#!/bin/bash

# Blockchain Voting System - Stop All Services Script
# This script stops all running services

set -e

echo "🛑 Stopping Blockchain Voting System..."
echo "======================================"

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

# Function to stop a service
stop_service() {
    local service_name=$1
    local process_pattern=$2
    
    print_status "Stopping $service_name..."
    
    if pgrep -f "$process_pattern" > /dev/null; then
        pkill -f "$process_pattern"
        sleep 2
        
        # Check if still running
        if pgrep -f "$process_pattern" > /dev/null; then
            print_warning "$service_name still running, force killing..."
            pkill -9 -f "$process_pattern"
            sleep 1
        fi
        
        if ! pgrep -f "$process_pattern" > /dev/null; then
            print_success "$service_name stopped successfully"
        else
            print_error "Failed to stop $service_name"
        fi
    else
        print_warning "$service_name is not running"
    fi
}

# Stop all services
print_status "Stopping all services..."

# Stop Frontend Client (Vite)
stop_service "Frontend Client" "vite"

# Stop Backend Server (Nodemon)
stop_service "Backend Server" "nodemon.*server.js"

# Stop Blockchain (Ganache)
stop_service "Blockchain (Ganache)" "ganache-cli"

# Additional cleanup
print_status "Performing additional cleanup..."

# Kill any remaining Node.js processes related to our project
if pgrep -f "node.*BlockChainVotingSystem" > /dev/null; then
    print_status "Stopping remaining Node.js processes..."
    pkill -f "node.*BlockChainVotingSystem" 2>/dev/null || true
fi

# Kill any processes on our ports
for port in 5173 5174 5000 8545; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Final verification
echo ""
print_status "Verifying all services are stopped..."

services_stopped=true

if pgrep -f "vite" > /dev/null; then
    print_warning "Frontend client may still be running"
    services_stopped=false
fi

if pgrep -f "nodemon.*server.js" > /dev/null; then
    print_warning "Backend server may still be running"
    services_stopped=false
fi

if pgrep -f "ganache-cli" > /dev/null; then
    print_warning "Blockchain may still be running"
    services_stopped=false
fi

# Check ports
for port in 5173 5174 5000 8545; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is still in use"
        services_stopped=false
    fi
done

echo ""
if [ "$services_stopped" = true ]; then
    print_success "All services stopped successfully! 🎉"
else
    print_warning "Some services may still be running. Check manually if needed."
fi

echo ""
echo "📊 System Status:"
echo "  🔗 Blockchain: Stopped"
echo "  🖥️  Backend:   Stopped"
echo "  🌐 Frontend:  Stopped"
echo ""
echo "💡 To start the system again, run: ./start-system.sh"
echo ""
print_success "Blockchain Voting System shutdown complete! 👋"
