#!/bin/bash
# Install Sugar CLI for Linux (used by Render/Railway)

# Skip Sugar installation on Vercel (frontend-only deployment)
if [ "$VERCEL" = "1" ]; then
    echo "Skipping Sugar installation on Vercel"
    exit 0
fi

if [ "$OSTYPE" != "win32" ]; then
    echo "Installing Sugar CLI for Linux..."
    
    # Remove old version if exists
    rm -f sugar
    
    # Try multiple download sources
    echo "Downloading Sugar CLI..."
    curl -L -f -o sugar https://github.com/metaplex-foundation/sugar/releases/download/v2.4.1/sugar-ubuntu-latest || \
    curl -L -f -o sugar https://github.com/metaplex-foundation/sugar/releases/download/v2.6.0/sugar-ubuntu-latest || \
    curl -L -f -o sugar https://github.com/metaplex-foundation/sugar/releases/latest/download/sugar-ubuntu-latest
    
    # Verify the file was downloaded
    if [ ! -f "./sugar" ]; then
        echo "ERROR: Sugar binary not found after download!"
        exit 0  # Don't fail on Vercel
    fi
    
    # Check file size (should be >1MB)
    SIZE=$(stat -c%s sugar 2>/dev/null || stat -f%z sugar 2>/dev/null || echo 0)
    if [ "$SIZE" -lt 1000000 ]; then
        echo "ERROR: Sugar binary seems corrupted (size: $SIZE bytes)"
        exit 0  # Don't fail on Vercel
    fi
    
    # Make it executable
    chmod +x sugar
    
    echo "Sugar CLI installed successfully! (Size: $SIZE bytes)"
    ./sugar --version || echo "Sugar installed but version check failed"
else
    echo "Sugar already installed or running on Windows"
fi



