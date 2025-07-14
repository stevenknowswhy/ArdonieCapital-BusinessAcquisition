/**
 * SEO Optimization and Monitoring Suite
 * Analyzes and optimizes on-page SEO elements for better search engine visibility
 */

class SEOOptimization {
    constructor() {
        this.seoScore = 0;
        this.issues = [];
        this.recommendations = [];
        this.checkedElements = {
            title: false,
            description: false,
            headings: false,
            images: false,
            links: false,
            structured: false
        };
        this.init();
    }

    init() {
        this.analyzePage();
        this.optimizeElements();
        this.setupSEOMonitoring();
        this.displaySEOReport();
    }

    analyzePage() {
        console.log('🔍 Analyzing SEO elements...');
        
        this.analyzeTitle();
        this.analyzeMetaDescription();
        this.analyzeHeadings();
        this.analyzeImages();
        this.analyzeLinks();
        this.analyzeStructuredData();
        this.analyzePageSpeed();
        this.analyzeMobileOptimization();
        this.analyzeContent();
        
        this.calculateSEOScore();
    }

    analyzeTitle() {
        const title = document.querySelector('title');
        if (!title) {
            this.addIssue('Missing title tag', 'Add a descriptive title tag');
            return;
        }

        const titleText = title.textContent;
        const titleLength = titleText.length;

        if (titleLength === 0) {
            this.addIssue('Empty title tag', 'Add descriptive title content');
        } else if (titleLength < 30) {
            this.addRecommendation('Title is too short', 'Consider expanding to 50-60 characters');
        } else if (titleLength > 60) {
            this.addIssue('Title is too long', 'Keep title under 60 characters');
        } else {
            this.addSuccess('Title length is optimal');
        }

        // Check for target keywords
        const hasKeywords = /auto repair|shop|dallas|dfw|marketplace/i.test(titleText);
        if (hasKeywords) {
            this.addSuccess('Title contains relevant keywords');
        } else {
            this.addRecommendation('Title could include more relevant keywords');
        }

        this.checkedElements.title = true;
    }

    analyzeMetaDescription() {
        const description = document.querySelector('meta[name="description"]');
        if (!description) {
            this.addIssue('Missing meta description', 'Add a compelling meta description');
            return;
        }

        const descText = description.getAttribute('content');
        const descLength = descText.length;

        if (descLength === 0) {
            this.addIssue('Empty meta description', 'Add descriptive content');
        } else if (descLength < 120) {
            this.addRecommendation('Meta description is short', 'Consider expanding to 150-160 characters');
        } else if (descLength > 160) {
            this.addIssue('Meta description is too long', 'Keep under 160 characters');
        } else {
            this.addSuccess('Meta description length is optimal');
        }

        this.checkedElements.description = true;
    }

    analyzeHeadings() {
        const h1s = document.querySelectorAll('h1');
        const h2s = document.querySelectorAll('h2');
        const h3s = document.querySelectorAll('h3');

        // Check H1
        if (h1s.length === 0) {
            this.addIssue('Missing H1 tag', 'Add a primary heading');
        } else if (h1s.length > 1) {
            this.addIssue('Multiple H1 tags found', 'Use only one H1 per page');
        } else {
            this.addSuccess('Single H1 tag found');
        }

        // Check heading hierarchy
        if (h2s.length > 0) {
            this.addSuccess(`Found ${h2s.length} H2 headings`);
        }

        if (h3s.length > 0) {
            this.addSuccess(`Found ${h3s.length} H3 headings`);
        }

        // Check for empty headings
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let emptyHeadings = 0;
        allHeadings.forEach(heading => {
            if (!heading.textContent.trim()) {
                emptyHeadings++;
            }
        });

        if (emptyHeadings > 0) {
            this.addIssue(`${emptyHeadings} empty headings found`, 'Add descriptive text to all headings');
        }

        this.checkedElements.headings = true;
    }

