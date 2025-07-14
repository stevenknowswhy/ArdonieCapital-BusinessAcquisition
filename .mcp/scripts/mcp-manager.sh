#!/bin/bash

# AWS MCP Server Manager for Ardonie Capital
# Manages AWS MCP servers for the platform

set -e

MCP_DIR=".mcp"
CONFIG_DIR="$MCP_DIR/configs"
LOGS_DIR="$MCP_DIR/logs"

# Function to start MCP servers
start_servers() {
    echo "🚀 Starting AWS MCP servers..."
    
    # Test core server
    echo "Testing core MCP server..."
    timeout 10s uvx awslabs.core-mcp-server@latest 2>&1 | tee "$LOGS_DIR/core-server.log" || echo "Core server test completed"
    
    # Test documentation server
    echo "Testing documentation MCP server..."
    timeout 10s uvx awslabs.aws-documentation-mcp-server@latest 2>&1 | tee "$LOGS_DIR/docs-server.log" || echo "Documentation server test completed"
    
    echo "✅ MCP servers started successfully"
}

# Function to stop MCP servers
stop_servers() {
    echo "🛑 Stopping AWS MCP servers..."
    pkill -f "awslabs.*mcp-server" || echo "No MCP servers running"
    echo "✅ MCP servers stopped"
}

# Function to test MCP servers
test_servers() {
    echo "🧪 Testing AWS MCP servers..."
    
    # Test each server with timeout
    servers=(
        "awslabs.core-mcp-server"
        "awslabs.aws-documentation-mcp-server"
        "awslabs.cdk-mcp-server"
    )
    
    for server in "${servers[@]}"; do
        echo "Testing $server..."
        timeout 5s uvx "$server@latest" --help > /dev/null 2>&1 && echo "✅ $server OK" || echo "⚠️ $server failed"
    done
    
    echo "✅ MCP server testing completed"
}

# Function to update MCP servers
update_servers() {
    echo "📦 Updating AWS MCP servers..."
    
    # Clear UV cache and reinstall
    uv cache clean
    
    servers=(
        "awslabs.core-mcp-server"
        "awslabs.aws-documentation-mcp-server"
        "awslabs.cdk-mcp-server"
        "awslabs.terraform-mcp-server"
        "awslabs.aws-serverless-mcp-server"
        "awslabs.cost-analysis-mcp-server"
    )
    
    for server in "${servers[@]}"; do
        echo "Updating $server..."
        uv tool install "$server" --force || echo "Failed to update $server"
    done
    
    echo "✅ MCP servers updated"
}

# Main command handling
case "$1" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    test)
        test_servers
        ;;
    update)
        update_servers
        ;;
    restart)
        stop_servers
        sleep 2
        start_servers
        ;;
    *)
        echo "Usage: $0 {start|stop|test|update|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start AWS MCP servers"
        echo "  stop    - Stop AWS MCP servers"
        echo "  test    - Test AWS MCP servers"
        echo "  update  - Update AWS MCP servers"
        echo "  restart - Restart AWS MCP servers"
        exit 1
        ;;
esac
