mod app_config;
mod environment;
mod file_utils;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            app_config::handle_app_get,
            app_config::handle_app_uninstall,
            app_config::is_app_configured,
            app_config::is_app_installed,
            environment::ensure_environment,
            environment::ensure_node_environment,
            app_config::get_all_app_statuses
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
