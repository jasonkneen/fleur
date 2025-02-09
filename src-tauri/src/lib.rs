// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn handle_app_get(app_name: &str) -> Result<String, String> {
    println!("Installing app: {}", app_name);
    Ok(format!("Started installation of {}", app_name))
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, check_uv_version, check_bun_version, handle_app_get])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
