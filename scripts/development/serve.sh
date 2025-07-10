#!/bin/bash
# Simple server script for the Signals & Actions app

echo "🚀 Starting Signals & Actions..."
echo "📍 Navigate to http://localhost:4200"
echo "🛑 Press Ctrl+C to stop"
echo ""

cd app && python3 -m http.server 4200