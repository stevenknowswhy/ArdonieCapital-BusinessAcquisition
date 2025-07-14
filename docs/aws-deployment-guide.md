# Ardonie Capital AWS Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Ardonie Capital business acquisition platform to AWS using S3 static website hosting, CloudFront CDN, and optional Route 53 DNS management.

## Prerequisites

### 1. AWS CLI Installation
```bash
# macOS (using Homebrew)
brew install awscli

# Windows (using MSI installer)
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Linux (using curl)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. AWS Credentials Configuration
```bash
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-west-2
# Default output format: json
```

### 3. Required AWS Permissions
Ensure your AWS user/role has the following permissions:
- `s3:*` (for S3 bucket operations)
- `cloudfront:*` (for CloudFront distribution)
- `route53:*` (for DNS management, if using custom domain)
- `cloudformation:*` (for infrastructure as code)
- `iam:*` (for role creation)

## Deployment Methods

### Method 1: Quick Deployment (Recommended for Development)

#### Step 1: Make the deployment script executable
```bash
chmod +x deploy.sh
```

#### Step 2: Run the deployment script
```bash
./deploy.sh
```

The script will:
- Check AWS CLI installation and credentials
- Validate project structure
- Create S3 bucket if it doesn't exist
- Sync files to S3 with appropriate cache headers
- Invalidate CloudFront cache (if configured)
- Display deployment summary

### Method 2: Infrastructure as Code (Recommended for Production)

#### Step 1: Deploy CloudFormation Stack
```bash
# For production environment
aws cloudformation create-stack \
  --stack-name ardonie-capital-production \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
               ParameterKey=DomainName,ParameterValue=ardoniecapital.com \
  --capabilities CAPABILITY_NAMED_IAM

# For staging environment
aws cloudformation create-stack \
  --stack-name ardonie-capital-staging \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=staging \
  --capabilities CAPABILITY_NAMED_IAM
```

#### Step 2: Get Stack Outputs
```bash
aws cloudformation describe-stacks \
  --stack-name ardonie-capital-production \
  --query 'Stacks[0].Outputs'
```

#### Step 3: Deploy Website Files
```bash
# Get bucket name from CloudFormation output
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name ardonie-capital-production \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

# Sync files
aws s3 sync . "s3://$BUCKET_NAME/" \
  --delete \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "setupDocs/*" \
  --exclude "deploy.sh" \
  --exclude "aws-config.json" \
  --exclude "cloudformation-template.yaml"
```

### Method 3: Manual S3 Deployment

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://ardonie-capital-ws --region us-west-2
```

#### Step 2: Configure Static Website Hosting
```bash
aws s3 website s3://ardonie-capital-ws \
  --index-document index.html \
  --error-document error.html
```

#### Step 3: Set Bucket Policy
```bash
cat > bucket-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ardonie-capital-ws/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
  --bucket ardonie-capital-ws \
  --policy file://bucket-policy.json
```

#### Step 4: Upload Files
```bash
aws s3 sync . s3://ardonie-capital-ws/ \
  --delete \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "setupDocs/*"
```

## Configuration Files

### 1. aws-config.json
Contains deployment configuration including:
- S3 bucket settings
- CloudFront configuration
- Cache control headers
- Security headers
- Monitoring settings

### 2. cloudformation-template.yaml
Infrastructure as Code template that creates:
- S3 bucket for website hosting
- CloudFront distribution
- Route 53 DNS records (optional)
- IAM roles and policies
- CloudWatch logging

### 3. deploy.sh
Automated deployment script that:
- Validates prerequisites
- Creates/configures S3 bucket
- Syncs files with proper cache headers
- Invalidates CloudFront cache
- Provides deployment summary

## Post-Deployment Verification

### 1. Test Website Functionality
```bash
# Get website URL
aws cloudformation describe-stacks \
  --stack-name ardonie-capital-production \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
  --output text
```

### 2. Verify SSL Certificate (if using custom domain)
```bash
curl -I https://ardoniecapital.com
```

### 3. Test Page Load Times
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://ardoniecapital.com
```

### 4. Check CloudFront Cache Status
```bash
curl -I https://ardoniecapital.com | grep -i "x-cache"
```

## Monitoring and Maintenance

### 1. CloudWatch Metrics
Monitor the following metrics:
- S3 bucket requests and data transfer
- CloudFront cache hit ratio
- Error rates (4xx, 5xx)
- Origin latency

### 2. Access Logs
Enable S3 access logging and CloudFront logging for:
- Traffic analysis
- Security monitoring
- Performance optimization

### 3. Cost Optimization
- Use CloudFront for global content delivery
- Implement proper cache headers
- Monitor data transfer costs
- Use S3 Intelligent Tiering for cost optimization

## Security Best Practices

### 1. S3 Bucket Security
- Block public ACLs (except for website hosting)
- Enable versioning
- Configure lifecycle policies
- Use bucket policies instead of ACLs

### 2. CloudFront Security
- Use HTTPS only (redirect HTTP to HTTPS)
- Implement security headers
- Use Origin Access Identity (OAI)
- Configure custom error pages

### 3. Access Control
- Use IAM roles with least privilege
- Enable CloudTrail for API logging
- Implement MFA for sensitive operations
- Regular security audits

## Troubleshooting

### Common Issues

#### 1. 403 Forbidden Error
- Check bucket policy
- Verify file permissions
- Ensure index.html exists

#### 2. CloudFront Not Updating
- Create cache invalidation
- Check cache headers
- Verify origin configuration

#### 3. Custom Domain Issues
- Verify DNS records
- Check SSL certificate
- Confirm Route 53 configuration

### Useful Commands

```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket ardonie-capital-ws

# List CloudFront distributions
aws cloudfront list-distributions

# Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

# Check stack status
aws cloudformation describe-stacks \
  --stack-name ardonie-capital-production
```

## Environment-Specific Deployments

### Development
- Bucket: `ardonie-capital-dev`
- No CloudFront
- No custom domain
- Shorter cache times

### Staging
- Bucket: `ardonie-capital-staging`
- CloudFront enabled
- Subdomain: `staging.ardoniecapital.com`
- Production-like configuration

### Production
- Bucket: `ardonie-capital-ws`
- Full CloudFront configuration
- Custom domain: `ardoniecapital.com`
- Optimized cache settings
- Monitoring and alerting

## Cost Estimation

### Monthly Costs (Estimated)
- S3 Storage (10GB): ~$0.25
- S3 Requests (100K): ~$0.05
- CloudFront (100GB transfer): ~$8.50
- Route 53 (hosted zone): $0.50
- **Total: ~$9.30/month**

*Note: Costs may vary based on actual usage and AWS pricing changes.*

## Support and Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

For technical support, contact the development team or AWS Support.
