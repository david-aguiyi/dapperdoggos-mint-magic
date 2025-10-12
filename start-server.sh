#!/bin/bash
# Startup script for Render

echo "🚀 Starting DapperDoggos Mint Server..."
echo "ℹ️ Using Metaplex SDK (no Sugar CLI needed)"

# Start the Node.js server
echo "🌟 Starting Mint API server..."
node server/mint-server.mjs
