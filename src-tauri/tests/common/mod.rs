use std::path::PathBuf;
use tempfile::TempDir;
use serde_json::json;

#[allow(dead_code)]
pub fn setup_test_config() -> (PathBuf, TempDir) {
    let temp_dir = tempfile::tempdir().unwrap();
    let config_dir = temp_dir.path().join("Library/Application Support/Claude");
    std::fs::create_dir_all(&config_dir).unwrap();

    let config_path = config_dir.join("claude_desktop_config.json");
    let initial_config = json!({
        "mcpServers": {}
    });

    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&initial_config).unwrap(),
    ).unwrap();

    (config_path, temp_dir)
}
