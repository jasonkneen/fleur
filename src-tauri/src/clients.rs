use dirs;
use lazy_static::lazy_static;
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use crate::os::OSType;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ClientType {
    Claude,
    Cursor,
}

impl ClientType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClientType::Claude => "Claude",
            ClientType::Cursor => "Cursor",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "Claude" => Some(ClientType::Claude),
            "Cursor" => Some(ClientType::Cursor),
            _ => None,
        }
    }

    pub fn all() -> Vec<ClientType> {
        vec![ClientType::Claude, ClientType::Cursor]
    }

    pub fn all_as_str() -> Vec<&'static str> {
        vec!["Claude", "Cursor"]
    }

    pub fn default() -> ClientType {
        ClientType::Claude
    }
}

#[derive(Clone, Debug)]
pub struct ClientPathConfig {
    pub base_dir: PathBuf,
    pub config_filename: String,
    pub os: OSType,
}

lazy_static! {
    // Map of client name -> path configuration
    static ref CLIENT_PATH_CONFIGS: Mutex<std::collections::HashMap<ClientType, ClientPathConfig>> = Mutex::new(std::collections::HashMap::new());
}

// Initialize default path configurations for supported clients
pub fn init_client_path_configs() {
    let mut configs = CLIENT_PATH_CONFIGS.lock().unwrap();

    // Only initialize if empty
    if configs.is_empty() {
        if let Some(home_dir) = dirs::home_dir() {
            // Claude configuration
            configs.insert(
                ClientType::Claude,
                ClientPathConfig {
                    base_dir: home_dir.join("Library/Application Support/Claude"),
                    config_filename: "claude_desktop_config.json".to_string(),
                    os: OSType::MacOS,
                }
            );

            // Cursor configuration
            configs.insert(
                ClientType::Cursor,
                ClientPathConfig {
                    base_dir: home_dir.join("/.cursor/"),
                    config_filename: "mcp.json".to_string(),
                    os: OSType::MacOS,
                }
            );
        }
    }
}

// Get the path configuration for a specific client
pub fn get_client_path_config(client: &ClientType) -> Result<ClientPathConfig, String> {
    // Initialize configs if needed
    init_client_path_configs();

    // Get the client's path configuration
    let configs = CLIENT_PATH_CONFIGS.lock().unwrap();
    if let Some(config) = configs.get(client) {
        Ok(config.clone())
    } else {
        Err(format!("No path configuration for client: {}", client.as_str()))
    }
}

// Set a custom path configuration for a client
pub fn set_client_path_config(client: &ClientType, config: ClientPathConfig) -> Result<(), String> {
    // Validate client
    if ClientType::from_str(client.as_str()).is_none() {
        return Err(format!("Unsupported client: {}", client.as_str()));
    }

    // Update the configuration
    let mut configs = CLIENT_PATH_CONFIGS.lock().unwrap();
    configs.insert(client.clone(), config);

    debug!("Updated path configuration for client: {}", client.as_str());
    Ok(())
}

// Validate that a client name is supported
pub fn validate_client(client: &ClientType) -> Result<(), String> {
    if ClientType::from_str(client.as_str()).is_none() {
        return Err(format!("Unsupported client: {}", client.as_str()));
    }
    Ok(())
}

// Get the default client
pub fn get_default_client() -> ClientType {
    ClientType::default()
}

// Check if a client is installed on the system
pub fn check_client_installed(client: Option<&ClientType>) -> Result<bool, String> {
    // Use the default client if none is provided
    let default = ClientType::default();
    let client = client.unwrap_or(&default);

    // Validate client
    validate_client(client)?;

    #[cfg(target_os = "macos")]
    {
        let app_path = std::path::PathBuf::from(format!("/Applications/{}.app", client.as_str()));
        debug!("Checking for {}.app at: {}", client.as_str(), app_path.display());
        return Ok(app_path.exists());
    }
}

// Restart a client application
pub fn restart_client_app(client: Option<&ClientType>) -> Result<String, String> {
    let default = ClientType::default();
    let client = client.unwrap_or(&default);

    validate_client(client)?;

    info!("Restarting {} app...", client.as_str());

    // Kill the client app
    std::process::Command::new("pkill")
        .arg("-x")
        .arg(client.as_str())
        .output()
        .map_err(|e| format!("Failed to kill {} app: {}", client.as_str(), e))?;

    // Wait a moment to ensure it's fully closed
    std::thread::sleep(std::time::Duration::from_millis(500));

    // Relaunch the app
    std::process::Command::new("open")
        .arg("-a")
        .arg(client.as_str())
        .output()
        .map_err(|e| format!("Failed to relaunch {} app: {}", client.as_str(), e))?;

    Ok(format!("{} app restarted successfully", client.as_str()))
}