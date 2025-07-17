#!/usr/bin/env node

/**
 * Environment Validation Script for BuyMartV1
 * Validates environment configuration before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Get environment from command line argument
const environment = process.argv[2] || 'development';
const envFile = path.join(rootDir, `.env.${environment}`);

class EnvironmentValidator {
    constructor(env) {
        this.environment = env;
        this.errors = [];
        this.warnings = [];
        this.config = {};
        
        this.loadEnvironment();
    }

    loadEnvironment() {
        if (!fs.existsSync(envFile)) {
            this.errors.push(`Environment file not found: ${envFile}`);
            return;
        }
        
        dotenv.config({ path: envFile });
        this.config = process.env;
    }

    async validate() {
        console.log(chalk.blue(`🔍 Validating ${this.environment} environment...`));
        
        // Core validation checks
        this.validateRequired();
        this.validateApplication();
        this.validateDatabase();
        this.validateAuthentication();
        this.validatePayments();
        this.validateSecurity();
        this.validatePerformance();
        
        // Environment-specific validations
        if (this.environment === 'production') {
            this.validateProduction();
        } else if (this.environment === 'staging') {
            this.validateStaging();
        }
        
        // Test connections
        await this.testConnections();
        
        // Report results
        this.reportResults();
        
        return this.errors.length === 0;
    }

    validateRequired() {
        const required = [
            'ENVIRONMENT',
            'NODE_ENV',
            'APP_NAME',
            'APP_URL',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY'
        ];
        
        for (const key of required) {
            if (!this.config[key]) {
                this.errors.push(`Missing required environment variable: ${key}`);
            }
        }
    }

    validateApplication() {
        // Validate APP_URL format
        if (this.config.APP_URL) {
            try {
                new URL(this.config.APP_URL);
            } catch (error) {
                this.errors.push(`Invalid APP_URL format: ${this.config.APP_URL}`);
            }
        }
        
        // Validate environment consistency
        if (this.config.ENVIRONMENT !== this.environment) {
            this.warnings.push(`Environment mismatch: expected ${this.environment}, got ${this.config.ENVIRONMENT}`);
        }
        
        // Validate NODE_ENV
        const validNodeEnvs = ['development', 'production', 'test'];
        if (this.config.NODE_ENV && !validNodeEnvs.includes(this.config.NODE_ENV)) {
            this.errors.push(`Invalid NODE_ENV: ${this.config.NODE_ENV}`);
        }
    }

    validateDatabase() {
        // Validate Supabase URL format
        if (this.config.SUPABASE_URL) {
            if (!this.config.SUPABASE_URL.includes('supabase.co')) {
                this.warnings.push('SUPABASE_URL does not appear to be a valid Supabase URL');
            }
        }
        
        // Validate keys are present
        if (!this.config.SUPABASE_ANON_KEY) {
            this.errors.push('SUPABASE_ANON_KEY is required');
        }
        
        if (this.environment === 'production' && !this.config.SUPABASE_SERVICE_KEY) {
            this.warnings.push('SUPABASE_SERVICE_KEY recommended for production');
        }
    }

    validateAuthentication() {
        // OAuth validation
        if (!this.config.OAUTH_GOOGLE_CLIENT_ID) {
            this.warnings.push('OAUTH_GOOGLE_CLIENT_ID not configured');
        }
        
        if (!this.config.OAUTH_MICROSOFT_CLIENT_ID) {
            this.warnings.push('OAUTH_MICROSOFT_CLIENT_ID not configured');
        }
        
        // Security keys
        if (this.environment === 'production') {
            if (!this.config.JWT_SECRET || this.config.JWT_SECRET.length < 32) {
                this.errors.push('JWT_SECRET must be at least 32 characters in production');
            }
            
            if (!this.config.SESSION_SECRET || this.config.SESSION_SECRET.length < 32) {
                this.errors.push('SESSION_SECRET must be at least 32 characters in production');
            }
        }
    }

    validatePayments() {
        if (this.config.STRIPE_PUBLISHABLE_KEY) {
            const isTestKey = this.config.STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_');
            const isLiveKey = this.config.STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_');
            
            if (this.environment === 'production' && !isLiveKey) {
                this.errors.push('Production environment should use live Stripe keys');
            }
            
            if (this.environment !== 'production' && isLiveKey) {
                this.errors.push('Non-production environment should not use live Stripe keys');
            }
            
            if (!isTestKey && !isLiveKey) {
                this.errors.push('Invalid Stripe publishable key format');
            }
        }
    }

    validateSecurity() {
        // Rate limiting
        if (this.config.RATE_LIMIT_MAX_REQUESTS) {
            const maxRequests = parseInt(this.config.RATE_LIMIT_MAX_REQUESTS);
            
            if (this.environment === 'production' && maxRequests > 200) {
                this.warnings.push('High rate limit for production environment');
            }
        }
        
        // CORS validation
        if (this.environment === 'production') {
            if (this.config.CORS_ORIGIN === '*') {
                this.errors.push('CORS_ORIGIN should not be wildcard (*) in production');
            }
        }
        
        // Debug mode
        if (this.environment === 'production' && this.config.DEBUG === 'true') {
            this.errors.push('DEBUG should be false in production');
        }
    }

    validatePerformance() {
        // Cache settings
        if (this.config.CACHE_TTL) {
            const ttl = parseInt(this.config.CACHE_TTL);
            
            if (this.environment === 'production' && ttl < 300) {
                this.warnings.push('Low cache TTL for production environment');
            }
        }
        
        // Database pool settings
        if (this.config.DB_POOL_MAX) {
            const maxPool = parseInt(this.config.DB_POOL_MAX);
            
            if (this.environment === 'production' && maxPool < 20) {
                this.warnings.push('Low database pool size for production');
            }
        }
    }

    validateProduction() {
        console.log(chalk.yellow('🔒 Running production-specific validations...'));
        
        // SSL requirements
        if (!this.config.SERVER_HTTPS || this.config.SERVER_HTTPS !== 'true') {
            this.errors.push('HTTPS must be enabled in production');
        }
        
        // Monitoring
        if (!this.config.MONITORING_ENABLED || this.config.MONITORING_ENABLED !== 'true') {
            this.warnings.push('Monitoring should be enabled in production');
        }
        
        // Backup settings
        if (!this.config.BACKUP_ENABLED || this.config.BACKUP_ENABLED !== 'true') {
            this.warnings.push('Backups should be enabled in production');
        }
        
        // Performance optimizations
        if (this.config.COMPRESSION_ENABLED !== 'true') {
            this.warnings.push('Compression should be enabled in production');
        }
        
        if (this.config.MINIFICATION_ENABLED !== 'true') {
            this.warnings.push('Minification should be enabled in production');
        }
    }

    validateStaging() {
        console.log(chalk.yellow('🧪 Running staging-specific validations...'));
        
        // Staging should mirror production settings
        if (this.config.NODE_ENV !== 'production') {
            this.warnings.push('Staging should use NODE_ENV=production');
        }
        
        // Test data validation
        if (!this.config.TEST_USER_EMAIL) {
            this.warnings.push('TEST_USER_EMAIL should be configured for staging');
        }
    }

    async testConnections() {
        console.log(chalk.yellow('🔗 Testing connections...'));
        
        // Test Supabase connection
        await this.testSupabaseConnection();
        
        // Test external services
        await this.testExternalServices();
    }

    async testSupabaseConnection() {
        if (!this.config.SUPABASE_URL || !this.config.SUPABASE_ANON_KEY) {
            this.warnings.push('Cannot test Supabase connection - missing configuration');
            return;
        }
        
        try {
            const supabase = createClient(
                this.config.SUPABASE_URL,
                this.config.SUPABASE_ANON_KEY
            );
            
            const { data, error } = await supabase.from('profiles').select('count').limit(1);
            
            if (error) {
                this.warnings.push(`Supabase connection test failed: ${error.message}`);
            } else {
                console.log(chalk.green('  ✓ Supabase connection successful'));
            }
            
        } catch (error) {
            this.warnings.push(`Supabase connection error: ${error.message}`);
        }
    }

    async testExternalServices() {
        // Test OAuth endpoints (simplified)
        if (this.config.OAUTH_GOOGLE_CLIENT_ID) {
            console.log(chalk.green('  ✓ Google OAuth configured'));
        }
        
        if (this.config.OAUTH_MICROSOFT_CLIENT_ID) {
            console.log(chalk.green('  ✓ Microsoft OAuth configured'));
        }
        
        // Test Stripe configuration
        if (this.config.STRIPE_PUBLISHABLE_KEY) {
            console.log(chalk.green('  ✓ Stripe configured'));
        }
    }

    reportResults() {
        console.log('\n' + chalk.blue('📊 Validation Results:'));
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log(chalk.green('✅ All validations passed!'));
            return;
        }
        
        if (this.errors.length > 0) {
            console.log(chalk.red(`\n❌ Errors (${this.errors.length}):`));
            this.errors.forEach(error => {
                console.log(chalk.red(`  • ${error}`));
            });
        }
        
        if (this.warnings.length > 0) {
            console.log(chalk.yellow(`\n⚠️  Warnings (${this.warnings.length}):`));
            this.warnings.forEach(warning => {
                console.log(chalk.yellow(`  • ${warning}`));
            });
        }
        
        console.log('\n' + chalk.blue('Summary:'));
        console.log(`  Environment: ${this.environment}`);
        console.log(`  Errors: ${this.errors.length}`);
        console.log(`  Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            console.log(chalk.red('\n❌ Environment validation failed'));
            process.exit(1);
        } else {
            console.log(chalk.green('\n✅ Environment validation passed'));
        }
    }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new EnvironmentValidator(environment);
    validator.validate().catch(console.error);
}

export default EnvironmentValidator;
