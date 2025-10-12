#!/bin/bash
# Startup script for Render - ensures Sugar is installed before starting server

echo "🚀 Starting DapperDoggos Mint Server..."

# Install Sugar if not present or if corrupted
if [ ! -f "./sugar" ] || [ ! -x "./sugar" ] || [ $(stat -c%s sugar 2>/dev/null || echo 0) -lt 1000000 ]; then
    echo "📦 Installing Sugar CLI v2.6.0..."
    rm -f sugar
    
    curl -L -f -o sugar https://github.com/metaplex-foundation/sugar/releases/download/sugar-v2.6.0/sugar-linux-x86_64
    
    if [ $? -eq 0 ] && [ -f "./sugar" ]; then
        chmod +x sugar
        SIZE=$(stat -c%s sugar 2>/dev/null || stat -f%z sugar 2>/dev/null || echo 0)
        echo "✅ Sugar CLI installed successfully! (Size: $SIZE bytes)"
        ./sugar --version || echo "⚠️ Sugar version check failed"
    else
        echo "❌ Failed to install Sugar CLI"
        exit 1
    fi
else
    echo "✅ Sugar CLI already installed"
    ./sugar --version || echo "⚠️ Sugar version check failed"
fi

# Start the Node.js server
echo "🌟 Starting Mint API server..."
node server/mint-server.mjs

