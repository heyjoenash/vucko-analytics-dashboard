#!/bin/bash

echo "🚀 Starting Signals & Actions Lite"
echo "================================="
echo ""

# Safety check - ensure we're not using forbidden ports
if lsof -ti:3000 >/dev/null 2>&1 || lsof -ti:5000 >/dev/null 2>&1; then
    echo "⚠️  WARNING: Ports 3000 or 5000 are in use by other projects"
    echo "   This project uses ports 4200 (frontend) and 4201 (backend)"
    echo ""
fi

# Kill any existing processes on our ports
echo "🧹 Cleaning up any existing processes..."
lsof -ti:4201 | xargs kill -9 2>/dev/null
lsof -ti:4200 | xargs kill -9 2>/dev/null

# Start backend API
echo "🔧 Starting backend API on port 4201..."
cd backend && python3 main.py &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend on port 4200..."
cd ../frontend && python3 -m http.server 4200 &
FRONTEND_PID=$!

# Give everything a moment to start
sleep 2

echo ""
echo "✅ Signals & Actions Lite is running!"
echo "====================================="
echo "📊 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:4201"
echo "📚 API Docs: http://localhost:4201/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait