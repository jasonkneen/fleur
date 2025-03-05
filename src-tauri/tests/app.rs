mod common;

use fleur_lib::{
    app::{self, get_app_configs, set_test_config_path},
    environment,
};
use log::{debug, error, info, warn};
use serde_json::Value;
use serial_test::serial;
use std::{thread, time::Duration};
use tempfile;
use uuid::Uuid;

#[test]
fn test_get_app_configs() {
    environment::set_test_mode(true);
    let configs = get_app_configs().expect("Failed to get app configs");
    let browser = configs
        .iter()
        .find(|(name, _)| name == "Browser")
        .expect("Browser app not found");
    assert_eq!(browser.1.mcp_key, "puppeteer");
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_install() {
    environment::set_test_mode(true);

    // Create a direct test with a unique ID
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    // Create initial config
    let initial_config = serde_json::json!({
        "mcpServers": {}
    });

    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();

    // Set the test config path
    set_test_config_path(Some(config_path.clone()));

    // Set up test app registry
    {
        let mut cache = app::APP_REGISTRY_CACHE.lock().unwrap();
        *cache = Some(serde_json::json!([{
            "name": "Browser",
            "config": {
                "mcpKey": "puppeteer",
                "runtime": "npx",
                "args": ["-y", "@modelcontextprotocol/server-puppeteer", "--debug"]
            }
        }]));
    }

    // Install the app
    let result = app::install("Browser", None);
    assert!(
        result.is_ok(),
        "Install failed with error: {:?}",
        result.err()
    );

    // Wait and verify config file
    thread::sleep(Duration::from_millis(100));

    // Read directly from the file to verify it was updated
    let config_str = std::fs::read_to_string(&config_path).unwrap();
    let config: Value = serde_json::from_str(&config_str).unwrap();

    // Check if puppeteer key exists and has expected values
    let puppeteer = &config["mcpServers"]["puppeteer"];
    assert!(
        puppeteer.is_object(),
        "Puppeteer config should be an object"
    );

    // Reset the test config path and cache
    set_test_config_path(None);
    {
        let mut cache = app::APP_REGISTRY_CACHE.lock().unwrap();
        *cache = None;
    }
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_uninstall() {
    environment::set_test_mode(true);

    // Create a direct test with a unique ID
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    // Create initial config with puppeteer already installed
    let initial_config = serde_json::json!({
        "mcpServers": {
            "puppeteer": {
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-puppeteer", "--debug"]
            }
        }
    });

    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();

    // Set the test config path
    set_test_config_path(Some(config_path.clone()));

    // Uninstall the app
    let result = app::uninstall("Browser");
    assert!(result.is_ok());

    // Wait and verify config file
    thread::sleep(Duration::from_millis(100));

    // Verify config was removed
    let config_str = std::fs::read_to_string(&config_path).unwrap();
    let config: Value = serde_json::from_str(&config_str).unwrap();

    // Check if puppeteer key was removed
    let puppeteer = &config["mcpServers"]["puppeteer"];
    assert!(
        puppeteer.is_null(),
        "Puppeteer config should be null after uninstall"
    );

    // Reset the test config path
    set_test_config_path(None);
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_app_status() {
    // Set test mode
    environment::set_test_mode(true);
    debug!("test_app_status: Starting test with test_mode set to true");

    // Create a direct test with a unique ID
    let test_id = Uuid::new_v4().to_string();
    let temp_dir = tempfile::tempdir().unwrap();
    let config_path = temp_dir
        .path()
        .join(format!("test_config_{}.json", test_id));

    // Create initial config
    let initial_config = serde_json::json!({
        "mcpServers": {}
    });

    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    )
    .unwrap();

    // Set the test config path
    set_test_config_path(Some(config_path.clone()));

    // Set up test app registry
    {
        let mut cache = app::APP_REGISTRY_CACHE.lock().unwrap();
        *cache = Some(serde_json::json!([{
            "name": "Browser",
            "config": {
                "mcpKey": "puppeteer",
                "runtime": "npx",
                "args": ["-y", "@modelcontextprotocol/server-puppeteer", "--debug"]
            }
        }]));
    }

    debug!(
        "test_app_status: App registry set up, test_mode status: {}",
        environment::is_test_mode()
    );

    // Create a separate scope for the core test logic
    {
        // Test initial status
        debug!(
            "test_app_status: Getting app statuses, test_mode: {}",
            environment::is_test_mode()
        );
        let result = match app::get_app_statuses() {
            Ok(r) => r,
            Err(e) => {
                panic!(
                    "get_app_statuses failed: {} (test_mode={})",
                    e,
                    environment::is_test_mode()
                );
            }
        };

        assert!(result["installed"].is_object());
        assert!(result["configured"].is_object());

        // Install and check status
        debug!(
            "test_app_status: Installing Browser app, test_mode: {}",
            environment::is_test_mode()
        );
        app::install("Browser", None).unwrap();
        thread::sleep(Duration::from_millis(100));

        debug!(
            "test_app_status: Getting app statuses again, test_mode: {}",
            environment::is_test_mode()
        );
        let result = app::get_app_statuses().unwrap();
        assert!(result["installed"]["Browser"].as_bool().unwrap());
    }

    // Clean up resources
    debug!("test_app_status: Cleaning up resources");
    set_test_config_path(None);
    {
        let mut cache = app::APP_REGISTRY_CACHE.lock().unwrap();
        *cache = None;
    }

    // Reset test mode at the end
    debug!("test_app_status: Test completed, resetting test_mode");
    environment::set_test_mode(false);
}

#[test]
#[serial]
fn test_stubbed_app_configs() {
    environment::set_test_mode(true);

    use fleur_lib::app::{self, APP_REGISTRY_CACHE};
    use serde_json::json;

    // Create the stubbed app registry
    let stubbed_registry = json!([{
        "name": "Browser",
        "description": "This is a browser app that allows Claude to navigate to any website, take screenshots, and interact with the page.",
        "icon": {
          "type": "url",
          "url": {
            "light": "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/browser.svg",
            "dark": "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/browser.svg"
          }
        },
        "category": "Utilities",
        "price": "Free",
        "developer": "Google LLC",
        "sourceUrl": "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
        "config": {
          "mcpKey": "puppeteer",
          "runtime": "npx",
          "args": [
            "-y",
            "@modelcontextprotocol/server-puppeteer",
            "--debug"
          ]
        },
        "features": [
          {
            "name": "Navigate to any website",
            "description": "Navigate to any URL in the browser",
            "prompt": "Navigate to the URL google.com and..."
          },
          {
            "name": "Interact with any website - search, click, scroll, screenshot, etc.",
            "description": "Click elements on the page",
            "prompt": "Go to google.com and search for..."
          }
        ],
        "setup": []
    }]);

    // Set the stubbed registry in the cache
    {
        let mut cache = APP_REGISTRY_CACHE.lock().unwrap();
        *cache = Some(stubbed_registry);
    }

    // Call get_app_configs and verify the result
    let configs = app::get_app_configs().expect("Failed to get app configs");

    // Verify we got exactly one app
    assert_eq!(configs.len(), 1, "Expected exactly one app in the configs");

    // Verify the app is the Browser app
    let (name, config) = &configs[0];
    assert_eq!(name, "Browser", "Expected app name to be 'Browser'");
    assert_eq!(
        config.mcp_key, "puppeteer",
        "Expected mcp_key to be 'puppeteer'"
    );

    // Verify the command is npx or a path to npx
    assert!(
        config.command.contains("npx"),
        "Expected command to contain 'npx'"
    );

    // Verify the args
    assert_eq!(config.args.len(), 3, "Expected 3 arguments");
    assert_eq!(config.args[0], "-y", "Expected first arg to be '-y'");
    assert_eq!(
        config.args[1], "@modelcontextprotocol/server-puppeteer",
        "Expected second arg to be '@modelcontextprotocol/server-puppeteer'"
    );
    assert_eq!(
        config.args[2], "--debug",
        "Expected third arg to be '--debug'"
    );

    // Reset the cache for other tests
    {
        let mut cache = APP_REGISTRY_CACHE.lock().unwrap();
        *cache = None;
    }

    environment::set_test_mode(false);
}
