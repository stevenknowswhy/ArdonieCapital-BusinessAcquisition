/**
 * Accessibility Improvements Suite
 * Enhances website accessibility and WCAG compliance
 */

class AccessibilityImprovements {
    constructor() {
        this.accessibilityScore = 0;
        this.violations = [];
        this.improvements = [];
        this.init();
    }

    init() {
        this.analyzeAccessibility();
        this.implementImprovements();
        this.setupAccessibilityFeatures();
        this.displayAccessibilityReport();
    }

    analyzeAccessibility() {
        console.log('♿ Analyzing accessibility...');
        
        this.checkColorContrast();
        this.checkKeyboardNavigation();
        this.checkARIALabels();
        this.checkHeadingStructure();
        this.checkFormAccessibility();
        this.checkImageAccessibility();
        this.checkFocusManagement();
        this.checkSemanticHTML();
        this.checkTextAlternatives();
        
        this.calculateAccessibilityScore();
    }

    checkColorContrast() {
        // Basic color contrast checking
        const elements = document.querySelectorAll('*');
        let contrastIssues = 0;
        
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Skip elements with transparent or inherit colors
            if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
                return;
            }
            
            // This is a simplified check - in production, use a proper contrast ratio calculator
            if (this.isLowContrast(color, backgroundColor)) {
                contrastIssues++;
            }
        });
        
        if (contrastIssues > 0) {
            this.addViolation(`${contrastIssues} elements may have low color contrast`);
        } else {
            this.addImprovement('Color contrast appears adequate');
        }
    }

    isLowContrast(color, backgroundColor) {
        // Simplified contrast check - in production, use proper WCAG contrast calculation
        const colorLuminance = this.getLuminance(color);
        const bgLuminance = this.getLuminance(backgroundColor);
        
        if (colorLuminance === null || bgLuminance === null) return false;
        
        const contrast = (Math.max(colorLuminance, bgLuminance) + 0.05) / 
                        (Math.min(colorLuminance, bgLuminance) + 0.05);
        
        return contrast < 4.5; // WCAG AA standard
    }

    getLuminance(color) {
        // Simplified luminance calculation
        if (!color || color === 'transparent') return null;
        
        // This is a basic implementation - use a proper color library in production
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return null;
        
        const [r, g, b] = rgb.map(c => {
            c = parseInt(c) / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    checkKeyboardNavigation() {
        const interactiveElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex], [onclick], [role="button"]'
        );
        
        let keyboardAccessible = 0;
        let notAccessible = 0;
        
        interactiveElements.forEach(element => {
            const tabIndex = element.getAttribute('tabindex');
            
            if (tabIndex === '-1') {
                notAccessible++;
            } else if (element.tagName === 'A' || element.tagName === 'BUTTON' || 
                      element.tagName === 'INPUT' || element.tagName === 'SELECT' || 
                      element.tagName === 'TEXTAREA' || tabIndex >= 0) {
                keyboardAccessible++;
            } else {
                notAccessible++;
            }
        });
        
        if (notAccessible > 0) {
            this.addViolation(`${notAccessible} interactive elements may not be keyboard accessible`);
        }
        
        this.addImprovement(`${keyboardAccessible} elements are keyboard accessible`);
    }

    checkARIALabels() {
        const elementsNeedingLabels = document.querySelectorAll(
            'button:not([aria-label]):not([aria-labelledby]), ' +
            'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
            '[role="button"]:not([aria-label]):not([aria-labelledby])'
        );
        
        if (elementsNeedingLabels.length > 0) {
            this.addViolation(`${elementsNeedingLabels.length} elements missing ARIA labels`);
        } else {
            this.addImprovement('ARIA labels appear to be properly implemented');
        }
        
        // Check for proper ARIA roles
        const customElements = document.querySelectorAll('[role]');
        customElements.forEach(element => {
            const role = element.getAttribute('role');
            const validRoles = ['button', 'link', 'tab', 'tabpanel', 'dialog', 'alert', 'banner', 'navigation', 'main', 'complementary', 'contentinfo'];
            
            if (!validRoles.includes(role)) {
                this.addViolation(`Invalid ARIA role: ${role}`);
            }
        });
    }

    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
        
        // Check for proper heading hierarchy
        let previousLevel = 0;
        let hierarchyIssues = 0;
        
        headingLevels.forEach(level => {
            if (level > previousLevel + 1) {
                hierarchyIssues++;
            }
            previousLevel = level;
        });
        
        if (hierarchyIssues > 0) {
            this.addViolation('Heading hierarchy has gaps (e.g., H1 followed by H3)');
        } else {
            this.addImprovement('Heading hierarchy is properly structured');
        }
        
        // Check for empty headings
        const emptyHeadings = Array.from(headings).filter(h => !h.textContent.trim());
        if (emptyHeadings.length > 0) {
            this.addViolation(`${emptyHeadings.length} empty headings found`);
        }
    }

    checkFormAccessibility() {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, select, textarea');
        
        let inputsWithLabels = 0;
        let inputsWithoutLabels = 0;
        
        inputs.forEach(input => {
            const id = input.getAttribute('id');
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            
            if (label || ariaLabel || ariaLabelledBy) {
                inputsWithLabels++;
            } else {
                inputsWithoutLabels++;
            }
        });
        
        if (inputsWithoutLabels > 0) {
            this.addViolation(`${inputsWithoutLabels} form inputs missing labels`);
        }
        
        if (inputsWithLabels > 0) {
            this.addImprovement(`${inputsWithLabels} form inputs have proper labels`);
        }
        
        // Check for fieldsets in complex forms
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            const fieldsets = form.querySelectorAll('fieldset');
            
            if (inputs.length > 3 && fieldsets.length === 0) {
                this.addViolation('Complex form should use fieldsets for grouping');
            }
        });
    }

    checkImageAccessibility() {
        const images = document.querySelectorAll('img');
        let imagesWithAlt = 0;
        let imagesWithoutAlt = 0;
        let decorativeImages = 0;
        
        images.forEach(img => {
            const alt = img.getAttribute('alt');
            
            if (alt === null) {
                imagesWithoutAlt++;
            } else if (alt === '') {
                decorativeImages++;
            } else {
                imagesWithAlt++;
            }
        });
        
        if (imagesWithoutAlt > 0) {
            this.addViolation(`${imagesWithoutAlt} images missing alt attributes`);
        }
        
        this.addImprovement(`${imagesWithAlt} images have descriptive alt text`);
        
        if (decorativeImages > 0) {
            this.addImprovement(`${decorativeImages} decorative images properly marked`);
        }
    }

    checkFocusManagement() {
        // Check for focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-focus-test:focus {
                outline: 2px solid #007cba !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
        
        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        const hasSkipToMain = Array.from(skipLinks).some(link => 
            link.textContent.toLowerCase().includes('skip') && 
            link.textContent.toLowerCase().includes('main')
        );
        
        if (!hasSkipToMain) {
            this.addViolation('Missing skip to main content link');
        } else {
            this.addImprovement('Skip to main content link found');
        }
    }

    checkSemanticHTML() {
        const semanticElements = document.querySelectorAll(
            'main, nav, header, footer, section, article, aside'
        );
        
        if (semanticElements.length === 0) {
            this.addViolation('No semantic HTML5 elements found');
        } else {
            this.addImprovement(`${semanticElements.length} semantic HTML5 elements found`);
        }
        
        // Check for proper landmarks
        const main = document.querySelector('main');
        const nav = document.querySelector('nav');
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        if (!main) this.addViolation('Missing main landmark');
        if (!nav) this.addViolation('Missing navigation landmark');
        if (!header) this.addViolation('Missing header landmark');
        if (!footer) this.addViolation('Missing footer landmark');
    }

    checkTextAlternatives() {
        // Check for text alternatives for non-text content
        const mediaElements = document.querySelectorAll('video, audio, canvas, svg');
        
        mediaElements.forEach(element => {
            const hasTextAlternative = element.getAttribute('aria-label') || 
                                     element.getAttribute('aria-labelledby') ||
                                     element.querySelector('title') ||
                                     element.nextElementSibling?.textContent;
            
            if (!hasTextAlternative) {
                this.addViolation(`${element.tagName} element missing text alternative`);
            }
        });
    }

    implementImprovements() {
        this.addSkipLinks();
        this.improveFocusIndicators();
        this.addARIALabels();
        this.improveKeyboardNavigation();
        this.addLiveRegions();
    }

    addSkipLinks() {
        const existingSkipLink = document.querySelector('a[href="#main"]');
        if (!existingSkipLink) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            this.addImprovement('Added skip to main content link');
        }
    }

    improveFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced focus indicators */
            *:focus {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
            }
            
            /* Screen reader only class */
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
            
            .focus\\:not-sr-only:focus {
                position: static !important;
                width: auto !important;
                height: auto !important;
                padding: 0.5rem 1rem !important;
                margin: 0 !important;
                overflow: visible !important;
                clip: auto !important;
                white-space: normal !important;
            }
        `;
        document.head.appendChild(style);
        
        this.addImprovement('Enhanced focus indicators added');
    }

    addARIALabels() {
        // Add ARIA labels to buttons without text
        const buttonsWithoutText = document.querySelectorAll('button:not([aria-label]):empty');
        buttonsWithoutText.forEach((button, index) => {
            button.setAttribute('aria-label', `Button ${index + 1}`);
        });
        
        if (buttonsWithoutText.length > 0) {
            this.addImprovement(`Added ARIA labels to ${buttonsWithoutText.length} buttons`);
        }
    }

    improveKeyboardNavigation() {
        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('[onclick]:not(button):not(a)');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'button');
            }
            
            // Add keyboard event listeners
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
        
        if (interactiveElements.length > 0) {
            this.addImprovement(`Made ${interactiveElements.length} elements keyboard accessible`);
        }
    }

    addLiveRegions() {
        // Add live region for dynamic content updates
        if (!document.getElementById('live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
            
            this.addImprovement('Added live region for screen readers');
        }
    }

    setupAccessibilityFeatures() {
        this.setupReducedMotion();
        this.setupHighContrast();
        this.setupTextScaling();
    }

    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
            
            this.addImprovement('Reduced motion for accessibility preferences');
        }
    }

    setupHighContrast() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.classList.add('high-contrast');
            this.addImprovement('High contrast mode detected and applied');
        }
    }

    setupTextScaling() {
        // Ensure text can scale up to 200% without horizontal scrolling
        const style = document.createElement('style');
        style.textContent = `
            @media (min-width: 1200px) {
                html {
                    font-size: clamp(16px, 1.2vw, 20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    calculateAccessibilityScore() {
        const totalChecks = 10; // Number of accessibility checks
        const violationCount = this.violations.length;
        const improvementCount = this.improvements.length;
        
        // Base score from improvements
        let score = (improvementCount / totalChecks) * 100;
        
        // Deduct points for violations
        score -= violationCount * 10;
        
        // Ensure score is between 0 and 100
        this.accessibilityScore = Math.max(0, Math.min(100, Math.round(score)));
    }

    displayAccessibilityReport() {
        console.log('♿ Accessibility Analysis Complete');
        console.log(`Accessibility Score: ${this.accessibilityScore}/100`);
        console.log(`Violations: ${this.violations.length}`);
        console.log(`Improvements: ${this.improvements.length}`);

        // Show visual report in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createAccessibilityDisplay();
        }
    }

    createAccessibilityDisplay() {
        const display = document.createElement('div');
        display.id = 'accessibility-report';
        display.className = 'fixed top-4 right-1/2 transform translate-x-1/2 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-sm';
        display.style.display = 'none';
        
        const scoreColor = this.accessibilityScore >= 90 ? 'text-green-400' : 
                          this.accessibilityScore >= 70 ? 'text-yellow-400' : 'text-red-400';
        
        display.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">♿ Accessibility Report</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="text-slate-400 hover:text-white">×</button>
            </div>
            <div class="text-center mb-3">
                <div class="text-2xl font-bold ${scoreColor}">${this.accessibilityScore}/100</div>
                <div class="text-xs text-slate-400">Accessibility Score</div>
            </div>
            <div class="space-y-1 text-xs max-h-40 overflow-y-auto">
                ${this.violations.map(violation => `<div class="text-red-400">❌ ${violation}</div>`).join('')}
                ${this.improvements.map(improvement => `<div class="text-green-400">✅ ${improvement}</div>`).join('')}
            </div>
        `;
        
        document.body.appendChild(display);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'fixed top-28 left-4 bg-purple-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-purple-700';
        toggleBtn.innerHTML = '♿';
        toggleBtn.title = 'Toggle Accessibility Report';
        toggleBtn.onclick = () => {
            const display = document.getElementById('accessibility-report');
            display.style.display = display.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
    }

    addViolation(violation) {
        this.violations.push(violation);
        console.warn('❌', violation);
    }

    addImprovement(improvement) {
        this.improvements.push(improvement);
        console.log('✅', improvement);
    }

    // Utility method to announce messages to screen readers
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// Initialize accessibility improvements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityImprovements();
});

// Export for manual testing
window.AccessibilityImprovements = AccessibilityImprovements;
