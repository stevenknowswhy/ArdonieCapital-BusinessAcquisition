#!/usr/bin/env node

/**
 * MCP Server Test Script
 * Tests the Shadcn UI MCP Server functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  async testMCPServer() {
    console.log('🧪 Testing Shadcn MCP Server...\n');

    return new Promise((resolve, reject) => {
      // Start the MCP server with inspector
      const mcpProcess = spawn('npx', ['@heilgar/shadcn-ui-mcp-server'], {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('📤 MCP Output:', data.toString().trim());
      });

      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('⚠️  MCP Error:', data.toString().trim());
      });

      // Test basic MCP communication
      setTimeout(() => {
        console.log('📋 Testing MCP tools...');
        
        // Send a test message to list components
        const testMessage = JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {}
        }) + '\n';

        mcpProcess.stdin.write(testMessage);

        setTimeout(() => {
          mcpProcess.kill();
          
          if (output.includes('Server connected and ready') || output.includes('shadcn')) {
            console.log('✅ MCP Server test passed!');
            console.log('📊 Server output:', output);
            resolve(true);
          } else {
            console.log('❌ MCP Server test failed');
            console.log('📊 Output:', output);
            console.log('🚨 Errors:', errorOutput);
            resolve(false);
          }
        }, 3000);
      }, 2000);

      mcpProcess.on('error', (error) => {
        console.error('❌ Failed to start MCP server:', error);
        reject(error);
      });
    });
  }

  async testServerConnectivity() {
    console.log('🌐 Testing server connectivity...');
    
    try {
      // Test if we can reach the server (this is a basic check)
      const { spawn } = await import('child_process');
      
      return new Promise((resolve) => {
        const curlProcess = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3001'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let httpCode = '';
        curlProcess.stdout.on('data', (data) => {
          httpCode += data.toString();
        });

        curlProcess.on('close', (code) => {
          if (httpCode.includes('200') || httpCode.includes('404')) {
            console.log('✅ Server is responding');
            resolve(true);
          } else {
            console.log('⚠️  Server may not be fully ready (HTTP code:', httpCode, ')');
            resolve(false);
          }
        });

        curlProcess.on('error', () => {
          console.log('⚠️  Could not test server connectivity (curl not available)');
          resolve(false);
        });
      });
    } catch (error) {
      console.log('⚠️  Could not test server connectivity:', error.message);
      return false;
    }
  }

  async checkConfiguration() {
    console.log('🔧 Checking MCP configuration...');
    
    const fs = await import('fs');
    const configPath = path.join(this.projectRoot, 'mcp-config.json');
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('✅ MCP configuration loaded successfully');
      console.log('📋 Available tools:', Object.keys(config.mcpServers));
      return true;
    } catch (error) {
      console.log('❌ Failed to load MCP configuration:', error.message);
      return false;
    }
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    const fs = await import('fs');
    const packagePath = path.join(this.projectRoot, 'package.json');
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const hasNodeModules = fs.existsSync(nodeModulesPath);
      const hasMCPDependency = packageJson.dependencies && packageJson.dependencies['@heilgar/shadcn-ui-mcp-server'];
      
      console.log('✅ Package.json exists');
      console.log(hasNodeModules ? '✅ Node modules installed' : '❌ Node modules missing');
      console.log(hasMCPDependency ? '✅ MCP dependency found' : '❌ MCP dependency missing');
      
      return hasNodeModules && hasMCPDependency;
    } catch (error) {
      console.log('❌ Failed to check dependencies:', error.message);
      return false;
    }
  }

  async run() {
    console.log('🎯 MCP Server Test Suite\n');

    const results = {
      dependencies: await this.checkDependencies(),
      configuration: await this.checkConfiguration(),
      connectivity: await this.testServerConnectivity(),
      mcpServer: await this.testMCPServer()
    };

    console.log('\n📊 Test Results:');
    console.log('================');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! MCP Server is ready to use.');
      console.log('\n📋 Next steps:');
      console.log('1. Start your AI assistant (Claude, Cursor, etc.)');
      console.log('2. The MCP server should appear in available tools');
      console.log('3. Try asking: "List all available shadcn/ui components"');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the setup.');
      console.log('💡 Try running: npm run mcp:setup');
    }

    return allPassed;
  }
}

// Run the tests
const tester = new MCPTester();
tester.run().catch(console.error);
