mod common;

use fleur_lib::app::{self, get_app_configs};
use common::setup_test_config;
use serde_json::Value;
use std::{thread, time::Duration};

#[test]
fn test_get_app_configs() {
    let configs = get_app_configs();
    let browser = configs.iter()
        .find(|(name, _)| name == "Browser")
        .expect("Browser app not found");
    assert_eq!(browser.1.mcp_key, "puppeteer");
}

#[test]
fn test_install() {
    let (config_path, temp_dir) = setup_test_config();
    let original_home = std::env::var("HOME").ok();
    std::env::set_var("HOME", temp_dir.path());

    // Verify initial config
    let config_str = std::fs::read_to_string(&config_path).unwrap();
    println!("Initial config: {}", config_str);

    let result = app::install("Browser");
    println!("Install result: {:?}", result);
    assert!(result.is_ok());

    // Wait and verify config file
    thread::sleep(Duration::from_millis(100));

    let config_str = std::fs::read_to_string(&config_path).unwrap();
    println!("Config after install: {}", config_str);

    let config: Value = serde_json::from_str(&config_str).unwrap();
    assert!(config["mcpServers"].is_object());

    // Check if puppeteer key exists and has expected values
    let puppeteer = &config["mcpServers"]["puppeteer"];
    println!("Puppeteer config: {}", puppeteer);
    assert!(puppeteer.is_object(), "Puppeteer config should be an object");

    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    }
}

#[test]
fn test_uninstall() {
    let (config_path, temp_dir) = setup_test_config();
    let original_home = std::env::var("HOME").ok();
    std::env::set_var("HOME", temp_dir.path());

    // First install
    app::install("Browser").unwrap();

    // Then uninstall
    let result = app::uninstall("Browser");
    assert!(result.is_ok());

    // Verify config was removed
    let config_str = std::fs::read_to_string(&config_path).unwrap();
    let config: Value = serde_json::from_str(&config_str).unwrap();
    assert!(config["mcpServers"]["puppeteer"].is_null());

    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    }
}

#[test]
fn test_app_status() {
    let (config_path, temp_dir) = setup_test_config();
    let original_home = std::env::var("HOME").ok();
    std::env::set_var("HOME", temp_dir.path());

    // Test initial status
    let result = app::get_app_statuses().unwrap();
    println!("Initial status: {}", serde_json::to_string_pretty(&result).unwrap());
    assert!(result["installed"].is_object());
    assert!(result["configured"].is_object());

    // Install and check status
    app::install("Browser").unwrap();
    thread::sleep(Duration::from_millis(100));

    let config_str = std::fs::read_to_string(&config_path).unwrap();
    println!("Config after install: {}", config_str);

    let result = app::get_app_statuses().unwrap();
    println!("Status after install: {}", serde_json::to_string_pretty(&result).unwrap());
    assert!(result["installed"]["Browser"].as_bool().unwrap());

    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    }
}
