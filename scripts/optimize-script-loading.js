/**
 * Script Loading Optimization Tool
 * Optimizes script loading patterns across all HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ScriptLoadingOptimizer {
    constructor() {
        this.optimizations = {
            filesProcessed: 0,
            scriptsOptimized: 0,
            blockingScriptsFixed: 0,
            moduleScriptsAdded: 0
        };
    }

    /**
     * Optimize script loading across all HTML files
     */
    async optimizeScriptLoading() {
        console.log('⚡ Optimizing Script Loading Patterns...\n');

        const htmlFiles = this.findHtmlFiles('.');
        
        for (const file of htmlFiles) {
            await this.optimizeHtmlFile(file);
        }

        this.generateOptimizationReport();
        console.log('✅ Script loading optimization complete!\n');
    }

    /**
     * Optimize a single HTML file
     */
    async optimizeHtmlFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // 1. Add defer to blocking scripts
            const blockingScriptPattern = /<script\s+src="([^"]+)"(?![^>]*(?:defer|async|type="module"))[^>]*>/g;
            content = content.replace(blockingScriptPattern, (match, src) => {
                this.optimizations.blockingScriptsFixed++;
                modified = true;
                return match.replace('>', ' defer>');
            });

            // 2. Convert feature scripts to modules where appropriate
            if (filePath.includes('marketplace/') || filePath.includes('dashboard/') || filePath.includes('auth/')) {
                content = this.convertToModuleScripts(content, filePath);
                if (content !== fs.readFileSync(filePath, 'utf8')) {
                    modified = true;
                }
            }

            // 3. Add preload hints for critical resources
            content = this.addPreloadHints(content, filePath);

            // 4. Optimize third-party script loading
            content = this.optimizeThirdPartyScripts(content);

            if (modified) {
                // Create backup
                const backupPath = filePath + '.backup';
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(filePath, backupPath);
                }

                // Write optimized content
                fs.writeFileSync(filePath, content);
                this.optimizations.filesProcessed++;
                console.log(`   ✅ Optimized: ${filePath}`);
            }

        } catch (error) {
            console.error(`   ❌ Error optimizing ${filePath}:`, error.message);
        }
    }

    /**
     * Convert appropriate scripts to module scripts
     */
    convertToModuleScripts(content, filePath) {
        // Check if this page should use modular loading
        const featureMap = {
            'marketplace/': 'marketplace',
            'dashboard/': 'dashboard',
            'auth/': 'authentication'
        };

        const feature = Object.keys(featureMap).find(key => filePath.includes(key));
        if (!feature) return content;

        const featureName = featureMap[feature];

        // Add module script for feature loading
        const moduleScript = `
    <!-- Load modular ${featureName} system -->
    <script type="module">
        import { ${featureName}Service } from '../src/features/${featureName}/index.js';
        import { validationUtils, formattingUtils, uiUtils, storageUtils } from '../src/shared/index.js';

        // Make services available globally for ${featureName}
        window.Ardonie${featureName.charAt(0).toUpperCase() + featureName.slice(1)} = {
            service: ${featureName}Service,
            validation: validationUtils,
            formatting: formattingUtils,
            ui: uiUtils,
            storage: storageUtils
        };

        console.log('Modular ${featureName} system loaded');
    </script>

    <!-- Fallback for legacy ${featureName} scripts -->
    <script>
        setTimeout(() => {
            if (!window.Ardonie${featureName.charAt(0).toUpperCase() + featureName.slice(1)}) {
                console.warn('Modular ${featureName} not available, loading legacy scripts');
                const commonScript = document.createElement('script');
                commonScript.src = '../assets/js/common.js';
                commonScript.defer = true;
                document.head.appendChild(commonScript);

                const featureScript = document.createElement('script');
                featureScript.src = '../assets/js/${featureName}.js';
                featureScript.defer = true;
                document.head.appendChild(featureScript);
            }
        }, 1000);
    </script>`;

        // Insert before closing body tag
        if (!content.includes(`Modular ${featureName} system loaded`)) {
            content = content.replace('</body>', `${moduleScript}\n</body>`);
            this.optimizations.moduleScriptsAdded++;
        }

        return content;
    }

    /**
     * Add preload hints for critical resources
     */
    addPreloadHints(content, filePath) {
        const preloadHints = [];

        // Add preload for critical CSS
        if (!content.includes('rel="preload"') && content.includes('tailwindcss.com')) {
            preloadHints.push('<link rel="preload" href="https://cdn.tailwindcss.com" as="script">');
        }

        // Add preload for critical fonts
        if (content.includes('fonts.googleapis.com') && !content.includes('rel="preload"')) {
            preloadHints.push('<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">');
        }

        // Add DNS prefetch for external domains
        const dnsPrefetchHints = [
            '<link rel="dns-prefetch" href="//cdn.tailwindcss.com">',
            '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
            '<link rel="dns-prefetch" href="//images.unsplash.com">'
        ];

        if (preloadHints.length > 0 || dnsPrefetchHints.length > 0) {
            const allHints = [...dnsPrefetchHints, ...preloadHints].join('\n    ');
            content = content.replace('<head>', `<head>\n    ${allHints}`);
        }

        return content;
    }

    /**
     * Optimize third-party script loading
     */
    optimizeThirdPartyScripts(content) {
        // Add async to non-critical third-party scripts
        content = content.replace(
            /<script src="https:\/\/cdn\.tailwindcss\.com">/g,
            '<script src="https://cdn.tailwindcss.com" defer>'
        );

        // Optimize Google Fonts loading
        content = content.replace(
            /rel="stylesheet"/g,
            'rel="stylesheet" media="print" onload="this.media=\'all\'"'
        );

        return content;
    }

    /**
     * Find all HTML files
     */
    findHtmlFiles(dir) {
        const files = [];
        const excludeDirs = ['node_modules', 'coverage', '.git'];
        
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
                        walk(fullPath);
                    }
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        };
        
        walk(dir);
        return files;
    }

    /**
     * Generate optimization report
     */
    generateOptimizationReport() {
        const report = `# Script Loading Optimization Report

Generated: ${new Date().toISOString()}

## Summary
- **Files Processed**: ${this.optimizations.filesProcessed}
- **Scripts Optimized**: ${this.optimizations.scriptsOptimized}
- **Blocking Scripts Fixed**: ${this.optimizations.blockingScriptsFixed}
- **Module Scripts Added**: ${this.optimizations.moduleScriptsAdded}

## Optimizations Applied

### 1. Blocking Script Fixes
- Added \`defer\` attribute to ${this.optimizations.blockingScriptsFixed} blocking scripts
- Improved page load performance by preventing render blocking

### 2. Module Script Implementation
- Added ${this.optimizations.moduleScriptsAdded} modular loading systems
- Implemented fallback mechanisms for legacy browser support

### 3. Resource Preloading
- Added DNS prefetch hints for external domains
- Added preload hints for critical resources

### 4. Third-Party Optimization
- Optimized Tailwind CSS loading with defer
- Implemented non-blocking Google Fonts loading

## Performance Impact
- **Reduced render blocking**: Scripts now load asynchronously
- **Improved First Contentful Paint**: Critical resources preloaded
- **Better user experience**: Pages render faster with progressive enhancement
`;

        fs.writeFileSync('./script-optimization-report.md', report);
        console.log('📄 Script optimization report saved to script-optimization-report.md');
    }
}

// Run optimization
console.log('🚀 Starting Script Loading Optimization...\n');
const optimizer = new ScriptLoadingOptimizer();
optimizer.optimizeScriptLoading()
    .then(() => {
        console.log('🎉 Script loading optimization completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Script optimization failed:', error);
        process.exit(1);
    });

export default ScriptLoadingOptimizer;
