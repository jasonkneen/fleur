use log::info;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use once_cell::sync::Lazy;

static UV_INSTALLED: AtomicBool = AtomicBool::new(false);
static NVM_INSTALLED: AtomicBool = AtomicBool::new(false);
static NODE_INSTALLED: AtomicBool = AtomicBool::new(false);
static ENVIRONMENT_SETUP_STARTED: AtomicBool = AtomicBool::new(false);
static NODE_VERSION: &str = "v20.9.0";
static mut IS_TEST_MODE: bool = false;

// Lock to prevent concurrent environment setup operations
static ENVIRONMENT_SETUP_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

#[cfg(feature = "test-utils")]
pub fn set_test_mode(enabled: bool) {
    unsafe {
        IS_TEST_MODE = enabled;
    }
}

fn is_test_mode() -> bool {
    unsafe { IS_TEST_MODE }
}

pub fn get_npx_shim_path() -> std::path::PathBuf {
    if is_test_mode() {
        return std::path::PathBuf::from("/test/.local/share/fleur/bin/npx-fleur");
    }

    dirs::home_dir()
        .unwrap_or_default()
        .join(".local/share/fleur/bin/npx-fleur")
}

pub fn get_uvx_path() -> Result<String, String> {
    if is_test_mode() {
        return Ok("/test/.local/bin/uvx".to_string());
    }

    let output = Command::new("which")
        .arg("uvx")
        .output()
        .map_err(|e| format!("Failed to get uvx path: {}", e))?;

    if !output.status.success() {
        return Err("uvx not found in PATH".to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

pub fn get_nvm_node_paths() -> Result<(String, String), String> {
    if is_test_mode() {
        return Ok(("/test/node".to_string(), "/test/npx".to_string()));
    }

    let shell_command = format!(r#"
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use {} > /dev/null 2>&1
        which node
        which npx
    "#, NODE_VERSION);

    let output = Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .output()
        .map_err(|e| format!("Failed to get node paths: {}", e))?;

    if !output.status.success() {
        return Err("Failed to get node and npx paths".to_string());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut lines = output_str.lines();

    let node_path = lines
        .next()
        .ok_or("Failed to get node path")?
        .trim()
        .to_string();

    let npx_path = lines
        .next()
        .ok_or("Failed to get npx path")?
        .trim()
        .to_string();

    if !node_path.contains(".nvm/versions/node") {
        return Err("Node path is not from nvm installation".to_string());
    }

    Ok((node_path, npx_path))
}

pub fn ensure_npx_shim() -> Result<String, String> {
    if is_test_mode() {
        return Ok("/test/.local/share/fleur/bin/npx-fleur".to_string());
    }

    let shim_path = get_npx_shim_path();

    // Only create the shim if it doesn't exist
    if shim_path.exists() {
        info!("NPX shim already exists at {}", shim_path.display());
        return Ok(shim_path.to_string_lossy().to_string());
    }

    info!("Creating NPX shim...");
    let (node_path, npx_path) = get_nvm_node_paths()?;

    if let Some(parent) = shim_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create shim directory: {}", e))?;
    }

    let shim_content = format!(
        r#"#!/bin/sh
# NPX shim for Fleur

NODE="{}"
NPX="{}"

export PATH="$(dirname "$NODE"):$PATH"

exec "$NPX" "$@"
"#,
        node_path, npx_path
    );

    std::fs::write(&shim_path, shim_content)
        .map_err(|e| format!("Failed to write shim script: {}", e))?;

    Command::new("chmod")
        .arg("+x")
        .arg(&shim_path)
        .output()
        .map_err(|e| format!("Failed to make shim executable: {}", e))?;

    info!("NPX shim created at {}", shim_path.display());
    Ok(shim_path.to_string_lossy().to_string())
}

fn check_node_version() -> Result<String, String> {
    if is_test_mode() {
        return Ok(NODE_VERSION.to_string());
    }

    // If we already confirmed node is installed with correct version, return early
    if NODE_INSTALLED.load(Ordering::Relaxed) {
        return Ok(NODE_VERSION.to_string());
    }

    // Check if node exists in PATH
    let which_command = Command::new("which")
        .arg("node")
        .output()
        .map_err(|e| format!("Failed to check node existence: {}", e))?;

    if !which_command.status.success() {
        return Err("Node not found in PATH".to_string());
    }

    // Get node version
    let version_command = Command::new("node")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to check node version: {}", e))?;

    if version_command.status.success() {
        let version = String::from_utf8_lossy(&version_command.stdout)
            .trim()
            .to_string();

        // Only store as installed if it's the correct version
        if version == NODE_VERSION {
            info!("Node.js {} is already installed", NODE_VERSION);
            NODE_INSTALLED.store(true, Ordering::Relaxed);
        }

        Ok(version)
    } else {
        Err("Failed to get Node version".to_string())
    }
}

fn check_nvm_version() -> Result<String, String> {
    if is_test_mode() {
        return Ok("0.40.1".to_string());
    }

    let shell_command = r#"
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm --version
    "#;

    let output = Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .output()
        .map_err(|e| format!("Failed to check nvm version: {}", e))?;

    if !output.status.success() {
        return Err("Failed to get nvm version".to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn install_node() -> Result<(), String> {
    if is_test_mode() {
        return Ok(());
    }

    // Double-check node version to avoid race conditions
    match check_node_version() {
        Ok(version) if version == NODE_VERSION => {
            info!("Node.js {} is already installed, skipping installation", NODE_VERSION);
            NODE_INSTALLED.store(true, Ordering::Relaxed);
            return Ok(());
        }
        _ => {}
    }

    info!("Installing Node.js {}", NODE_VERSION);

    // Verify nvm is properly installed before using it
    if !check_nvm_installed() {
        return Err("nvm is required to install Node.js".to_string());
    }

    let shell_command = format!(r#"
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install {} --no-progress
    "#, NODE_VERSION);

    let output = Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .output()
        .map_err(|e| format!("Failed to run node installation: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Node installation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    NODE_INSTALLED.store(true, Ordering::Relaxed);
    info!("Node.js {} installed successfully", NODE_VERSION);
    Ok(())
}

fn check_nvm_installed() -> bool {
    if is_test_mode() {
        return true;
    }

    // If we've already confirmed nvm is installed, return early
    if NVM_INSTALLED.load(Ordering::Relaxed) {
        return true;
    }

    // First check if .nvm directory exists
    let nvm_dir = dirs::home_dir()
        .map(|path| path.join(".nvm"))
        .filter(|path| path.exists());

    if nvm_dir.is_none() {
        info!("NVM directory not found");
        return false;
    }

    // Then check if we can run nvm to confirm it's properly installed
    match check_nvm_version() {
        Ok(version) => {
            info!("NVM version {} is installed", version);
            NVM_INSTALLED.store(true, Ordering::Relaxed);
            true
        }
        Err(_) => {
            info!("NVM directory exists but nvm command failed");
            false
        }
    }
}

fn install_nvm() -> Result<(), String> {
    if is_test_mode() {
        return Ok(());
    }

    // Double-check nvm installation to avoid race conditions
    if check_nvm_installed() {
        info!("nvm is already installed, skipping installation");
        return Ok(());
    }

    info!("Installing nvm...");

    let shell_command = r#"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    "#;

    let output = Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .output()
        .map_err(|e| format!("Failed to install nvm: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "nvm installation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    NVM_INSTALLED.store(true, Ordering::Relaxed);
    info!("nvm installed successfully");
    Ok(())
}

fn check_uv_installed() -> bool {
    if is_test_mode() {
        return true;
    }

    // If we've already confirmed uv is installed, return early
    if UV_INSTALLED.load(Ordering::Relaxed) {
        return true;
    }

    // First check if uv is in PATH
    let which_command = Command::new("which")
        .arg("uv")
        .output()
        .map_or(false, |output| output.status.success());

    if !which_command {
        info!("uv not found in PATH");
        return false;
    }

    // Then check if we can run uv to confirm it's properly installed
    let version_command = Command::new("uv")
        .arg("--version")
        .output();

    match version_command {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            info!("uv version {} is installed", version);
            UV_INSTALLED.store(true, Ordering::Relaxed);
            true
        }
        _ => {
            info!("uv found in PATH but command failed");
            false
        }
    }
}

fn install_uv() -> Result<(), String> {
    if is_test_mode() {
        return Ok(());
    }

    // Double-check uv installation to avoid race conditions
    if check_uv_installed() {
        info!("uv is already installed, skipping installation");
        return Ok(());
    }

    info!("Installing uv...");

    let shell_command = r#"
        curl -LsSf https://astral.sh/uv/install.sh | sh
    "#;

    let output = Command::new("bash")
        .arg("-c")
        .arg(shell_command)
        .output()
        .map_err(|e| format!("Failed to install uv: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "uv installation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    UV_INSTALLED.store(true, Ordering::Relaxed);
    info!("uv installed successfully");
    Ok(())
}

fn ensure_node_environment() -> Result<String, String> {
    if is_test_mode() {
        return Ok("Node environment is ready".to_string());
    }

    // First check if we have nvm installed, install if needed
    if !check_nvm_installed() {
        install_nvm()?;
    }

    // Check if we have the correct node version, install if needed
    match check_node_version() {
        Ok(version) => {
            if version != NODE_VERSION {
                info!("Node.js {} found, but {} required. Installing...", version, NODE_VERSION);
                install_node()?;
            } else {
                info!("Node.js {} is already installed", NODE_VERSION);
                NODE_INSTALLED.store(true, Ordering::Relaxed);
            }
        }
        Err(_) => {
            info!("Node.js not found. Installing...");
            install_node()?;
        }
    }

    // Ensure npx shim exists
    ensure_npx_shim()?;

    Ok("Node environment is ready".to_string())
}

#[tauri::command]
pub fn ensure_environment() -> Result<String, String> {
    if is_test_mode() {
        return Ok("Environment setup started".to_string());
    }

    // Use a more reliable way to check if we're already setting up the environment
    if ENVIRONMENT_SETUP_STARTED.swap(true, Ordering::SeqCst) {
        return Ok("Environment setup already in progress".to_string());
    }

    // Use a thread-safe approach for environment setup
    std::thread::spawn(|| {
        // Use a mutex to prevent concurrent setup operations
        let _lock = match ENVIRONMENT_SETUP_LOCK.try_lock() {
            Ok(guard) => guard,
            Err(_) => {
                info!("Another environment setup is already in progress");
                ENVIRONMENT_SETUP_STARTED.store(false, Ordering::SeqCst);
                return;
            }
        };

        info!("Starting environment setup");

        // Check and install uv if needed
        if !check_uv_installed() {
            if let Err(e) = install_uv() {
                info!("Failed to install uv: {}", e);
            }
        }

        // Ensure node environment is ready
        if let Err(e) = ensure_node_environment() {
            info!("Failed to ensure node environment: {}", e);
        }

        info!("Environment setup completed");
        ENVIRONMENT_SETUP_STARTED.store(false, Ordering::SeqCst);
    });

    Ok("Environment setup started".to_string())
}
