#!/bin/bash

# Blockchain Voting System - Start Script
echo "🚀 Starting Blockchain Voting System..."

# Kill any existing processes on ports 8545 and 5000
echo "🔄 Cleaning up existing processes..."
pkill -f "ganache-cli" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
sleep 3

# Check if ports are free
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8545 is still in use. Force killing..."
    lsof -ti:8545 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is still in use. Force killing..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Ganache CLI with better error handling
echo "⛓️  Starting Ganache blockchain..."
npx ganache-cli --port 8545 --deterministic --accounts 10 --defaultBalanceEther 100 --quiet &
GANACHE_PID=$!

# Wait for Ganache to start with better checking
echo "⏳ Waiting for blockchain to initialize..."
for i in {1..10}; do
    if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545 > /dev/null 2>&1; then
        echo "✅ Ganache is responding!"
        break
    fi
    echo "   Attempt $i/10 - waiting..."
    sleep 2
done

# Final check
if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545 > /dev/null 2>&1; then
    echo "✅ Ganache started successfully (PID: $GANACHE_PID)"
    echo "📋 Available accounts:"
    echo "   (0) 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (100 ETH)"
    echo "   (1) 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (100 ETH)"
    echo "   ... and 8 more accounts"
    echo ""
    echo "🔗 RPC URL: http://127.0.0.1:8545"
    echo "📝 Contract Address: 0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Start the server: cd server && npm run dev"
    echo "   2. Start the client: cd client && npm run dev"
    echo ""
    echo "🛑 To stop Ganache: kill $GANACHE_PID"
    echo "📊 To check status: curl -X POST -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' http://127.0.0.1:8545"
else
    echo "❌ Failed to start Ganache after 20 seconds"
    echo "🔍 Troubleshooting:"
    echo "   - Check if port 8545 is free: lsof -i :8545"
    echo "   - Try running: npx ganache-cli --port 8545 --deterministic --accounts 10 --defaultBalanceEther 100"
    exit 1
fi