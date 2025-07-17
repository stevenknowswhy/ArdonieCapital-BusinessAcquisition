#!/usr/bin/env node

/**
 * Database Migration Script for BuyMartV1
 * Handles database schema migrations across environments
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
dotenv.config({ path: path.join(rootDir, `.env.${environment}`) });

class DatabaseMigrator {
    constructor(env) {
        this.environment = env;
        this.config = {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
            migrationsPath: path.join(rootDir, 'database/migrations'),
            schemasPath: path.join(rootDir, 'database/schemas')
        };
        
        this.validateConfig();
        this.initializeSupabase();
    }

    validateConfig() {
        if (!this.config.supabaseUrl || !this.config.supabaseServiceKey) {
            console.error(chalk.red('Missing Supabase configuration'));
            process.exit(1);
        }
    }

    initializeSupabase() {
        this.supabase = createClient(
            this.config.supabaseUrl,
            this.config.supabaseServiceKey
        );
    }

    async migrate() {
        console.log(chalk.blue(`🔄 Running database migrations for ${this.environment}...`));
        
        try {
            // Create migrations table if it doesn't exist
            await this.createMigrationsTable();
            
            // Get pending migrations
            const pendingMigrations = await this.getPendingMigrations();
            
            if (pendingMigrations.length === 0) {
                console.log(chalk.green('✅ No pending migrations'));
                return;
            }
            
            console.log(chalk.yellow(`📋 Found ${pendingMigrations.length} pending migrations`));
            
            // Run each migration
            for (const migration of pendingMigrations) {
                await this.runMigration(migration);
            }
            
            console.log(chalk.green('✅ All migrations completed successfully'));
            
        } catch (error) {
            console.error(chalk.red('❌ Migration failed:'), error.message);
            process.exit(1);
        }
    }

    async createMigrationsTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                checksum VARCHAR(64),
                environment VARCHAR(50) DEFAULT '${this.environment}'
            );
        `;
        
        const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (error) {
            throw new Error(`Failed to create migrations table: ${error.message}`);
        }
    }

    async getPendingMigrations() {
        // Get all migration files
        const migrationFiles = this.getMigrationFiles();
        
        // Get executed migrations from database
        const { data: executedMigrations, error } = await this.supabase
            .from('migrations')
            .select('filename')
            .eq('environment', this.environment);
        
        if (error) {
            throw new Error(`Failed to get executed migrations: ${error.message}`);
        }
        
        const executedFilenames = executedMigrations.map(m => m.filename);
        
        // Filter out already executed migrations
        return migrationFiles.filter(file => !executedFilenames.includes(file));
    }

    getMigrationFiles() {
        if (!fs.existsSync(this.config.migrationsPath)) {
            console.log(chalk.yellow('⚠️ Migrations directory not found, creating...'));
            fs.mkdirSync(this.config.migrationsPath, { recursive: true });
            return [];
        }
        
        return fs.readdirSync(this.config.migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure migrations run in order
    }

    async runMigration(filename) {
        console.log(chalk.yellow(`🔄 Running migration: ${filename}`));
        
        const migrationPath = path.join(this.config.migrationsPath, filename);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        try {
            // Calculate checksum for integrity
            const checksum = this.calculateChecksum(migrationSQL);
            
            // Execute migration
            const { error } = await this.supabase.rpc('exec_sql', { sql: migrationSQL });
            
            if (error) {
                throw new Error(`Migration execution failed: ${error.message}`);
            }
            
            // Record successful migration
            await this.recordMigration(filename, checksum);
            
            console.log(chalk.green(`  ✅ ${filename} completed`));
            
        } catch (error) {
            console.error(chalk.red(`  ❌ ${filename} failed: ${error.message}`));
            throw error;
        }
    }

    async recordMigration(filename, checksum) {
        const { error } = await this.supabase
            .from('migrations')
            .insert({
                filename,
                checksum,
                environment: this.environment,
                executed_at: new Date().toISOString()
            });
        
        if (error) {
            throw new Error(`Failed to record migration: ${error.message}`);
        }
    }

    calculateChecksum(content) {
        const crypto = await import('crypto');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    async rollback(steps = 1) {
        console.log(chalk.blue(`🔄 Rolling back ${steps} migration(s) for ${this.environment}...`));
        
        try {
            // Get last executed migrations
            const { data: lastMigrations, error } = await this.supabase
                .from('migrations')
                .select('*')
                .eq('environment', this.environment)
                .order('executed_at', { ascending: false })
                .limit(steps);
            
            if (error) {
                throw new Error(`Failed to get migrations for rollback: ${error.message}`);
            }
            
            if (lastMigrations.length === 0) {
                console.log(chalk.yellow('⚠️ No migrations to rollback'));
                return;
            }
            
            // Rollback each migration
            for (const migration of lastMigrations) {
                await this.rollbackMigration(migration);
            }
            
            console.log(chalk.green('✅ Rollback completed successfully'));
            
        } catch (error) {
            console.error(chalk.red('❌ Rollback failed:'), error.message);
            process.exit(1);
        }
    }

    async rollbackMigration(migration) {
        console.log(chalk.yellow(`🔄 Rolling back: ${migration.filename}`));
        
        // Look for rollback file
        const rollbackFilename = migration.filename.replace('.sql', '.rollback.sql');
        const rollbackPath = path.join(this.config.migrationsPath, rollbackFilename);
        
        if (!fs.existsSync(rollbackPath)) {
            console.warn(chalk.yellow(`  ⚠️ No rollback file found: ${rollbackFilename}`));
            return;
        }
        
        try {
            const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');
            
            // Execute rollback
            const { error } = await this.supabase.rpc('exec_sql', { sql: rollbackSQL });
            
            if (error) {
                throw new Error(`Rollback execution failed: ${error.message}`);
            }
            
            // Remove migration record
            await this.removeMigrationRecord(migration.filename);
            
            console.log(chalk.green(`  ✅ ${migration.filename} rolled back`));
            
        } catch (error) {
            console.error(chalk.red(`  ❌ Rollback failed for ${migration.filename}: ${error.message}`));
            throw error;
        }
    }

    async removeMigrationRecord(filename) {
        const { error } = await this.supabase
            .from('migrations')
            .delete()
            .eq('filename', filename)
            .eq('environment', this.environment);
        
        if (error) {
            throw new Error(`Failed to remove migration record: ${error.message}`);
        }
    }

    async status() {
        console.log(chalk.blue(`📋 Migration status for ${this.environment}:`));
        
        try {
            // Get all migration files
            const migrationFiles = this.getMigrationFiles();
            
            // Get executed migrations
            const { data: executedMigrations, error } = await this.supabase
                .from('migrations')
                .select('*')
                .eq('environment', this.environment)
                .order('executed_at', { ascending: true });
            
            if (error) {
                throw new Error(`Failed to get migration status: ${error.message}`);
            }
            
            const executedFilenames = executedMigrations.map(m => m.filename);
            
            console.log(chalk.cyan('\n📁 All Migrations:'));
            
            for (const file of migrationFiles) {
                const isExecuted = executedFilenames.includes(file);
                const status = isExecuted ? chalk.green('✅ Executed') : chalk.yellow('⏳ Pending');
                console.log(`  ${status} ${file}`);
                
                if (isExecuted) {
                    const migration = executedMigrations.find(m => m.filename === file);
                    console.log(chalk.gray(`    Executed: ${new Date(migration.executed_at).toLocaleString()}`));
                }
            }
            
            const pendingCount = migrationFiles.length - executedMigrations.length;
            console.log(chalk.cyan(`\n📊 Summary:`));
            console.log(`  Total migrations: ${migrationFiles.length}`);
            console.log(`  Executed: ${executedMigrations.length}`);
            console.log(`  Pending: ${pendingCount}`);
            
        } catch (error) {
            console.error(chalk.red('❌ Failed to get migration status:'), error.message);
        }
    }

    async createMigration(name) {
        if (!name) {
            console.error(chalk.red('Migration name is required'));
            process.exit(1);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
        const migrationPath = path.join(this.config.migrationsPath, filename);
        const rollbackPath = path.join(this.config.migrationsPath, filename.replace('.sql', '.rollback.sql'));
        
        // Ensure migrations directory exists
        if (!fs.existsSync(this.config.migrationsPath)) {
            fs.mkdirSync(this.config.migrationsPath, { recursive: true });
        }
        
        // Create migration file
        const migrationTemplate = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Environment: ${this.environment}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
`;
        
        // Create rollback file
        const rollbackTemplate = `-- Rollback for: ${name}
-- Created: ${new Date().toISOString()}

-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example;
`;
        
        fs.writeFileSync(migrationPath, migrationTemplate);
        fs.writeFileSync(rollbackPath, rollbackTemplate);
        
        console.log(chalk.green(`✅ Created migration files:`));
        console.log(chalk.cyan(`  Migration: ${filename}`));
        console.log(chalk.cyan(`  Rollback: ${filename.replace('.sql', '.rollback.sql')}`));
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[3] || 'migrate';
    const migrator = new DatabaseMigrator(environment);
    
    switch (command) {
        case 'migrate':
            migrator.migrate().catch(console.error);
            break;
        case 'rollback':
            const steps = parseInt(process.argv[4]) || 1;
            migrator.rollback(steps).catch(console.error);
            break;
        case 'status':
            migrator.status().catch(console.error);
            break;
        case 'create':
            const name = process.argv.slice(4).join(' ');
            migrator.createMigration(name).catch(console.error);
            break;
        default:
            console.error(chalk.red('Unknown command. Use: migrate, rollback, status, or create'));
            process.exit(1);
    }
}

export default DatabaseMigrator;
