#!/bin/bash
# Install Sugar CLI for Linux (used by Render/Railway)

# Skip Sugar installation on Vercel (frontend-only deployment)
if [ "$VERCEL" = "1" ]; then
    echo "Skipping Sugar installation on Vercel"
    exit 0
fi

if [ "$OSTYPE" != "win32" ] && [ ! -f "./sugar" ]; then
    echo "Installing Sugar CLI for Linux..."
    
    # Download Sugar for Linux
    curl -L https://github.com/metaplex-foundation/sugar/releases/latest/download/sugar-ubuntu-latest -o sugar
    
    # Make it executable
    chmod +x sugar
    
    echo "Sugar CLI installed successfully!"
else
    echo "Sugar already installed or running on Windows"
fi



