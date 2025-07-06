#!/usr/bin/env node

/**
 * Quick verification script for Shadcn MCP Server setup
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Shadcn MCP Server Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'mcp-config.json',
  'start-with-mcp.sh',
  'scripts/setup-mcp.js',
  'SHADCN-MCP-SETUP.md'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check if node_modules exists
const hasNodeModules = fs.existsSync('node_modules');
console.log(`${hasNodeModules ? '✅' : '❌'} node_modules directory`);

// Check if MCP dependency is installed
if (hasNodeModules) {
  const mcpPackageExists = fs.existsSync('node_modules/@heilgar/shadcn-ui-mcp-server');
  console.log(`${mcpPackageExists ? '✅' : '❌'} @heilgar/shadcn-ui-mcp-server package`);
}

// Check configuration files
console.log('\n🔧 Checking configuration files:');
const configFiles = [
  '.cursor/mcp.json',
  '.vscode/settings.json',
  'codeium/windsurf/model_config.json'
];

configFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🎉 Setup verification complete!');
console.log('\n📋 To start the MCP server:');
console.log('   ./start-with-mcp.sh');
console.log('   or');
console.log('   npm run start:all');
console.log('\n🤖 The MCP server will be available for AI assistants at:');
console.log('   http://localhost:3001/sse');
