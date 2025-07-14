/**
 * Performance Optimization Suite
 * Monitors and optimizes page performance, loading times, and user experience
 */

class PerformanceOptimization {
    constructor() {
        this.metrics = {
            loadTime: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
        };
        
        this.optimizations = [];
        this.init();
    }

    init() {
        this.measurePerformance();
        this.optimizeImages();
        this.optimizeScripts();
        this.optimizeCSS();
        this.setupLazyLoading();
        this.optimizeAnimations();
        this.setupPerformanceMonitoring();
        this.displayPerformanceReport();
    }

    measurePerformance() {
        // Measure basic timing metrics
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            // Measure paint metrics
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
            
            // Measure Core Web Vitals
            this.measureCoreWebVitals();
        });
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift (CLS)
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        this.metrics.cumulativeLayoutShift += entry.value;
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        }
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        let optimized = 0;
        
        images.forEach(img => {
            // Add loading="lazy" if not present
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
                optimized++;
            }
            
            // Add proper sizing attributes
            if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
                // Try to get dimensions from CSS or natural size
                const computedStyle = window.getComputedStyle(img);
                if (computedStyle.width && computedStyle.height) {
                    img.setAttribute('width', parseInt(computedStyle.width));
                    img.setAttribute('height', parseInt(computedStyle.height));
                }
            }
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
            });
        });
        
        if (optimized > 0) {
            this.logOptimization(`Added lazy loading to ${optimized} images`);
        }
    }

    optimizeScripts() {
        const scripts = document.querySelectorAll('script[src]');
        let optimized = 0;
        
        scripts.forEach(script => {
            // Add async/defer to external scripts if not present
            if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                // Use defer for scripts that don't need immediate execution
                if (!script.src.includes('tailwind') && !script.src.includes('config')) {
                    script.setAttribute('defer', '');
                    optimized++;
                }
            }
        });
        
        if (optimized > 0) {
            this.logOptimization(`Added defer attribute to ${optimized} scripts`);
        }
    }

    optimizeCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let optimized = 0;
        
        stylesheets.forEach(link => {
            // Add preload for critical CSS
            if (link.href.includes('tailwind') || link.href.includes('main')) {
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.as = 'style';
                preload.href = link.href;
                preload.onload = () => {
                    preload.rel = 'stylesheet';
                };
                document.head.insertBefore(preload, link);
                optimized++;
            }
        });
        
        // Remove unused CSS classes (basic detection)
        this.removeUnusedCSS();
        
        if (optimized > 0) {
            this.logOptimization(`Preloaded ${optimized} critical stylesheets`);
        }
    }

    removeUnusedCSS() {
        // This is a simplified version - in production, use tools like PurgeCSS
        const usedClasses = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            if (el.className) {
                // Handle both string className and SVGAnimatedString
                const classNameValue = typeof el.className === 'string'
                    ? el.className
                    : el.className.baseVal || el.className.animVal || '';

                if (classNameValue && typeof classNameValue === 'string') {
                    classNameValue.split(' ').forEach(cls => {
                        if (cls.trim()) usedClasses.add(cls.trim());
                    });
                }
            }
        });
        
        this.logOptimization(`Detected ${usedClasses.size} CSS classes in use`);
    }

    setupLazyLoading() {
        // Lazy load sections that are below the fold
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        sections.forEach((section, index) => {
            if (index > 1) { // Skip first two sections (hero and first content)
                section.classList.add('lazy-section');
                observer.observe(section);
            }
        });
        
        this.logOptimization('Set up lazy loading for below-fold sections');
    }

    optimizeAnimations() {
        // Use CSS transforms instead of changing layout properties
        const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
        
        animatedElements.forEach(el => {
            // Ensure animations use transform and opacity only
            el.style.willChange = 'transform, opacity';
        });
        
        // Reduce animations for users who prefer reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
            this.logOptimization('Reduced animations for accessibility');
        }
        
        this.logOptimization(`Optimized ${animatedElements.length} animated elements`);
    }

    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration + 'ms');
                    }
                }
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
        
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                }
            }, 30000);
        }
    }

    displayPerformanceReport() {
        setTimeout(() => {
            this.generateReport();
        }, 3000); // Wait for page to fully load
    }

    generateReport() {
        const report = {
            metrics: this.metrics,
            optimizations: this.optimizations,
            score: this.calculatePerformanceScore(),
            recommendations: this.getRecommendations()
        };
        
        console.log('🚀 Performance Report:', report);
        
        // Show visual report in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createPerformanceDisplay(report);
        }
    }

    calculatePerformanceScore() {
        let score = 100;
        
        // Deduct points for poor metrics
        if (this.metrics.firstContentfulPaint > 2000) score -= 20;
        if (this.metrics.largestContentfulPaint > 2500) score -= 20;
        if (this.metrics.cumulativeLayoutShift > 0.1) score -= 15;
        if (this.metrics.firstInputDelay > 100) score -= 15;
        if (this.metrics.loadTime > 3000) score -= 10;
        
        return Math.max(0, score);
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.firstContentfulPaint > 2000) {
            recommendations.push('Optimize critical rendering path');
        }
        if (this.metrics.largestContentfulPaint > 2500) {
            recommendations.push('Optimize largest contentful paint element');
        }
        if (this.metrics.cumulativeLayoutShift > 0.1) {
            recommendations.push('Reduce layout shifts by setting image dimensions');
        }
        if (this.metrics.firstInputDelay > 100) {
            recommendations.push('Reduce JavaScript execution time');
        }
        
        return recommendations;
    }

    createPerformanceDisplay(report) {
        const display = document.createElement('div');
        display.id = 'performance-report';
        display.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-md text-sm';
        display.style.display = 'none';
        
        const scoreColor = report.score >= 90 ? 'text-green-400' : 
                          report.score >= 70 ? 'text-yellow-400' : 'text-red-400';
        
        display.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">Performance Report</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="text-slate-400 hover:text-white">×</button>
            </div>
            <div class="text-center mb-3">
                <div class="text-2xl font-bold ${scoreColor}">${report.score}/100</div>
                <div class="text-xs text-slate-400">Performance Score</div>
            </div>
            <div class="space-y-1 text-xs">
                <div>FCP: ${Math.round(this.metrics.firstContentfulPaint)}ms</div>
                <div>LCP: ${Math.round(this.metrics.largestContentfulPaint)}ms</div>
                <div>CLS: ${this.metrics.cumulativeLayoutShift.toFixed(3)}</div>
                <div>FID: ${Math.round(this.metrics.firstInputDelay)}ms</div>
            </div>
            ${report.recommendations.length > 0 ? `
                <div class="mt-3 pt-2 border-t border-slate-700">
                    <div class="text-xs font-semibold mb-1">Recommendations:</div>
                    ${report.recommendations.map(rec => `<div class="text-xs text-slate-300">• ${rec}</div>`).join('')}
                </div>
            ` : ''}
        `;
        
        document.body.appendChild(display);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'fixed bottom-16 left-4 bg-green-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-green-700';
        toggleBtn.innerHTML = '🚀';
        toggleBtn.title = 'Toggle Performance Report';
        toggleBtn.onclick = () => {
            const display = document.getElementById('performance-report');
            display.style.display = display.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
    }

    logOptimization(message) {
        this.optimizations.push(message);
        console.log('⚡', message);
    }
}

// Initialize performance optimization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimization();
});

// Export for manual testing
window.PerformanceOptimization = PerformanceOptimization;
