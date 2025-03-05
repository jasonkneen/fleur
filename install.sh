#!/bin/bash
set -e

echo "Installing Fleur from source..."

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

# Install Homebrew if not already installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH based on processor type
    if [[ $(uname -m) == "arm64" ]]; then
        # For Apple Silicon
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        # For Intel Macs
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "Homebrew is already installed."
fi

# Install Git if not already installed
if ! command -v git &> /dev/null; then
    echo "Installing Git using Homebrew..."
    brew install git
else
    echo "Git is already installed."
fi

# Install Rust if not already installed
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# Install cargo-tauri CLI
echo "Installing cargo-tauri CLI..."
cargo install tauri-cli

# Install Bun if not already installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun using Homebrew..."
    brew tap oven-sh/bun
    brew install bun
else
    echo "Bun is already installed."
fi

# Clone the repository
echo "Cloning Fleur repository..."
git clone https://github.com/fleuristes/fleur
cd fleur

# Install dependencies with Bun
echo "Installing project dependencies with Bun..."
bun install

# Build with Tauri
echo "Building Fleur with Tauri (this may take a while)..."
cd src-tauri
cargo tauri build

echo "Build complete!"
