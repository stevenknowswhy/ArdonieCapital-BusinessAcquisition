#!/usr/bin/env node

/**
 * Import/Export System Validation Script
 * Validates that all imports and exports are working correctly
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

class ImportExportValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.successes = [];
    }

    async validate() {
        log.info('Starting import/export system validation...');
        
        try {
            await this.validateDirectoryStructure();
            await this.validateBarrelExports();
            await this.validateImportPaths();
            await this.validateDynamicImports();
            await this.generateReport();
        } catch (error) {
            log.error(`Validation failed: ${error.message}`);
            process.exit(1);
        }
    }

    async validateDirectoryStructure() {
        log.info('Validating directory structure...');
        
        const requiredDirs = [
            'src',
            'src/features',
            'src/features/authentication',
            'src/features/dashboard',
            'src/features/marketplace',
            'src/shared',
            'src/shared/utils',
            'src/shared/components',
            'src/shared/hooks',
            'src/shared/services'
        ];

        for (const dir of requiredDirs) {
            const dirPath = path.join(projectRoot, dir);
            try {
                const stats = await fs.stat(dirPath);
                if (stats.isDirectory()) {
                    this.successes.push(`Directory exists: ${dir}`);
                } else {
                    this.errors.push(`Path exists but is not a directory: ${dir}`);
                }
            } catch (error) {
                this.errors.push(`Directory missing: ${dir}`);
            }
        }
    }

    async validateBarrelExports() {
        log.info('Validating barrel exports...');
        
        const barrelFiles = [
            'src/index.js',
            'src/features/authentication/index.js',
            'src/features/dashboard/index.js',
            'src/features/marketplace/index.js',
            'src/shared/index.js',
            'src/shared/components/index.js'
        ];

        for (const barrelFile of barrelFiles) {
            await this.validateBarrelFile(barrelFile);
        }
    }

    async validateBarrelFile(filePath) {
        const fullPath = path.join(projectRoot, filePath);
        
        try {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Check for export statements
            const hasExports = /export\s+/.test(content);
            if (hasExports) {
                this.successes.push(`Barrel export found: ${filePath}`);
            } else {
                this.warnings.push(`No exports found in barrel file: ${filePath}`);
            }
            
            // Check for proper documentation
            const hasDocumentation = /\/\*\*[\s\S]*?\*\//.test(content);
            if (hasDocumentation) {
                this.successes.push(`Documentation found: ${filePath}`);
            } else {
                this.warnings.push(`Missing documentation: ${filePath}`);
            }
            
            // Check for feature metadata
            if (filePath.includes('features/')) {
                const hasMetadata = /FEATURE_NAME|_FEATURE_NAME/.test(content);
                if (hasMetadata) {
                    this.successes.push(`Feature metadata found: ${filePath}`);
                } else {
                    this.warnings.push(`Missing feature metadata: ${filePath}`);
                }
            }
            
        } catch (error) {
            this.errors.push(`Cannot read barrel file: ${filePath} - ${error.message}`);
        }
    }

    async validateImportPaths() {
        log.info('Validating import paths...');
        
        const jsFiles = await this.findJavaScriptFiles();
        
        for (const file of jsFiles) {
            await this.validateFileImports(file);
        }
    }

    async findJavaScriptFiles() {
        const files = [];
        
        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                        await scanDirectory(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith('.js')) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Directory might not exist, skip
            }
        }
        
        await scanDirectory(path.join(projectRoot, 'src'));
        return files;
    }

    async validateFileImports(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(projectRoot, filePath);
            
            // Find import statements
            const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
            let match;
            
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                await this.validateImportPath(relativePath, importPath);
            }
            
        } catch (error) {
            this.errors.push(`Cannot read file: ${filePath} - ${error.message}`);
        }
    }

    async validateImportPath(sourceFile, importPath) {
        // Skip external modules
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            return;
        }
        
        const sourceDir = path.dirname(path.join(projectRoot, sourceFile));
        const resolvedPath = path.resolve(sourceDir, importPath);
        
        // Add .js extension if missing
        const possiblePaths = [
            resolvedPath,
            resolvedPath + '.js',
            path.join(resolvedPath, 'index.js')
        ];
        
        let found = false;
        for (const possiblePath of possiblePaths) {
            try {
                await fs.access(possiblePath);
                found = true;
                break;
            } catch (error) {
                // File doesn't exist, try next
            }
        }
        
        if (found) {
            this.successes.push(`Valid import: ${importPath} in ${sourceFile}`);
        } else {
            this.errors.push(`Invalid import: ${importPath} in ${sourceFile}`);
        }
    }

    async validateDynamicImports() {
        log.info('Validating dynamic imports...');
        
        // Test dynamic imports from main application
        try {
            const mainAppPath = path.join(projectRoot, 'src/index.js');
            const content = await fs.readFile(mainAppPath, 'utf-8');
            
            // Check for dynamic import patterns
            const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
            let match;
            let foundDynamicImports = false;
            
            while ((match = dynamicImportRegex.exec(content)) !== null) {
                foundDynamicImports = true;
                const importPath = match[1];
                this.successes.push(`Dynamic import found: ${importPath}`);
            }
            
            if (!foundDynamicImports) {
                this.warnings.push('No dynamic imports found in main application');
            }
            
        } catch (error) {
            this.errors.push(`Cannot validate dynamic imports: ${error.message}`);
        }
    }

    async generateReport() {
        log.info('Generating validation report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.successes.length + this.warnings.length + this.errors.length,
                successes: this.successes.length,
                warnings: this.warnings.length,
                errors: this.errors.length
            },
            details: {
                successes: this.successes,
                warnings: this.warnings,
                errors: this.errors
            }
        };
        
        // Write report to file
        const reportPath = path.join(projectRoot, 'import-export-validation-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Display summary
        console.log('\n' + '='.repeat(60));
        log.info('IMPORT/EXPORT VALIDATION REPORT');
        console.log('='.repeat(60));
        
        log.success(`Successes: ${report.summary.successes}`);
        log.warning(`Warnings: ${report.summary.warnings}`);
        log.error(`Errors: ${report.summary.errors}`);
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        console.log(`\n📄 Full report saved to: ${reportPath}`);
        
        if (this.errors.length === 0) {
            log.success('Import/export system validation PASSED!');
            return true;
        } else {
            log.error('Import/export system validation FAILED!');
            return false;
        }
    }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new ImportExportValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log.error(`Validation script failed: ${error.message}`);
        process.exit(1);
    });
}

export { ImportExportValidator };
