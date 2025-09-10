#!/bin/bash

# SSH Globe Tracker Launcher Script

APP_DIR="/opt/ssh-globe-tracker"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

case "$1" in
    start)
        echo "🚀 Starting SSH Globe Tracker..."
        
        # Stop any existing service first
        sudo systemctl stop ssh-globe-tracker 2>/dev/null || true
        
        # Kill any process using port 3001
        echo "🔍 Checking for processes using port 3001..."
        PORT_PID=$(sudo lsof -ti:3001 2>/dev/null || true)
        if [ ! -z "$PORT_PID" ]; then
            echo "🛑 Killing process using port 3001 (PID: $PORT_PID)..."
            sudo kill -9 $PORT_PID 2>/dev/null || true
            sleep 2
        fi
        
        # Start the backend directly with proper permissions
        echo "⏳ Starting backend server..."
        cd "$BACKEND_DIR"
        sudo -E node server.js &
        BACKEND_PID=$!
        
        # Wait for backend to be ready
        echo "⏳ Waiting for backend to be ready..."
        timeout 30 bash -c 'until curl -s http://localhost:3001/api/health > /dev/null; do sleep 1; done'
        
        if [ $? -eq 0 ]; then
            echo "✅ Backend is ready, opening web interface..."
            xdg-open "http://localhost:3001" 2>/dev/null || \
            firefox "http://localhost:3001" 2>/dev/null || \
            chromium-browser "http://localhost:3001" 2>/dev/null || \
            google-chrome "http://localhost:3001" 2>/dev/null || \
            echo "Please open http://localhost:3001 in your browser"
        else
            echo "❌ Backend failed to start within 30 seconds"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        ;;
    stop)
        echo "🛑 Stopping SSH Globe Tracker..."
        sudo systemctl stop ssh-globe-tracker 2>/dev/null || true
        sudo pkill -f "node server.js" 2>/dev/null || true
        
        # Kill any process using port 3001
        PORT_PID=$(sudo lsof -ti:3001 2>/dev/null || true)
        if [ ! -z "$PORT_PID" ]; then
            echo "🛑 Killing process using port 3001 (PID: $PORT_PID)..."
            sudo kill -9 $PORT_PID 2>/dev/null || true
        fi
        
        echo "✅ SSH Globe Tracker stopped"
        ;;
    restart)
        echo "🔄 Restarting SSH Globe Tracker..."
        sudo systemctl restart ssh-globe-tracker
        ;;
    status)
        sudo systemctl status ssh-globe-tracker
        ;;
    logs)
        sudo journalctl -u ssh-globe-tracker -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "SSH Globe Tracker - SSH Security Monitor"
        echo "Commands:"
        echo "  start   - Start the application and open web interface"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  status  - Show application status"
        echo "  logs    - Show application logs"
        exit 1
        ;;
esac
