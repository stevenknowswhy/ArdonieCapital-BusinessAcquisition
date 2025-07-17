# BuyMartV1 Comprehensive Multi-Environment Deployment Guide

## Overview

This guide provides complete instructions for deploying BuyMartV1 across multiple environments using automated CI/CD pipelines, manual deployment options, and comprehensive validation processes.

---

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Automated Deployment (CI/CD)](#automated-deployment-cicd)
5. [Manual Deployment](#manual-deployment)
6. [Validation & Testing](#validation--testing)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Environment Overview

### 🏗️ **Development Environment**
- **Purpose**: Local development and testing
- **URL**: http://localhost:8000
- **Database**: Development Supabase project
- **Features**: Hot reload, debug mode, lenient security

### 🧪 **Staging Environment**
- **Purpose**: Pre-production testing and validation
- **URL**: https://staging.buymart.ardonie.com
- **Database**: Staging Supabase project
- **Features**: Production-like configuration, test data

### 🚀 **Production Environment**
- **Purpose**: Live application serving real users
- **URL**: https://buymart.ardonie.com
- **Database**: Production Supabase project
- **Features**: Optimized performance, strict security, monitoring

---

## Prerequisites

### Required Software
- **Node.js** 18+ with npm
- **Python** 3.9+ (for local development server)
- **Git** for version control
- **Docker** (optional, for containerized deployments)

### Required Accounts & Services
- **GitHub** account with repository access
- **Supabase** projects for each environment
- **Hostinger** hosting account (primary deployment)
- **AWS** account (optional, for CDN deployment)
- **Stripe** account for payment processing

### Environment Files Required
```bash
.env.development    # Development configuration
.env.staging       # Staging configuration  
.env.production    # Production configuration
```

---

## Environment Configuration

### 1. Create Environment Files

Copy the example files and fill in your values:

```bash
# Development
cp .env.development.example .env.development

# Staging
cp .env.staging.example .env.staging

# Production
cp .env.production.example .env.production
```

### 2. Configure Supabase Projects

#### Development Project
```bash
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your_development_anon_key
SUPABASE_SERVICE_KEY=your_development_service_key
```

#### Staging Project
```bash
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_KEY=your_staging_service_key
```

#### Production Project
```bash
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key
```

### 3. Configure OAuth Applications

#### Google OAuth
- **Development**: Redirect to `http://localhost:8000/auth/callback`
- **Staging**: Redirect to `https://staging.buymart.ardonie.com/auth/callback`
- **Production**: Redirect to `https://buymart.ardonie.com/auth/callback`

#### Microsoft OAuth
- **Development**: Redirect to `http://localhost:8000/auth/callback`
- **Staging**: Redirect to `https://staging.buymart.ardonie.com/auth/callback`
- **Production**: Redirect to `https://buymart.ardonie.com/auth/callback`

### 4. Configure Payment Processing

#### Stripe Configuration
- **Development/Staging**: Use test keys (`pk_test_*`, `sk_test_*`)
- **Production**: Use live keys (`pk_live_*`, `sk_live_*`)

---

## Automated Deployment (CI/CD)

### GitHub Actions Workflows

#### 1. Development Workflow
**Trigger**: Push to `development` branch

```bash
# Workflow: .github/workflows/development.yml
- Runs tests and linting
- Builds staging assets
- Deploys to staging environment
- Runs post-deployment tests
- Sends notifications
```

#### 2. Staging Workflow
**Trigger**: Push to `staging` branch

```bash
# Workflow: .github/workflows/staging.yml
- Validates environment configuration
- Runs comprehensive test suite
- Creates database backup
- Deploys to staging server
- Runs integration tests
- Requires manual approval for production
```

#### 3. Production Workflow
**Trigger**: Push to `main` branch

```bash
# Workflow: .github/workflows/production.yml
- Pre-deployment validation
- Creates production backup
- Deploys to Hostinger/AWS
- Runs database migrations
- Validates deployment
- Sets up monitoring
- Sends success/failure notifications
```

### Setting Up GitHub Secrets

Configure the following secrets in your GitHub repository:

#### Supabase Secrets
```bash
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_SERVICE_KEY
PRODUCTION_SUPABASE_URL
PRODUCTION_SUPABASE_ANON_KEY
PRODUCTION_SUPABASE_SERVICE_KEY
```

#### OAuth Secrets
```bash
STAGING_GOOGLE_CLIENT_ID
STAGING_MICROSOFT_CLIENT_ID
PRODUCTION_GOOGLE_CLIENT_ID
PRODUCTION_MICROSOFT_CLIENT_ID
```

#### Hosting Secrets
```bash
HOSTINGER_FTP_HOST
HOSTINGER_FTP_USER
HOSTINGER_FTP_PASSWORD
HOSTINGER_DOMAIN
```

#### AWS Secrets (Optional)
```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
AWS_CLOUDFRONT_DISTRIBUTION
```

#### Monitoring Secrets
```bash
SLACK_WEBHOOK
SENTRY_DSN
MONITORING_API_KEY
```

---

## Manual Deployment

### Development Deployment

```bash
# 1. Install dependencies
npm install

# 2. Build development assets
npm run build:development

# 3. Start development server
npm run dev

# 4. Validate environment
npm run validate:development
```

### Staging Deployment

```bash
# 1. Validate staging environment
npm run validate:staging

# 2. Build staging assets
npm run build:staging

# 3. Create backup
npm run backup:staging

# 4. Deploy to staging
npm run deploy:staging

# 5. Run post-deployment tests
npm run test:staging
```

### Production Deployment

```bash
# 1. Validate production environment
npm run validate:production

# 2. Create production backup
npm run backup:production

# 3. Build production assets
npm run build:production

# 4. Deploy to Hostinger
npm run deploy:hostinger

# 5. Deploy to AWS (optional)
npm run deploy:aws

# 6. Run production validation
npm run test:critical:production
```

---

## Validation & Testing

### Pre-Deployment Validation

```bash
# Environment validation
npm run validate:development
npm run validate:staging
npm run validate:production

# Build validation
npm run validate:build
npm run validate:build:production

# Database validation
npm run validate:db:staging
npm run validate:db:production
```

### Testing Suite

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Security tests
npm run test:security

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:a11y
```

### Environment-Specific Testing

```bash
# Staging tests
npm run test:auth:staging
npm run test:oauth:staging
npm run test:db:staging
npm run test:performance:staging

# Production tests
npm run test:critical:production
npm run test:auth:production
npm run test:payments:production
npm run test:security:production
```

---

## Monitoring & Maintenance

### Production Monitoring Setup

```bash
# Setup monitoring
npm run setup:monitoring:production

# Setup performance tracking
npm run setup:performance:tracking

# Setup error tracking
npm run setup:error:tracking

# Monitor performance
npm run monitor:performance:production
```

### Health Checks

#### Automated Health Checks
- **Endpoint**: `/health`
- **Frequency**: Every 30 seconds
- **Alerts**: Slack notifications on failure

#### Manual Health Checks
```bash
# Check application health
curl -f https://buymart.ardonie.com/health

# Check API health
curl -f https://buymart.ardonie.com/api/health

# Check database connectivity
npm run test:db:production
```

### Backup Management

```bash
# Create manual backup
npm run backup:production

# List available backups
node scripts/deployment/backup.js production list

# Restore from backup (emergency)
node scripts/deployment/restore.js production [backup-name]
```

---

## Troubleshooting

### Common Issues

#### 1. **Environment Configuration Errors**
```bash
# Symptom: Validation failures
# Solution: Check environment variables
npm run validate:production

# Check for missing variables
cat .env.production | grep -E "^[A-Z_]+=\s*$"
```

#### 2. **Build Failures**
```bash
# Symptom: Build validation fails
# Solution: Check build integrity
npm run validate:build:production

# Rebuild assets
npm run build:production
```

#### 3. **Database Connection Issues**
```bash
# Symptom: Database tests fail
# Solution: Validate database configuration
npm run test:db:production

# Check Supabase status
curl -f https://your-project.supabase.co/rest/v1/
```

#### 4. **OAuth Authentication Failures**
```bash
# Symptom: OAuth login fails
# Solution: Validate OAuth configuration
npm run test:oauth:production

# Check redirect URLs in OAuth apps
# Verify client IDs and secrets
```

### Emergency Procedures

#### 1. **Immediate Rollback**
```bash
# Rollback to previous deployment
npm run deploy:rollback:production

# Or restore from backup
node scripts/deployment/restore.js production
```

#### 2. **Database Recovery**
```bash
# Restore database from backup
npm run restore:db:production [backup-timestamp]

# Verify database integrity
npm run validate:db:production
```

#### 3. **Service Outage Response**
1. **Check monitoring alerts**
2. **Verify health endpoints**
3. **Check recent deployments**
4. **Rollback if necessary**
5. **Notify stakeholders**

---

## Rollback Procedures

### Automated Rollback

```bash
# Trigger rollback workflow
gh workflow run production.yml -f deployment_type=rollback -f rollback_version=v1.2.3
```

### Manual Rollback

```bash
# 1. Identify last known good deployment
node scripts/deployment/backup.js production list

# 2. Restore from backup
node scripts/deployment/restore.js production backup-production-2024-07-14

# 3. Verify rollback
npm run test:critical:production

# 4. Update monitoring
npm run setup:monitoring:production
```

### Database Rollback

```bash
# 1. Stop application traffic (if possible)
# 2. Restore database backup
npm run restore:db:production [backup-timestamp]

# 3. Verify data integrity
npm run validate:db:production

# 4. Resume application traffic
# 5. Monitor for issues
```

---

## Best Practices

### 1. **Pre-Deployment Checklist**
- [ ] Environment validation passes
- [ ] All tests pass
- [ ] Build validation successful
- [ ] Backup created
- [ ] Stakeholders notified

### 2. **Post-Deployment Checklist**
- [ ] Health checks pass
- [ ] Critical functionality verified
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Monitoring active

### 3. **Security Considerations**
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Security headers set

### 4. **Performance Optimization**
- [ ] Assets minified
- [ ] Compression enabled
- [ ] CDN configured
- [ ] Caching optimized
- [ ] Bundle size acceptable

---

## Support & Contact

### Emergency Contact
- **Primary**: [Your emergency contact]
- **Secondary**: [Backup contact]
- **Slack**: #deployments channel

### Documentation
- **API Docs**: `/docs/api/`
- **User Guides**: `/docs/user-guides/`
- **Troubleshooting**: `/docs/troubleshooting/`

### Monitoring Dashboards
- **Application**: [Your monitoring URL]
- **Infrastructure**: [Your infrastructure monitoring]
- **Logs**: [Your logging platform]

---

**Last Updated**: July 14, 2025
**Version**: 1.0.0
**Maintainer**: BuyMartV1 Development Team
