/**
 * Shared Utilities Integration Tests
 * Tests that shared utilities work correctly across all features
 */

import { TestUtils, TestAssertions } from '../setup.js';

describe('Shared Utilities Integration', () => {
    let mockLocalStorage;
    let mockSessionStorage;
    let mockWindow;

    beforeEach(() => {
        TestUtils.resetMocks();
        mockLocalStorage = TestUtils.mockLocalStorage();
        mockSessionStorage = TestUtils.mockLocalStorage(); // Reuse the same mock structure
        mockWindow = TestUtils.mockWindow();

        global.localStorage = mockLocalStorage;
        global.sessionStorage = mockSessionStorage;
        global.window = mockWindow;
        global.document = mockWindow.document;
    });

    describe('Formatting Utilities Cross-Feature Usage', () => {
        test('should format currency consistently across marketplace and dashboard', async () => {
            const { formatCurrency } = await import('../../src/shared/utils/formatting.utils.js');

            // Test marketplace listing price formatting
            const listingPrice = 250000;
            const formattedListingPrice = formatCurrency(listingPrice);
            expect(formattedListingPrice).toBe('$250,000.00');

            // Test dashboard revenue formatting
            const dashboardRevenue = 1500000;
            const formattedRevenue = formatCurrency(dashboardRevenue);
            expect(formattedRevenue).toBe('$1,500,000.00');

            // Test different currencies
            const eurPrice = formatCurrency(100000, 'EUR');
            expect(eurPrice).toBe('€100,000.00');

            // Test edge cases
            expect(formatCurrency(0)).toBe('$0.00');
            expect(formatCurrency(null)).toBe('$0.00');
            expect(formatCurrency(undefined)).toBe('$0.00');
        });

        test('should format dates consistently across all features', async () => {
            const { formatDate } = await import('../../src/shared/utils/formatting.utils.js');

            const testDate = new Date('2024-01-15T10:30:00Z');

            // Test authentication last login formatting
            const authDateFormat = formatDate(testDate, { dateStyle: 'medium' });
            expect(authDateFormat).toContain('2024');

            // Test marketplace listing date formatting
            const listingDateFormat = formatDate(testDate, { dateStyle: 'short' });
            expect(listingDateFormat).toContain('2024');

            // Test dashboard analytics date formatting
            const dashboardDateFormat = formatDate(testDate, { 
                dateStyle: 'full',
                timeStyle: 'short'
            });
            expect(dashboardDateFormat).toContain('2024');

            // Test edge cases
            expect(formatDate(null)).toBe('');
            expect(formatDate(undefined)).toBe('');
            expect(formatDate('invalid')).toBe('');
        });

        test('should format phone numbers consistently across features', async () => {
            const { formatPhone } = await import('../../src/shared/utils/formatting.utils.js');

            // Test contact form phone formatting
            const rawPhone = '5551234567';
            const formattedPhone = formatPhone(rawPhone);
            expect(formattedPhone).toBe('(555) 123-4567');

            // Test marketplace inquiry phone formatting
            const internationalPhone = '+15551234567';
            const formattedIntlPhone = formatPhone(internationalPhone);
            expect(formattedIntlPhone).toBe('+1 (555) 123-4567');

            // Test edge cases
            expect(formatPhone('')).toBe('');
            expect(formatPhone(null)).toBe('');
            expect(formatPhone('123')).toBe('123');
        });
    });

    describe('Validation Utilities Cross-Feature Usage', () => {
        test('should validate emails consistently across authentication and contact forms', async () => {
            const { validateEmail } = await import('../../src/shared/utils/validation.utils.js');

            // Test authentication email validation
            expect(validateEmail('user@example.com')).toBe(true);
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail(null)).toBe(false);

            // Test contact form email validation
            expect(validateEmail('contact@business.com')).toBe(true);
            expect(validateEmail('test@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.com')).toBe(true);

            // Test marketplace inquiry email validation
            expect(validateEmail('buyer@marketplace.com')).toBe(true);
            expect(validateEmail('seller@listings.net')).toBe(true);
        });

        test('should validate phone numbers consistently across features', async () => {
            const { validatePhone } = await import('../../src/shared/utils/validation.utils.js');

            // Test contact form phone validation
            expect(validatePhone('(555) 123-4567')).toBe(true);
            expect(validatePhone('555-123-4567')).toBe(true);
            expect(validatePhone('5551234567')).toBe(true);
            expect(validatePhone('+1 555 123 4567')).toBe(true);

            // Test marketplace inquiry phone validation
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('')).toBe(false);
            expect(validatePhone(null)).toBe(false);
        });

        test('should validate required fields consistently across all forms', async () => {
            const { validateRequired } = await import('../../src/shared/utils/validation.utils.js');

            // Test authentication form validation
            expect(validateRequired('password123')).toBe(true);
            expect(validateRequired('')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
            expect(validateRequired('   ')).toBe(false);

            // Test marketplace form validation
            expect(validateRequired('Business Name')).toBe(true);
            expect(validateRequired(0)).toBe(true); // Zero is valid for numbers
            expect(validateRequired(false)).toBe(true); // Boolean false is valid
        });
    });

    describe('Storage Utilities Cross-Feature Usage', () => {
        test('should handle localStorage consistently across features', async () => {
            const { setStorageItem, getStorageItem, removeStorageItem } = 
                await import('../../src/shared/utils/storage.utils.js');

            // Test authentication token storage
            const authToken = 'auth-token-123';
            setStorageItem('auth_token', authToken);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', authToken);

            mockLocalStorage.getItem.mockReturnValue(authToken);
            const retrievedToken = getStorageItem('auth_token');
            expect(retrievedToken).toBe(authToken);

            // Test marketplace preferences storage
            const marketplacePrefs = { location: 'Dallas', priceRange: [100000, 500000] };
            setStorageItem('marketplace_preferences', marketplacePrefs);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'marketplace_preferences', 
                JSON.stringify(marketplacePrefs)
            );

            // Test dashboard settings storage
            const dashboardSettings = { theme: 'dark', notifications: true };
            setStorageItem('dashboard_settings', dashboardSettings);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'dashboard_settings',
                JSON.stringify(dashboardSettings)
            );

            // Test removal
            removeStorageItem('auth_token');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
        });

        test('should handle sessionStorage consistently across features', async () => {
            const { setSessionItem, getSessionItem } = 
                await import('../../src/shared/utils/storage.utils.js');

            const mockSessionStorage = {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn()
            };
            global.sessionStorage = mockSessionStorage;

            // Test temporary marketplace search state
            const searchState = { query: 'auto repair', filters: { location: 'Dallas' } };
            setSessionItem('marketplace_search', searchState);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
                'marketplace_search',
                JSON.stringify(searchState)
            );

            // Test temporary form data
            const formData = { step: 2, data: { name: 'Test Business' } };
            setSessionItem('form_progress', formData);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
                'form_progress',
                JSON.stringify(formData)
            );
        });
    });

    describe('UI Utilities Cross-Feature Usage', () => {
        test('should show toast notifications consistently across features', async () => {
            const { showToast } = await import('../../src/shared/utils/ui.utils.js');

            // Mock DOM elements
            const mockCreatedElement = {
                classList: { add: jest.fn(), remove: jest.fn() },
                style: {},
                textContent: '',
                innerHTML: '',
                className: '',
                id: '',
                addEventListener: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null),
                appendChild: jest.fn()
            };

            mockWindow.document.getElementById = jest.fn().mockReturnValue(null); // No existing container
            mockWindow.document.createElement = jest.fn().mockReturnValue(mockCreatedElement);

            // Test authentication success toast
            showToast('Login successful!', 'success');
            expect(mockCreatedElement.appendChild).toHaveBeenCalled();

            // Test marketplace error toast
            showToast('Failed to save listing', 'error');
            expect(mockCreatedElement.appendChild).toHaveBeenCalled();

            // Test dashboard info toast
            showToast('Dashboard updated', 'info');
            expect(mockCreatedElement.appendChild).toHaveBeenCalled();
        });

        test('should handle loading states consistently across features', async () => {
            const { showLoading, hideLoading } = await import('../../src/shared/utils/ui.utils.js');

            const mockLoadingElement = {
                style: {
                    display: ''
                },
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    [Symbol.iterator]: function* () {
                        yield 'existing-class';
                    }
                },
                disabled: false,
                innerHTML: 'Original content',
                appendChild: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null),
                tagName: 'DIV'
            };

            mockWindow.document.querySelector = jest.fn().mockReturnValue(mockLoadingElement);

            // Test authentication loading
            showLoading('auth-form');
            expect(mockLoadingElement.style.display).toBe('block');

            hideLoading('auth-form');
            expect(mockLoadingElement.style.display).toBe('none');

            // Test marketplace loading
            showLoading('marketplace-listings');
            expect(mockLoadingElement.style.display).toBe('block');

            hideLoading('marketplace-listings');
            expect(mockLoadingElement.style.display).toBe('none');
        });
    });

    describe('Theme Utilities Cross-Feature Usage', () => {
        test('should apply theme consistently across all features', async () => {
            const { setTheme, getTheme, toggleTheme } = 
                await import('../../src/shared/utils/theme.utils.js');

            mockWindow.document.documentElement = {
                classList: { add: jest.fn(), remove: jest.fn() },
                setAttribute: jest.fn()
            };

            // Test setting dark theme
            setTheme('dark');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
            expect(mockWindow.document.documentElement.classList.add).toHaveBeenCalledWith('dark');

            // Test setting light theme
            setTheme('light');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
            expect(mockWindow.document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');

            // Test getting theme
            mockLocalStorage.getItem.mockReturnValue('dark');
            const currentTheme = getTheme();
            expect(currentTheme).toBe('dark');

            // Test toggling theme
            mockLocalStorage.getItem.mockReturnValue('light');
            toggleTheme();
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        });
    });
});
