#!/bin/bash
# Script to clone the public repository to a fixed location

# Define the directory for the public repository
PUBLIC_REPO_DIR="/Users/dfrankle/Documents/GitHub/widget-factory-assets"

# Check if the directory already exists
if [ -d "$PUBLIC_REPO_DIR" ]; then
  echo "Directory already exists: $PUBLIC_REPO_DIR"
  echo "Updating repository..."
  cd "$PUBLIC_REPO_DIR"
  git pull
else
  echo "Creating directory: $PUBLIC_REPO_DIR"
  mkdir -p "$PUBLIC_REPO_DIR"
  
  # Clone the public repository
  echo "Cloning public repository..."
  git clone https://github.com/dfrankle2/widget-factory-assets.git "$PUBLIC_REPO_DIR"
fi

# Navigate to the public repository
cd "$PUBLIC_REPO_DIR"
echo "Now in $(pwd)"

# Print instructions
echo ""
echo "Public repository is ready at: $PUBLIC_REPO_DIR"
echo ""
echo "To work with Claude Code on this repository, run:"
echo "cd $PUBLIC_REPO_DIR && claude code ."
echo ""
echo "Or simply run: claude code $PUBLIC_REPO_DIR"