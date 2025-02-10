// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde_json::{json, Value};
use std::fs;
use std::process::Command;

// App configurations
#[derive(Clone)]
struct AppConfig {
    mcp_key: String,
    command: String,
    args: Vec<String>,
}

fn get_npx_shim_path() -> std::path::PathBuf {
    dirs::home_dir()
        .unwrap_or_default()
        .join(".local/share/fleur/bin/npx-fleur")
}

fn get_uvx_path() -> Result<String, String> {
    let output = Command::new("which")
        .arg("uvx")
        .output()
        .map_err(|e| format!("Failed to get uvx path: {}", e))?;

    if !output.status.success() {
        return Err("uvx not found in PATH".to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn get_nvm_node_paths() -> Result<(String, String), String> {
    // First ensure we're using the right node version
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

    // Verify these are nvm paths
    if !node_path.contains(".nvm/versions/node") {
        return Err("Node path is not from nvm installation".to_string());
    }

    Ok((node_path, npx_path))
}

fn ensure_npx_shim() -> Result<String, String> {
    let shim_path = get_npx_shim_path();

    // Get Node and NPX paths from nvm installation
    let (node_path, npx_path) = get_nvm_node_paths()?;

    // Create directory if it doesn't exist
    if let Some(parent) = shim_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create shim directory: {}", e))?;
    }

    // Create shim script if it doesn't exist or update it if paths have changed
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

    // Always write the shim to ensure paths are up to date
    fs::write(&shim_path, shim_content)
        .map_err(|e| format!("Failed to write shim script: {}", e))?;

    // Make the script executable
    Command::new("chmod")
        .arg("+x")
        .arg(&shim_path)
        .output()
        .map_err(|e| format!("Failed to make shim executable: {}", e))?;

    Ok(shim_path.to_string_lossy().to_string())
}

fn get_app_configs() -> Vec<(String, AppConfig)> {
    let npx_shim = ensure_npx_shim().unwrap_or_else(|_| "npx".to_string());
    let uvx_path = get_uvx_path().unwrap_or_else(|_| "uvx".to_string());

    vec![
        (
            "Browser".to_string(),
            AppConfig {
                mcp_key: "puppeteer".to_string(),
                command: npx_shim.clone(),
                args: vec![
                    "-y".to_string(),
                    "@modelcontextprotocol/server-puppeteer".to_string(),
                    "--debug".to_string(),
                ],
            },
        ),
        (
            "Hacker News".to_string(),
            AppConfig {
                mcp_key: "hn".to_string(),
                command: uvx_path.clone(),
                args: vec![
                    "--from".to_string(),
                    "git+https://github.com/erithwik/mcp-hn".to_string(),
                    "mcp-hn".to_string(),
                ],
            },
        ),
        (
            "Gmail".to_string(),
            AppConfig {
                mcp_key: "gmail".to_string(),
                command: String::new(),
                args: vec![],
            },
        ),
        (
            "Google Calendar".to_string(),
            AppConfig {
                mcp_key: "calendar".to_string(),
                command: String::new(),
                args: vec![],
            },
        ),
        (
            "Google Drive".to_string(),
            AppConfig {
                mcp_key: "drive".to_string(),
                command: String::new(),
                args: vec![],
            },
        ),
        (
            "YouTube".to_string(),
            AppConfig {
                mcp_key: "youtube".to_string(),
                command: String::new(),
                args: vec![],
            },
        ),
    ]
}

fn ensure_config_file(config_path: &std::path::PathBuf) -> Result<(), String> {
    if !config_path.exists() {
        let initial_config = json!({
            "mcpServers": {}
        });

        let config_str = serde_json::to_string_pretty(&initial_config)
            .map_err(|e| format!("Failed to create initial config: {}", e))?;

        // Create parent directories if they don't exist
        if let Some(parent) = config_path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create config directory: {}", e))?;
        }

        fs::write(config_path, config_str)
            .map_err(|e| format!("Failed to write initial config file: {}", e))?;
    }
    Ok(())
}

fn ensure_mcp_servers(config_json: &mut Value) -> Result<(), String> {
    if !config_json.is_object() {
        *config_json = json!({
            "mcpServers": {}
        });
    } else if !config_json
        .get("mcpServers")
        .map_or(false, |v| v.is_object())
    {
        config_json["mcpServers"] = json!({});
    }
    Ok(())
}

#[tauri::command]
fn handle_app_get(app_name: &str) -> Result<String, String> {
    println!("Installing app: {}", app_name);

    // Find the app configuration
    if let Some((_, config)) = get_app_configs().iter().find(|(name, _)| name == app_name) {
        // Path to Claude config
        let config_path = dirs::home_dir()
            .ok_or("Could not find home directory".to_string())?
            .join("Library/Application Support/Claude/claude_desktop_config.json");

        // Ensure config file exists with proper structure
        ensure_config_file(&config_path)?;

        // Read existing config
        let config_str = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;

        // Parse JSON and ensure proper structure
        let mut config_json: Value = serde_json::from_str(&config_str)
            .map_err(|e| format!("Failed to parse config JSON: {}", e))?;

        ensure_mcp_servers(&mut config_json)?;

        // Add puppeteer config to mcpServers if it doesn't exist
        if let Some(mcp_servers) = config_json
            .get_mut("mcpServers")
            .and_then(|v| v.as_object_mut())
        {
            // Check if the key already exists
            if mcp_servers.contains_key(&config.mcp_key) {
                return Ok(format!("Configuration for {} already exists", app_name));
            }

            // Add new configuration
            mcp_servers.insert(
                config.mcp_key.clone(),
                json!({
                    "command": config.command,
                    "args": config.args,
                }),
            );

            // Write updated config back to file
            let updated_config = serde_json::to_string_pretty(&config_json)
                .map_err(|e| format!("Failed to serialize config: {}", e))?;

            fs::write(&config_path, updated_config)
                .map_err(|e| format!("Failed to write config file: {}", e))?;

            Ok(format!(
                "Added {} configuration for {}",
                config.mcp_key, app_name
            ))
        } else {
            Err("Failed to find mcpServers in config".to_string())
        }
    } else {
        Ok(format!("No configuration available for {}", app_name))
    }
}

#[tauri::command]
fn handle_app_uninstall(app_name: &str) -> Result<String, String> {
    println!("Uninstalling app: {}", app_name);

    // Find the app configuration
    if let Some((_, config)) = get_app_configs().iter().find(|(name, _)| name == app_name) {
        // Path to Claude config
        let config_path = dirs::home_dir()
            .ok_or("Could not find home directory".to_string())?
            .join("Library/Application Support/Claude/claude_desktop_config.json");

        // Read existing config
        let config_str = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;

        // Parse JSON
        let mut config_json: Value = serde_json::from_str(&config_str)
            .map_err(|e| format!("Failed to parse config JSON: {}", e))?;

        // Remove config from mcpServers if it exists
        if let Some(mcp_servers) = config_json
            .get_mut("mcpServers")
            .and_then(|v| v.as_object_mut())
        {
            if mcp_servers.remove(&config.mcp_key).is_some() {
                // Write updated config back to file
                let updated_config = serde_json::to_string_pretty(&config_json)
                    .map_err(|e| format!("Failed to serialize config: {}", e))?;

                fs::write(&config_path, updated_config)
                    .map_err(|e| format!("Failed to write config file: {}", e))?;

                Ok(format!(
                    "Removed {} configuration for {}",
                    config.mcp_key, app_name
                ))
            } else {
                Ok(format!("Configuration for {} was not found", app_name))
            }
        } else {
            Err("Failed to find mcpServers in config".to_string())
        }
    } else {
        Ok(format!("No configuration available for {}", app_name))
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn is_app_configured(app_name: &str) -> bool {
    get_app_configs()
        .iter()
        .find(|(name, _)| name == app_name)
        .map(|(_, config)| !config.command.is_empty())
        .unwrap_or(false)
}

#[tauri::command]
fn is_app_installed(app_name: &str) -> Result<bool, String> {
    // Find the app configuration
    if let Some((_, config)) = get_app_configs().iter().find(|(name, _)| name == app_name) {
        // Path to Claude config
        let config_path = dirs::home_dir()
            .ok_or("Could not find home directory".to_string())?
            .join("Library/Application Support/Claude/claude_desktop_config.json");

        // Read existing config
        let config_str = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;

        // Parse JSON
        let config_json: Value = serde_json::from_str(&config_str)
            .map_err(|e| format!("Failed to parse config JSON: {}", e))?;

        // Check if mcpServers exists and contains the key
        if let Some(mcp_servers) = config_json.get("mcpServers") {
            if let Some(servers) = mcp_servers.as_object() {
                return Ok(servers.contains_key(&config.mcp_key));
            }
        }

        // Return false if mcpServers doesn't exist or isn't an object
        Ok(false)
    } else {
        Ok(false)
    }
}

fn check_node_version() -> Result<String, String> {
    // First check if node is in PATH
    let which_command = Command::new("which")
        .arg("node")
        .output()
        .map_err(|e| format!("Failed to check node existence: {}", e))?;

    if !which_command.status.success() {
        return Err("Node not found in PATH".to_string());
    }

    // Then check node version
    let version_command = Command::new("node")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to check node version: {}", e))?;

    if version_command.status.success() {
        Ok(String::from_utf8_lossy(&version_command.stdout)
            .trim()
            .to_string())
    } else {
        Err("Failed to get Node version".to_string())
    }
}

fn install_node() -> Result<(), String> {
    println!("Installing Node.js v20.9.0...");

    // Get nvm executable path
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

    // Let nvm handle the installation
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

    println!("Node.js v20.9.0 installed successfully");
    Ok(())
}

fn check_nvm_installed() -> bool {
    // Check if NVM directory exists
    let nvm_dir = dirs::home_dir()
        .map(|path| path.join(".nvm"))
        .filter(|path| path.exists());

    if nvm_dir.is_none() {
        return false;
    }

    // Try to source nvm and check its version
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

    println!("nvm installed successfully");
    Ok(())
}

fn check_uv_installed() -> bool {
    // Check if uv is in PATH
    let which_command = Command::new("which")
        .arg("uv")
        .output()
        .map_or(false, |output| output.status.success());

    if !which_command {
        return false;
    }

    // Then check if uv --version works
    let version_command = Command::new("uv")
        .arg("--version")
        .output()
        .map_or(false, |output| output.status.success());

    if version_command {
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

    println!("uv installed successfully");
    Ok(())
}

#[tauri::command]
fn ensure_node_environment() -> Result<String, String> {
    // First ensure nvm is installed
    if !check_nvm_installed() {
        install_nvm()?;
    }

    match check_node_version() {
        Ok(version) => {
            if version != "v20.9.0" {
                install_node()?;
            }
            // Update the shim with the correct paths
            ensure_npx_shim()?;
            Ok("Node environment is ready".to_string())
        }
        Err(_) => {
            install_node()?;
            // Update the shim with the correct paths
            ensure_npx_shim()?;
            Ok("Node environment is ready".to_string())
        }
    }
}

#[tauri::command]
fn ensure_environment() -> Result<String, String> {
    // First ensure UV is installed
    if !check_uv_installed() {
        install_uv()?;
    }

    // Then ensure Node environment is ready
    ensure_node_environment()?;

    Ok("Environment is ready".to_string())
}

#[tauri::command]
fn get_all_app_statuses() -> Result<Value, String> {
    // Path to Claude config
    let config_path = dirs::home_dir()
        .ok_or("Could not find home directory".to_string())?
        .join("Library/Application Support/Claude/claude_desktop_config.json");

    // Read existing config
    let config_str = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    // Parse JSON
    let config_json: Value = serde_json::from_str(&config_str)
        .map_err(|e| format!("Failed to parse config JSON: {}", e))?;

    let mut installed_apps = json!({});
    let mut configured_apps = json!({});

    // Get all app configs
    let app_configs = get_app_configs();

    // Check installation status for all apps at once
    if let Some(mcp_servers) = config_json.get("mcpServers").and_then(|v| v.as_object()) {
        for (app_name, config) in app_configs {
            installed_apps[&app_name] = json!(mcp_servers.contains_key(&config.mcp_key));
            configured_apps[&app_name] = json!(!config.command.is_empty());
        }
    }

    Ok(json!({
        "installed": installed_apps,
        "configured": configured_apps
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            handle_app_get,
            handle_app_uninstall,
            is_app_configured,
            is_app_installed,
            ensure_environment,
            get_all_app_statuses
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
