// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;
use std::fs;
use serde_json::{Value, json};

// App configurations
struct AppConfig {
    mcp_key: &'static str,
    command: &'static str,
    args: &'static [&'static str],
}

const APP_CONFIGS: &[(&str, AppConfig)] = &[
    ("Browser", AppConfig {
        mcp_key: "puppeteer",
        command: "/Users/vinayak/.bun/bin/bun",
        args: &["x", "@modelcontextprotocol/server-puppeteer", "--debug"],
    }),
    ("Gmail", AppConfig {
        mcp_key: "gmail",
        command: "",
        args: &[],
    }),
    ("Google Calendar", AppConfig {
        mcp_key: "calendar",
        command: "",
        args: &[],
    }),
    ("Google Drive", AppConfig {
        mcp_key: "drive",
        command: "",
        args: &[],
    }),
    ("YouTube", AppConfig {
        mcp_key: "youtube",
        command: "",
        args: &[],
    }),
];

#[tauri::command]
fn handle_app_get(app_name: &str) -> Result<String, String> {
    println!("Installing app: {}", app_name);

    // Find the app configuration
    if let Some((_, config)) = APP_CONFIGS.iter().find(|(name, _)| *name == app_name) {
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

        // Add puppeteer config to mcpServers if it doesn't exist
        if let Some(mcp_servers) = config_json.get_mut("mcpServers").and_then(|v| v.as_object_mut()) {
            // Check if the key already exists
            if mcp_servers.contains_key(config.mcp_key) {
                return Ok(format!("Configuration for {} already exists", app_name));
            }

            // Add new configuration
            mcp_servers.insert(
                config.mcp_key.to_string(),
                json!({
                    "command": config.command,
                    "args": config.args,
                })
            );

            // Write updated config back to file
            let updated_config = serde_json::to_string_pretty(&config_json)
                .map_err(|e| format!("Failed to serialize config: {}", e))?;

            fs::write(&config_path, updated_config)
                .map_err(|e| format!("Failed to write config file: {}", e))?;

            Ok(format!("Added {} configuration for {}", config.mcp_key, app_name))
        } else {
            Err("Failed to find mcpServers in config".to_string())
        }
    } else {
        Ok(format!("No configuration available for {}", app_name))
    }
}

#[tauri::command]
fn check_uv_version() -> Result<String, String> {
    match Command::new("uv").arg("--version").output() {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                Err("uv is not installed or command failed".to_string())
            }
        }
        Err(_) => Err("uv is not installed".to_string())
    }
}

#[tauri::command]
fn check_bun_version() -> Result<String, String> {
    match Command::new("bun").arg("--version").output() {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                Err("bun is not installed or command failed".to_string())
            }
        }
        Err(_) => Err("bun is not installed".to_string())
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn is_app_configured(app_name: &str) -> bool {
    APP_CONFIGS
        .iter()
        .find(|(name, _)| *name == app_name)
        .map(|(_, config)| !config.command.is_empty())
        .unwrap_or(false)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            check_uv_version,
            check_bun_version,
            handle_app_get,
            is_app_configured
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
