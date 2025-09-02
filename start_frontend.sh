#!/bin/bash

# CareDock Frontend Startup Script

echo "🏥 Starting CareDock Frontend..."

# Check if we're in the right directory
if [ ! -f "frontend/index.html" ]; then
    echo "❌ Error: Please run this script from the CareDock root directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python is not installed"
    exit 1
fi

# Start the server
echo "🚀 Starting frontend server..."
echo "📖 Frontend will be available at:"
echo "   - Main Page: http://localhost:8001"
echo "   - Direct File: file://$(pwd)/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD -m http.server 8001
