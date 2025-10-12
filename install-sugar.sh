#!/bin/bash
# Install Sugar CLI for Linux (used by Render/Railway)

# Skip Sugar installation on Vercel (frontend-only deployment)
if [ "$VERCEL" = "1" ]; then
    echo "Skipping Sugar installation on Vercel"
    exit 0
fi

if [ "$OSTYPE" != "win32" ]; then
    echo "Installing Sugar CLI v2.6.0 for Linux..."
    
    # Remove old version if exists
    rm -f sugar
    
    # Download specific Sugar version that's compatible
    # Using v2.6.0 which is stable and widely compatible
    curl -L https://github.com/metaplex-foundation/sugar/releases/download/sugar-v2.6.0/sugar-ubuntu-latest -o sugar
    
    # Make it executable
    chmod +x sugar
    
    echo "Sugar CLI v2.6.0 installed successfully!"
    ./sugar --version
else
    echo "Sugar already installed or running on Windows"
fi



