# AWS Model Context Protocol (MCP) Server Integration

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

MCP configurations are stored in `.mcp/configs/`:

- `cline_mcp_settings.json` - Cline VS Code extension configuration
- `cursor_mcp.json` - Cursor IDE configuration
- `windsurf_mcp_config.json` - Windsurf IDE configuration
- `amazonq_mcp.json` - Amazon Q CLI configuration

## Usage

### With Cline (VS Code)
1. Install the Cline VS Code extension
2. Copy `.mcp/configs/cline_mcp_settings.json` to your Cline settings
3. Configure AWS profile: `ardonie-capital`
4. Start using AI-assisted AWS development

### With Cursor
1. Copy `.mcp/configs/cursor_mcp.json` to `.cursor/mcp.json` in your project
2. Configure AWS credentials
3. Use MCP tools in Cursor's AI assistant

### With Amazon Q CLI
1. Copy `.mcp/configs/amazonq_mcp.json` to `~/.aws/amazonq/mcp.json`
2. Configure AWS profile
3. Use `q chat` with MCP server capabilities

## Management Scripts

Use the MCP manager script for server management:

```bash
# Start MCP servers
.mcp/scripts/mcp-manager.sh start

# Test MCP servers
.mcp/scripts/mcp-manager.sh test

# Update MCP servers
.mcp/scripts/mcp-manager.sh update

# Stop MCP servers
.mcp/scripts/mcp-manager.sh stop
```

## AWS Configuration

### Required AWS Services Access
- AWS CloudFormation
- AWS Lambda
- Amazon S3
- Amazon CloudWatch
- AWS Cost Explorer
- AWS Documentation APIs

### Recommended AWS Profile
Create an AWS profile named `ardonie-capital`:

```bash
aws configure --profile ardonie-capital
```

### Environment Variables
Set these environment variables for enhanced functionality:

```bash
export AWS_PROFILE=ardonie-capital
export AWS_REGION=us-east-1
export FASTMCP_LOG_LEVEL=ERROR
```

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
3. **AWS credentials not configured**: Run `aws configure`
4. **MCP server timeout**: Check network connectivity and AWS permissions

### Logs
MCP server logs are stored in `.mcp/logs/`:
- `core-server.log` - Core MCP server logs
- `docs-server.log` - Documentation server logs

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
