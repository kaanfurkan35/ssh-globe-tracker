#!/bin/bash

# SSH Globe Tracker - Status Check Script

echo "🔍 SSH Globe Tracker Status Check"
echo "================================="

# Check if application is running
if pgrep -f "node server.js" > /dev/null; then
    PID=$(pgrep -f "node server.js")
    echo "✅ Application is running (PID: $PID)"
    
    # Check if API is responding
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ API is responding"
        echo "🌐 Web interface: http://localhost:3001"
        
        # Get health status
        HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null)
        if [ ! -z "$HEALTH" ]; then
            echo "📊 Health status: $HEALTH"
        fi
    else
        echo "❌ API is not responding"
    fi
    
    # Check system service status
    if systemctl is-active ssh-globe-tracker >/dev/null 2>&1; then
        echo "✅ Systemd service is active"
    else
        echo "⚠️  Systemd service is not active (running manually)"
    fi
    
    # Show process details
    echo ""
    echo "📋 Process details:"
    ps aux | grep "node server.js" | grep -v grep
    
else
    echo "❌ Application is not running"
    
    # Check if systemd service exists
    if systemctl list-unit-files ssh-globe-tracker.service >/dev/null 2>&1; then
        echo "📋 Systemd service status:"
        systemctl status ssh-globe-tracker --no-pager -l
    else
        echo "⚠️  No systemd service found"
    fi
fi

echo ""
echo "📄 Recent logs:"
if [ -f "/tmp/ssh-globe-tracker.log" ]; then
    echo "--- /tmp/ssh-globe-tracker.log (last 10 lines) ---"
    tail -10 /tmp/ssh-globe-tracker.log
else
    echo "No log file found at /tmp/ssh-globe-tracker.log"
fi

echo ""
echo "🔧 Management commands:"
echo "  🚀 Start: ~/start-ssh-globe-tracker.sh"
echo "  🛑 Stop: pkill -f 'node server.js'"
echo "  📄 Logs: tail -f /tmp/ssh-globe-tracker.log"
echo "  🔄 Restart: pkill -f 'node server.js' && ~/start-ssh-globe-tracker.sh"
