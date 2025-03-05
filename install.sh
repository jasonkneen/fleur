#!/bin/bash
set -e

echo "Building Fleur from source..."

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "Error: Fleur is currently only compatible with macOS."
    echo "This installation script does not support Linux or Windows yet."
    exit 1
fi

# Check if curl is available (it should be on all macOS systems by default)
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed. It should be available on macOS by default."
    exit 1
fi

# Create temp directory for downloads
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Download pre-built frontend assets
echo "Downloading pre-built frontend assets..."
FRONTEND_URL="https://github.com/fleuristes/fleur/releases/latest/download/dist.tar.gz"
curl -L "$FRONTEND_URL" -o "$TEMP_DIR/dist.tar.gz"
tar xzf "$TEMP_DIR/dist.tar.gz" -C "$TEMP_DIR"

# Install Rust if not already installed (required for building)
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# Download the source code (without git)
echo "Downloading source code..."
curl -L "https://github.com/fleuristes/fleur/archive/refs/heads/main.tar.gz" -o "$TEMP_DIR/source.tar.gz"
tar xzf "$TEMP_DIR/source.tar.gz" -C "$TEMP_DIR"
cd "$TEMP_DIR/fleur-main"

# Copy pre-built frontend assets
echo "Setting up frontend assets..."
rm -rf src-tauri/dist
cp -r "$TEMP_DIR/dist" src-tauri/

# Create a temporary config for building without frontend
echo "Configuring build..."
cat > src-tauri/tauri.conf.install.json << 'EOL'
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Fleur",
  "version": "0.1.2",
  "identifier": "com.fleur.app",
  "build": {
    "beforeDevCommand": "",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "",
    "frontendDist": "dist"
  },
  "app": {
    "windows": [
      {
        "title": "Fleur",
        "width": 800,
        "height": 600,
        "fullscreen": false,
        "center": true,
        "decorations": true,
        "resizable": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDVGODVDQzZBM0EzOEIzODIKUldTQ3N6ZzZhc3lGWHcydHl6L3Z3ejVya29NYUpRNEJRZmRRb0lzWW4xV25vdTQrSXpBdzR0Z1kK",
      "endpoints": [
        "https://github.com/fleuristes/fleur/releases/latest/download/latest.json"
      ]
    }
  }
}
EOL

# Build with Tauri (using pre-built frontend)
echo "Building Fleur with Tauri (this may take a while)..."
cd src-tauri
cargo tauri build --config tauri.conf.install.json

echo "Installation complete! You can now find Fleur in your Applications folder."