    analyzeImages() {
        const images = document.querySelectorAll('img');
        let missingAlt = 0;
        let emptyAlt = 0;
        let goodAlt = 0;

        images.forEach(img => {
            const alt = img.getAttribute('alt');
            if (!alt) {
                missingAlt++;
            } else if (alt.trim() === '') {
                emptyAlt++;
            } else {
                goodAlt++;
            }
        });

        if (missingAlt > 0) {
            this.addIssue(`${missingAlt} images missing alt text`, 'Add descriptive alt text for accessibility and SEO');
        }

        if (emptyAlt > 0) {
            this.addIssue(`${emptyAlt} images with empty alt text`, 'Add descriptive alt text');
        }

        if (goodAlt > 0) {
            this.addSuccess(`${goodAlt} images have proper alt text`);
        }

        this.checkedElements.images = true;
    }

    analyzeLinks() {
        const links = document.querySelectorAll('a[href]');
        let internalLinks = 0;
        let externalLinks = 0;
        let noFollowLinks = 0;

        links.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                externalLinks++;
                if (link.getAttribute('rel') && link.getAttribute('rel').includes('nofollow')) {
                    noFollowLinks++;
                }
            } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                internalLinks++;
            }
        });

        this.addSuccess(`Found ${internalLinks} internal links`);
        if (externalLinks > 0) {
            this.addSuccess(`Found ${externalLinks} external links`);
            if (noFollowLinks < externalLinks) {
                this.addRecommendation('Consider adding rel="nofollow" to external links');
            }
        }

        this.checkedElements.links = true;
    }

    analyzeStructuredData() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        if (jsonLdScripts.length === 0) {
            this.addIssue('No structured data found', 'Add JSON-LD structured data');
        } else {
            this.addSuccess(`Found ${jsonLdScripts.length} structured data blocks`);
            
            // Validate JSON-LD
            jsonLdScripts.forEach((script, index) => {
                try {
                    JSON.parse(script.textContent);
                    this.addSuccess(`Structured data block ${index + 1} is valid JSON`);
                } catch (e) {
                    this.addIssue(`Structured data block ${index + 1} has invalid JSON`, 'Fix JSON syntax errors');
                }
            });
        }

        this.checkedElements.structured = true;
    }

    analyzePageSpeed() {
        // Basic page speed analysis
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            
            if (loadTime > 3000) {
                this.addIssue('Slow page load time', 'Optimize images and scripts');
            } else if (loadTime > 2000) {
                this.addRecommendation('Page load time could be improved');
            } else {
                this.addSuccess('Good page load time');
            }
        }
    }

    analyzeMobileOptimization() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            this.addIssue('Missing viewport meta tag', 'Add viewport meta tag for mobile optimization');
        } else {
            this.addSuccess('Viewport meta tag found');
        }

        // Check for mobile-friendly CSS
        const hasResponsiveClasses = document.querySelector('[class*="sm:"], [class*="md:"], [class*="lg:"]');
        if (hasResponsiveClasses) {
            this.addSuccess('Responsive design classes detected');
        } else {
            this.addRecommendation('Consider adding responsive design classes');
        }
    }

    analyzeContent() {
        const textContent = document.body.textContent;
        const wordCount = textContent.split(/\s+/).length;

        if (wordCount < 300) {
            this.addRecommendation('Page content is thin', 'Consider adding more valuable content');
        } else {
            this.addSuccess(`Good content length: ${wordCount} words`);
        }

        // Check for target keywords in content
        const hasKeywords = /auto repair|shop|dallas|dfw|marketplace|buy|sell/gi.test(textContent);
        if (hasKeywords) {
            this.addSuccess('Content contains relevant keywords');
        } else {
            this.addRecommendation('Consider adding more relevant keywords to content');
        }
    }

    optimizeElements() {
        // Add missing SEO elements
        this.addMissingMetaTags();
        this.optimizeImages();
        this.addStructuredDataIfMissing();
    }

    addMissingMetaTags() {
        // Add robots meta if missing
        if (!document.querySelector('meta[name="robots"]')) {
            const robots = document.createElement('meta');
            robots.name = 'robots';
            robots.content = 'index, follow';
            document.head.appendChild(robots);
            this.addSuccess('Added robots meta tag');
        }

        // Add canonical link if missing
        if (!document.querySelector('link[rel="canonical"]')) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = window.location.href.split('?')[0];
            document.head.appendChild(canonical);
            this.addSuccess('Added canonical link');
        }
    }

    optimizeImages() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach((img, index) => {
            img.setAttribute('alt', `Image ${index + 1}`);
        });
        
        if (images.length > 0) {
            this.addSuccess(`Added alt text to ${images.length} images`);
        }
    }

    addStructuredDataIfMissing() {
        const hasStructuredData = document.querySelector('script[type="application/ld+json"]');
        if (!hasStructuredData) {
            // Add basic organization structured data
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": document.title,
                "url": window.location.href
            });
            document.head.appendChild(script);
            this.addSuccess('Added basic structured data');
        }
    }

    setupSEOMonitoring() {
        // Monitor for dynamic content changes
        const observer = new MutationObserver(() => {
            this.debounce(() => {
                this.analyzePage();
            }, 1000);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    calculateSEOScore() {
        const totalChecks = Object.keys(this.checkedElements).length;
        const completedChecks = Object.values(this.checkedElements).filter(Boolean).length;
        const issueCount = this.issues.length;
        
        // Base score from completed checks
        let score = (completedChecks / totalChecks) * 100;
        
        // Deduct points for issues
        score -= issueCount * 5;
        
        // Ensure score is between 0 and 100
        this.seoScore = Math.max(0, Math.min(100, Math.round(score)));
    }

    displaySEOReport() {
        console.log('📊 SEO Analysis Complete');
        console.log(`SEO Score: ${this.seoScore}/100`);
        console.log(`Issues: ${this.issues.length}`);
        console.log(`Recommendations: ${this.recommendations.length}`);

        // Show visual report in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createSEODisplay();
        }
    }

    createSEODisplay() {
        const display = document.createElement('div');
        display.id = 'seo-report';
        display.className = 'fixed top-4 left-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-sm';
        display.style.display = 'none';
        
        const scoreColor = this.seoScore >= 90 ? 'text-green-400' : 
                          this.seoScore >= 70 ? 'text-yellow-400' : 'text-red-400';
        
        display.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">SEO Report</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="text-slate-400 hover:text-white">×</button>
            </div>
            <div class="text-center mb-3">
                <div class="text-2xl font-bold ${scoreColor}">${this.seoScore}/100</div>
                <div class="text-xs text-slate-400">SEO Score</div>
            </div>
            <div class="space-y-1 text-xs max-h-40 overflow-y-auto">
                ${this.issues.map(issue => `<div class="text-red-400">❌ ${issue}</div>`).join('')}
                ${this.recommendations.map(rec => `<div class="text-yellow-400">⚠️ ${rec}</div>`).join('')}
            </div>
        `;
        
        document.body.appendChild(display);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'fixed top-16 left-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-indigo-700';
        toggleBtn.innerHTML = '📊';
        toggleBtn.title = 'Toggle SEO Report';
        toggleBtn.onclick = () => {
            const display = document.getElementById('seo-report');
            display.style.display = display.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
    }

    addIssue(issue, solution = '') {
        this.issues.push(solution ? `${issue} - ${solution}` : issue);
    }

    addRecommendation(recommendation) {
        this.recommendations.push(recommendation);
    }

    addSuccess(message) {
        console.log('✅', message);
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Initialize SEO optimization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SEOOptimization();
});

// Export for manual testing
window.SEOOptimization = SEOOptimization;
