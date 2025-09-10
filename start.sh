#!/bin/bash

# Start SSH Globe Tracker with Backend API

echo "🚀 Starting SSH Globe Tracker..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the ssh-globe-tracker root directory"
    exit 1
fi

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Start backend server
echo "🔧 Starting backend API server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started successfully!"
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:8080"
echo "🔌 WebSocket: ws://localhost:3002"
echo ""
echo "📋 Available features:"
echo "   • Load from Server - loads /var/log/ssh_reports/ssh_summary_last14d.md"
echo "   • Generate Report - runs report_maker.py and loads fresh data"
echo "   • Live Monitor - shows real-time SSH connections as green dots"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
