#!/usr/bin/env node

/**
 * Hostinger Deployment Script for BuyMartV1
 * Automates deployment to Hostinger hosting via FTP
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import ftp from 'basic-ftp';
import dotenv from 'dotenv';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Load environment configuration
const environment = process.env.ENVIRONMENT || 'production';
dotenv.config({ path: path.join(rootDir, `.env.${environment}`) });

class HostingerDeployer {
    constructor() {
        this.config = {
            host: process.env.HOSTINGER_FTP_HOST,
            user: process.env.HOSTINGER_FTP_USER,
            password: process.env.HOSTINGER_FTP_PASSWORD,
            domain: process.env.HOSTINGER_DOMAIN,
            remotePath: '/public_html',
            localBuildPath: path.join(rootDir, 'dist'),
            backupPath: path.join(rootDir, 'backups/hostinger'),
            excludePatterns: [
                'node_modules/**',
                'tests/**',
                'docs/**',
                'scripts/**',
                'backups/**',
                'temp/**',
                'dev/**',
                '.git/**',
                '.github/**',
                '*.md',
                '.env*',
                '*.log',
                'coverage/**',
                'src/**',
                'package*.json',
                'tailwind.config.js',
                'lighthouse.config.js'
            ]
        };
        
        this.validateConfig();
    }

    validateConfig() {
        const required = ['host', 'user', 'password', 'domain'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            console.error(chalk.red(`Missing required configuration: ${missing.join(', ')}`));
            process.exit(1);
        }
    }

    async deploy() {
        console.log(chalk.blue('🚀 Starting Hostinger deployment...'));
        
        try {
            // Step 1: Create production build
            await this.createProductionBuild();
            
            // Step 2: Create deployment package
            await this.createDeploymentPackage();
            
            // Step 3: Create backup of current deployment
            await this.createBackup();
            
            // Step 4: Upload to Hostinger
            await this.uploadToHostinger();
            
            // Step 5: Verify deployment
            await this.verifyDeployment();
            
            console.log(chalk.green('✅ Deployment completed successfully!'));
            console.log(chalk.cyan(`🌐 Site URL: https://${this.config.domain}`));
            
        } catch (error) {
            console.error(chalk.red('❌ Deployment failed:'), error.message);
            await this.rollback();
            process.exit(1);
        }
    }

    async createProductionBuild() {
        console.log(chalk.yellow('📦 Creating production build...'));
        
        // Ensure dist directory exists
        if (!fs.existsSync(this.config.localBuildPath)) {
            fs.mkdirSync(this.config.localBuildPath, { recursive: true });
        }
        
        // Copy production files
        await this.copyProductionFiles();
        
        // Process environment variables
        await this.processEnvironmentVariables();
        
        // Optimize assets
        await this.optimizeAssets();
        
        console.log(chalk.green('✅ Production build created'));
    }

    async copyProductionFiles() {
        const sourceDir = rootDir;
        const targetDir = this.config.localBuildPath;
        
        // Copy all files except excluded patterns
        await this.copyDirectory(sourceDir, targetDir, this.config.excludePatterns);
    }

    async copyDirectory(source, target, excludePatterns = []) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        
        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);
            const relativePath = path.relative(rootDir, sourcePath);
            
            // Check if item should be excluded
            const shouldExclude = excludePatterns.some(pattern => {
                const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
                return regex.test(relativePath) || regex.test(item);
            });
            
            if (shouldExclude) {
                continue;
            }
            
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath, excludePatterns);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }

    async processEnvironmentVariables() {
        console.log(chalk.yellow('🔧 Processing environment variables...'));
        
        // Create environment-specific configuration
        const envConfig = {
            ENVIRONMENT: environment,
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
            OAUTH_GOOGLE_CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID,
            OAUTH_MICROSOFT_CLIENT_ID: process.env.OAUTH_MICROSOFT_CLIENT_ID,
            STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
            ANALYTICS_ID: process.env.ANALYTICS_ID,
            CDN_URL: process.env.CDN_URL || `https://${this.config.domain}`
        };
        
        // Create config.js file for client-side use
        const configContent = `
// BuyMartV1 Configuration - ${environment.toUpperCase()}
window.BUYMART_CONFIG = ${JSON.stringify(envConfig, null, 2)};
`;
        
        fs.writeFileSync(
            path.join(this.config.localBuildPath, 'assets/js/config.js'),
            configContent
        );
    }

    async optimizeAssets() {
        console.log(chalk.yellow('⚡ Optimizing assets...'));
        
        // Minify CSS and JS files would go here
        // For now, we'll just ensure proper file permissions
        
        const assetsDir = path.join(this.config.localBuildPath, 'assets');
        if (fs.existsSync(assetsDir)) {
            // Set proper permissions for web assets
            this.setFilePermissions(assetsDir);
        }
    }

    setFilePermissions(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                this.setFilePermissions(itemPath);
            } else {
                // Set readable permissions for web files
                fs.chmodSync(itemPath, 0o644);
            }
        }
    }

    async createDeploymentPackage() {
        console.log(chalk.yellow('📦 Creating deployment package...'));
        
        const packagePath = path.join(rootDir, 'temp', `buymart-${environment}-${Date.now()}.zip`);
        
        // Ensure temp directory exists
        fs.mkdirSync(path.dirname(packagePath), { recursive: true });
        
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(packagePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                console.log(chalk.green(`✅ Package created: ${archive.pointer()} bytes`));
                this.packagePath = packagePath;
                resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            
            // Add all files from build directory
            archive.directory(this.config.localBuildPath, false);
            archive.finalize();
        });
    }

    async createBackup() {
        console.log(chalk.yellow('💾 Creating backup of current deployment...'));
        
        try {
            const client = new ftp.Client();
            await client.access({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                secure: false
            });
            
            const backupDir = path.join(this.config.backupPath, `backup-${Date.now()}`);
            fs.mkdirSync(backupDir, { recursive: true });
            
            // Download current files for backup
            await client.downloadToDir(backupDir, this.config.remotePath);
            await client.close();
            
            console.log(chalk.green('✅ Backup created'));
            
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Backup creation failed (continuing deployment):'), error.message);
        }
    }

    async uploadToHostinger() {
        console.log(chalk.yellow('📤 Uploading to Hostinger...'));
        
        const client = new ftp.Client();
        
        try {
            await client.access({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                secure: false
            });
            
            console.log(chalk.blue('Connected to Hostinger FTP'));
            
            // Clear remote directory (except for certain files)
            await this.clearRemoteDirectory(client);
            
            // Upload new files
            await client.uploadFromDir(this.config.localBuildPath, this.config.remotePath);
            
            await client.close();
            console.log(chalk.green('✅ Upload completed'));
            
        } catch (error) {
            await client.close();
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    async clearRemoteDirectory(client) {
        try {
            // List files in remote directory
            const files = await client.list(this.config.remotePath);
            
            // Files to preserve during deployment
            const preserveFiles = ['.htaccess', 'robots.txt', 'sitemap.xml'];
            
            for (const file of files) {
                if (!preserveFiles.includes(file.name) && !file.name.startsWith('.')) {
                    const remotePath = `${this.config.remotePath}/${file.name}`;
                    
                    if (file.isDirectory) {
                        await client.removeDir(remotePath);
                    } else {
                        await client.remove(remotePath);
                    }
                }
            }
            
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Could not clear remote directory:'), error.message);
        }
    }

    async verifyDeployment() {
        console.log(chalk.yellow('🔍 Verifying deployment...'));
        
        // Simple HTTP check
        try {
            const response = await fetch(`https://${this.config.domain}`);
            
            if (response.ok) {
                console.log(chalk.green('✅ Site is accessible'));
            } else {
                throw new Error(`Site returned status: ${response.status}`);
            }
            
        } catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    async rollback() {
        console.log(chalk.yellow('🔄 Attempting rollback...'));
        
        try {
            // Find latest backup
            const backupDir = this.config.backupPath;
            
            if (fs.existsSync(backupDir)) {
                const backups = fs.readdirSync(backupDir)
                    .filter(name => name.startsWith('backup-'))
                    .sort()
                    .reverse();
                
                if (backups.length > 0) {
                    const latestBackup = path.join(backupDir, backups[0]);
                    
                    // Upload backup to restore previous state
                    const client = new ftp.Client();
                    await client.access({
                        host: this.config.host,
                        user: this.config.user,
                        password: this.config.password,
                        secure: false
                    });
                    
                    await client.uploadFromDir(latestBackup, this.config.remotePath);
                    await client.close();
                    
                    console.log(chalk.green('✅ Rollback completed'));
                } else {
                    console.warn(chalk.yellow('⚠️ No backup available for rollback'));
                }
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Rollback failed:'), error.message);
        }
    }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new HostingerDeployer();
    deployer.deploy().catch(console.error);
}

export default HostingerDeployer;
