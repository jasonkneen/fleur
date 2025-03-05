#!/bin/bash
set -e

echo "Installing Fleur..."

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

# Download pre-built application
echo "Downloading Fleur application..."
APP_URL="https://github.com/fleuristes/fleur/releases/download/v0.1.2/Fleur.app.tar.gz"
curl -L "$APP_URL" -o "$BUILD_DIR/Fleur.app.tar.gz"

# Extract the application
echo "Extracting application..."
tar -xzf "$BUILD_DIR/Fleur.app.tar.gz" -C "$BUILD_DIR"

# Remove quarantine attribute
echo "Removing quarantine attribute..."
xattr -rd com.apple.quarantine "$BUILD_DIR/Fleur.app"

# Remove existing app if it exists
if [ -d "/Applications/Fleur.app" ]; then
    echo "Removing existing Fleur installation..."
    rm -rf "/Applications/Fleur.app"
fi

# Copy to Applications
echo "Copying Fleur.app to Applications folder..."
cp -R "$BUILD_DIR/Fleur.app" /Applications/

# Set permissions
echo "Setting final permissions..."
chmod -R 755 "/Applications/Fleur.app"

echo "Installation complete! You can now find Fleur in your Applications folder."
