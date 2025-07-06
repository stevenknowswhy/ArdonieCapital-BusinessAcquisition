#!/usr/bin/env node

/**
 * MCP Server Setup Script for BuyMart V1
 * Sets up Shadcn UI MCP Server integration with various AI assistants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'mcp-config.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('❌ Failed to load MCP configuration:', error.message);
      process.exit(1);
    }
  }

  async setupClaudeDesktop() {
    console.log('🔧 Setting up Claude Desktop integration...');
    
    const isWindows = os.platform() === 'win32';
    const configPath = isWindows 
      ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
      : path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');

    const claudeConfig = {
      mcpServers: this.config.mcpServers
    };

    try {
      // Create directory if it doesn't exist
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Write or merge with existing config
      let existingConfig = {};
      if (fs.existsSync(configPath)) {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      const mergedConfig = {
        ...existingConfig,
        mcpServers: {
          ...existingConfig.mcpServers,
          ...claudeConfig.mcpServers
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
      console.log('✅ Claude Desktop configuration updated');
      console.log(`📁 Config location: ${configPath}`);
    } catch (error) {
      console.warn('⚠️  Could not setup Claude Desktop automatically:', error.message);
      console.log('📋 Manual setup required - add this to your Claude Desktop config:');
      console.log(JSON.stringify(claudeConfig, null, 2));
    }
  }

  async setupCursor() {
    console.log('🔧 Setting up Cursor integration...');
    
    const cursorConfigPath = path.join(this.projectRoot, '.cursor', 'mcp.json');
    const cursorConfig = {
      mcpServers: this.config.mcpServers
    };

    try {
      const cursorDir = path.dirname(cursorConfigPath);
      if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
      }

      fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2));
      console.log('✅ Cursor configuration created');
      console.log(`📁 Config location: ${cursorConfigPath}`);
    } catch (error) {
      console.error('❌ Failed to setup Cursor configuration:', error.message);
    }
  }

  async setupWindsurf() {
    console.log('🔧 Setting up Windsurf integration...');
    
    const windsurfConfigPath = path.join(this.projectRoot, 'codeium', 'windsurf', 'model_config.json');
    const windsurfConfig = {
      mcpServers: this.config.mcpServers
    };

    try {
      const windsurfDir = path.dirname(windsurfConfigPath);
      if (!fs.existsSync(windsurfDir)) {
        fs.mkdirSync(windsurfDir, { recursive: true });
      }

      fs.writeFileSync(windsurfConfigPath, JSON.stringify(windsurfConfig, null, 2));
      console.log('✅ Windsurf configuration created');
      console.log(`📁 Config location: ${windsurfConfigPath}`);
    } catch (error) {
      console.error('❌ Failed to setup Windsurf configuration:', error.message);
    }
  }

  async setupVSCode() {
    console.log('🔧 Setting up VS Code integration...');
    
    const vscodeConfigPath = path.join(this.projectRoot, '.vscode', 'settings.json');
    
    try {
      const vscodeDir = path.dirname(vscodeConfigPath);
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }

      let vscodeSettings = {};
      if (fs.existsSync(vscodeConfigPath)) {
        vscodeSettings = JSON.parse(fs.readFileSync(vscodeConfigPath, 'utf8'));
      }

      // Add MCP server configuration for VS Code
      vscodeSettings['mcp.servers'] = this.config.mcpServers;
      vscodeSettings['mcp.endpoint'] = this.config.server.endpoints.sse;

      fs.writeFileSync(vscodeConfigPath, JSON.stringify(vscodeSettings, null, 2));
      console.log('✅ VS Code configuration updated');
      console.log(`📁 Config location: ${vscodeConfigPath}`);
    } catch (error) {
      console.error('❌ Failed to setup VS Code configuration:', error.message);
    }
  }

  async createStartupScript() {
    console.log('🔧 Creating startup script...');
    
    const startupScript = `#!/bin/bash

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
sleep 2

# Check if MCP server is running
if ps -p $MCP_PID > /dev/null; then
    echo "✅ Shadcn MCP Server started successfully (PID: $MCP_PID)"
    echo "🌐 SSE Endpoint: http://localhost:3001/sse"
else
    echo "❌ Failed to start Shadcn MCP Server"
    exit 1
fi

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
`;

    const scriptPath = path.join(this.projectRoot, 'start-with-mcp.sh');
    fs.writeFileSync(scriptPath, startupScript);
    
    // Make script executable on Unix systems
    if (os.platform() !== 'win32') {
      fs.chmodSync(scriptPath, '755');
    }

    console.log('✅ Startup script created');
    console.log(`📁 Script location: ${scriptPath}`);
  }

  async run() {
    console.log('🎯 Setting up Shadcn MCP Server for BuyMart V1...\n');

    await this.setupClaudeDesktop();
    await this.setupCursor();
    await this.setupWindsurf();
    await this.setupVSCode();
    await this.createStartupScript();

    console.log('\n🎉 MCP Server setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: ./start-with-mcp.sh (or npm run start:all)');
    console.log('2. Open your AI assistant (Claude, Cursor, etc.)');
    console.log('3. The MCP server will be available at: http://localhost:3001/sse');
    console.log('4. Use MCP tools to manage shadcn/ui components');
    console.log('\n🔧 Available MCP tools:');
    console.log('- list-components: Get available shadcn/ui components');
    console.log('- get-component-docs: Get component documentation');
    console.log('- install-component: Install a component');
    console.log('- list-blocks: Get available blocks');
    console.log('- get-block-docs: Get block documentation');
    console.log('- install-blocks: Install blocks');
  }
}

// Run the setup
const setup = new MCPSetup();
setup.run().catch(console.error);
