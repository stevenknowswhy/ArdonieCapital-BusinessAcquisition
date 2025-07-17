#!/usr/bin/env node

/**
 * Build Validation Script for BuyMartV1
 * Validates build integrity and deployment readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Get environment from command line argument
const environment = process.argv[2] || 'production';

class BuildValidator {
    constructor(env) {
        this.environment = env;
        this.errors = [];
        this.warnings = [];
        this.buildPath = path.join(rootDir, 'dist');
        this.requiredFiles = [
            'index.html',
            'assets/css/tailwind.css',
            'assets/js/config.js',
            'components/main-navigation.js'
        ];
        this.requiredDirectories = [
            'assets',
            'assets/css',
            'assets/js',
            'assets/images',
            'components'
        ];
    }

    async validate() {
        console.log(chalk.blue(`🔍 Validating build for ${this.environment}...`));
        
        // Core validations
        this.validateBuildExists();
        this.validateRequiredFiles();
        this.validateFileIntegrity();
        this.validateAssets();
        this.validateConfiguration();
        this.validateSecurity();
        this.validatePerformance();
        
        // Environment-specific validations
        if (this.environment === 'production') {
            this.validateProduction();
        }
        
        // Report results
        this.reportResults();
        
        return this.errors.length === 0;
    }

    validateBuildExists() {
        if (!fs.existsSync(this.buildPath)) {
            this.errors.push(`Build directory not found: ${this.buildPath}`);
            return false;
        }
        
        const files = fs.readdirSync(this.buildPath);
        if (files.length === 0) {
            this.errors.push('Build directory is empty');
            return false;
        }
        
        console.log(chalk.green('✓ Build directory exists and contains files'));
        return true;
    }

    validateRequiredFiles() {
        console.log(chalk.yellow('📁 Validating required files...'));
        
        for (const file of this.requiredFiles) {
            const filePath = path.join(this.buildPath, file);
            
            if (!fs.existsSync(filePath)) {
                this.errors.push(`Required file missing: ${file}`);
            } else {
                const stat = fs.statSync(filePath);
                if (stat.size === 0) {
                    this.errors.push(`Required file is empty: ${file}`);
                } else {
                    console.log(chalk.green(`  ✓ ${file} (${this.formatFileSize(stat.size)})`));
                }
            }
        }
        
        for (const dir of this.requiredDirectories) {
            const dirPath = path.join(this.buildPath, dir);
            
            if (!fs.existsSync(dirPath)) {
                this.errors.push(`Required directory missing: ${dir}`);
            } else if (!fs.statSync(dirPath).isDirectory()) {
                this.errors.push(`Path exists but is not a directory: ${dir}`);
            } else {
                console.log(chalk.green(`  ✓ ${dir}/`));
            }
        }
    }

    validateFileIntegrity() {
        console.log(chalk.yellow('🔐 Validating file integrity...'));
        
        // Check for common file corruption indicators
        const htmlFiles = this.findFiles(this.buildPath, '.html');
        const cssFiles = this.findFiles(this.buildPath, '.css');
        const jsFiles = this.findFiles(this.buildPath, '.js');
        
        // Validate HTML files
        for (const file of htmlFiles) {
            this.validateHtmlFile(file);
        }
        
        // Validate CSS files
        for (const file of cssFiles) {
            this.validateCssFile(file);
        }
        
        // Validate JS files
        for (const file of jsFiles) {
            this.validateJsFile(file);
        }
    }

    validateHtmlFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.buildPath, filePath);
        
        // Check for basic HTML structure
        if (!content.includes('<!DOCTYPE html>')) {
            this.warnings.push(`HTML file missing DOCTYPE: ${relativePath}`);
        }
        
        if (!content.includes('<html') || !content.includes('</html>')) {
            this.errors.push(`Invalid HTML structure: ${relativePath}`);
        }
        
        // Check for required meta tags
        if (!content.includes('<meta charset=')) {
            this.warnings.push(`HTML file missing charset meta tag: ${relativePath}`);
        }
        
        if (!content.includes('<meta name="viewport"')) {
            this.warnings.push(`HTML file missing viewport meta tag: ${relativePath}`);
        }
        
        // Check for broken links (basic check)
        const brokenLinkPattern = /href=["'][^"']*\{\{[^}]*\}\}[^"']*["']/g;
        if (brokenLinkPattern.test(content)) {
            this.errors.push(`HTML file contains unprocessed template variables: ${relativePath}`);
        }
        
        console.log(chalk.green(`  ✓ ${relativePath}`));
    }

    validateCssFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.buildPath, filePath);
        
        // Check for CSS syntax errors (basic)
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            this.errors.push(`CSS file has mismatched braces: ${relativePath}`);
        }
        
        // Check for unprocessed variables
        if (content.includes('{{') || content.includes('}}')) {
            this.errors.push(`CSS file contains unprocessed template variables: ${relativePath}`);
        }
        
        console.log(chalk.green(`  ✓ ${relativePath}`));
    }

    validateJsFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.buildPath, filePath);
        
        // Check for basic syntax issues
        if (content.includes('{{') || content.includes('}}')) {
            this.errors.push(`JS file contains unprocessed template variables: ${relativePath}`);
        }
        
        // Check for console.log in production
        if (this.environment === 'production' && content.includes('console.log')) {
            this.warnings.push(`JS file contains console.log statements: ${relativePath}`);
        }
        
        // Check for development-only code
        if (this.environment === 'production' && content.includes('// DEV ONLY')) {
            this.errors.push(`JS file contains development-only code: ${relativePath}`);
        }
        
        console.log(chalk.green(`  ✓ ${relativePath}`));
    }

    validateAssets() {
        console.log(chalk.yellow('🖼️ Validating assets...'));
        
        const assetsPath = path.join(this.buildPath, 'assets');
        if (!fs.existsSync(assetsPath)) {
            this.errors.push('Assets directory not found');
            return;
        }
        
        // Check for large files
        this.checkFileSizes(assetsPath);
        
        // Check for missing critical assets
        this.checkCriticalAssets();
        
        // Validate image files
        this.validateImages();
    }

    checkFileSizes(dir) {
        const files = this.getAllFiles(dir);
        const maxSizes = {
            '.js': 1024 * 1024, // 1MB
            '.css': 512 * 1024, // 512KB
            '.jpg': 2 * 1024 * 1024, // 2MB
            '.jpeg': 2 * 1024 * 1024, // 2MB
            '.png': 2 * 1024 * 1024, // 2MB
            '.gif': 1024 * 1024, // 1MB
            '.svg': 100 * 1024 // 100KB
        };
        
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            const stat = fs.statSync(file);
            const maxSize = maxSizes[ext];
            
            if (maxSize && stat.size > maxSize) {
                const relativePath = path.relative(this.buildPath, file);
                this.warnings.push(`Large file detected: ${relativePath} (${this.formatFileSize(stat.size)})`);
            }
        }
    }

    checkCriticalAssets() {
        const criticalAssets = [
            'assets/images/logo.png',
            'assets/images/favicon.ico',
            'assets/css/tailwind.css'
        ];
        
        for (const asset of criticalAssets) {
            const assetPath = path.join(this.buildPath, asset);
            if (!fs.existsSync(assetPath)) {
                this.warnings.push(`Critical asset missing: ${asset}`);
            }
        }
    }

    validateImages() {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
        const imageFiles = this.findFilesByExtensions(this.buildPath, imageExtensions);
        
        for (const file of imageFiles) {
            const stat = fs.statSync(file);
            if (stat.size === 0) {
                const relativePath = path.relative(this.buildPath, file);
                this.errors.push(`Empty image file: ${relativePath}`);
            }
        }
        
        console.log(chalk.green(`  ✓ Validated ${imageFiles.length} image files`));
    }

    validateConfiguration() {
        console.log(chalk.yellow('⚙️ Validating configuration...'));
        
        const configPath = path.join(this.buildPath, 'assets/js/config.js');
        if (!fs.existsSync(configPath)) {
            this.errors.push('Configuration file not found: assets/js/config.js');
            return;
        }
        
        const content = fs.readFileSync(configPath, 'utf8');
        
        // Check for required configuration
        if (!content.includes('BUYMART_CONFIG')) {
            this.errors.push('Configuration file missing BUYMART_CONFIG object');
        }
        
        // Check for environment-specific settings
        if (!content.includes(`"ENVIRONMENT":"${this.environment}"`)) {
            this.warnings.push(`Configuration may not be set for ${this.environment} environment`);
        }
        
        console.log(chalk.green('  ✓ Configuration file validated'));
    }

    validateSecurity() {
        console.log(chalk.yellow('🔒 Validating security...'));
        
        // Check for exposed secrets
        const allFiles = this.getAllFiles(this.buildPath);
        const secretPatterns = [
            /sk_live_[a-zA-Z0-9]+/g, // Stripe live secret keys
            /sk_test_[a-zA-Z0-9]+/g, // Stripe test secret keys
            /[a-zA-Z0-9]{32,}/g // Long strings that might be secrets
        ];
        
        for (const file of allFiles) {
            if (path.extname(file) === '.js' || path.extname(file) === '.html') {
                const content = fs.readFileSync(file, 'utf8');
                
                for (const pattern of secretPatterns) {
                    if (pattern.test(content)) {
                        const relativePath = path.relative(this.buildPath, file);
                        this.warnings.push(`Potential secret detected in: ${relativePath}`);
                    }
                }
            }
        }
        
        console.log(chalk.green('  ✓ Security validation completed'));
    }

    validatePerformance() {
        console.log(chalk.yellow('⚡ Validating performance...'));
        
        // Calculate total bundle size
        const totalSize = this.calculateTotalSize();
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (totalSize > maxSize) {
            this.warnings.push(`Large total bundle size: ${this.formatFileSize(totalSize)}`);
        }
        
        console.log(chalk.green(`  ✓ Total bundle size: ${this.formatFileSize(totalSize)}`));
    }

    validateProduction() {
        console.log(chalk.yellow('🚀 Running production-specific validations...'));
        
        // Check for minification
        const cssFiles = this.findFiles(this.buildPath, '.css');
        const jsFiles = this.findFiles(this.buildPath, '.js');
        
        for (const file of [...cssFiles, ...jsFiles]) {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(this.buildPath, file);
            
            // Simple minification check
            if (content.includes('\n\n') || content.includes('  ')) {
                this.warnings.push(`File may not be minified: ${relativePath}`);
            }
        }
        
        // Check for source maps in production
        const sourceMapFiles = this.findFiles(this.buildPath, '.map');
        if (sourceMapFiles.length > 0) {
            this.warnings.push('Source map files found in production build');
        }
        
        console.log(chalk.green('  ✓ Production validations completed'));
    }

    // Utility methods
    findFiles(dir, extension) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findFiles(itemPath, extension));
            } else if (path.extname(item) === extension) {
                files.push(itemPath);
            }
        }
        
        return files;
    }

    findFilesByExtensions(dir, extensions) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findFilesByExtensions(itemPath, extensions));
            } else if (extensions.includes(path.extname(item).toLowerCase())) {
                files.push(itemPath);
            }
        }
        
        return files;
    }

    getAllFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(itemPath));
            } else {
                files.push(itemPath);
            }
        }
        
        return files;
    }

    calculateTotalSize() {
        const files = this.getAllFiles(this.buildPath);
        return files.reduce((total, file) => {
            return total + fs.statSync(file).size;
        }, 0);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    reportResults() {
        console.log('\n' + chalk.blue('📊 Build Validation Results:'));
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log(chalk.green('✅ Build validation passed!'));
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
            console.log(chalk.red('\n❌ Build validation failed'));
            process.exit(1);
        } else {
            console.log(chalk.green('\n✅ Build validation passed'));
        }
    }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new BuildValidator(environment);
    validator.validate().catch(console.error);
}

export default BuildValidator;
