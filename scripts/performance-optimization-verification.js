/**
 * Performance Optimization Verification Tool
 * Analyzes and optimizes the Ardonie Capital platform for performance
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceOptimizationVerifier {
    constructor() {
        this.results = {
            bundleSizes: {},
            loadingTimes: {},
            optimizations: {},
            recommendations: []
        };
        this.thresholds = {
            maxJSFileSize: 100000, // 100KB
            maxCSSFileSize: 50000,  // 50KB
            maxImageSize: 500000,   // 500KB
            maxTotalBundleSize: 1000000, // 1MB
            maxLoadingTime: 3000    // 3 seconds
        };
    }

    /**
     * Run comprehensive performance verification
     */
    async runVerification() {
        console.log('🚀 Starting Performance Optimization Verification...\n');

        try {
            // 1. Analyze bundle sizes
            await this.analyzeBundleSizes();

            // 2. Check loading patterns
            await this.analyzeLoadingPatterns();

            // 3. Verify lazy loading implementation
            await this.verifyLazyLoading();

            // 4. Check image optimization
            await this.analyzeImageOptimization();

            // 5. Verify caching strategies
            await this.verifyCachingStrategies();

            // 6. Analyze modular architecture performance
            await this.analyzeModularPerformance();

            // 7. Generate optimization recommendations
            await this.generateRecommendations();

            // 8. Create performance report
            await this.generatePerformanceReport();

            console.log('✅ Performance Optimization Verification Complete!\n');
            return this.results;

        } catch (error) {
            console.error('❌ Performance verification failed:', error);
            throw error;
        }
    }

    /**
     * Analyze JavaScript and CSS bundle sizes
     */
    async analyzeBundleSizes() {
        console.log('📊 Analyzing Bundle Sizes...');

        const jsFiles = this.findFiles('.', /\.js$/, ['node_modules', 'coverage']);
        const cssFiles = this.findFiles('.', /\.css$/, ['node_modules', 'coverage']);

        // Analyze JavaScript files
        for (const file of jsFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;
            const lines = this.countLines(file);

            this.results.bundleSizes[file] = {
                size,
                lines,
                sizeKB: Math.round(size / 1024),
                category: this.categorizeFile(file),
                optimized: size < this.thresholds.maxJSFileSize
            };

            if (size > this.thresholds.maxJSFileSize) {
                this.results.recommendations.push({
                    type: 'bundle-size',
                    severity: 'high',
                    file,
                    message: `JavaScript file ${file} is ${Math.round(size/1024)}KB (exceeds ${Math.round(this.thresholds.maxJSFileSize/1024)}KB threshold)`,
                    suggestion: 'Consider code splitting, tree shaking, or modularization'
                });
            }
        }

        // Analyze CSS files
        for (const file of cssFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;

            this.results.bundleSizes[file] = {
                size,
                sizeKB: Math.round(size / 1024),
                category: 'css',
                optimized: size < this.thresholds.maxCSSFileSize
            };

            if (size > this.thresholds.maxCSSFileSize) {
                this.results.recommendations.push({
                    type: 'bundle-size',
                    severity: 'medium',
                    file,
                    message: `CSS file ${file} is ${Math.round(size/1024)}KB (exceeds ${Math.round(this.thresholds.maxCSSFileSize/1024)}KB threshold)`,
                    suggestion: 'Consider CSS optimization, unused CSS removal, or critical CSS extraction'
                });
            }
        }

        console.log(`   ✅ Analyzed ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
    }

    /**
     * Analyze loading patterns and dynamic imports
     */
    async analyzeLoadingPatterns() {
        console.log('🔄 Analyzing Loading Patterns...');

        const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'coverage']);
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for script loading patterns
            const scriptTags = content.match(/<script[^>]*>/g) || [];
            const moduleScripts = content.match(/<script[^>]*type="module"[^>]*>/g) || [];
            const dynamicImports = content.match(/import\([^)]+\)/g) || [];
            const deferredScripts = content.match(/<script[^>]*defer[^>]*>/g) || [];
            const asyncScripts = content.match(/<script[^>]*async[^>]*>/g) || [];

            this.results.loadingTimes[file] = {
                totalScripts: scriptTags.length,
                moduleScripts: moduleScripts.length,
                dynamicImports: dynamicImports.length,
                deferredScripts: deferredScripts.length,
                asyncScripts: asyncScripts.length,
                hasLazyLoading: dynamicImports.length > 0,
                optimized: deferredScripts.length > 0 || asyncScripts.length > 0 || moduleScripts.length > 0
            };

            // Check for blocking scripts
            const blockingScripts = scriptTags.filter(script => 
                !script.includes('defer') && 
                !script.includes('async') && 
                !script.includes('type="module"')
            );

            if (blockingScripts.length > 2) {
                this.results.recommendations.push({
                    type: 'loading-pattern',
                    severity: 'medium',
                    file,
                    message: `${blockingScripts.length} blocking scripts found in ${file}`,
                    suggestion: 'Consider using defer, async, or module scripts to improve loading performance'
                });
            }
        }

        console.log(`   ✅ Analyzed loading patterns in ${htmlFiles.length} HTML files`);
    }

    /**
     * Verify lazy loading implementation
     */
    async verifyLazyLoading() {
        console.log('⚡ Verifying Lazy Loading Implementation...');

        const jsFiles = this.findFiles('./src', /\.js$/, ['node_modules', 'tests']);
        let lazyLoadingImplemented = false;
        let dynamicImportCount = 0;

        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for dynamic imports
            const dynamicImports = content.match(/import\([^)]+\)/g) || [];
            const conditionalImports = content.match(/if\s*\([^)]+\)\s*{[^}]*import\(/g) || [];
            
            if (dynamicImports.length > 0) {
                lazyLoadingImplemented = true;
                dynamicImportCount += dynamicImports.length;
            }

            this.results.optimizations[file] = {
                dynamicImports: dynamicImports.length,
                conditionalImports: conditionalImports.length,
                hasLazyLoading: dynamicImports.length > 0
            };
        }

        if (!lazyLoadingImplemented) {
            this.results.recommendations.push({
                type: 'lazy-loading',
                severity: 'medium',
                message: 'No lazy loading implementation found',
                suggestion: 'Implement dynamic imports for non-critical features to improve initial load time'
            });
        }

        console.log(`   ✅ Found ${dynamicImportCount} dynamic imports across ${jsFiles.length} files`);
    }

    /**
     * Analyze image optimization
     */
    async analyzeImageOptimization() {
        console.log('🖼️ Analyzing Image Optimization...');

        const imageFiles = this.findFiles('./assets/images', /\.(jpg|jpeg|png|gif|svg|webp)$/i, []);
        let totalImageSize = 0;
        let unoptimizedImages = 0;

        for (const file of imageFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;
            totalImageSize += size;

            const isOptimized = size < this.thresholds.maxImageSize;
            if (!isOptimized) {
                unoptimizedImages++;
                this.results.recommendations.push({
                    type: 'image-optimization',
                    severity: 'medium',
                    file,
                    message: `Image ${file} is ${Math.round(size/1024)}KB (exceeds ${Math.round(this.thresholds.maxImageSize/1024)}KB threshold)`,
                    suggestion: 'Consider image compression, WebP format, or responsive images'
                });
            }
        }

        this.results.optimizations.images = {
            totalImages: imageFiles.length,
            totalSizeKB: Math.round(totalImageSize / 1024),
            unoptimizedImages,
            optimizationRate: Math.round(((imageFiles.length - unoptimizedImages) / imageFiles.length) * 100)
        };

        console.log(`   ✅ Analyzed ${imageFiles.length} images (${Math.round(totalImageSize/1024)}KB total)`);
    }

    /**
     * Verify caching strategies
     */
    async verifyCachingStrategies() {
        console.log('💾 Verifying Caching Strategies...');

        // Check for service worker
        const serviceWorkerExists = fs.existsSync('./sw.js') || fs.existsSync('./service-worker.js');
        
        // Check for cache headers in HTML
        const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'coverage']);
        let cacheHeadersFound = 0;

        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('cache-control') || content.includes('expires')) {
                cacheHeadersFound++;
            }
        }

        this.results.optimizations.caching = {
            serviceWorker: serviceWorkerExists,
            cacheHeaders: cacheHeadersFound,
            browserCaching: cacheHeadersFound > 0
        };

        if (!serviceWorkerExists) {
            this.results.recommendations.push({
                type: 'caching',
                severity: 'low',
                message: 'No service worker found',
                suggestion: 'Consider implementing a service worker for advanced caching strategies'
            });
        }

        console.log(`   ✅ Caching analysis complete (Service Worker: ${serviceWorkerExists})`);
    }

    /**
     * Analyze modular architecture performance
     */
    async analyzeModularPerformance() {
        console.log('🏗️ Analyzing Modular Architecture Performance...');

        const featureModules = this.findFiles('./src/features', /index\.js$/, []);
        const sharedModules = this.findFiles('./src/shared', /\.js$/, []);

        let totalModuleSize = 0;
        let moduleCount = 0;

        // Analyze feature modules
        for (const module of featureModules) {
            const stats = fs.statSync(module);
            totalModuleSize += stats.size;
            moduleCount++;

            const content = fs.readFileSync(module, 'utf8');
            const exports = content.match(/export\s+{[^}]+}/g) || [];
            const dynamicImports = content.match(/import\([^)]+\)/g) || [];

            this.results.optimizations[module] = {
                size: stats.size,
                exports: exports.length,
                dynamicImports: dynamicImports.length,
                isModular: exports.length > 0
            };
        }

        // Analyze shared modules
        for (const module of sharedModules) {
            const stats = fs.statSync(module);
            totalModuleSize += stats.size;
            moduleCount++;
        }

        this.results.optimizations.modularArchitecture = {
            totalModules: moduleCount,
            totalSizeKB: Math.round(totalModuleSize / 1024),
            averageSizeKB: Math.round(totalModuleSize / moduleCount / 1024),
            featureModules: featureModules.length,
            sharedModules: sharedModules.length
        };

        console.log(`   ✅ Analyzed ${moduleCount} modules (${Math.round(totalModuleSize/1024)}KB total)`);
    }

    /**
     * Generate optimization recommendations
     */
    async generateRecommendations() {
        console.log('💡 Generating Optimization Recommendations...');

        // Calculate total bundle size
        const totalSize = Object.values(this.results.bundleSizes)
            .reduce((sum, file) => sum + file.size, 0);

        if (totalSize > this.thresholds.maxTotalBundleSize) {
            this.results.recommendations.push({
                type: 'total-bundle-size',
                severity: 'high',
                message: `Total bundle size is ${Math.round(totalSize/1024)}KB (exceeds ${Math.round(this.thresholds.maxTotalBundleSize/1024)}KB threshold)`,
                suggestion: 'Implement code splitting, tree shaking, and lazy loading to reduce bundle size'
            });
        }

        // Check for performance best practices
        this.checkPerformanceBestPractices();

        console.log(`   ✅ Generated ${this.results.recommendations.length} recommendations`);
    }

    /**
     * Check for performance best practices
     */
    checkPerformanceBestPractices() {
        // Check for minification
        const jsFiles = Object.keys(this.results.bundleSizes).filter(f => f.endsWith('.js'));
        const minifiedFiles = jsFiles.filter(f => f.includes('.min.'));
        
        if (minifiedFiles.length === 0 && jsFiles.length > 0) {
            this.results.recommendations.push({
                type: 'minification',
                severity: 'medium',
                message: 'No minified JavaScript files found',
                suggestion: 'Consider implementing JavaScript minification for production builds'
            });
        }

        // Check for CDN usage
        const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'coverage']);
        let cdnUsage = 0;

        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('cdn.') || content.includes('unpkg.') || content.includes('jsdelivr.')) {
                cdnUsage++;
            }
        }

        if (cdnUsage === 0) {
            this.results.recommendations.push({
                type: 'cdn',
                severity: 'low',
                message: 'No CDN usage detected',
                suggestion: 'Consider using CDN for external libraries to improve loading performance'
            });
        }
    }

    /**
     * Generate comprehensive performance report
     */
    async generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: Object.keys(this.results.bundleSizes).length,
                totalSizeKB: Math.round(Object.values(this.results.bundleSizes).reduce((sum, file) => sum + file.size, 0) / 1024),
                optimizedFiles: Object.values(this.results.bundleSizes).filter(f => f.optimized).length,
                recommendations: this.results.recommendations.length,
                performanceScore: this.calculatePerformanceScore()
            },
            details: this.results
        };

        // Save report
        fs.writeFileSync('./performance-report.json', JSON.stringify(report, null, 2));
        
        // Generate human-readable report
        this.generateHumanReadableReport(report);
    }

    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore() {
        let score = 100;
        
        // Deduct points for recommendations
        this.results.recommendations.forEach(rec => {
            switch (rec.severity) {
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        });

        return Math.max(0, score);
    }

    /**
     * Generate human-readable performance report
     */
    generateHumanReadableReport(report) {
        let output = `# Performance Optimization Report\n\n`;
        output += `Generated: ${report.timestamp}\n\n`;
        output += `## Summary\n`;
        output += `- **Performance Score**: ${report.summary.performanceScore}/100\n`;
        output += `- **Total Files**: ${report.summary.totalFiles}\n`;
        output += `- **Total Size**: ${report.summary.totalSizeKB}KB\n`;
        output += `- **Optimized Files**: ${report.summary.optimizedFiles}/${report.summary.totalFiles}\n`;
        output += `- **Recommendations**: ${report.summary.recommendations}\n\n`;

        if (this.results.recommendations.length > 0) {
            output += `## Recommendations\n\n`;
            this.results.recommendations.forEach((rec, index) => {
                output += `### ${index + 1}. ${rec.type.toUpperCase()} (${rec.severity})\n`;
                output += `**Issue**: ${rec.message}\n`;
                output += `**Suggestion**: ${rec.suggestion}\n`;
                if (rec.file) output += `**File**: ${rec.file}\n`;
                output += `\n`;
            });
        }

        fs.writeFileSync('./performance-report.md', output);
        console.log('📄 Performance report saved to performance-report.md');
    }

    /**
     * Utility methods
     */
    findFiles(dir, pattern, excludeDirs = []) {
        const files = [];
        
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
                        walk(fullPath);
                    }
                } else if (pattern.test(item)) {
                    files.push(fullPath);
                }
            }
        };
        
        walk(dir);
        return files;
    }

    countLines(file) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            return content.split('\n').length;
        } catch {
            return 0;
        }
    }

    categorizeFile(file) {
        if (file.includes('/src/features/')) return 'feature';
        if (file.includes('/src/shared/')) return 'shared';
        if (file.includes('/assets/js/')) return 'legacy';
        if (file.includes('/tests/')) return 'test';
        return 'other';
    }
}

// Always run verification when script is executed
console.log('🚀 Starting Performance Optimization Verification...\n');
const verifier = new PerformanceOptimizationVerifier();
verifier.runVerification()
    .then(results => {
        console.log('\n🎉 Performance optimization verification completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Performance verification failed:', error);
        process.exit(1);
    });

export default PerformanceOptimizationVerifier;
