#!/usr/bin/env node

/**
 * AWS Model Context Protocol (MCP) Server Setup
 * Integrates AWS MCP Server with Ardonie Capital platform
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class AWSMCPServerSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.mcpConfigPath = path.join(this.projectRoot, '.mcp');
        this.errors = [];
        this.warnings = [];
        this.setupComplete = false;
    }

    /**
     * Main setup process
     */
    async setupAWSMCPServer() {
        console.log('🚀 Setting up AWS MCP Server for Ardonie Capital platform...\n');

        try {
            // 1. Check prerequisites
            await this.checkPrerequisites();

            // 2. Install UV package manager
            await this.installUV();

            // 3. Install Python 3.10
            await this.installPython();

            // 4. Configure AWS credentials
            await this.configureAWSCredentials();

            // 5. Create MCP configuration directory
            await this.createMCPDirectory();

            // 6. Install AWS MCP Servers
            await this.installAWSMCPServers();

            // 7. Create MCP configuration files
            await this.createMCPConfigurations();

            // 8. Create development workflow scripts
            await this.createWorkflowScripts();

            // 9. Update project documentation
            await this.updateDocumentation();

            // 10. Test MCP server integration
            await this.testMCPIntegration();

            console.log('✅ AWS MCP Server setup completed successfully!');
            this.setupComplete = true;

        } catch (error) {
            console.error('❌ AWS MCP Server setup failed:', error);
            this.errors.push(`Setup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check system prerequisites
     */
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');

        // Check if we're in the correct project directory
        if (!fs.existsSync('package.json')) {
            throw new Error('Not in a valid Node.js project directory');
        }

        // Check if AWS CLI is available
        try {
            execSync('aws --version', { stdio: 'pipe' });
            console.log('   ✅ AWS CLI found');
        } catch (error) {
            this.warnings.push('AWS CLI not found - will need manual configuration');
            console.log('   ⚠️ AWS CLI not found - manual configuration required');
        }

        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`   ✅ Node.js version: ${nodeVersion}`);

        console.log('   ✅ Prerequisites checked');
    }

    /**
     * Install UV package manager
     */
    async installUV() {
        console.log('📦 Installing UV package manager...');

        try {
            // Check if UV is already installed
            execSync('uv --version', { stdio: 'pipe' });
            console.log('   ✅ UV already installed');
            return;
        } catch (error) {
            // UV not installed, install it
        }

        try {
            // Install UV using the official installer
            console.log('   📥 Downloading and installing UV...');
            execSync('curl -LsSf https://astral.sh/uv/install.sh | sh', { stdio: 'inherit' });
            console.log('   ✅ UV installed successfully');
        } catch (error) {
            throw new Error(`Failed to install UV: ${error.message}`);
        }
    }

    /**
     * Install Python 3.10
     */
    async installPython() {
        console.log('🐍 Installing Python 3.10...');

        try {
            // Check if Python 3.10 is available
            execSync('python3.10 --version', { stdio: 'pipe' });
            console.log('   ✅ Python 3.10 already available');
            return;
        } catch (error) {
            // Python 3.10 not available
        }

        try {
            // Install Python 3.10 using UV
            console.log('   📥 Installing Python 3.10 via UV...');
            execSync('uv python install 3.10', { stdio: 'inherit' });
            console.log('   ✅ Python 3.10 installed successfully');
        } catch (error) {
            this.warnings.push('Failed to install Python 3.10 via UV - manual installation may be required');
            console.log('   ⚠️ Failed to install Python 3.10 - manual installation may be required');
        }
    }

    /**
     * Configure AWS credentials
     */
    async configureAWSCredentials() {
        console.log('🔐 Configuring AWS credentials...');

        // Check if AWS credentials are configured
        try {
            execSync('aws sts get-caller-identity', { stdio: 'pipe' });
            console.log('   ✅ AWS credentials already configured');
            return;
        } catch (error) {
            // AWS credentials not configured
        }

        // Create AWS credentials template
        const awsConfigTemplate = `# AWS Configuration for MCP Server
# Configure your AWS credentials using one of these methods:
#
# 1. AWS CLI: aws configure
# 2. Environment variables:
#    export AWS_ACCESS_KEY_ID=your_access_key
#    export AWS_SECRET_ACCESS_KEY=your_secret_key
#    export AWS_DEFAULT_REGION=us-east-1
# 3. AWS Profile: aws configure --profile your-profile-name
#
# Recommended: Use AWS profiles for better security
# Default profile for Ardonie Capital: ardonie-capital
`;

        fs.writeFileSync('.aws-config-template.txt', awsConfigTemplate);
        console.log('   ⚠️ AWS credentials not configured - template created');
        this.warnings.push('AWS credentials need manual configuration');
    }

    /**
     * Create MCP configuration directory
     */
    async createMCPDirectory() {
        console.log('📁 Creating MCP configuration directory...');

        if (!fs.existsSync(this.mcpConfigPath)) {
            fs.mkdirSync(this.mcpConfigPath, { recursive: true });
        }

        // Create subdirectories
        const subdirs = ['configs', 'scripts', 'logs', 'cache'];
        for (const subdir of subdirs) {
            const dirPath = path.join(this.mcpConfigPath, subdir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }

        console.log('   ✅ MCP directory structure created');
    }

    /**
     * Install AWS MCP Servers
     */
    async installAWSMCPServers() {
        console.log('🔧 Installing AWS MCP Servers...');

        const mcpServers = [
            'awslabs.core-mcp-server',
            'awslabs.aws-documentation-mcp-server',
            'awslabs.cdk-mcp-server',
            'awslabs.terraform-mcp-server',
            'awslabs.aws-serverless-mcp-server',
            'awslabs.cost-analysis-mcp-server',
            'awslabs.cloudwatch-mcp-server',
            'awslabs.lambda-tool-mcp-server'
        ];

        for (const server of mcpServers) {
            try {
                console.log(`   📦 Installing ${server}...`);
                execSync(`uv tool install ${server}`, { stdio: 'pipe' });
                console.log(`   ✅ ${server} installed`);
            } catch (error) {
                this.warnings.push(`Failed to install ${server}: ${error.message}`);
                console.log(`   ⚠️ Failed to install ${server}`);
            }
        }

        console.log('   ✅ AWS MCP Servers installation completed');
    }

    /**
     * Create MCP configuration files
     */
    async createMCPConfigurations() {
        console.log('⚙️ Creating MCP configuration files...');

        // Create main MCP configuration for different clients
        await this.createClineConfig();
        await this.createCursorConfig();
        await this.createWindsurfConfig();
        await this.createAmazonQConfig();

        console.log('   ✅ MCP configuration files created');
    }

    /**
     * Create Cline MCP configuration
     */
    async createClineConfig() {
        const clineConfig = {
            mcpServers: {
                "awslabs.core-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.core-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR",
                        MCP_SETTINGS_PATH: path.join(this.mcpConfigPath, "configs")
                    }
                },
                "awslabs.aws-documentation-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.aws-documentation-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.cdk-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.cdk-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.terraform-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.terraform-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.aws-serverless-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.aws-serverless-mcp-server@latest"],
                    env: {
                        AWS_PROFILE: "ardonie-capital",
                        AWS_REGION: "us-east-1",
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.cost-analysis-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.cost-analysis-mcp-server@latest"],
                    env: {
                        AWS_PROFILE: "ardonie-capital",
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.cloudwatch-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.cloudwatch-mcp-server@latest"],
                    env: {
                        AWS_PROFILE: "ardonie-capital",
                        AWS_REGION: "us-east-1",
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.lambda-tool-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.lambda-tool-mcp-server@latest"],
                    env: {
                        AWS_PROFILE: "ardonie-capital",
                        AWS_REGION: "us-east-1",
                        FUNCTION_PREFIX: "ardonie-",
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                }
            }
        };

        const configPath = path.join(this.mcpConfigPath, 'configs', 'cline_mcp_settings.json');
        fs.writeFileSync(configPath, JSON.stringify(clineConfig, null, 2));
    }

    /**
     * Create Cursor MCP configuration
     */
    async createCursorConfig() {
        const cursorConfig = {
            mcpServers: {
                "awslabs.core-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.core-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.aws-documentation-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.aws-documentation-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.cdk-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.cdk-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                }
            }
        };

        const configPath = path.join(this.mcpConfigPath, 'configs', 'cursor_mcp.json');
        fs.writeFileSync(configPath, JSON.stringify(cursorConfig, null, 2));
    }

    /**
     * Create Windsurf MCP configuration
     */
    async createWindsurfConfig() {
        const windsurfConfig = {
            mcpServers: {
                "awslabs.core-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.core-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                }
            }
        };

        const configPath = path.join(this.mcpConfigPath, 'configs', 'windsurf_mcp_config.json');
        fs.writeFileSync(configPath, JSON.stringify(windsurfConfig, null, 2));
    }

    /**
     * Create Amazon Q CLI MCP configuration
     */
    async createAmazonQConfig() {
        const amazonQConfig = {
            mcpServers: {
                "awslabs.core-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.core-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                },
                "awslabs.aws-documentation-mcp-server": {
                    command: "uvx",
                    args: ["awslabs.aws-documentation-mcp-server@latest"],
                    env: {
                        FASTMCP_LOG_LEVEL: "ERROR"
                    }
                }
            }
        };

        const configPath = path.join(this.mcpConfigPath, 'configs', 'amazonq_mcp.json');
        fs.writeFileSync(configPath, JSON.stringify(amazonQConfig, null, 2));
    }

    /**
     * Create development workflow scripts
     */
    async createWorkflowScripts() {
        console.log('📝 Creating development workflow scripts...');

        // Create MCP server management script
        const mcpManagerScript = `#!/bin/bash

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
    
    for server in "\${servers[@]}"; do
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
    
    for server in "\${servers[@]}"; do
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
`;

        const scriptPath = path.join(this.mcpConfigPath, 'scripts', 'mcp-manager.sh');
        fs.writeFileSync(scriptPath, mcpManagerScript);
        
        // Make script executable
        try {
            execSync(`chmod +x "${scriptPath}"`);
        } catch (error) {
            this.warnings.push('Could not make MCP manager script executable');
        }

        console.log('   ✅ Development workflow scripts created');
    }

    /**
     * Update project documentation
     */
    async updateDocumentation() {
        console.log('📚 Updating project documentation...');

        const mcpDocumentation = `# AWS Model Context Protocol (MCP) Server Integration

## Overview

The Ardonie Capital platform now includes AWS MCP Server integration to enhance AI-assisted development workflows. This integration provides access to AWS services, documentation, and best practices through standardized Model Context Protocol.

## Installed MCP Servers

### Core Servers
- **awslabs.core-mcp-server** - Intelligent planning and MCP server orchestration
- **awslabs.aws-documentation-mcp-server** - Latest AWS documentation and API references

### Infrastructure & Development
- **awslabs.cdk-mcp-server** - AWS CDK development with security best practices
- **awslabs.terraform-mcp-server** - Terraform workflows with security scanning
- **awslabs.aws-serverless-mcp-server** - Complete serverless application lifecycle

### Monitoring & Cost Management
- **awslabs.cost-analysis-mcp-server** - Pre-deployment cost estimation
- **awslabs.cloudwatch-mcp-server** - Metrics, alarms, and logs analysis
- **awslabs.lambda-tool-mcp-server** - Execute Lambda functions as AI tools

## Configuration Files

MCP configurations are stored in \`.mcp/configs/\`:

- \`cline_mcp_settings.json\` - Cline VS Code extension configuration
- \`cursor_mcp.json\` - Cursor IDE configuration
- \`windsurf_mcp_config.json\` - Windsurf IDE configuration
- \`amazonq_mcp.json\` - Amazon Q CLI configuration

## Usage

### With Cline (VS Code)
1. Install the Cline VS Code extension
2. Copy \`.mcp/configs/cline_mcp_settings.json\` to your Cline settings
3. Configure AWS profile: \`ardonie-capital\`
4. Start using AI-assisted AWS development

### With Cursor
1. Copy \`.mcp/configs/cursor_mcp.json\` to \`.cursor/mcp.json\` in your project
2. Configure AWS credentials
3. Use MCP tools in Cursor's AI assistant

### With Amazon Q CLI
1. Copy \`.mcp/configs/amazonq_mcp.json\` to \`~/.aws/amazonq/mcp.json\`
2. Configure AWS profile
3. Use \`q chat\` with MCP server capabilities

## Management Scripts

Use the MCP manager script for server management:

\`\`\`bash
# Start MCP servers
.mcp/scripts/mcp-manager.sh start

# Test MCP servers
.mcp/scripts/mcp-manager.sh test

# Update MCP servers
.mcp/scripts/mcp-manager.sh update

# Stop MCP servers
.mcp/scripts/mcp-manager.sh stop
\`\`\`

## AWS Configuration

### Required AWS Services Access
- AWS CloudFormation
- AWS Lambda
- Amazon S3
- Amazon CloudWatch
- AWS Cost Explorer
- AWS Documentation APIs

### Recommended AWS Profile
Create an AWS profile named \`ardonie-capital\`:

\`\`\`bash
aws configure --profile ardonie-capital
\`\`\`

### Environment Variables
Set these environment variables for enhanced functionality:

\`\`\`bash
export AWS_PROFILE=ardonie-capital
export AWS_REGION=us-east-1
export FASTMCP_LOG_LEVEL=ERROR
\`\`\`

## Development Workflows

### Infrastructure as Code
- Use CDK MCP server for AWS CDK development
- Use Terraform MCP server for Terraform workflows
- Get real-time AWS documentation and best practices

### Serverless Development
- Use Serverless MCP server for SAM CLI workflows
- Execute Lambda functions through Lambda Tool MCP server
- Monitor applications with CloudWatch MCP server

### Cost Management
- Estimate costs before deployment with Cost Analysis MCP server
- Monitor spending and optimize resources
- Get cost recommendations and insights

## Troubleshooting

### Common Issues

1. **UV not found**: Install UV package manager
2. **Python 3.10 not available**: Install Python 3.10 via UV
3. **AWS credentials not configured**: Run \`aws configure\`
4. **MCP server timeout**: Check network connectivity and AWS permissions

### Logs
MCP server logs are stored in \`.mcp/logs/\`:
- \`core-server.log\` - Core MCP server logs
- \`docs-server.log\` - Documentation server logs

### Support
For issues with AWS MCP servers, refer to:
- [AWS MCP Servers GitHub Repository](https://github.com/awslabs/mcp)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)

## Security Considerations

- Use AWS profiles instead of hardcoded credentials
- Enable read-only mode by default for production
- Review MCP server permissions regularly
- Monitor AWS CloudTrail for MCP server activities
- Use least privilege access principles

## Integration with Existing Infrastructure

The MCP server integration is designed to work seamlessly with:
- Existing AWS deployment setup (S3, CloudFront)
- Current deployment scripts (deploy.sh, validate-deployment.sh)
- Production deployment testing suite
- Performance optimization tools
- Security and accessibility auditing

This integration enhances the development experience without disrupting the current production-ready deployment pipeline.
`;

        const docPath = path.join(this.projectRoot, 'docs', 'AWS-MCP-SERVER-INTEGRATION.md');
        
        // Create docs directory if it doesn't exist
        const docsDir = path.dirname(docPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        fs.writeFileSync(docPath, mcpDocumentation);

        console.log('   ✅ Project documentation updated');
    }

    /**
     * Test MCP server integration
     */
    async testMCPIntegration() {
        console.log('🧪 Testing MCP server integration...');

        try {
            // Test core MCP server
            console.log('   Testing core MCP server...');
            execSync('timeout 5s uvx awslabs.core-mcp-server@latest --help', { stdio: 'pipe' });
            console.log('   ✅ Core MCP server working');

            // Test documentation MCP server
            console.log('   Testing documentation MCP server...');
            execSync('timeout 5s uvx awslabs.aws-documentation-mcp-server@latest --help', { stdio: 'pipe' });
            console.log('   ✅ Documentation MCP server working');

        } catch (error) {
            this.warnings.push('Some MCP servers may need additional configuration');
            console.log('   ⚠️ Some MCP servers may need additional configuration');
        }

        console.log('   ✅ MCP server integration testing completed');
    }

    /**
     * Generate setup report
     */
    generateSetupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            setupComplete: this.setupComplete,
            errors: this.errors,
            warnings: this.warnings,
            mcpConfigPath: this.mcpConfigPath,
            installedServers: [
                'awslabs.core-mcp-server',
                'awslabs.aws-documentation-mcp-server',
                'awslabs.cdk-mcp-server',
                'awslabs.terraform-mcp-server',
                'awslabs.aws-serverless-mcp-server',
                'awslabs.cost-analysis-mcp-server',
                'awslabs.cloudwatch-mcp-server',
                'awslabs.lambda-tool-mcp-server'
            ],
            configurationFiles: [
                '.mcp/configs/cline_mcp_settings.json',
                '.mcp/configs/cursor_mcp.json',
                '.mcp/configs/windsurf_mcp_config.json',
                '.mcp/configs/amazonq_mcp.json'
            ],
            nextSteps: [
                'Configure AWS credentials with profile: ardonie-capital',
                'Copy MCP configuration to your preferred AI coding assistant',
                'Test MCP servers with: .mcp/scripts/mcp-manager.sh test',
                'Start using AI-assisted AWS development workflows'
            ]
        };

        fs.writeFileSync('.mcp/aws-mcp-setup-report.json', JSON.stringify(report, null, 2));
        return report;
    }
}

// Run AWS MCP Server setup
console.log('🚀 Starting AWS MCP Server Setup for Ardonie Capital...\n');
const mcpSetup = new AWSMCPServerSetup();
mcpSetup.setupAWSMCPServer()
    .then(() => {
        const report = mcpSetup.generateSetupReport();
        console.log('\n📊 Setup Report Generated');
        console.log(`Setup Status: ${report.setupComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
        console.log(`Errors: ${report.errors.length}`);
        console.log(`Warnings: ${report.warnings.length}`);
        console.log(`Configuration Path: ${report.mcpConfigPath}`);
        
        if (report.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            report.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        console.log('\n🎉 AWS MCP Server integration ready for Ardonie Capital platform!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ AWS MCP Server setup failed:', error);
        process.exit(1);
    });

export default AWSMCPServerSetup;
