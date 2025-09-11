#!/bin/bash

# SSH Globe Tracker - Uninstall Script
# This script completely removes SSH Globe Tracker from the system

echo "🗑️  SSH Globe Tracker Uninstall Script"
echo "======================================"

# Stop and disable service
echo "🛑 Stopping service..."
sudo systemctl stop ssh-globe-tracker 2>/dev/null || true
sudo systemctl disable ssh-globe-tracker 2>/dev/null || true

# Remove systemd service file
echo "🗂️  Removing systemd service..."
sudo rm -f /etc/systemd/system/ssh-globe-tracker.service

# Remove command script
echo "📜 Removing command script..."
sudo rm -f /usr/bin/ssh-globe-tracker

# Remove application directory
echo "📁 Removing application directory..."
sudo rm -rf /opt/ssh-globe-tracker

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Remove log files (optional - ask user)
read -p "🗂️  Remove log files in /var/log/ssh_reports? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo rm -rf /var/log/ssh_reports
    echo "✅ Log files removed"
else
    echo "📄 Log files preserved"
fi

# Remove desktop entry (if exists)
rm -f ~/.local/share/applications/ssh-globe-tracker.desktop 2>/dev/null || true

# Kill any running processes
echo "🔪 Killing any running processes..."
sudo pkill -f "node server.js" 2>/dev/null || true
sudo pkill -f "ssh-globe-tracker" 2>/dev/null || true

echo ""
echo "✅ SSH Globe Tracker has been completely uninstalled"
echo "💡 The source code in your home directory was not removed"
echo "🔧 To reinstall, run: sudo ./setup-ubuntu.sh"
