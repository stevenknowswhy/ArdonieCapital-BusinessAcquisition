#!/usr/bin/env node

/**
 * Fix Script Paths
 * Updates path references in moved scripts to point to correct project root
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function fixScriptPaths() {
    console.log('🔧 Fixing script path references...\n');
    
    const scriptsDir = path.join(projectRoot, 'scripts');
    const updatedFiles = [];
    
    // Find all JavaScript files in scripts subdirectories (not root)
    const findJSFiles = (dir, depth = 0) => {
        const files = [];
        if (depth === 0) {
            // Skip root scripts directory, only check subdirectories
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    files.push(...findJSFiles(fullPath, depth + 1));
                }
            }
        } else {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...findJSFiles(fullPath, depth + 1));
                } else if (item.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        }
        
        return files;
    };
    
    const jsFiles = findJSFiles(scriptsDir);
    
    for (const filePath of jsFiles) {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Check if file has path.resolve(__dirname, '../..') pattern
        const singleDotPattern = /path\.resolve\(__dirname,\s*['"`]\.\.['"`]\)/g;
        if (singleDotPattern.test(content)) {
            content = content.replace(singleDotPattern, "path.resolve(__dirname, '../..')");
            hasChanges = true;
        }
        
        // Fix import paths that reference ../src/ (should be ../../src/)
        const importPattern = /import\s+.*?\s+from\s+['"`]\.\.\/src\//g;
        if (importPattern.test(content)) {
            content = content.replace(/(['"`])\.\.\/src\//g, '$1../../src/');
            hasChanges = true;
        }

        // Check for other common patterns that might need fixing
        const patterns = [
            {
                // this.projectRoot = path.resolve(__dirname, '../..');
                regex: /(this\.projectRoot\s*=\s*path\.resolve\(__dirname,\s*['"`])\.\.(['"`]\))/g,
                replacement: '$1../..$2'
            },
            {
                // const projectRoot = path.resolve(__dirname, '../..');
                regex: /(const\s+projectRoot\s*=\s*path\.resolve\(__dirname,\s*['"`])\.\.(['"`]\))/g,
                replacement: '$1../..$2'
            },
            {
                // let projectRoot = path.resolve(__dirname, '../..');
                regex: /(let\s+projectRoot\s*=\s*path\.resolve\(__dirname,\s*['"`])\.\.(['"`]\))/g,
                replacement: '$1../..$2'
            },
            {
                // var projectRoot = path.resolve(__dirname, '../..');
                regex: /(var\s+projectRoot\s*=\s*path\.resolve\(__dirname,\s*['"`])\.\.(['"`]\))/g,
                replacement: '$1../..$2'
            }
        ];
        
        for (const pattern of patterns) {
            if (pattern.regex.test(content)) {
                content = content.replace(pattern.regex, pattern.replacement);
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content);
            const relativePath = path.relative(projectRoot, filePath);
            updatedFiles.push(relativePath);
            console.log(`✅ Updated: ${relativePath}`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total JavaScript files checked: ${jsFiles.length}`);
    console.log(`- Files updated: ${updatedFiles.length}`);
    
    if (updatedFiles.length > 0) {
        console.log(`\n📝 Updated files:`);
        updatedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    console.log('\n✅ Script path references fixed successfully!');
}

// Run the fix
fixScriptPaths().catch(error => {
    console.error('❌ Error fixing script paths:', error);
    process.exit(1);
});
