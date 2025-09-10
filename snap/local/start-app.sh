#!/bin/bash

# Start SSH Globe Tracker Backend
set -e

# Set up environment
export NODE_ENV=production
export PORT=${PORT:-3001}

# Create necessary directories in snap data
mkdir -p $SNAP_DATA/logs
mkdir -p $SNAP_DATA/reports

# Set up log directory path for the application
export SSH_REPORTS_DIR="$SNAP_DATA/reports/"

# Start the backend server
echo "🚀 Starting SSH Globe Tracker Backend..."
echo "📁 Data directory: $SNAP_DATA"
echo "📁 App directory: $SNAP"

# Check if server directory exists
if [ -d "$SNAP/server" ]; then
    cd $SNAP/server
    exec node server.js
else
    echo "❌ Server directory not found at $SNAP/server"
    ls -la $SNAP/
    exit 1
fi
