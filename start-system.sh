#!/bin/bash

# Blockchain Voting System - Complete Startup Script
# This script starts all services in the correct order

set -e

echo "🚀 Starting Blockchain Voting System..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Kill existing processes
print_status "Cleaning up existing processes..."
pkill -f "ganache-cli" 2>/dev/null || true
pkill -f "nodemon.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Step 1: Start Blockchain
print_status "Step 1: Starting Ganache blockchain..."
if check_port 8545; then
    print_warning "Port 8545 is already in use. Killing existing process..."
    pkill -f "ganache-cli" 2>/dev/null || true
    sleep 2
fi

./start-blockchain.sh &
BLOCKCHAIN_PID=$!

# Wait for blockchain to be ready
if wait_for_service "http://127.0.0.1:8545" "Blockchain"; then
    print_success "Blockchain started successfully (PID: $BLOCKCHAIN_PID)"
else
    print_error "Failed to start blockchain"
    exit 1
fi

# Step 2: Start Backend Server
print_status "Step 2: Starting backend server..."
if check_port 5000; then
    print_warning "Port 5000 is already in use. Killing existing process..."
    pkill -f "nodemon.*server.js" 2>/dev/null || true
    sleep 2
fi

cd server
npm run dev &
SERVER_PID=$!
cd ..

# Wait for server to be ready
if wait_for_service "http://localhost:5000/api/health" "Backend Server"; then
    print_success "Backend server started successfully (PID: $SERVER_PID)"
else
    print_error "Failed to start backend server"
    exit 1
fi

# Step 3: Start Frontend Client
print_status "Step 3: Starting frontend client..."
if check_port 5173; then
    print_warning "Port 5173 is already in use. Will try alternative port..."
fi

cd client
npm run dev &
CLIENT_PID=$!
cd ..

# Wait for client to be ready
if wait_for_service "http://localhost:5173" "Frontend Client"; then
    print_success "Frontend client started successfully (PID: $CLIENT_PID)"
else
    print_warning "Frontend client may be running on a different port (5174)"
fi

# Final status check
echo ""
echo "🎉 System Startup Complete!"
echo "=========================="
echo ""
print_success "All services are running:"
echo "  🔗 Blockchain: http://127.0.0.1:8545 (PID: $BLOCKCHAIN_PID)"
echo "  🖥️  Backend:   http://localhost:5000 (PID: $SERVER_PID)"
echo "  🌐 Frontend:  http://localhost:5173 (PID: $CLIENT_PID)"
echo ""
echo "📊 System Status:"
curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || echo "  ✅ Backend API responding"
echo ""
echo "🛑 To stop all services:"
echo "  kill $BLOCKCHAIN_PID $SERVER_PID $CLIENT_PID"
echo ""
echo "📝 Logs:"
echo "  Blockchain: Check terminal output"
echo "  Backend:    Check server terminal"
echo "  Frontend:   Check client terminal"
echo ""
print_success "Blockchain Voting System is ready for use! 🚀"