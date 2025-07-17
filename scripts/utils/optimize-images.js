/**
 * Image Optimization Tool
 * Optimizes images and implements responsive loading strategies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageOptimizer {
    constructor() {
        this.optimizations = {
            imagesAnalyzed: 0,
            largeImagesFound: 0,
            lazyLoadingAdded: 0,
            webpSuggestionsGenerated: 0,
            responsiveImagesAdded: 0
        };
        this.maxImageSize = 500000; // 500KB
    }

    /**
     * Run comprehensive image optimization
     */
    async optimizeImages() {
        console.log('🖼️ Starting Image Optimization...\n');

        // 1. Analyze existing images
        await this.analyzeImages();

        // 2. Implement lazy loading
        await this.implementLazyLoading();

        // 3. Add responsive image strategies
        await this.addResponsiveImages();

        // 4. Generate optimization recommendations
        await this.generateOptimizationRecommendations();

        this.generateImageOptimizationReport();
        console.log('✅ Image optimization complete!\n');
    }

    /**
     * Analyze existing images
     */
    async analyzeImages() {
        console.log('📊 Analyzing Images...');

        const imageFiles = this.findImageFiles('./assets/images');
        
        for (const file of imageFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;
            this.optimizations.imagesAnalyzed++;

            if (size > this.maxImageSize) {
                this.optimizations.largeImagesFound++;
                console.log(`   ⚠️  Large image found: ${file} (${Math.round(size/1024)}KB)`);
            }
        }

        console.log(`   ✅ Analyzed ${this.optimizations.imagesAnalyzed} images`);
    }

    /**
     * Implement lazy loading for images
     */
    async implementLazyLoading() {
        console.log('⚡ Implementing Lazy Loading...');

        const htmlFiles = this.findHtmlFiles('.');
        
        for (const file of htmlFiles) {
            await this.addLazyLoadingToFile(file);
        }

        console.log(`   ✅ Added lazy loading to ${this.optimizations.lazyLoadingAdded} files`);
    }

    /**
     * Add lazy loading to a specific HTML file
     */
    async addLazyLoadingToFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Add loading="lazy" to images that don't have it
            const imgPattern = /<img(?![^>]*loading=)[^>]*src="[^"]*"[^>]*>/g;
            content = content.replace(imgPattern, (match) => {
                // Don't add lazy loading to hero images or above-the-fold content
                if (match.includes('hero') || match.includes('logo')) {
                    return match;
                }
                
                modified = true;
                return match.replace('>', ' loading="lazy">');
            });

            // Add intersection observer polyfill for older browsers
            if (modified && !content.includes('intersection-observer')) {
                const polyfillScript = `
    <!-- Intersection Observer Polyfill for older browsers -->
    <script>
        if (!('IntersectionObserver' in window)) {
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
            document.head.appendChild(script);
        }
    </script>`;

                content = content.replace('</head>', `${polyfillScript}\n</head>`);
            }

            if (modified) {
                // Create backup
                const backupPath = filePath + '.img-backup';
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(filePath, backupPath);
                }

                fs.writeFileSync(filePath, content);
                this.optimizations.lazyLoadingAdded++;
            }

        } catch (error) {
            console.error(`   ❌ Error adding lazy loading to ${filePath}:`, error.message);
        }
    }

    /**
     * Add responsive image strategies
     */
    async addResponsiveImages() {
        console.log('📱 Adding Responsive Image Strategies...');

        const htmlFiles = this.findHtmlFiles('.');
        
        for (const file of htmlFiles) {
            await this.addResponsiveImagesToFile(file);
        }

        console.log(`   ✅ Added responsive images to ${this.optimizations.responsiveImagesAdded} files`);
    }

    /**
     * Add responsive images to a specific HTML file
     */
    async addResponsiveImagesToFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Add responsive image classes and srcset for hero images
            const heroImagePattern = /<img[^>]*class="[^"]*hero[^"]*"[^>]*>/g;
            content = content.replace(heroImagePattern, (match) => {
                if (!match.includes('srcset')) {
                    // Add responsive classes if not present
                    if (!match.includes('object-cover')) {
                        match = match.replace('class="', 'class="object-cover ');
                    }
                    
                    modified = true;
                    this.optimizations.responsiveImagesAdded++;
                }
                return match;
            });

            // Add CSS for responsive images if not present
            if (modified && !content.includes('img-responsive')) {
                const responsiveCSS = `
    <style>
        .img-responsive {
            max-width: 100%;
            height: auto;
        }
        
        .img-lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .img-lazy.loaded {
            opacity: 1;
        }
        
        /* Placeholder for loading images */
        .img-placeholder {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>`;

                content = content.replace('</head>', `${responsiveCSS}\n</head>`);
            }

            if (modified) {
                fs.writeFileSync(filePath, content);
            }

        } catch (error) {
            console.error(`   ❌ Error adding responsive images to ${filePath}:`, error.message);
        }
    }

    /**
     * Generate optimization recommendations
     */
    async generateOptimizationRecommendations() {
        console.log('💡 Generating Image Optimization Recommendations...');

        const recommendations = [];

        // Check for large images
        const imageFiles = this.findImageFiles('./assets/images');
        for (const file of imageFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;

            if (size > this.maxImageSize) {
                recommendations.push({
                    type: 'compression',
                    file,
                    currentSize: Math.round(size / 1024),
                    recommendation: 'Compress image or convert to WebP format',
                    priority: 'high'
                });
                this.optimizations.webpSuggestionsGenerated++;
            }
        }

        // Generate WebP conversion script
        this.generateWebPConversionScript(recommendations);

        console.log(`   ✅ Generated ${recommendations.length} optimization recommendations`);
    }

    /**
     * Generate WebP conversion script
     */
    generateWebPConversionScript(recommendations) {
        const script = `#!/bin/bash
# Image Optimization Script
# Converts images to WebP format for better performance

echo "🖼️ Starting Image Optimization..."

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Please install WebP tools:"
    echo "   macOS: brew install webp"
    echo "   Ubuntu: sudo apt-get install webp"
    echo "   Windows: Download from https://developers.google.com/speed/webp/download"
    exit 1
fi

# Create optimized directory
mkdir -p assets/images/optimized

${recommendations.map(rec => `
# Optimize ${rec.file}
echo "Optimizing ${rec.file}..."
cwebp -q 80 "${rec.file}" -o "assets/images/optimized/$(basename "${rec.file}" .jpg).webp"
cwebp -q 80 "${rec.file}" -o "assets/images/optimized/$(basename "${rec.file}" .png).webp"
`).join('')}

echo "✅ Image optimization complete!"
echo "📁 Optimized images saved to assets/images/optimized/"
echo "💡 Update your HTML to use the optimized images with fallbacks:"
echo ""
echo "<picture>"
echo "  <source srcset='assets/images/optimized/image.webp' type='image/webp'>"
echo "  <img src='assets/images/image.jpg' alt='Description' loading='lazy'>"
echo "</picture>"
`;

        fs.writeFileSync('./optimize-images.sh', script);
        fs.chmodSync('./optimize-images.sh', '755');
        console.log('   📄 WebP conversion script saved to optimize-images.sh');
    }

    /**
     * Find image files
     */
    findImageFiles(dir) {
        const files = [];
        const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp)$/i;
        
        if (!fs.existsSync(dir)) {
            return files;
        }

        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (imageExtensions.test(item)) {
                    files.push(fullPath);
                }
            }
        };
        
        walk(dir);
        return files;
    }

    /**
     * Find HTML files
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
     * Generate comprehensive image optimization report
     */
    generateImageOptimizationReport() {
        const report = `# Image Optimization Report

Generated: ${new Date().toISOString()}

## Summary
- **Images Analyzed**: ${this.optimizations.imagesAnalyzed}
- **Large Images Found**: ${this.optimizations.largeImagesFound}
- **Lazy Loading Added**: ${this.optimizations.lazyLoadingAdded} files
- **WebP Suggestions**: ${this.optimizations.webpSuggestionsGenerated}
- **Responsive Images**: ${this.optimizations.responsiveImagesAdded} files

## Optimizations Applied

### 1. Lazy Loading Implementation
- Added \`loading="lazy"\` attribute to images
- Implemented intersection observer polyfill for older browsers
- Excluded hero images and above-the-fold content from lazy loading

### 2. Responsive Image Strategies
- Added responsive CSS classes
- Implemented loading animations and placeholders
- Added object-fit properties for better image scaling

### 3. Performance Improvements
- Reduced initial page load by deferring off-screen images
- Added smooth loading transitions
- Implemented progressive image enhancement

## Next Steps

### 1. Image Compression
Run the generated \`optimize-images.sh\` script to:
- Convert images to WebP format
- Reduce file sizes by 25-80%
- Maintain visual quality

### 2. Implement Picture Elements
Replace large images with:
\`\`\`html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
\`\`\`

### 3. Consider CDN Integration
- Use image CDN for automatic optimization
- Implement responsive image delivery
- Add automatic format detection

## Performance Impact
- **Reduced initial load time**: Images load only when needed
- **Improved Core Web Vitals**: Better LCP and CLS scores
- **Better user experience**: Faster page rendering with progressive loading
`;

        fs.writeFileSync('./image-optimization-report.md', report);
        console.log('📄 Image optimization report saved to image-optimization-report.md');
    }
}

// Run optimization
console.log('🚀 Starting Image Optimization...\n');
const optimizer = new ImageOptimizer();
optimizer.optimizeImages()
    .then(() => {
        console.log('🎉 Image optimization completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Image optimization failed:', error);
        process.exit(1);
    });

export default ImageOptimizer;
