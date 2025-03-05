mod common;

use fleur_lib::{
    app::{self, APP_REGISTRY_CACHE},
    environment,
};
use log::debug;
use serde_json::{json, Value};
use serial_test::serial;
use std::{thread, time::Duration};
use tempfile;
use uuid::Uuid;

fn setup_test_registry() {
    let test_registry = json!([{
        "name": "Browser",
        "description": "Web browser",
        "icon": {
            "type": "url",
            "url": {
                "light": "browser.svg",
                "dark": "browser.svg"
            }
        },
        "category": "Utilities",
        "price": "Free",
        "developer": "Test Developer",
        "config": {
            "mcpKey": "puppeteer",
            "runtime": "npx",
            "args": ["-y", "@modelcontextprotocol/server-puppeteer", "--debug"]
        }
    }, {
        "name": "Time",
        "description": "Time server",
        "config": {
            "mcpKey": "time",
            "runtime": "npx",
            "args": ["-y", "mcp-server-time"]
        }
    }]);

    let mut cache = APP_REGISTRY_CACHE.lock().unwrap();
    *cache = Some(test_registry);
}

fn cleanup_test_registry() {
    let mut cache = APP_REGISTRY_CACHE.lock().unwrap();
    *cache = None;
}

#[test]
#[serial]
fn test_preload_dependencies() {
    environment::set_test_mode(true);
    let result = app::preload_dependencies();
    assert!(result.is_ok());
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_install_and_uninstall() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Create a unique test configuration
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    // Set up initial config
    let initial_config = json!({
        "mcpServers": {}
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();
    app::set_test_config_path(Some(config_path.clone()));

    // Test installation
    let install_result = app::install("Browser", None);
    assert!(
        install_result.is_ok(),
        "Install failed: {:?}",
        install_result
    );

    // Verify installation
    let is_installed = app::is_installed("Browser").unwrap();
    assert!(is_installed, "Browser should be installed");

    // Test uninstallation
    let uninstall_result = app::uninstall("Browser");
    assert!(
        uninstall_result.is_ok(),
        "Uninstall failed: {:?}",
        uninstall_result
    );

    // Verify uninstallation
    let is_installed = app::is_installed("Browser").unwrap();
    assert!(!is_installed, "Browser should not be installed");

    // Cleanup
    app::set_test_config_path(None);
    cleanup_test_registry();
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_app_env_operations() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Setup test config
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    let initial_config = json!({
        "mcpServers": {}
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();
    app::set_test_config_path(Some(config_path.clone()));

    // Install app first
    app::install("Browser", None).unwrap();

    // Test saving env values
    let env_values = json!({
        "TEST_KEY": "test_value",
        "ANOTHER_KEY": "another_value"
    });
    let save_result = app::save_app_env("Browser", env_values.clone());
    assert!(
        save_result.is_ok(),
        "Failed to save env values: {:?}",
        save_result
    );

    // Test getting env values
    let get_result = app::get_app_env("Browser").unwrap();
    assert_eq!(
        get_result, env_values,
        "Retrieved env values don't match saved values"
    );

    // Cleanup
    app::set_test_config_path(None);
    cleanup_test_registry();
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_app_statuses() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Setup test config
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    let initial_config = json!({
        "mcpServers": {}
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();
    app::set_test_config_path(Some(config_path.clone()));

    // Get initial statuses
    let initial_statuses = app::get_app_statuses().unwrap();
    assert!(initial_statuses["installed"].is_object());
    assert!(initial_statuses["configured"].is_object());

    // Install an app
    app::install("Browser", None).unwrap();
    thread::sleep(Duration::from_millis(100));

    // Check updated statuses
    let updated_statuses = app::get_app_statuses().unwrap();
    assert!(
        updated_statuses["installed"]["Browser"].as_bool().unwrap(),
        "Browser should be marked as installed"
    );

    // Cleanup
    app::set_test_config_path(None);
    cleanup_test_registry();
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_app_registry() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Test getting app registry
    let registry_result = app::get_app_registry();
    assert!(registry_result.is_ok(), "Failed to get app registry");

    let registry = registry_result.unwrap();
    assert!(registry.is_array(), "Registry should be an array");

    let apps = registry.as_array().unwrap();
    assert!(!apps.is_empty(), "Registry should not be empty");

    // Verify Browser app exists with correct configuration
    let browser_app = apps.iter().find(|app| app["name"] == "Browser");
    assert!(
        browser_app.is_some(),
        "Browser app should exist in registry"
    );

    let browser_app = browser_app.unwrap();
    assert_eq!(
        browser_app["config"]["mcpKey"].as_str().unwrap(),
        "puppeteer",
        "Browser app should have correct mcpKey"
    );

    // Cleanup
    cleanup_test_registry();
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_install_with_env_vars() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Setup test config
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    let initial_config = json!({
        "mcpServers": {}
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();
    app::set_test_config_path(Some(config_path.clone()));

    // Test installation with env vars
    let env_vars = json!({
        "TEST_ENV": "test_value",
        "DEBUG": "true"
    });
    let install_result = app::install("Browser", Some(env_vars.clone()));
    assert!(
        install_result.is_ok(),
        "Install with env vars failed: {:?}",
        install_result
    );

    // Verify env vars were saved
    let saved_env = app::get_app_env("Browser").unwrap();
    assert_eq!(
        saved_env, env_vars,
        "Saved env vars don't match provided values"
    );

    // Cleanup
    app::set_test_config_path(None);
    cleanup_test_registry();
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_multiple_apps() {
    environment::set_test_mode(true);
    setup_test_registry();

    // Setup test config
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    let initial_config = json!({
        "mcpServers": {}
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();
    app::set_test_config_path(Some(config_path.clone()));

    // Install multiple apps
    app::install("Browser", None).unwrap();
    app::install("Time", None).unwrap();

    // Verify both are installed
    assert!(
        app::is_installed("Browser").unwrap(),
        "Browser should be installed"
    );
    assert!(
        app::is_installed("Time").unwrap(),
        "Time should be installed"
    );

    // Check app statuses
    let statuses = app::get_app_statuses().unwrap();
    assert!(statuses["installed"]["Browser"].as_bool().unwrap());
    assert!(statuses["installed"]["Time"].as_bool().unwrap());

    // Uninstall one app
    app::uninstall("Browser").unwrap();
    assert!(
        !app::is_installed("Browser").unwrap(),
        "Browser should be uninstalled"
    );
    assert!(
        app::is_installed("Time").unwrap(),
        "Time should still be installed"
    );

    // Cleanup
    app::set_test_config_path(None);
    cleanup_test_registry();
    environment::set_test_mode(false);
}
