#!/bin/bash

# SSH Globe Tracker - Simple Startup Script (No Sudo Required)
# This script starts the application without requiring sudo passwords

APP_DIR="/opt/ssh-globe-tracker"
BACKEND_DIR="$APP_DIR/backend"

echo "🚀 Starting SSH Globe Tracker (Simple Mode)..."

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    echo "💡 Make sure the application is installed properly"
    exit 1
fi

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Kill any existing processes
echo "🔍 Checking for existing processes..."
pkill -f "node server.js" 2>/dev/null || true

# Wait a moment
sleep 2

# Start the backend
echo "⏳ Starting backend server..."
cd "$BACKEND_DIR"

# Start with current user permissions (limited log access)
nohup node server.js > /tmp/ssh-globe-tracker.log 2>&1 &
BACKEND_PID=$!

echo "💾 Process ID: $BACKEND_PID"
echo "📄 Logs: /tmp/ssh-globe-tracker.log"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout 30 bash -c 'until curl -s http://localhost:3001/api/health > /dev/null 2>&1; do sleep 1; done'

if [ $? -eq 0 ]; then
    echo "✅ Backend is ready!"
    echo "🌐 Web interface: http://localhost:3001"
    echo "📊 Health check: curl http://localhost:3001/api/health"
    echo ""
    echo "📋 Management commands:"
    echo "  🔍 Check process: ps aux | grep 'node server.js'"
    echo "  📄 View logs: tail -f /tmp/ssh-globe-tracker.log"
    echo "  🛑 Stop: pkill -f 'node server.js'"
    echo ""
    echo "⚠️  Note: Running with limited permissions (no SSH log monitoring)"
    echo "💡 For full features, use: sudo systemctl start ssh-globe-tracker"
    
    # Try to open browser (optional)
    (xdg-open "http://localhost:3001" 2>/dev/null || echo "Open http://localhost:3001 in your browser") &
    
    disown
else
    echo "❌ Backend failed to start within 30 seconds"
    echo "📄 Check logs: tail /tmp/ssh-globe-tracker.log"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
