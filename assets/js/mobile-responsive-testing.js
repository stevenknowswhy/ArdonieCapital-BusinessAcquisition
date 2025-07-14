/**
 * Mobile Responsive Testing Suite
 * Validates responsive design across different screen sizes and devices
 */

class MobileResponsiveTesting {
    constructor() {
        this.breakpoints = {
            mobile: { min: 320, max: 767 },
            tablet: { min: 768, max: 1023 },
            desktop: { min: 1024, max: 1439 },
            large: { min: 1440, max: 9999 }
        };
        
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
        
        this.init();
    }

    init() {
        this.setupTestEnvironment();
        this.runResponsiveTests();
        this.setupContinuousMonitoring();
    }

    setupTestEnvironment() {
        // Create test results display
        this.createTestResultsDisplay();
        
        // Add viewport meta tag if missing
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
            this.logWarning('Added missing viewport meta tag');
        }
    }

    createTestResultsDisplay() {
        // Only show in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testDisplay = document.createElement('div');
            testDisplay.id = 'responsive-test-results';
            testDisplay.className = 'fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-sm';
            testDisplay.style.display = 'none';
            
            testDisplay.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">Responsive Tests</h4>
                    <button onclick="this.parentElement.parentElement.style.display='none'" class="text-slate-400 hover:text-white">×</button>
                </div>
                <div id="test-summary"></div>
                <div id="test-details" class="mt-2 max-h-40 overflow-y-auto"></div>
            `;
            
            document.body.appendChild(testDisplay);
            
            // Add toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'fixed bottom-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-blue-700';
            toggleBtn.innerHTML = '📱';
            toggleBtn.title = 'Toggle Responsive Test Results';
            toggleBtn.onclick = () => {
                const display = document.getElementById('responsive-test-results');
                display.style.display = display.style.display === 'none' ? 'block' : 'none';
            };
            document.body.appendChild(toggleBtn);
        }
    }

    runResponsiveTests() {
        console.log('🔍 Running Mobile Responsive Tests...');
        
        // Test 1: Navigation responsiveness
        this.testNavigationResponsiveness();
        
        // Test 2: Grid layouts
        this.testGridLayouts();
        
        // Test 3: Typography scaling
        this.testTypographyScaling();
        
        // Test 4: Interactive elements
        this.testInteractiveElements();
        
        // Test 5: Image responsiveness
        this.testImageResponsiveness();
        
        // Test 6: Form responsiveness
        this.testFormResponsiveness();
        
        // Test 7: Modal responsiveness
        this.testModalResponsiveness();
        
        // Test 8: Touch targets
        this.testTouchTargets();
        
        this.displayResults();
    }

    testNavigationResponsiveness() {
        const nav = document.querySelector('nav, header');
        if (!nav) {
            this.logFail('Navigation element not found');
            return;
        }

        // Test mobile menu button exists
        const mobileMenuBtn = document.querySelector('[data-mobile-menu], #mobile-menu-button, .mobile-menu-toggle');
        if (!mobileMenuBtn) {
            this.logWarning('Mobile menu button not found - navigation may not be mobile-friendly');
        } else {
            this.logPass('Mobile menu button found');
        }

        // Test navigation links are properly hidden/shown
        const navLinks = document.querySelectorAll('nav a, header a');
        if (navLinks.length > 0) {
            this.logPass(`Found ${navLinks.length} navigation links`);
        }
    }

    testGridLayouts() {
        const grids = document.querySelectorAll('[class*="grid-cols"]');
        
        grids.forEach((grid, index) => {
            const classes = grid.className;
            
            // Check for responsive grid classes
            const hasResponsiveGrid = /grid-cols-1.*md:grid-cols-|grid-cols-1.*lg:grid-cols-/.test(classes);
            
            if (hasResponsiveGrid) {
                this.logPass(`Grid ${index + 1}: Has responsive breakpoints`);
            } else {
                this.logWarning(`Grid ${index + 1}: May not be responsive - consider adding breakpoint classes`);
            }
        });
    }

    testTypographyScaling() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach((heading, index) => {
            const classes = heading.className;
            
            // Check for responsive text sizing
            const hasResponsiveText = /text-\w+.*md:text-|text-\w+.*lg:text-/.test(classes);
            
            if (hasResponsiveText) {
                this.logPass(`Heading ${index + 1}: Has responsive text sizing`);
            } else if (classes.includes('text-')) {
                this.logWarning(`Heading ${index + 1}: Consider adding responsive text classes`);
            }
        });
    }

    testInteractiveElements() {
        const buttons = document.querySelectorAll('button, [role="button"], .btn');
        const links = document.querySelectorAll('a');
        
        [...buttons, ...links].forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const minTouchTarget = 44; // 44px minimum for accessibility
            
            if (rect.width >= minTouchTarget && rect.height >= minTouchTarget) {
                this.logPass(`Interactive element ${index + 1}: Adequate touch target size`);
            } else if (rect.width > 0 && rect.height > 0) {
                this.logWarning(`Interactive element ${index + 1}: Touch target may be too small (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
            }
        });
    }

    testImageResponsiveness() {
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            const classes = img.className;
            const hasResponsiveClass = classes.includes('w-full') || classes.includes('max-w-') || classes.includes('responsive');
            
            if (hasResponsiveClass) {
                this.logPass(`Image ${index + 1}: Has responsive classes`);
            } else {
                this.logWarning(`Image ${index + 1}: Consider adding responsive classes`);
            }
            
            // Check for alt text
            if (!img.alt) {
                this.logWarning(`Image ${index + 1}: Missing alt text for accessibility`);
            }
        });
    }

    testFormResponsiveness() {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input, index) => {
            const classes = input.className;
            const hasResponsiveClass = classes.includes('w-full') || /w-\d+.*md:w-|w-\d+.*lg:w-/.test(classes);
            
            if (hasResponsiveClass) {
                this.logPass(`Form input ${index + 1}: Has responsive width`);
            } else {
                this.logWarning(`Form input ${index + 1}: Consider adding responsive width classes`);
            }
        });
    }

    testModalResponsiveness() {
        // Test for modal containers
        const modals = document.querySelectorAll('[class*="modal"], [class*="fixed"][class*="inset"]');
        
        modals.forEach((modal, index) => {
            const classes = modal.className;
            const hasPadding = classes.includes('p-4') || classes.includes('px-') || classes.includes('py-');
            
            if (hasPadding) {
                this.logPass(`Modal ${index + 1}: Has mobile padding`);
            } else {
                this.logWarning(`Modal ${index + 1}: Consider adding mobile padding`);
            }
        });
    }

    testTouchTargets() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
        let adequateTargets = 0;
        let inadequateTargets = 0;
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const area = rect.width * rect.height;
            
            if (area >= 44 * 44) { // 44px x 44px minimum
                adequateTargets++;
            } else if (area > 0) {
                inadequateTargets++;
            }
        });
        
        if (inadequateTargets === 0) {
            this.logPass(`All ${adequateTargets} touch targets meet minimum size requirements`);
        } else {
            this.logWarning(`${inadequateTargets} touch targets may be too small for mobile use`);
        }
    }

    setupContinuousMonitoring() {
        // Monitor viewport changes
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.checkCurrentBreakpoint();
            }, 250);
        });
        
        // Initial breakpoint check
        this.checkCurrentBreakpoint();
    }

    checkCurrentBreakpoint() {
        const width = window.innerWidth;
        let currentBreakpoint = 'unknown';
        
        for (const [name, range] of Object.entries(this.breakpoints)) {
            if (width >= range.min && width <= range.max) {
                currentBreakpoint = name;
                break;
            }
        }
        
        // Update display if exists
        const display = document.getElementById('responsive-test-results');
        if (display) {
            const breakpointInfo = display.querySelector('#current-breakpoint') || document.createElement('div');
            breakpointInfo.id = 'current-breakpoint';
            breakpointInfo.textContent = `Current: ${currentBreakpoint} (${width}px)`;
            breakpointInfo.className = 'text-xs text-slate-300 mt-1';
            
            if (!display.contains(breakpointInfo)) {
                display.appendChild(breakpointInfo);
            }
        }
    }

    logPass(message) {
        this.testResults.passed++;
        this.testResults.details.push({ type: 'pass', message });
        console.log('✅', message);
    }

    logFail(message) {
        this.testResults.failed++;
        this.testResults.details.push({ type: 'fail', message });
        console.error('❌', message);
    }

    logWarning(message) {
        this.testResults.warnings++;
        this.testResults.details.push({ type: 'warning', message });
        console.warn('⚠️', message);
    }

    displayResults() {
        const summary = `✅ ${this.testResults.passed} passed, ❌ ${this.testResults.failed} failed, ⚠️ ${this.testResults.warnings} warnings`;
        console.log('📱 Responsive Test Summary:', summary);
        
        // Update display if exists
        const summaryEl = document.getElementById('test-summary');
        const detailsEl = document.getElementById('test-details');
        
        if (summaryEl) {
            summaryEl.textContent = summary;
        }
        
        if (detailsEl) {
            detailsEl.innerHTML = this.testResults.details.map(detail => {
                const icon = detail.type === 'pass' ? '✅' : detail.type === 'fail' ? '❌' : '⚠️';
                return `<div class="text-xs mb-1">${icon} ${detail.message}</div>`;
            }).join('');
        }
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Initialize responsive testing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileResponsiveTesting();
});

// Export for manual testing
window.ResponsiveTesting = MobileResponsiveTesting;
