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

# Create a directory for downloads
BUILD_DIR="$HOME/.fleur-build"
mkdir -p "$BUILD_DIR"
echo "Using build directory: $BUILD_DIR"

# Clean up on exit or error
trap 'echo "Cleaning up build directory..."; rm -rf "$BUILD_DIR"' EXIT

# Download pre-built frontend assets
echo "Downloading pre-built frontend assets..."
FRONTEND_URL="https://github.com/fleuristes/fleur/releases/latest/download/dist.tar.gz"
curl -L "$FRONTEND_URL" -o "$BUILD_DIR/dist.tar.gz"
tar xzf "$BUILD_DIR/dist.tar.gz" -C "$BUILD_DIR"

# Install Rust if not already installed (required for building)
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# Install cargo-tauri CLI
echo "Installing cargo-tauri CLI..."
cargo install tauri-cli

# Download the source code (without git)
echo "Downloading source code..."
curl -L "https://github.com/fleuristes/fleur/archive/refs/heads/main.tar.gz" -o "$BUILD_DIR/source.tar.gz"
tar xzf "$BUILD_DIR/source.tar.gz" -C "$BUILD_DIR"
cd "$BUILD_DIR/fleur-main"

# Copy pre-built frontend assets
echo "Setting up frontend assets..."
rm -rf src-tauri/dist
cp -r "$BUILD_DIR/dist" src-tauri/

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

# Install the application
echo "Installing Fleur to Applications folder..."
DMG_PATH=$(find target/release/bundle/dmg -name "*.dmg" -type f)

if [ ! -f "$DMG_PATH" ]; then
    echo "Error: DMG file not found"
    exit 1
fi

# Remove existing app if it exists
if [ -d "/Applications/Fleur.app" ]; then
    echo "Removing existing Fleur installation..."
    sudo rm -rf "/Applications/Fleur.app"
fi

# Mount the DMG
echo "Mounting DMG..."
MOUNT_PATH=$(hdiutil attach "$DMG_PATH" -nobrowse | grep '/Volumes/' | tail -n 1 | cut -f 3-)

if [ -z "$MOUNT_PATH" ]; then
    echo "Error: Failed to mount DMG"
    exit 1
fi

# Copy the app to Applications with sudo
echo "Copying Fleur.app to Applications folder..."
sudo cp -R "$MOUNT_PATH/Fleur.app" /Applications/

# Set proper ownership
echo "Setting permissions..."
sudo chown -R $(whoami):staff "/Applications/Fleur.app"
sudo chmod -R 755 "/Applications/Fleur.app"

# Unmount the DMG
echo "Cleaning up..."
hdiutil detach "$MOUNT_PATH" -quiet

echo "Installation complete! You can now find Fleur in your Applications folder."
