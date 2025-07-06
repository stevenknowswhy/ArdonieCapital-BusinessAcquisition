# 🎯 Shadcn MCP Server Setup - BuyMart V1

## ✅ **INSTALLATION COMPLETED**

The Shadcn MCP (Model Context Protocol) server has been successfully installed and configured for the BuyMart V1 project. This enables AI-assisted integration of shadcn/ui components.

---

## 🚀 **Quick Start**

### Start the MCP Server
```bash
# Option 1: Use the startup script (recommended)
./start-with-mcp.sh

# Option 2: Use npm scripts
npm run start:all

# Option 3: Start MCP server only
npm run mcp:start
```

### Access Points
- **Website**: http://localhost:8000
- **MCP Server SSE Endpoint**: http://localhost:3001/sse
- **MCP Inspector** (for debugging): `npm run mcp:inspector`

---

## 🔧 **Configuration Files Created**

### 1. Project Configuration
- `package.json` - Node.js project configuration with MCP dependencies
- `mcp-config.json` - MCP server configuration and settings
- `start-with-mcp.sh` - Startup script for both web server and MCP server

### 2. AI Assistant Integrations
- `.cursor/mcp.json` - Cursor IDE configuration
- `.vscode/settings.json` - VS Code configuration  
- `codeium/windsurf/model_config.json` - Windsurf configuration
- `~/Library/Application Support/Claude/claude_desktop_config.json` - Claude Desktop (macOS)

---

## 🛠️ **Available MCP Tools**

The MCP server provides these tools for AI assistants:

### Component Management
- **`list-components`** - Get all available shadcn/ui components
- **`get-component-docs`** - Get documentation for a specific component
- **`install-component`** - Install a shadcn/ui component with package manager support

### Block Management  
- **`list-blocks`** - Get all available shadcn/ui blocks
- **`get-block-docs`** - Get documentation for a specific block
- **`install-blocks`** - Install shadcn/ui blocks

### Features
- ✅ Support for multiple package managers (npm, pnpm, yarn, bun)
- ✅ Automatic package manager detection
- ✅ Real-time component documentation
- ✅ Installation script generation
- ✅ Framework-specific guides

---

## 🤖 **AI Assistant Integration**

### Claude Desktop
Configuration automatically added to:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Cursor IDE
Configuration created at:
```
.cursor/mcp.json
```

### VS Code
Settings updated in:
```
.vscode/settings.json
```

### Windsurf
Configuration created at:
```
codeium/windsurf/model_config.json
```

---

## 📋 **Usage Examples**

### With AI Assistant
Once your AI assistant is connected to the MCP server, you can:

```
"List all available shadcn/ui components"
"Show me documentation for the Button component"
"Install the Card component using npm"
"Get all available blocks"
"Install the authentication block"
```

### Manual Testing
```bash
# Test MCP server connectivity
curl http://localhost:3001/sse

# Use MCP Inspector for debugging
npm run mcp:inspector
```

---

## 🔍 **Verification Steps**

### 1. Check Server Status
```bash
# Check if MCP server is running
ps aux | grep shadcn-ui-mcp-server

# Check port 3001 is listening
lsof -i :3001
```

### 2. Test MCP Tools
```bash
# Use MCP Inspector to test tools
npm run mcp:inspector
# Then open the provided URL in your browser
```

### 3. AI Assistant Connection
1. Restart your AI assistant (Claude, Cursor, etc.)
2. The MCP server should appear in available tools
3. Test by asking for component information

---

## 🚨 **Troubleshooting**

### Common Issues

**MCP Server Won't Start**
```bash
# Check Node.js version (requires v18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Port 3001 Already in Use**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in mcp-config.json
```

**AI Assistant Not Detecting MCP Server**
1. Restart the AI assistant completely
2. Check configuration file paths
3. Verify MCP server is running on correct port

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm run mcp:start

# Use MCP Inspector for detailed debugging
npm run mcp:inspector
```

---

## 📁 **Project Structure**

```
BuyMartV1/
├── package.json                    # Node.js configuration
├── mcp-config.json                # MCP server settings
├── start-with-mcp.sh              # Startup script
├── scripts/
│   └── setup-mcp.js               # Setup automation
├── .cursor/
│   └── mcp.json                   # Cursor configuration
├── .vscode/
│   └── settings.json              # VS Code settings
├── codeium/windsurf/
│   └── model_config.json          # Windsurf configuration
└── [existing project files...]
```

---

## 🎉 **Success Indicators**

✅ MCP server starts without errors  
✅ SSE endpoint responds at http://localhost:3001/sse  
✅ AI assistant detects MCP tools  
✅ Component listing works  
✅ Documentation retrieval works  
✅ Installation scripts generate correctly  

---

## 🔄 **Next Steps**

1. **Test Integration**: Ask your AI assistant to list shadcn/ui components
2. **Install Components**: Use the MCP tools to install components you need
3. **Integrate with Project**: Add shadcn/ui components to your existing HTML/CSS structure
4. **Customize**: Modify MCP configuration as needed for your workflow

The Shadcn MCP server is now ready to enhance your development workflow with AI-assisted component management!
