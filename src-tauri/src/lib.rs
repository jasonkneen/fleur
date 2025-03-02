pub mod app;
pub mod environment;
pub mod file_utils;

#[cfg(test)]
pub use environment::testing;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Preload dependencies in background
    std::thread::spawn(|| {
        let _ = app::preload_dependencies();
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            app::install,
            app::uninstall,
            app::is_installed,
            app::get_app_statuses,
            app::preload_dependencies,
            environment::ensure_environment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
