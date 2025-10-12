#!/bin/bash
# Install dependencies for Sugar CLI on Ubuntu

echo "📦 Installing Sugar CLI dependencies..."

# Install libssl1.1 (required by Sugar)
apt-get update -qq
apt-get install -y libssl1.1 || {
    echo "⚠️ libssl1.1 not in default repos, trying alternatives..."
    # For Ubuntu 22.04+, libssl1.1 isn't available, so we need to add older repo
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb || true
    apt-get install -f -y
}

echo "✅ Sugar dependencies installed"

