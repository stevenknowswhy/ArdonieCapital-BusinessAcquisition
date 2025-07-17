# GitHub Secrets Configuration Guide
## Ardonie Capital BuyMartV1 CI/CD Pipeline

This document outlines the GitHub repository secrets required for the CI/CD pipeline to function properly.

## Overview

The GitHub Actions workflows have been configured to gracefully handle missing secrets by:
- Using fallback values for non-critical secrets
- Skipping optional deployment steps when secrets are not configured
- Providing clear logging when steps are skipped

## Required Secrets by Environment

### Development/Staging Environment

#### **Required Secrets:**
- `STAGING_SUPABASE_URL` - Staging Supabase project URL
- `STAGING_SUPABASE_ANON_KEY` - Staging Supabase anonymous key

#### **Optional Secrets:**
- `STAGING_API_BASE_URL` - Custom API base URL (defaults to https://staging-api.ardonie.com)
- `STAGING_GOOGLE_CLIENT_ID` - Google OAuth client ID for staging
- `STAGING_MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID for staging
- `STAGING_SERVER_HOST` - Staging server hostname for deployment
- `STAGING_SERVER_USER` - Staging server username
- `STAGING_SERVER_KEY` - Staging server SSH key
- `SLACK_WEBHOOK` - Slack webhook URL for notifications

### Production Environment

#### **Required Secrets:**
- `PRODUCTION_SUPABASE_URL` - Production Supabase project URL
- `PRODUCTION_SUPABASE_ANON_KEY` - Production Supabase anonymous key
- `PRODUCTION_SUPABASE_SERVICE_KEY` - Production Supabase service key (for migrations)

#### **Optional Secrets:**

**Deployment:**
- `PRODUCTION_API_BASE_URL` - Custom API base URL (defaults to https://api.ardonie.com)
- `HOSTINGER_FTP_HOST` - Hostinger FTP hostname
- `HOSTINGER_FTP_USER` - Hostinger FTP username
- `HOSTINGER_FTP_PASSWORD` - Hostinger FTP password
- `HOSTINGER_DOMAIN` - Hostinger domain name

**AWS (if using AWS deployment):**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket for deployment
- `AWS_CLOUDFRONT_DISTRIBUTION` - CloudFront distribution ID
- `PRODUCTION_BACKUP_BUCKET` - S3 bucket for backups

**OAuth:**
- `PRODUCTION_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `PRODUCTION_MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID

**Third-party Services:**
- `PRODUCTION_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `PRODUCTION_ANALYTICS_ID` - Analytics tracking ID
- `PRODUCTION_CDN_URL` - CDN URL for assets

**Monitoring & Alerts:**
- `MONITORING_API_KEY` - Monitoring service API key
- `ALERT_EMAIL` - Email for alerts
- `SLACK_WEBHOOK` - Slack webhook for notifications
- `SENTRY_DSN` - Sentry DSN for error tracking

## Repository Variables

- `AWS_DEPLOYMENT_ENABLED` - Set to 'true' to enable AWS deployment (optional)

## How to Configure Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the secret name and value
5. Click "Add secret"

## Workflow Behavior

### When Secrets Are Missing:
- **Required secrets**: Workflow will use placeholder values and may fail at runtime
- **Optional secrets**: Related steps will be skipped with informative messages
- **Deployment secrets**: Deployment to that platform will be skipped
- **Notification secrets**: Notifications will be skipped

### Example Log Messages:
```
Database backup skipped - no Supabase configuration
Hostinger deployment skipped - no FTP configuration
AWS deployment skipped - no AWS configuration
Monitoring setup skipped - no monitoring configuration
```

## Security Best Practices

1. **Never commit secrets to the repository**
2. **Use environment-specific secrets** (staging vs production)
3. **Rotate secrets regularly**
4. **Use least-privilege access** for service accounts
5. **Monitor secret usage** in workflow logs

## Testing the Configuration

After configuring secrets:
1. Push a commit to trigger the workflow
2. Check the Actions tab for workflow execution
3. Review logs for any skipped steps
4. Verify deployments are working as expected

## Troubleshooting

### Common Issues:
- **"Context access might be invalid"**: This warning is expected for optional secrets
- **Deployment failures**: Check that required secrets for your deployment method are configured
- **Notification failures**: Verify webhook URLs and API keys are correct

### Getting Help:
- Check workflow logs for specific error messages
- Verify secret names match exactly (case-sensitive)
- Ensure secret values don't have extra whitespace
- Test secrets individually by temporarily hardcoding values (remove before committing)

---

*Last updated: July 17, 2025*
*For questions, contact the development team*
