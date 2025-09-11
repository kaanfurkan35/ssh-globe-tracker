#!/bin/bash

# SSH Globe Tracker - Quick Deployment Script
# Usage: ./deploy.sh user@target-machine

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 user@target-machine"
    echo "Example: $0 ubuntu@192.168.1.100"
    exit 1
fi

TARGET="$1"
PROJECT_DIR="$(dirname "$(readlink -f "$0")")"

echo "🚀 Deploying SSH Globe Tracker to $TARGET"

# Check if target is reachable
echo "🔍 Testing connection to $TARGET..."
if ! ssh -o ConnectTimeout=5 "$TARGET" "echo 'Connection successful'" > /dev/null 2>&1; then
    echo "❌ Cannot connect to $TARGET"
    exit 1
fi

echo "✅ Connection successful"

# Create remote directory
echo "📁 Creating remote directory..."
ssh "$TARGET" "mkdir -p ~/ssh-globe-tracker-deployment"

# Copy project files
echo "📤 Copying project files..."
rsync -avz --progress "$PROJECT_DIR/" "$TARGET:~/ssh-globe-tracker-deployment/" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'server/node_modules' \
    --exclude '.env' \
    --exclude 'debian/ssh-globe-tracker/' \
    --exclude '*.log'

# Copy simple startup script to a convenient location
scp "$PROJECT_DIR/start-simple.sh" "$TARGET:~/start-ssh-globe-tracker.sh"

# Install and setup on target
echo "🔧 Installing on target machine..."
ssh "$TARGET" << 'EOF'
cd ~/ssh-globe-tracker-deployment

# Make scripts executable
chmod +x setup-ubuntu.sh
chmod +x start.sh
chmod +x start-simple.sh

# Make a copy of the simple startup script in home directory
cp start-simple.sh ~/start-ssh-globe-tracker.sh
chmod +x ~/start-ssh-globe-tracker.sh

# Copy status check script
cp check-status.sh ~/check-ssh-globe-tracker.sh
chmod +x ~/check-ssh-globe-tracker.sh

# Check if we have a .deb package
if [ -f "ssh-globe-tracker_1.0.0_all.deb" ]; then
    echo "📦 Installing from .deb package..."
    sudo dpkg -i ssh-globe-tracker_1.0.0_all.deb 2>/dev/null || sudo apt-get install -f -y
    echo "✅ Package installation completed"
else
    echo "🔧 Running manual setup..."
    sudo ./setup-ubuntu.sh
fi

# Test installation
if command -v ssh-globe-tracker >/dev/null 2>&1; then
    echo "✅ SSH Globe Tracker command is available"
    echo "🚀 Starting service..."
    
    # Try to start with systemd first (no sudo password needed for starting services)
    if systemctl is-enabled ssh-globe-tracker >/dev/null 2>&1 || systemctl list-unit-files ssh-globe-tracker.service >/dev/null 2>&1; then
        echo "📋 Using systemd service..."
        sudo systemctl start ssh-globe-tracker
        sleep 3
        if systemctl is-active ssh-globe-tracker >/dev/null 2>&1; then
            echo "✅ Service started successfully via systemd"
        else
            echo "⚠️  Systemd service failed, trying alternative method..."
            # Start manually in background
            cd /opt/ssh-globe-tracker/backend && nohup node server.js > /tmp/ssh-globe-tracker.log 2>&1 &
            sleep 3
        fi
    else
        echo "📋 Starting manually..."
        cd /opt/ssh-globe-tracker/backend && nohup node server.js > /tmp/ssh-globe-tracker.log 2>&1 &
        sleep 3
    fi
    
    # Test if the service is responding
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        echo "✅ Service is responding"
    else
        echo "⚠️  Service may not be fully ready yet. Check logs: tail -f /tmp/ssh-globe-tracker.log"
    fi
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Web interface will be available at: http://$(hostname -I | awk '{print $1}'):3001"
    echo ""
    echo "📋 Useful commands:"
    echo "  ssh-globe-tracker status  - Check service status"
    echo "  ssh-globe-tracker stop    - Stop the service"
    echo "  ssh-globe-tracker logs    - View service logs"
    echo "  tail -f /tmp/ssh-globe-tracker.log  - View direct logs"
    echo ""
    echo "🚀 Alternative startup (no sudo required):"
    echo "  ~/start-ssh-globe-tracker.sh"
    echo ""
    echo "💡 If service needs manual restart:"
    echo "  sudo systemctl start ssh-globe-tracker"
else
    echo "❌ Installation failed. Please check the logs above."
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Access the web interface at: http://$TARGET:3001"
    echo "🔗 Or create SSH tunnel: ssh -L 3001:localhost:3001 $TARGET"
    echo ""
    echo "📋 To manage the service on the target machine:"
    echo "  ssh $TARGET 'ssh-globe-tracker status'"
    echo "  ssh $TARGET 'ssh-globe-tracker stop'"
    echo "  ssh $TARGET 'ssh-globe-tracker logs'"
else
    echo "❌ Deployment failed. Check the output above for errors."
    exit 1
fi
