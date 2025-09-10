#!/bin/bash

# SSH Globe Tracker Desktop Launcher
# This script handles GUI launching with graphical sudo prompt

APP_NAME="SSH Globe Tracker"
APP_DIR="/opt/ssh-globe-tracker"
BACKEND_DIR="$APP_DIR/backend"

# Function to show notification
show_notification() {
    if command -v notify-send >/dev/null 2>&1; then
        notify-send "$APP_NAME" "$1" --icon=ssh-globe-tracker
    fi
}

# Function to show error dialog
show_error() {
    if command -v notify-send >/dev/null 2>&1; then
        notify-send "$APP_NAME" "Error: $1" --icon=dialog-error
    fi
}

# Function to show info dialog
show_info() {
    if command -v notify-send >/dev/null 2>&1; then
        notify-send "$APP_NAME" "$1" --icon=ssh-globe-tracker
    fi
}

# Check if already running
if pgrep -f "node.*server.js" > /dev/null; then
    show_info "SSH Globe Tracker is already running!\n\nOpen your browser to: http://localhost:3001"
    # Open browser
    xdg-open "http://localhost:3001" 2>/dev/null || \
    firefox "http://localhost:3001" 2>/dev/null || \
    chromium-browser "http://localhost:3001" 2>/dev/null || \
    google-chrome "http://localhost:3001" 2>/dev/null
    exit 0
fi

# Show starting notification
show_notification "Starting SSH Globe Tracker..."

# Start the backend with terminal-based sudo (most reliable)
if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="SSH Globe Tracker" --geometry=80x24 -- bash -c "
        echo '🚀 Starting SSH Globe Tracker...'
        echo '⏳ This will ask for your password to access system logs'
        echo ''
        cd '$BACKEND_DIR'
        sudo node server.js &
        SERVER_PID=\$!
        echo ''
        echo '⏳ Waiting for server to start...'
        sleep 3
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo '✅ SSH Globe Tracker started successfully!'
            echo '🌐 Opening browser...'
            xdg-open 'http://localhost:3001' 2>/dev/null || echo 'Please open http://localhost:3001 in your browser'
            echo ''
            echo '📋 SSH Globe Tracker is now running!'
            echo '   • Web Interface: http://localhost:3001'
            echo '   • Keep this terminal open to see logs'
            echo '   • Press Ctrl+C to stop the server'
            echo ''
            wait \$SERVER_PID
        else
            echo '❌ Failed to start server.'
            echo 'Press Enter to close.'
            read
        fi
    " & 
    disown
elif command -v konsole >/dev/null 2>&1; then
    konsole --title "SSH Globe Tracker" -e bash -c "
        echo '🚀 Starting SSH Globe Tracker...'
        cd '$BACKEND_DIR'
        sudo node server.js &
        sleep 3
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo '✅ Server started! Opening browser...'
            xdg-open 'http://localhost:3001' 2>/dev/null
            wait
        else
            echo '❌ Failed to start server. Press Enter to close.'
            read
        fi
    " &
    disown
elif command -v xterm >/dev/null 2>&1; then
    xterm -title "SSH Globe Tracker" -geometry 80x24 -e bash -c "
        echo '🚀 Starting SSH Globe Tracker...'
        cd '$BACKEND_DIR'
        sudo node server.js &
        sleep 3
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo '✅ Server started! Opening browser...'
            xdg-open 'http://localhost:3001' 2>/dev/null
            wait
        else
            echo '❌ Failed to start server. Press Enter to close.'
            read
        fi
    " &
    disown
else
    show_error "Cannot start SSH Globe Tracker. No suitable terminal found."
    exit 1
fi
