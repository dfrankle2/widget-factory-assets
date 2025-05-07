#!/bin/bash
# Script to clone the public repository and open it with Claude Code

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Clone the public repository
echo "Cloning public repository..."
git clone https://github.com/dfrankle2/widget-factory-assets.git "$TEMP_DIR"

# Change to the temporary directory
cd "$TEMP_DIR"
echo "Now in $(pwd)"

# Launch Claude Code
echo "Launching Claude Code..."
claude code .

# The script will pause here while Claude is running

# Once Claude is closed, clean up
echo "Cleaning up temporary directory..."
cd ~
rm -rf "$TEMP_DIR"
echo "Done!"