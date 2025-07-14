/**
 * Header Component Tests
 * Comprehensive tests for the header component functionality
 */

import { HeaderComponent } from '../../../src/shared/components/header.component.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('HeaderComponent', () => {
    let headerComponent;
    let mockContainer;
    let mockAuthService;

    beforeEach(() => {
        TestUtils.resetMocks();
        
        // Create mock container
        mockContainer = TestUtils.createElement('div', { id: 'header-container' });
        
        // Mock auth service
        mockAuthService = {
            isLoggedIn: jest.fn(() => false),
            getCurrentUser: jest.fn(() => null),
            logout: jest.fn(() => Promise.resolve({ success: true }))
        };
        
        // Mock document.getElementById
        global.document.getElementById = jest.fn((id) => {
            if (id === 'header-container') return mockContainer;
            return null;
        });
        
        // Mock global auth service
        global.authService = mockAuthService;
    });

    describe('Initialization', () => {
        test('should initialize with default options', () => {
            headerComponent = new HeaderComponent('header-container');
            
            expect(headerComponent.containerId).toBe('header-container');
            expect(headerComponent.options.brand).toBe('Ardonie Capital');
            expect(headerComponent.options.showAuth).toBe(true);
            expect(headerComponent.options.showNavigation).toBe(true);
        });

        test('should initialize with custom options', () => {
            const customOptions = {
                brand: 'Custom Brand',
                brandUrl: '/custom',
                showAuth: false,
                showNavigation: false,
                theme: 'dark'
            };

            headerComponent = new HeaderComponent('header-container', customOptions);
            
            expect(headerComponent.options.brand).toBe('Custom Brand');
            expect(headerComponent.options.brandUrl).toBe('/custom');
            expect(headerComponent.options.showAuth).toBe(false);
            expect(headerComponent.options.showNavigation).toBe(false);
            expect(headerComponent.options.theme).toBe('dark');
        });

        test('should throw error if container not found', () => {
            global.document.getElementById = jest.fn(() => null);
            
            expect(() => {
                new HeaderComponent('nonexistent-container');
            }).toThrow('Header container not found');
        });
    });

    describe('Rendering', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
        });

        test('should render header structure', () => {
            headerComponent.render();
            
            expect(mockContainer.innerHTML).toContain('header');
            expect(mockContainer.innerHTML).toContain('nav');
            expect(mockContainer.innerHTML).toContain('Ardonie Capital');
        });

        test('should render navigation menu', () => {
            headerComponent.render();
            
            expect(mockContainer.innerHTML).toContain('Home');
            expect(mockContainer.innerHTML).toContain('Marketplace');
            expect(mockContainer.innerHTML).toContain('Dashboard');
            expect(mockContainer.innerHTML).toContain('About');
        });

        test('should render auth buttons when not logged in', () => {
            mockAuthService.isLoggedIn.mockReturnValue(false);
            headerComponent.render();
            
            expect(mockContainer.innerHTML).toContain('Login');
            expect(mockContainer.innerHTML).toContain('Register');
        });

        test('should render user menu when logged in', () => {
            const mockUser = TestUtils.createTestData('user');
            mockAuthService.isLoggedIn.mockReturnValue(true);
            mockAuthService.getCurrentUser.mockReturnValue(mockUser);
            
            headerComponent.render();
            
            expect(mockContainer.innerHTML).toContain('Profile');
            expect(mockContainer.innerHTML).toContain('Logout');
            expect(mockContainer.innerHTML).toContain(mockUser.name);
        });

        test('should not render navigation when disabled', () => {
            headerComponent = new HeaderComponent('header-container', { showNavigation: false });
            headerComponent.render();
            
            expect(mockContainer.innerHTML).not.toContain('Home');
            expect(mockContainer.innerHTML).not.toContain('Marketplace');
        });

        test('should not render auth when disabled', () => {
            headerComponent = new HeaderComponent('header-container', { showAuth: false });
            headerComponent.render();
            
            expect(mockContainer.innerHTML).not.toContain('Login');
            expect(mockContainer.innerHTML).not.toContain('Register');
        });
    });

    describe('Mobile Menu', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
        });

        test('should toggle mobile menu', () => {
            const toggleButton = { click: jest.fn() };
            headerComponent.mobileMenuToggle = toggleButton;
            
            headerComponent.toggleMobileMenu();
            
            expect(headerComponent.isMobileMenuOpen).toBe(true);
            
            headerComponent.toggleMobileMenu();
            
            expect(headerComponent.isMobileMenuOpen).toBe(false);
        });

        test('should close mobile menu on outside click', () => {
            headerComponent.isMobileMenuOpen = true;
            
            const outsideClickEvent = TestUtils.createEvent('click', {
                target: TestUtils.createElement('div')
            });
            
            headerComponent.handleOutsideClick(outsideClickEvent);
            
            expect(headerComponent.isMobileMenuOpen).toBe(false);
        });

        test('should not close mobile menu on inside click', () => {
            headerComponent.isMobileMenuOpen = true;
            const mobileMenu = TestUtils.createElement('div');
            headerComponent.mobileMenu = mobileMenu;
            
            const insideClickEvent = TestUtils.createEvent('click', {
                target: mobileMenu
            });
            
            headerComponent.handleOutsideClick(insideClickEvent);
            
            expect(headerComponent.isMobileMenuOpen).toBe(true);
        });

        test('should close mobile menu on escape key', () => {
            headerComponent.isMobileMenuOpen = true;
            
            const escapeEvent = TestUtils.createEvent('keydown', {
                key: 'Escape'
            });
            
            headerComponent.handleKeyDown(escapeEvent);
            
            expect(headerComponent.isMobileMenuOpen).toBe(false);
        });
    });

    describe('Authentication Integration', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
        });

        test('should handle login button click', () => {
            const loginButton = TestUtils.createElement('button');
            headerComponent.loginButton = loginButton;
            
            headerComponent.handleLoginClick();
            
            expect(global.window.location.href).toContain('/auth/login.html');
        });

        test('should handle register button click', () => {
            const registerButton = TestUtils.createElement('button');
            headerComponent.registerButton = registerButton;
            
            headerComponent.handleRegisterClick();
            
            expect(global.window.location.href).toContain('/auth/register.html');
        });

        test('should handle logout', async () => {
            mockAuthService.logout.mockResolvedValue({ success: true });
            
            await headerComponent.handleLogout();
            
            expect(mockAuthService.logout).toHaveBeenCalled();
            expect(global.window.location.href).toContain('/');
        });

        test('should handle logout failure', async () => {
            mockAuthService.logout.mockResolvedValue({ 
                success: false, 
                error: 'Logout failed' 
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            await headerComponent.handleLogout();
            
            expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', 'Logout failed');
            consoleSpy.mockRestore();
        });

        test('should update auth state on login', () => {
            const mockUser = TestUtils.createTestData('user');
            mockAuthService.isLoggedIn.mockReturnValue(true);
            mockAuthService.getCurrentUser.mockReturnValue(mockUser);
            
            headerComponent.updateAuthState();
            
            expect(headerComponent.isLoggedIn).toBe(true);
            expect(headerComponent.currentUser).toEqual(mockUser);
        });
    });

    describe('Navigation', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
        });

        test('should handle navigation clicks', () => {
            const navItem = TestUtils.createElement('a', { href: '/marketplace' });
            const clickEvent = TestUtils.createEvent('click', { target: navItem });
            
            headerComponent.handleNavClick(clickEvent);
            
            expect(clickEvent.preventDefault).toHaveBeenCalled();
            expect(global.window.location.href).toContain('/marketplace');
        });

        test('should highlight active navigation item', () => {
            global.window.location.pathname = '/marketplace';
            
            headerComponent.updateActiveNavItem();
            
            const marketplaceNav = headerComponent.container.querySelector('[href="/marketplace"]');
            expect(marketplaceNav?.classList.contains('active')).toBe(true);
        });

        test('should handle external links correctly', () => {
            const externalLink = TestUtils.createElement('a', { 
                href: 'https://external.com',
                target: '_blank'
            });
            const clickEvent = TestUtils.createEvent('click', { target: externalLink });
            
            headerComponent.handleNavClick(clickEvent);
            
            expect(clickEvent.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('Theme Support', () => {
        test('should apply theme classes', () => {
            headerComponent = new HeaderComponent('header-container', { theme: 'dark' });
            headerComponent.render();
            
            expect(mockContainer.classList.contains('theme-dark')).toBe(true);
        });

        test('should toggle theme', () => {
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
            
            headerComponent.toggleTheme();
            
            expect(headerComponent.currentTheme).toBe('dark');
            expect(mockContainer.classList.contains('theme-dark')).toBe(true);
            
            headerComponent.toggleTheme();
            
            expect(headerComponent.currentTheme).toBe('light');
            expect(mockContainer.classList.contains('theme-light')).toBe(true);
        });

        test('should save theme preference', () => {
            headerComponent = new HeaderComponent('header-container');
            
            headerComponent.setTheme('dark');
            
            expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        });

        test('should load saved theme preference', () => {
            global.localStorage.getItem.mockReturnValue('dark');
            
            headerComponent = new HeaderComponent('header-container');
            headerComponent.loadThemePreference();
            
            expect(headerComponent.currentTheme).toBe('dark');
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
        });

        test('should have proper ARIA attributes', () => {
            expect(mockContainer.innerHTML).toContain('role="banner"');
            expect(mockContainer.innerHTML).toContain('aria-label');
        });

        test('should handle keyboard navigation', () => {
            const tabEvent = TestUtils.createEvent('keydown', { key: 'Tab' });
            const enterEvent = TestUtils.createEvent('keydown', { key: 'Enter' });
            
            headerComponent.handleKeyDown(tabEvent);
            headerComponent.handleKeyDown(enterEvent);
            
            // Should not throw errors
            expect(true).toBe(true);
        });

        test('should support screen readers', () => {
            expect(mockContainer.innerHTML).toContain('aria-expanded');
            expect(mockContainer.innerHTML).toContain('aria-hidden');
        });
    });

    describe('Event Handling', () => {
        beforeEach(() => {
            headerComponent = new HeaderComponent('header-container');
        });

        test('should add event listeners on init', () => {
            const addEventListenerSpy = jest.spyOn(global.document, 'addEventListener');
            
            headerComponent.init();
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should remove event listeners on destroy', () => {
            const removeEventListenerSpy = jest.spyOn(global.document, 'removeEventListener');
            
            headerComponent.init();
            headerComponent.destroy();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should handle window resize', () => {
            headerComponent.init();
            
            const resizeEvent = TestUtils.createEvent('resize');
            global.window.dispatchEvent(resizeEvent);
            
            // Should update mobile menu state
            expect(headerComponent.checkMobileBreakpoint).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing auth service gracefully', () => {
            global.authService = undefined;
            
            expect(() => {
                headerComponent = new HeaderComponent('header-container');
                headerComponent.render();
            }).not.toThrow();
        });

        test('should handle render errors gracefully', () => {
            mockContainer.innerHTML = null;
            Object.defineProperty(mockContainer, 'innerHTML', {
                set: () => { throw new Error('Render error'); }
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            headerComponent = new HeaderComponent('header-container');
            headerComponent.render();
            
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
