
/**
 * Enhanced Security Headers for Production
 */
(function() {
    'use strict';
    
    // Force HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        location.replace('https:' + window.location.href.substring(window.location.protocol.length));
    }
    
    // Add security headers via meta tags (fallback)
    const securityHeaders = [
        {
            'http-equiv': 'Content-Security-Policy',
            'content': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cpwebassets.codepen.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';"
        },
        {
            'http-equiv': 'X-Content-Type-Options',
            'content': 'nosniff'
        },
        {
            'http-equiv': 'X-Frame-Options',
            'content': 'DENY'
        },
        {
            'http-equiv': 'X-XSS-Protection',
            'content': '1; mode=block'
        },
        {
            'http-equiv': 'Referrer-Policy',
            'content': 'strict-origin-when-cross-origin'
        },
        {
            'http-equiv': 'Permissions-Policy',
            'content': 'camera=(), microphone=(), geolocation=(), payment=()'
        }
    ];
    
    // Add headers if not already present
    securityHeaders.forEach(header => {
        const existing = document.querySelector(`meta[http-equiv="${header['http-equiv']}"]`);
        if (!existing) {
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', header['http-equiv']);
            meta.setAttribute('content', header.content);
            document.head.appendChild(meta);
        }
    });
    
    // Form submission security
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.tagName === 'FORM') {
            // Ensure HTTPS for form submissions in production
            if (form.action && form.action.startsWith('http:') && location.hostname !== 'localhost') {
                form.action = form.action.replace('http:', 'https:');
            }
            
            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (csrfToken && !form.querySelector('input[name="_token"]')) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = '_token';
                tokenInput.value = csrfToken.getAttribute('content');
                form.appendChild(tokenInput);
            }
        }
    });
    
    // Secure cookie settings
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value && location.protocol === 'https:') {
                // Ensure secure cookies in production
                document.cookie = `${name}=${value}; Secure; SameSite=Strict; Path=/`;
            }
        });
    }
    
    // Content Security Policy violation reporting
    document.addEventListener('securitypolicyviolation', function(e) {
        console.warn('CSP Violation:', {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy
        });
        
        // In production, you might want to report this to your logging service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'csp_violation', {
                'blocked_uri': e.blockedURI,
                'violated_directive': e.violatedDirective
            });
        }
    });
    
})();
