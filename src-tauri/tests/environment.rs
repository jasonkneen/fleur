mod common;

use fleur_lib::environment;

#[test]
fn test_environment_setup() {
    let result = environment::ensure_environment();
    assert!(result.is_ok());
}

#[test]
fn test_node_environment() {
    let result = environment::ensure_npx_shim();
    assert!(result.is_ok());
    assert!(result.unwrap().contains("npx-fleur"));
}
