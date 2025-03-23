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
    Windsurf,
}

impl ClientType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClientType::Claude => "Claude",
            ClientType::Cursor => "Cursor",
            ClientType::Windsurf => "Windsurf",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "Claude" => Some(ClientType::Claude),
            "Cursor" => Some(ClientType::Cursor),
            "Windsurf" => Some(ClientType::Windsurf),
            _ => None,
        }
    }

    pub fn all() -> Vec<ClientType> {
        vec![ClientType::Claude, ClientType::Cursor, ClientType::Windsurf]
    }

    pub fn all_as_str() -> Vec<&'static str> {
        vec!["Claude", "Cursor", "Windsurf"]
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
    static ref CLIENT_PATH_CONFIGS: Mutex<std::collections::HashMap<ClientType, ClientPathConfig>> = Mutex::new(std::collections::HashMap::new());
}

pub fn init_client_path_configs() {
    let mut configs = CLIENT_PATH_CONFIGS.lock().unwrap();

    if configs.is_empty() {
        if let Some(home_dir) = dirs::home_dir() {
            configs.insert(
                ClientType::Claude,
                ClientPathConfig {
                    base_dir: home_dir.join("Library/Application Support/Claude"),
                    config_filename: "claude_desktop_config.json".to_string(),
                    os: OSType::MacOS,
                }
            );

            configs.insert(
                ClientType::Cursor,
                ClientPathConfig {
                    base_dir: home_dir.join(".cursor/"),
                    config_filename: "mcp.json".to_string(),
                    os: OSType::MacOS,
                }
            );

            configs.insert(
                ClientType::Windsurf,
                ClientPathConfig {
                    base_dir: home_dir.join(".codeium/windsurf"),
                    config_filename: "mcp_config.json".to_string(),
                    os: OSType::MacOS,
                }
            );
        }
    }
}

pub fn get_client_path_config(client: &ClientType) -> Result<ClientPathConfig, String> {
    init_client_path_configs();

    let configs = CLIENT_PATH_CONFIGS.lock().unwrap();
    if let Some(config) = configs.get(client) {
        Ok(config.clone())
    } else {
        Err(format!("No path configuration for client: {}", client.as_str()))
    }
}

pub fn set_client_path_config(client: &ClientType, config: ClientPathConfig) -> Result<(), String> {
    if ClientType::from_str(client.as_str()).is_none() {
        return Err(format!("Unsupported client: {}", client.as_str()));
    }

    let mut configs = CLIENT_PATH_CONFIGS.lock().unwrap();
    configs.insert(client.clone(), config);

    debug!("Updated path configuration for client: {}", client.as_str());
    Ok(())
}

pub fn validate_client(client: &ClientType) -> Result<(), String> {
    if ClientType::from_str(client.as_str()).is_none() {
        return Err(format!("Unsupported client: {}", client.as_str()));
    }
    Ok(())
}

pub fn get_default_client() -> ClientType {
    ClientType::default()
}

pub fn check_client_installed(client: &ClientType) -> Result<bool, String> {
    validate_client(client)?;

    #[cfg(target_os = "macos")]
    {
        let app_path = std::path::PathBuf::from(format!("/Applications/{}.app", client.as_str()));
        debug!("Checking for {}.app at: {}", client.as_str(), app_path.display());
        return Ok(app_path.exists());
    }
}

pub fn restart_client_app(client: &ClientType) -> Result<String, String> {
    validate_client(client)?;

    info!("Restarting {} app...", client.as_str());

    std::process::Command::new("pkill")
        .arg("-x")
        .arg(client.as_str())
        .output()
        .map_err(|e| format!("Failed to kill {} app: {}", client.as_str(), e))?;

    std::thread::sleep(std::time::Duration::from_millis(500));

    std::process::Command::new("open")
        .arg("-a")
        .arg(client.as_str())
        .output()
        .map_err(|e| format!("Failed to relaunch {} app: {}", client.as_str(), e))?;

    Ok(format!("{} app restarted successfully", client.as_str()))
}