pub mod app;
pub mod environment;
pub mod file_utils;

use tauri::Manager as _;
use tauri_plugin_updater::{Builder as UpdaterBuilder, UpdaterExt};

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        println!("Update available: {}", update.version);
        let mut downloaded = 0;
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("Downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("Download finished");
                },
            )
            .await?;
        println!("Update installed");
        app.restart();
    } else {
        println!("No update available");
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Preload dependencies in background
    std::thread::spawn(|| {
        let _ = app::preload_dependencies();
    });

    tauri::Builder::default()
        .plugin(UpdaterBuilder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            app::install,
            app::uninstall,
            app::is_installed,
            app::get_app_statuses,
            app::preload_dependencies,
            environment::ensure_environment,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            println!("Checking for updates...");
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update(handle).await {
                    println!("Error checking for updates: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
