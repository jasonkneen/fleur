mod common;

use fleur_lib::app::{self, get_app_configs};
use serde_json::Value;
use common::setup_test_config;

#[test]
fn test_get_app_configs() {
    let configs = get_app_configs();
    let browser = configs.iter()
        .find(|(name, _)| name == "Browser")
        .expect("Browser app not found");
    assert_eq!(browser.1.mcp_key, "puppeteer");
}

#[test]
fn test_install_app() {
    let (_config_path, temp_dir) = setup_test_config();

    // Mock home directory
    let original_home = std::env::var("HOME").ok();
    std::env::set_var("HOME", temp_dir.path());

    let result = app::install("Browser");
    assert!(result.is_ok());

    // Cleanup
    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    }
}

#[test]
fn test_app_status() {
    let (_config_path, temp_dir) = setup_test_config();
    let original_home = std::env::var("HOME").ok();
    std::env::set_var("HOME", temp_dir.path());

    // Test initial status
    let result = app::get_app_statuses().unwrap();
    assert!(result["installed"].is_object());
    assert!(result["configured"].is_object());

    // Install and check status
    app::install("Browser").unwrap();
    let result = app::get_app_statuses().unwrap();
    assert!(result["installed"]["Browser"].as_bool().unwrap());

    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    }
}
