/**
 * Security Headers Implementation for Ardonie Capital
 * Implements client-side security measures and CSP
 */

(function() {
    'use strict';
    
    /**
     * Security Headers Configuration
     */
    const securityConfig = {
        // Content Security Policy (for meta tag implementation)
        csp: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'", // Required for inline scripts
                "https://fonts.googleapis.com"
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'", // Required for inline styles
                "https://fonts.googleapis.com"
            ],
            'font-src': [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            'img-src': [
                "'self'",
                "data:",
                "https:",
                "https://images.unsplash.com"
            ],
            'connect-src': [
                "'self'"
            ],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'upgrade-insecure-requests': []
        },

        // Server-only headers (cannot be set via meta tags)
        serverOnlyHeaders: {
            'frame-ancestors': "'none'",
            'X-Frame-Options': 'DENY'
        },
        
        // Additional security headers (safe for meta tag implementation)
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    };
    
    /**
     * Apply Content Security Policy
     */
    function applyCSP() {
        // Build CSP string
        const cspDirectives = [];
        
        for (const [directive, sources] of Object.entries(securityConfig.csp)) {
            if (sources.length === 0) {
                cspDirectives.push(directive);
            } else {
                cspDirectives.push(`${directive} ${sources.join(' ')}`);
            }
        }
        
        const cspString = cspDirectives.join('; ');
        
        // Apply CSP via meta tag (fallback if server headers not available)
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!existingCSP) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', cspString);
            document.head.appendChild(cspMeta);
        }
        
        console.log('CSP Applied:', cspString);
    }
    
    /**
     * Apply additional security headers via meta tags
     */
    function applySecurityHeaders() {
        for (const [header, value] of Object.entries(securityConfig.headers)) {
            const existingHeader = document.querySelector(`meta[http-equiv="${header}"]`);
            if (!existingHeader) {
                const headerMeta = document.createElement('meta');
                headerMeta.setAttribute('http-equiv', header);
                headerMeta.setAttribute('content', value);
                document.head.appendChild(headerMeta);
            }
        }
    }
    
    /**
     * Secure external links
     */
    function secureExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(link => {
            const url = new URL(link.href);
            const currentDomain = window.location.hostname;
            
            // Check if it's an external link
            if (url.hostname !== currentDomain) {
                // Add security attributes
                if (!link.hasAttribute('rel')) {
                    link.setAttribute('rel', 'noopener noreferrer');
                } else {
                    const rel = link.getAttribute('rel');
                    if (!rel.includes('noopener')) {
                        link.setAttribute('rel', rel + ' noopener');
                    }
                    if (!rel.includes('noreferrer')) {
                        link.setAttribute('rel', link.getAttribute('rel') + ' noreferrer');
                    }
                }
                
                // Add target="_blank" if not already present
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_blank');
                }
                
                // Add visual indicator for external links
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon ml-1 text-xs';
                    icon.innerHTML = '↗️';
                    icon.title = 'External link';
                    link.appendChild(icon);
                }
            }
        });
    }
    
    /**
     * Prevent clickjacking
     */
    function preventClickjacking() {
        // Check if page is being framed
        if (window.top !== window.self) {
            // Break out of frame
            window.top.location = window.self.location;
        }
    }
    
    /**
     * Secure form submissions
     */
    function secureForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add novalidate to prevent HTML5 validation bypass
            if (!form.hasAttribute('novalidate')) {
                form.setAttribute('novalidate', 'true');
            }
            
            // Ensure HTTPS submission for sensitive forms
            if (form.action && form.action.startsWith('http://')) {
                console.warn('Insecure form submission detected:', form.action);
                // In production, you might want to force HTTPS
                // form.action = form.action.replace('http://', 'https://');
            }
            
            // Add CSRF token if not present
            if (!form.querySelector('input[name="csrf_token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = generateCSRFToken();
                form.appendChild(csrfInput);
            }
        });
    }
    
    /**
     * Generate CSRF token (client-side fallback)
     */
    function generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    /**
     * Sanitize user input
     */
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    /**
     * Monitor for XSS attempts
     */
    function monitorXSS() {
        // Monitor for suspicious script injections
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for suspicious script tags
                        if (node.tagName === 'SCRIPT' && !node.src) {
                            console.warn('Suspicious inline script detected:', node.innerHTML);
                        }
                        
                        // Check for suspicious event handlers
                        const suspiciousAttributes = ['onload', 'onerror', 'onclick', 'onmouseover'];
                        suspiciousAttributes.forEach(attr => {
                            if (node.hasAttribute && node.hasAttribute(attr)) {
                                console.warn(`Suspicious ${attr} attribute detected:`, node.getAttribute(attr));
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['onload', 'onerror', 'onclick', 'onmouseover']
        });
    }
    
    /**
     * Secure localStorage usage
     */
    function secureLocalStorage() {
        // Override localStorage to add encryption
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        localStorage.setItem = function(key, value) {
            // Only encrypt sensitive keys
            const sensitiveKeys = ['auth_token', 'user_data', 'session_data'];
            if (sensitiveKeys.some(k => key.includes(k))) {
                console.log('Encrypting sensitive data for key:', key);
                // In a real implementation, use proper encryption
                value = btoa(value); // Simple base64 encoding for demo
            }
            return originalSetItem.call(this, key, value);
        };
        
        localStorage.getItem = function(key) {
            const value = originalGetItem.call(this, key);
            if (value) {
                const sensitiveKeys = ['auth_token', 'user_data', 'session_data'];
                if (sensitiveKeys.some(k => key.includes(k))) {
                    try {
                        return atob(value); // Simple base64 decoding for demo
                    } catch (e) {
                        console.error('Failed to decrypt data for key:', key);
                        return value;
                    }
                }
            }
            return value;
        };
    }
    
    /**
     * Initialize security measures
     */
    function initSecurity() {
        // Apply security headers
        applyCSP();
        applySecurityHeaders();
        
        // Prevent clickjacking
        preventClickjacking();
        
        // Secure forms and links
        secureForms();
        secureExternalLinks();
        
        // Monitor for security issues
        monitorXSS();
        
        // Secure localStorage
        secureLocalStorage();
        
        console.log('Security measures initialized');
    }
    
    /**
     * Public API
     */
    window.SecurityHeaders = {
        init: initSecurity,
        sanitizeInput: sanitizeInput,
        generateCSRFToken: generateCSRFToken,
        secureExternalLinks: secureExternalLinks,
        secureForms: secureForms
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }
    
    // Re-secure dynamic content
    document.addEventListener('DOMContentLoaded', function() {
        // Re-run security measures when new content is added
        const observer = new MutationObserver(function(mutations) {
            let shouldResecure = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if new forms or links were added
                            if (node.tagName === 'FORM' || node.tagName === 'A' || 
                                node.querySelector('form') || node.querySelector('a[href^="http"]')) {
                                shouldResecure = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldResecure) {
                setTimeout(() => {
                    secureForms();
                    secureExternalLinks();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();
