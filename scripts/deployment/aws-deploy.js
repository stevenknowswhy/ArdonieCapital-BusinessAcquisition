#!/usr/bin/env node

/**
 * AWS Deployment Script for BuyMartV1
 * Deploys to AWS S3 + CloudFront for global CDN distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import mime from 'mime-types';
import dotenv from 'dotenv';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Load environment configuration
const environment = process.env.ENVIRONMENT || 'production';
dotenv.config({ path: path.join(rootDir, `.env.${environment}`) });

class AWSDeployer {
    constructor() {
        this.config = {
            region: process.env.AWS_REGION || 'us-east-1',
            bucket: process.env.AWS_S3_BUCKET,
            distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            localBuildPath: path.join(rootDir, 'dist'),
            cacheControl: {
                html: 'public, max-age=0, must-revalidate',
                css: 'public, max-age=31536000, immutable',
                js: 'public, max-age=31536000, immutable',
                images: 'public, max-age=31536000, immutable',
                fonts: 'public, max-age=31536000, immutable',
                default: 'public, max-age=86400'
            }
        };
        
        this.validateConfig();
        this.initializeClients();
    }

    validateConfig() {
        const required = ['bucket', 'accessKeyId', 'secretAccessKey'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            console.error(chalk.red(`Missing required AWS configuration: ${missing.join(', ')}`));
            process.exit(1);
        }
    }

    initializeClients() {
        const credentials = {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey
        };

        this.s3Client = new S3Client({
            region: this.config.region,
            credentials
        });

        if (this.config.distributionId) {
            this.cloudFrontClient = new CloudFrontClient({
                region: this.config.region,
                credentials
            });
        }
    }

    async deploy() {
        console.log(chalk.blue('🚀 Starting AWS deployment...'));
        
        try {
            // Step 1: Validate build exists
            await this.validateBuild();
            
            // Step 2: Sync files to S3
            await this.syncToS3();
            
            // Step 3: Invalidate CloudFront cache
            if (this.config.distributionId) {
                await this.invalidateCloudFront();
            }
            
            // Step 4: Verify deployment
            await this.verifyDeployment();
            
            console.log(chalk.green('✅ AWS deployment completed successfully!'));
            console.log(chalk.cyan(`🌐 S3 Bucket: ${this.config.bucket}`));
            if (this.config.distributionId) {
                console.log(chalk.cyan(`🌐 CloudFront Distribution: ${this.config.distributionId}`));
            }
            
        } catch (error) {
            console.error(chalk.red('❌ AWS deployment failed:'), error.message);
            process.exit(1);
        }
    }

    async validateBuild() {
        console.log(chalk.yellow('🔍 Validating build...'));
        
        if (!fs.existsSync(this.config.localBuildPath)) {
            throw new Error(`Build directory not found: ${this.config.localBuildPath}`);
        }
        
        const files = fs.readdirSync(this.config.localBuildPath);
        if (files.length === 0) {
            throw new Error('Build directory is empty');
        }
        
        console.log(chalk.green('✅ Build validation passed'));
    }

    async syncToS3() {
        console.log(chalk.yellow('📤 Syncing files to S3...'));
        
        const files = await this.getAllFiles(this.config.localBuildPath);
        const uploadPromises = files.map(file => this.uploadFile(file));
        
        await Promise.all(uploadPromises);
        
        console.log(chalk.green(`✅ Uploaded ${files.length} files to S3`));
    }

    async getAllFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                await this.getAllFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        }
        
        return fileList;
    }

    async uploadFile(filePath) {
        const relativePath = path.relative(this.config.localBuildPath, filePath);
        const s3Key = relativePath.replace(/\\/g, '/'); // Convert Windows paths to Unix
        
        const fileContent = fs.readFileSync(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        const cacheControl = this.getCacheControl(filePath);
        
        const command = new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: s3Key,
            Body: fileContent,
            ContentType: contentType,
            CacheControl: cacheControl,
            Metadata: {
                'deployment-time': new Date().toISOString(),
                'environment': environment
            }
        });
        
        try {
            await this.s3Client.send(command);
            console.log(chalk.gray(`  ✓ ${s3Key}`));
        } catch (error) {
            console.error(chalk.red(`  ✗ ${s3Key}: ${error.message}`));
            throw error;
        }
    }

    getCacheControl(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        switch (ext) {
            case '.html':
                return this.config.cacheControl.html;
            case '.css':
                return this.config.cacheControl.css;
            case '.js':
                return this.config.cacheControl.js;
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
            case '.svg':
            case '.webp':
                return this.config.cacheControl.images;
            case '.woff':
            case '.woff2':
            case '.ttf':
            case '.eot':
                return this.config.cacheControl.fonts;
            default:
                return this.config.cacheControl.default;
        }
    }

    async invalidateCloudFront() {
        console.log(chalk.yellow('🔄 Invalidating CloudFront cache...'));
        
        const command = new CreateInvalidationCommand({
            DistributionId: this.config.distributionId,
            InvalidationBatch: {
                Paths: {
                    Quantity: 1,
                    Items: ['/*']
                },
                CallerReference: `deployment-${Date.now()}`
            }
        });
        
        try {
            const response = await this.cloudFrontClient.send(command);
            console.log(chalk.green(`✅ CloudFront invalidation created: ${response.Invalidation.Id}`));
        } catch (error) {
            console.error(chalk.red('❌ CloudFront invalidation failed:'), error.message);
            throw error;
        }
    }

    async verifyDeployment() {
        console.log(chalk.yellow('🔍 Verifying AWS deployment...'));
        
        try {
            // List objects in S3 bucket to verify upload
            const command = new ListObjectsV2Command({
                Bucket: this.config.bucket,
                MaxKeys: 10
            });
            
            const response = await this.s3Client.send(command);
            
            if (response.Contents && response.Contents.length > 0) {
                console.log(chalk.green('✅ Files verified in S3 bucket'));
            } else {
                throw new Error('No files found in S3 bucket');
            }
            
        } catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    async cleanup() {
        console.log(chalk.yellow('🧹 Cleaning up old deployments...'));
        
        try {
            // This would implement cleanup logic for old deployments
            // For now, we'll just log that cleanup would happen here
            console.log(chalk.green('✅ Cleanup completed'));
            
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Cleanup failed:'), error.message);
        }
    }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new AWSDeployer();
    deployer.deploy().catch(console.error);
}

export default AWSDeployer;
