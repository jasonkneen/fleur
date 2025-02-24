use std::fs;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};

static UV_INSTALLED: AtomicBool = AtomicBool::new(false);
static NVM_INSTALLED: AtomicBool = AtomicBool::new(false);
static NODE_INSTALLED: AtomicBool = AtomicBool::new(false);
static ENVIRONMENT_SETUP_STARTED: AtomicBool = AtomicBool::new(false);

pub fn get_npx_shim_path() -> std::path::PathBuf {
    dirs::home_dir()
        .unwrap_or_default()
        .join(".local/share/fleur/bin/npx-fleur")
}

pub fn get_uvx_path() -> Result<String, String> {
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
    let shell_command = r#"
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use v20.9.0 > /dev/null 2>&1
        which node
        which npx
    "#;

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
    let shim_path = get_npx_shim_path();

    if shim_path.exists() {
        return Ok(shim_path.to_string_lossy().to_string());
    }

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

    fs::write(&shim_path, shim_content)
        .map_err(|e| format!("Failed to write shim script: {}", e))?;

    Command::new("chmod")
        .arg("+x")
        .arg(&shim_path)
        .output()
        .map_err(|e| format!("Failed to make shim executable: {}", e))?;

    Ok(shim_path.to_string_lossy().to_string())
}

fn check_node_version() -> Result<String, String> {
    if NODE_INSTALLED.load(Ordering::Relaxed) {
        return Ok("v20.9.0".to_string());
    }

    let which_command = Command::new("which")
        .arg("node")
        .output()
        .map_err(|e| format!("Failed to check node existence: {}", e))?;

    if !which_command.status.success() {
        return Err("Node not found in PATH".to_string());
    }

    let version_command = Command::new("node")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to check node version: {}", e))?;

    if version_command.status.success() {
        let version = String::from_utf8_lossy(&version_command.stdout)
            .trim()
            .to_string();

        if version == "v20.9.0" {
            NODE_INSTALLED.store(true, Ordering::Relaxed);
        }

        Ok(version)
    } else {
        Err("Failed to get Node version".to_string())
    }
}

fn install_node() -> Result<(), String> {
    println!("Installing Node.js v20.9.0...");

    let nvm_path_output = Command::new("which")
        .arg("nvm")
        .output()
        .map_err(|e| format!("Failed to get nvm path: {}", e))?;

    if !nvm_path_output.status.success() {
        return Err("nvm not found in PATH".to_string());
    }

    let nvm_path = String::from_utf8_lossy(&nvm_path_output.stdout)
        .trim()
        .to_string();

    let output = Command::new(nvm_path)
        .arg("install")
        .arg("v20.9.0")
        .output()
        .map_err(|e| format!("Failed to run node installation: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Node installation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    NODE_INSTALLED.store(true, Ordering::Relaxed);
    println!("Node.js v20.9.0 installed successfully");
    Ok(())
}

fn check_nvm_installed() -> bool {
    if NVM_INSTALLED.load(Ordering::Relaxed) {
        return true;
    }

    let nvm_dir = dirs::home_dir()
        .map(|path| path.join(".nvm"))
        .filter(|path| path.exists());

    if nvm_dir.is_none() {
        return false;
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
        .map_or(false, |output| output.status.success());

    if output {
        NVM_INSTALLED.store(true, Ordering::Relaxed);
        println!("nvm is already installed");
    }

    output
}

fn install_nvm() -> Result<(), String> {
    println!("Installing nvm...");

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
    println!("nvm installed successfully");
    Ok(())
}

fn check_uv_installed() -> bool {
    if UV_INSTALLED.load(Ordering::Relaxed) {
        return true;
    }

    let which_command = Command::new("which")
        .arg("uv")
        .output()
        .map_or(false, |output| output.status.success());

    if !which_command {
        return false;
    }

    let version_command = Command::new("uv")
        .arg("--version")
        .output()
        .map_or(false, |output| output.status.success());

    if version_command {
        UV_INSTALLED.store(true, Ordering::Relaxed);
        println!("uv is installed");
    }

    version_command
}

fn install_uv() -> Result<(), String> {
    println!("Installing uv...");

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
    println!("uv installed successfully");
    Ok(())
}

fn ensure_node_environment() -> Result<String, String> {
    if !check_nvm_installed() {
        install_nvm()?;
    }

    match check_node_version() {
        Ok(version) => {
            if version != "v20.9.0" {
                install_node()?;
            }
            ensure_npx_shim()?;
            Ok("Node environment is ready".to_string())
        }
        Err(_) => {
            install_node()?;
            ensure_npx_shim()?;
            Ok("Node environment is ready".to_string())
        }
    }
}

#[tauri::command]
pub fn ensure_environment() -> Result<String, String> {
    if ENVIRONMENT_SETUP_STARTED.swap(true, Ordering::SeqCst) {
        return Ok("Environment setup already in progress".to_string());
    }

    std::thread::spawn(|| {
        if !check_uv_installed() {
            let _ = install_uv();
        }
        let _ = ensure_node_environment();
    });

    Ok("Environment setup started".to_string())
}
