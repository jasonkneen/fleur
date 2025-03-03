#!/bin/bash
set -e

echo "Installing Fleur from source..."

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

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
    # For zsh users (more common on macOS):
    if [[ -f ~/.zshrc ]]; then
        source ~/.zshrc
    fi
else
    echo "Bun is already installed."
fi

# Clone the repository
echo "Cloning Fleur repository..."
git clone git@github.com:fleuristes/fleur
cd fleur

# Install dependencies with Bun
echo "Installing project dependencies with Bun..."
bun install

# Build with Tauri
echo "Building Fleur with Tauri (this may take a while)..."
cd src-tauri
cargo tauri build

echo "Build complete! You can find the application in src-tauri/target/release/bundle"
