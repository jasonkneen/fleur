use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum OSType {
    MacOS,
    Linux,
    Windows,
}

impl OSType {
    pub fn default() -> OSType {
        OSType::MacOS
    }
}