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

# Install uv if not already installed
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Source the updated PATH to use uv immediately
    export PATH="$HOME/.cargo/bin:$PATH"
else
    echo "uv is already installed."
fi

# Install nvm if not already installed
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# Load nvm regardless of whether it was just installed or already existed
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
echo "nvm is ready."

# Install specified node version
NODE_VERSION="v20.9.0"
if ! command -v nvm &> /dev/null; then
    echo "Error: nvm command not available. Something went wrong with the nvm setup."
    exit 1
fi

echo "Checking Node.js version..."
if ! nvm ls "$NODE_VERSION" | grep -q "$NODE_VERSION"; then
    echo "Installing Node.js $NODE_VERSION..."
    nvm install "$NODE_VERSION"
else
    echo "Node.js $NODE_VERSION is already installed."
fi
nvm use "$NODE_VERSION"

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
