#!/bin/bash

# Start SSH Globe Tracker Web Interface
set -e

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout 30 bash -c 'until curl -s http://localhost:3001/api/health > /dev/null; do sleep 1; done'

if [ $? -eq 0 ]; then
    echo "✅ Backend is ready, opening web interface..."
    # Open the web interface in default browser
    xdg-open "http://localhost:8080" || firefox "http://localhost:8080" || google-chrome "http://localhost:8080"
else
    echo "❌ Backend failed to start within 30 seconds"
    exit 1
fi
