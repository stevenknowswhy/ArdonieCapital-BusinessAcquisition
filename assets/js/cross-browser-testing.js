/**
 * Cross-Browser Compatibility Testing Suite
 * Detects browser-specific issues and provides compatibility reports
 */

class CrossBrowserTesting {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.compatibilityIssues = [];
        this.supportedFeatures = [];
        this.init();
    }

    init() {
        this.runCompatibilityTests();
        this.setupBrowserSpecificFixes();
        this.displayCompatibilityReport();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        let browser = {
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown',
            mobile: /Mobi|Android/i.test(userAgent)
        };

        // Chrome
        if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
            browser.name = 'Chrome';
            browser.engine = 'Blink';
            const match = userAgent.match(/Chrome\/(\d+)/);
            browser.version = match ? match[1] : 'Unknown';
        }
        // Firefox
        else if (/Firefox/.test(userAgent)) {
            browser.name = 'Firefox';
            browser.engine = 'Gecko';
            const match = userAgent.match(/Firefox\/(\d+)/);
            browser.version = match ? match[1] : 'Unknown';
        }
        // Safari
        else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
            browser.name = 'Safari';
            browser.engine = 'WebKit';
            const match = userAgent.match(/Version\/(\d+)/);
            browser.version = match ? match[1] : 'Unknown';
        }
        // Edge
        else if (/Edg/.test(userAgent)) {
            browser.name = 'Edge';
            browser.engine = 'Blink';
            const match = userAgent.match(/Edg\/(\d+)/);
            browser.version = match ? match[1] : 'Unknown';
        }
        // Internet Explorer
        else if (/Trident/.test(userAgent) || /MSIE/.test(userAgent)) {
            browser.name = 'Internet Explorer';
            browser.engine = 'Trident';
            const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
            browser.version = match ? match[1] : 'Unknown';
        }

        return browser;
    }

    runCompatibilityTests() {
        console.log('🌐 Running Cross-Browser Compatibility Tests...');
        
        // Test CSS Grid support
        this.testCSSGrid();
        
        // Test Flexbox support
        this.testFlexbox();
        
        // Test CSS Custom Properties
        this.testCSSCustomProperties();
        
        // Test ES6 features
        this.testES6Features();
        
        // Test Fetch API
        this.testFetchAPI();
        
        // Test Local Storage
        this.testLocalStorage();
        
        // Test CSS Backdrop Filter
        this.testBackdropFilter();
        
        // Test Intersection Observer
        this.testIntersectionObserver();
        
        // Test Web Components
        this.testWebComponents();
        
        // Test specific browser issues
        this.testBrowserSpecificIssues();
    }

    testCSSGrid() {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        
        if (testElement.style.display === 'grid') {
            this.logSupport('CSS Grid', true);
        } else {
            this.logSupport('CSS Grid', false, 'Consider using Flexbox fallback');
        }
    }

    testFlexbox() {
        const testElement = document.createElement('div');
        testElement.style.display = 'flex';
        
        if (testElement.style.display === 'flex') {
            this.logSupport('Flexbox', true);
        } else {
            this.logSupport('Flexbox', false, 'Use float-based layouts as fallback');
        }
    }

    testCSSCustomProperties() {
        if (window.CSS && CSS.supports && CSS.supports('color', 'var(--test)')) {
            this.logSupport('CSS Custom Properties', true);
        } else {
            this.logSupport('CSS Custom Properties', false, 'Use Sass variables or PostCSS');
        }
    }

    testES6Features() {
        try {
            // Test arrow functions
            const arrowTest = () => true;
            
            // Test const/let
            const constTest = 'test';
            let letTest = 'test';
            
            // Test template literals
            const templateTest = `template ${constTest}`;
            
            // Test destructuring
            const [a, b] = [1, 2];
            const {name} = {name: 'test'};
            
            this.logSupport('ES6 Features', true);
        } catch (e) {
            this.logSupport('ES6 Features', false, 'Use Babel transpilation');
        }
    }

    testFetchAPI() {
        if (typeof fetch !== 'undefined') {
            this.logSupport('Fetch API', true);
        } else {
            this.logSupport('Fetch API', false, 'Use XMLHttpRequest or polyfill');
        }
    }

    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.logSupport('Local Storage', true);
        } catch (e) {
            this.logSupport('Local Storage', false, 'Use cookies as fallback');
        }
    }

    testBackdropFilter() {
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(10px)';
        
        if (testElement.style.backdropFilter === 'blur(10px)') {
            this.logSupport('Backdrop Filter', true);
        } else {
            this.logSupport('Backdrop Filter', false, 'Use solid backgrounds as fallback');
        }
    }

    testIntersectionObserver() {
        if (typeof IntersectionObserver !== 'undefined') {
            this.logSupport('Intersection Observer', true);
        } else {
            this.logSupport('Intersection Observer', false, 'Use scroll event listeners');
        }
    }

    testWebComponents() {
        if (typeof customElements !== 'undefined') {
            this.logSupport('Web Components', true);
        } else {
            this.logSupport('Web Components', false, 'Use framework components instead');
        }
    }

    testBrowserSpecificIssues() {
        // Internet Explorer specific issues
        if (this.browserInfo.name === 'Internet Explorer') {
            this.logIssue('IE: CSS Grid not supported', 'Use Flexbox or float layouts');
            this.logIssue('IE: Fetch API not supported', 'Use XMLHttpRequest or polyfill');
            this.logIssue('IE: ES6 features limited', 'Use Babel transpilation');
        }

        // Safari specific issues
        if (this.browserInfo.name === 'Safari') {
            // Check for older Safari versions
            if (parseInt(this.browserInfo.version) < 14) {
                this.logIssue('Safari: Limited CSS Grid support in older versions');
            }
            
            // Safari has issues with some CSS properties
            this.logIssue('Safari: Backdrop-filter may have performance issues');
        }

        // Firefox specific issues
        if (this.browserInfo.name === 'Firefox') {
            // Firefox sometimes has different behavior with flexbox
            this.logIssue('Firefox: Some flexbox behaviors may differ from Chrome');
        }

        // Mobile browser issues
        if (this.browserInfo.mobile) {
            this.logIssue('Mobile: Touch events may behave differently');
            this.logIssue('Mobile: Viewport units (vh/vw) may have issues');
        }
    }

    setupBrowserSpecificFixes() {
        // Add browser-specific CSS classes
        document.documentElement.classList.add(
            `browser-${this.browserInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
            `engine-${this.browserInfo.engine.toLowerCase()}`,
            `version-${this.browserInfo.version}`
        );

        if (this.browserInfo.mobile) {
            document.documentElement.classList.add('mobile-browser');
        }

        // Apply specific fixes
        this.applyIEFixes();
        this.applySafariFixes();
        this.applyMobileFixes();
    }

    applyIEFixes() {
        if (this.browserInfo.name === 'Internet Explorer') {
            // Add IE-specific polyfills or fallbacks
            console.log('Applying Internet Explorer compatibility fixes...');
            
            // Example: Add CSS Grid fallback
            const style = document.createElement('style');
            style.textContent = `
                .grid { display: flex; flex-wrap: wrap; }
                .grid > * { flex: 1; min-width: 300px; }
            `;
            document.head.appendChild(style);
        }
    }

    applySafariFixes() {
        if (this.browserInfo.name === 'Safari') {
            console.log('Applying Safari compatibility fixes...');
            
            // Safari-specific fixes
            const style = document.createElement('style');
            style.textContent = `
                /* Safari backdrop-filter performance fix */
                .backdrop-blur { -webkit-backdrop-filter: blur(10px); }
                
                /* Safari flexbox fixes */
                .flex { display: -webkit-flex; display: flex; }
            `;
            document.head.appendChild(style);
        }
    }

    applyMobileFixes() {
        if (this.browserInfo.mobile) {
            console.log('Applying mobile browser fixes...');
            
            // Mobile-specific fixes
            const style = document.createElement('style');
            style.textContent = `
                /* Mobile viewport fixes */
                .min-h-screen { min-height: 100vh; min-height: -webkit-fill-available; }
                
                /* Mobile touch improvements */
                button, a { -webkit-tap-highlight-color: transparent; }
            `;
            document.head.appendChild(style);
        }
    }

    logSupport(feature, supported, fallback = null) {
        const result = {
            feature,
            supported,
            fallback,
            type: supported ? 'support' : 'no-support'
        };
        
        this.supportedFeatures.push(result);
        
        if (supported) {
            console.log(`✅ ${feature}: Supported`);
        } else {
            console.warn(`❌ ${feature}: Not supported${fallback ? ` - ${fallback}` : ''}`);
        }
    }

    logIssue(issue, solution = null) {
        const result = {
            issue,
            solution,
            type: 'issue'
        };
        
        this.compatibilityIssues.push(result);
        console.warn(`⚠️ ${issue}${solution ? ` - ${solution}` : ''}`);
    }

    displayCompatibilityReport() {
        // Only show in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createCompatibilityDisplay();
        }
        
        // Log summary
        const supportedCount = this.supportedFeatures.filter(f => f.supported).length;
        const totalFeatures = this.supportedFeatures.length;
        const issueCount = this.compatibilityIssues.length;
        
        console.log(`🌐 Browser Compatibility Report:
Browser: ${this.browserInfo.name} ${this.browserInfo.version} (${this.browserInfo.engine})
Features Supported: ${supportedCount}/${totalFeatures}
Issues Found: ${issueCount}`);
    }

    createCompatibilityDisplay() {
        const display = document.createElement('div');
        display.id = 'browser-compatibility-report';
        display.className = 'fixed top-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-sm';
        display.style.display = 'none';
        
        const supportedCount = this.supportedFeatures.filter(f => f.supported).length;
        const totalFeatures = this.supportedFeatures.length;
        
        display.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">Browser Compatibility</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="text-slate-400 hover:text-white">×</button>
            </div>
            <div class="text-xs mb-2">
                <div>Browser: ${this.browserInfo.name} ${this.browserInfo.version}</div>
                <div>Engine: ${this.browserInfo.engine}</div>
                <div>Features: ${supportedCount}/${totalFeatures} supported</div>
            </div>
            <div class="max-h-40 overflow-y-auto">
                ${this.supportedFeatures.map(f => `
                    <div class="text-xs mb-1">
                        ${f.supported ? '✅' : '❌'} ${f.feature}
                        ${f.fallback ? `<div class="text-slate-400 ml-4">${f.fallback}</div>` : ''}
                    </div>
                `).join('')}
                ${this.compatibilityIssues.map(i => `
                    <div class="text-xs mb-1 text-yellow-400">
                        ⚠️ ${i.issue}
                        ${i.solution ? `<div class="text-slate-400 ml-4">${i.solution}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(display);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'fixed top-4 left-4 bg-purple-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-purple-700';
        toggleBtn.innerHTML = '🌐';
        toggleBtn.title = 'Toggle Browser Compatibility Report';
        toggleBtn.onclick = () => {
            const display = document.getElementById('browser-compatibility-report');
            display.style.display = display.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
    }
}

// Initialize cross-browser testing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CrossBrowserTesting();
});

// Export for manual testing
window.CrossBrowserTesting = CrossBrowserTesting;
