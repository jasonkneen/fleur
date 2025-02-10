mod common;

use fleur_lib::environment;

#[test]
fn test_environment_setup() {
    let result = environment::ensure_environment();
    assert!(result.is_ok());
}
