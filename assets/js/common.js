// Ardonie Capital Common JavaScript Utilities

// Dark mode toggle functionality
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        // Use the theme system for toggling
        darkModeToggle.addEventListener('click', () => {
            if (window.ArdonieTheme && window.ArdonieTheme.loader) {
                window.ArdonieTheme.loader.toggleColorMode();
            } else {
                // Fallback to original implementation
                const html = document.documentElement;
                html.classList.toggle('dark');
                localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
            }
        });

        // Update toggle state based on current mode
        const updateToggleState = () => {
            const isDark = document.documentElement.classList.contains('dark');
            darkModeToggle.setAttribute('aria-checked', isDark.toString());
            darkModeToggle.querySelector('.toggle-text').textContent = isDark ? 'Dark Mode' : 'Light Mode';
        };

        // Listen for theme changes
        window.addEventListener('themeChanged', updateToggleState);

        // Initial state
        updateToggleState();
    }
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');

            // Update aria-expanded attribute
            const isExpanded = !mobileMenu.classList.contains('hidden');
            mobileMenuButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Loading state management
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;

    // Set background color based on type
    switch (type) {
        case 'success':
            toast.classList.add('bg-emerald-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-600');
            break;
        default:
            toast.classList.add('bg-blue-600');
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Local storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format numbers with commas
function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to element
function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        showToast('Failed to copy to clipboard', 'error');
        return false;
    }
}

// Initialize all common functionality
function initCommonFeatures() {
    // Load theme files in the correct order
    loadThemeFiles(() => {
        initDarkMode();
        initMobileMenu();

        // Add loading states to forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (event) => {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    showLoading(submitButton);
                }
            });
        });

        // Add smooth scrolling to anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                scrollToElement(targetId, 80); // 80px offset for fixed header
            });
        });

        // Initialize tooltips (if any)
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    });
}

// Load theme files in the correct order
function loadThemeFiles(callback) {
    const themeFiles = [
        'assets/js/themes/base-theme.js',
        'assets/js/themes/navigation-theme.js',
        'assets/js/themes/footer-theme.js',
        'assets/js/themes/card-theme.js',
        'assets/js/themes/button-theme.js',
        'assets/js/themes/form-theme.js',
        'assets/js/themes/theme-loader.js'
    ];

    let filesLoaded = 0;

    themeFiles.forEach(file => {
        const script = document.createElement('script');
        script.src = file;
        script.onload = () => {
            filesLoaded++;
            if (filesLoaded === themeFiles.length) {
                callback();
            }
        };
        document.head.appendChild(script);
    });
}

// Tooltip functionality
function showTooltip(event) {
    const element = event.target;
    const tooltipText = element.getAttribute('data-tooltip');

    if (!tooltipText) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-slate-900 rounded shadow-lg pointer-events-none';
    tooltip.textContent = tooltipText;
    tooltip.id = 'tooltip';

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        document.body.removeChild(tooltip);
    }
}

// Express Deal specific utilities
const ExpressDeal = {
    // Calculate days remaining in Express process
    calculateDaysRemaining(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return Math.max(0, 34 - daysPassed);
    },

    // Get current phase of Express Deal
    getCurrentPhase(startDate) {
        const daysPassed = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));

        if (daysPassed <= 7) return { phase: 1, name: 'Discovery & Match', days: '1-7' };
        if (daysPassed <= 14) return { phase: 2, name: 'Connect & Evaluate', days: '8-14' };
        if (daysPassed <= 28) return { phase: 3, name: 'Express Due Diligence', days: '15-28' };
        if (daysPassed <= 34) return { phase: 4, name: 'Express Close', days: '29-34' };
        return { phase: 5, name: 'Completed', days: '34+' };
    },

    // Format badge display
    formatBadge(type) {
        const badges = {
            'express-buyer': '🚖 Express Buyer',
            'express-seller': '🚖 Express Seller',
            'verified': '✅ Verified',
            'financing-approved': '🏅 Financing Approved',
            'hot-deal': '🔥 Hot Deal'
        };
        return badges[type] || type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCommonFeatures);

// Export utilities for use in other scripts
window.ArdonieCapital = {
    validateEmail,
    validatePhone,
    validateRequired,
    showLoading,
    hideLoading,
    showToast,
    saveToLocalStorage,
    loadFromLocalStorage,
    formatCurrency,
    formatNumber,
    debounce,
    scrollToElement,
    copyToClipboard,
    ExpressDeal
};
