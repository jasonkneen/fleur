mod app;
mod environment;
mod file_utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            app::install,
            app::uninstall,
            app::is_configured,
            app::is_installed,
            app::get_app_statuses,
            environment::ensure_environment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
