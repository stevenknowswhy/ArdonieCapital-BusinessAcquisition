#!/usr/bin/env node

/**
 * Backup Script for BuyMartV1
 * Creates backups of deployments and databases before updates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import ftp from 'basic-ftp';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Get environment from command line argument
const environment = process.argv[2] || 'production';
dotenv.config({ path: path.join(rootDir, `.env.${environment}`) });

class BackupManager {
    constructor(env) {
        this.environment = env;
        this.config = {
            backupDir: path.join(rootDir, 'backups', env),
            maxBackups: 10,
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
            ftpHost: process.env.HOSTINGER_FTP_HOST,
            ftpUser: process.env.HOSTINGER_FTP_USER,
            ftpPassword: process.env.HOSTINGER_FTP_PASSWORD,
            remotePath: '/public_html'
        };
        
        this.ensureBackupDirectory();
        this.initializeSupabase();
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.config.backupDir)) {
            fs.mkdirSync(this.config.backupDir, { recursive: true });
        }
    }

    initializeSupabase() {
        if (this.config.supabaseUrl && this.config.supabaseServiceKey) {
            this.supabase = createClient(
                this.config.supabaseUrl,
                this.config.supabaseServiceKey
            );
        }
    }

    async createFullBackup() {
        console.log(chalk.blue(`🔄 Creating full backup for ${this.environment}...`));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${this.environment}-${timestamp}`;
        const backupPath = path.join(this.config.backupDir, backupName);
        
        try {
            // Create backup directory
            fs.mkdirSync(backupPath, { recursive: true });
            
            // Backup files
            await this.backupFiles(backupPath);
            
            // Backup database
            if (this.supabase) {
                await this.backupDatabase(backupPath);
            }
            
            // Create archive
            const archivePath = await this.createArchive(backupPath, backupName);
            
            // Cleanup old backups
            await this.cleanupOldBackups();
            
            console.log(chalk.green(`✅ Backup completed: ${archivePath}`));
            return archivePath;
            
        } catch (error) {
            console.error(chalk.red('❌ Backup failed:'), error.message);
            throw error;
        }
    }

    async backupFiles(backupPath) {
        console.log(chalk.yellow('📁 Backing up files...'));
        
        const filesBackupPath = path.join(backupPath, 'files');
        fs.mkdirSync(filesBackupPath, { recursive: true });
        
        if (this.environment === 'production' || this.environment === 'staging') {
            // Download from FTP server
            await this.downloadFromFTP(filesBackupPath);
        } else {
            // Copy local files
            await this.copyLocalFiles(filesBackupPath);
        }
        
        console.log(chalk.green('✅ Files backup completed'));
    }

    async downloadFromFTP(backupPath) {
        if (!this.config.ftpHost) {
            console.warn(chalk.yellow('⚠️ FTP configuration not found, skipping file backup'));
            return;
        }
        
        const client = new ftp.Client();
        
        try {
            await client.access({
                host: this.config.ftpHost,
                user: this.config.ftpUser,
                password: this.config.ftpPassword,
                secure: false
            });
            
            console.log(chalk.blue('Connected to FTP server'));
            await client.downloadToDir(backupPath, this.config.remotePath);
            await client.close();
            
        } catch (error) {
            await client.close();
            throw new Error(`FTP backup failed: ${error.message}`);
        }
    }

    async copyLocalFiles(backupPath) {
        const sourceDir = rootDir;
        const excludePatterns = [
            'node_modules/**',
            'backups/**',
            'temp/**',
            '.git/**',
            'coverage/**',
            'logs/**'
        ];
        
        await this.copyDirectory(sourceDir, backupPath, excludePatterns);
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

    async backupDatabase(backupPath) {
        console.log(chalk.yellow('🗄️ Backing up database...'));
        
        const dbBackupPath = path.join(backupPath, 'database');
        fs.mkdirSync(dbBackupPath, { recursive: true });
        
        try {
            // Get all table names
            const tables = await this.getDatabaseTables();
            
            // Backup each table
            for (const table of tables) {
                await this.backupTable(table, dbBackupPath);
            }
            
            // Backup schema
            await this.backupSchema(dbBackupPath);
            
            console.log(chalk.green('✅ Database backup completed'));
            
        } catch (error) {
            console.error(chalk.red('❌ Database backup failed:'), error.message);
            throw error;
        }
    }

    async getDatabaseTables() {
        const { data, error } = await this.supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .neq('table_name', 'spatial_ref_sys'); // Exclude PostGIS table
        
        if (error) {
            throw new Error(`Failed to get table list: ${error.message}`);
        }
        
        return data.map(row => row.table_name);
    }

    async backupTable(tableName, backupPath) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');
            
            if (error) {
                console.warn(chalk.yellow(`⚠️ Failed to backup table ${tableName}: ${error.message}`));
                return;
            }
            
            const tableBackupPath = path.join(backupPath, `${tableName}.json`);
            fs.writeFileSync(tableBackupPath, JSON.stringify(data, null, 2));
            
            console.log(chalk.gray(`  ✓ ${tableName} (${data.length} rows)`));
            
        } catch (error) {
            console.warn(chalk.yellow(`⚠️ Failed to backup table ${tableName}: ${error.message}`));
        }
    }

    async backupSchema(backupPath) {
        try {
            // This would backup the database schema
            // For now, we'll create a placeholder
            const schemaInfo = {
                timestamp: new Date().toISOString(),
                environment: this.environment,
                supabase_url: this.config.supabaseUrl,
                note: 'Schema backup would be implemented here'
            };
            
            const schemaPath = path.join(backupPath, 'schema.json');
            fs.writeFileSync(schemaPath, JSON.stringify(schemaInfo, null, 2));
            
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Schema backup failed:'), error.message);
        }
    }

    async createArchive(backupPath, backupName) {
        console.log(chalk.yellow('📦 Creating backup archive...'));
        
        const archivePath = path.join(this.config.backupDir, `${backupName}.zip`);
        
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(archivePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                console.log(chalk.green(`✅ Archive created: ${archive.pointer()} bytes`));
                
                // Remove uncompressed backup directory
                fs.rmSync(backupPath, { recursive: true, force: true });
                
                resolve(archivePath);
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            
            // Add all files from backup directory
            archive.directory(backupPath, false);
            archive.finalize();
        });
    }

    async cleanupOldBackups() {
        console.log(chalk.yellow('🧹 Cleaning up old backups...'));
        
        try {
            const backups = fs.readdirSync(this.config.backupDir)
                .filter(name => name.startsWith(`backup-${this.environment}-`) && name.endsWith('.zip'))
                .map(name => ({
                    name,
                    path: path.join(this.config.backupDir, name),
                    mtime: fs.statSync(path.join(this.config.backupDir, name)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);
            
            if (backups.length > this.config.maxBackups) {
                const toDelete = backups.slice(this.config.maxBackups);
                
                for (const backup of toDelete) {
                    fs.unlinkSync(backup.path);
                    console.log(chalk.gray(`  ✓ Deleted old backup: ${backup.name}`));
                }
                
                console.log(chalk.green(`✅ Cleaned up ${toDelete.length} old backups`));
            }
            
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Cleanup failed:'), error.message);
        }
    }

    async listBackups() {
        console.log(chalk.blue(`📋 Available backups for ${this.environment}:`));
        
        try {
            const backups = fs.readdirSync(this.config.backupDir)
                .filter(name => name.startsWith(`backup-${this.environment}-`) && name.endsWith('.zip'))
                .map(name => {
                    const filePath = path.join(this.config.backupDir, name);
                    const stat = fs.statSync(filePath);
                    return {
                        name,
                        size: stat.size,
                        created: stat.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);
            
            if (backups.length === 0) {
                console.log(chalk.yellow('No backups found'));
                return;
            }
            
            backups.forEach((backup, index) => {
                const sizeKB = Math.round(backup.size / 1024);
                const age = Math.round((Date.now() - backup.created.getTime()) / (1000 * 60 * 60 * 24));
                console.log(chalk.cyan(`  ${index + 1}. ${backup.name} (${sizeKB}KB, ${age} days ago)`));
            });
            
        } catch (error) {
            console.error(chalk.red('❌ Failed to list backups:'), error.message);
        }
    }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[3] || 'create';
    const backupManager = new BackupManager(environment);
    
    if (command === 'create') {
        backupManager.createFullBackup().catch(console.error);
    } else if (command === 'list') {
        backupManager.listBackups().catch(console.error);
    } else {
        console.error(chalk.red('Unknown command. Use: create or list'));
        process.exit(1);
    }
}

export default BackupManager;
