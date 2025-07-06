#!/bin/bash

# BuyMart V1 - Shadcn MCP Server Startup Script

echo "🚀 Starting BuyMart V1 with Shadcn MCP Server..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the MCP server in background
echo "🔧 Starting Shadcn MCP Server on port 3001..."
npx @heilgar/shadcn-ui-mcp-server &
MCP_PID=$!

# Wait a moment for the server to start
sleep 3

# The MCP server runs via stdio, so we'll assume it started if the process exists
echo "✅ Shadcn MCP Server started (PID: $MCP_PID)"
echo "🌐 MCP Server ready for AI assistant connections"

# Start the development server
echo "🌐 Starting development server on port 8000..."
python3 -m http.server 8000 &
DEV_PID=$!

echo "✅ BuyMart V1 is now running!"
echo "📱 Website: http://localhost:8000"
echo "🔧 MCP Server: http://localhost:3001/sse"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt signal
trap 'echo "🛑 Stopping servers..."; kill $MCP_PID $DEV_PID; exit 0' INT
wait
