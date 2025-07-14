/**
 * Test Setup and Configuration
 * Global test utilities and mocks for the Ardonie Capital platform
 */

// Global test configuration
const TEST_CONFIG = {
    timeout: 5000,
    retries: 2,
    verbose: true,
    coverage: true
};

// Mock DOM environment for Node.js testing
if (typeof window === 'undefined') {
    global.window = {
        location: { href: 'http://localhost:3000' },
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        sessionStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        document: {
            createElement: jest.fn(() => ({
                setAttribute: jest.fn(),
                appendChild: jest.fn(),
                removeChild: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    toggle: jest.fn(),
                    contains: jest.fn()
                },
                style: {},
                innerHTML: '',
                textContent: ''
            })),
            getElementById: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn(),
                style: {}
            },
            head: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            documentElement: {
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    toggle: jest.fn(),
                    contains: jest.fn()
                },
                style: {},
                setAttribute: jest.fn(),
                getAttribute: jest.fn()
            }
        },
        fetch: jest.fn(),
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        requestAnimationFrame: jest.fn(cb => setTimeout(cb, 16)),
        cancelAnimationFrame: jest.fn(),
        matchMedia: jest.fn(() => ({
            matches: false,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        })),
        dispatchEvent: jest.fn(),
        CustomEvent: jest.fn(),
        Event: jest.fn()
    };
    
    global.document = global.window.document;
    global.localStorage = global.window.localStorage;
    global.sessionStorage = global.window.sessionStorage;
    global.fetch = global.window.fetch;
}

// Test utilities
export const TestUtils = {
    /**
     * Create a mock DOM element
     * @param {string} tagName - Element tag name
     * @param {Object} attributes - Element attributes
     * @returns {Object} Mock element
     */
    createElement(tagName, attributes = {}) {
        const element = {
            tagName: tagName.toUpperCase(),
            id: attributes.id || '',
            className: attributes.className || '',
            innerHTML: '',
            textContent: '',
            value: attributes.value || '',
            checked: attributes.checked || false,
            disabled: attributes.disabled || false,
            style: {},
            dataset: {},
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                toggle: jest.fn(),
                contains: jest.fn(() => false)
            },
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            removeAttribute: jest.fn(),
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            click: jest.fn(),
            focus: jest.fn(),
            blur: jest.fn(),
            submit: jest.fn(),
            reset: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            getBoundingClientRect: jest.fn(() => ({
                top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100
            }))
        };
        
        // Apply attributes
        Object.entries(attributes).forEach(([key, value]) => {
            element[key] = value;
        });
        
        return element;
    },

    /**
     * Create a mock event
     * @param {string} type - Event type
     * @param {Object} properties - Event properties
     * @returns {Object} Mock event
     */
    createEvent(type, properties = {}) {
        return {
            type,
            target: null,
            currentTarget: null,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            stopImmediatePropagation: jest.fn(),
            ...properties
        };
    },

    /**
     * Wait for a specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after the specified time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Wait for a condition to be true
     * @param {Function} condition - Condition function
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise} Promise that resolves when condition is true
     */
    async waitFor(condition, timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return true;
            }
            await this.wait(10);
        }
        throw new Error(`Condition not met within ${timeout}ms`);
    },

    /**
     * Mock fetch response
     * @param {Object} data - Response data
     * @param {number} status - HTTP status code
     * @returns {Promise} Mock fetch response
     */
    mockFetch(data, status = 200) {
        return Promise.resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(data),
            text: () => Promise.resolve(JSON.stringify(data))
        });
    },

    /**
     * Mock localStorage
     * @returns {Object} Mock localStorage
     */
    mockLocalStorage() {
        const store = {};
        return {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value; }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
            get length() { return Object.keys(store).length; },
            key: jest.fn(index => Object.keys(store)[index] || null)
        };
    },

    /**
     * Mock window object
     * @returns {Object} Mock window
     */
    mockWindow() {
        return {
            location: {
                href: 'http://localhost:3000',
                pathname: '/',
                search: '',
                hash: '',
                host: 'localhost:3000',
                hostname: 'localhost',
                port: '3000',
                protocol: 'http:',
                origin: 'http://localhost:3000'
            },
            document: {
                getElementById: jest.fn(),
                querySelector: jest.fn(),
                querySelectorAll: jest.fn(() => []),
                createElement: jest.fn(() => ({
                    classList: { add: jest.fn(), remove: jest.fn() },
                    style: {},
                    textContent: '',
                    innerHTML: '',
                    className: '',
                    addEventListener: jest.fn(),
                    querySelector: jest.fn().mockReturnValue(null)
                })),
                documentElement: {
                    classList: { add: jest.fn(), remove: jest.fn() },
                    setAttribute: jest.fn()
                },
                body: {
                    appendChild: jest.fn()
                }
            },
            localStorage: this.mockLocalStorage(),
            sessionStorage: this.mockLocalStorage(),
            fetch: jest.fn(),
            console: this.mockConsole(),
            setTimeout: jest.fn((fn, delay) => setTimeout(fn, delay)),
            clearTimeout: jest.fn(),
            setInterval: jest.fn(),
            clearInterval: jest.fn(),
            requestAnimationFrame: jest.fn(cb => setTimeout(cb, 16)),
            cancelAnimationFrame: jest.fn(),
            matchMedia: jest.fn(() => ({
                matches: false,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            })),
            dispatchEvent: jest.fn(),
            CustomEvent: jest.fn(),
            Event: jest.fn()
        };
    },

    /**
     * Mock console methods
     * @returns {Object} Mock console
     */
    mockConsole() {
        return {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };
    },

    /**
     * Reset all mocks
     */
    resetMocks() {
        jest.clearAllMocks();
        if (global.window) {
            global.window.localStorage.getItem.mockClear();
            global.window.localStorage.setItem.mockClear();
            global.window.localStorage.removeItem.mockClear();
            global.window.localStorage.clear.mockClear();
            global.window.fetch.mockClear();
        }
    },

    /**
     * Create test data
     * @param {string} type - Data type
     * @param {Object} overrides - Property overrides
     * @returns {Object} Test data
     */
    createTestData(type, overrides = {}) {
        const testData = {
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'buyer',
                verified: true,
                createdAt: new Date().toISOString()
            },
            listing: {
                id: '456',
                title: 'Test Business',
                description: 'A test business listing',
                price: 100000,
                category: 'technology',
                location: 'New York, NY',
                revenue: 50000,
                profit: 20000,
                employees: 5,
                established: 2020
            },
            dashboard: {
                analytics: {
                    totalViews: 1000,
                    totalInquiries: 50,
                    conversionRate: 5.0,
                    revenue: 250000
                },
                notifications: [
                    {
                        id: '1',
                        type: 'info',
                        message: 'Test notification',
                        read: false,
                        createdAt: new Date().toISOString()
                    }
                ]
            }
        };

        return { ...testData[type], ...overrides };
    }
};

// Test assertions
export const TestAssertions = {
    /**
     * Assert element has class
     * @param {Object} element - DOM element
     * @param {string} className - Class name
     */
    toHaveClass(element, className) {
        expect(element.classList.contains).toHaveBeenCalledWith(className);
    },

    /**
     * Assert element has attribute
     * @param {Object} element - DOM element
     * @param {string} attribute - Attribute name
     * @param {string} value - Expected value
     */
    toHaveAttribute(element, attribute, value) {
        if (value !== undefined) {
            expect(element.getAttribute).toHaveBeenCalledWith(attribute);
        } else {
            expect(element.hasAttribute).toHaveBeenCalledWith(attribute);
        }
    },

    /**
     * Assert function was called with arguments
     * @param {Function} fn - Function
     * @param {Array} args - Expected arguments
     */
    toHaveBeenCalledWith(fn, ...args) {
        expect(fn).toHaveBeenCalledWith(...args);
    },

    /**
     * Assert async function resolves
     * @param {Promise} promise - Promise to test
     * @returns {Promise} Test promise
     */
    async toResolve(promise) {
        await expect(promise).resolves.toBeDefined();
    },

    /**
     * Assert async function rejects
     * @param {Promise} promise - Promise to test
     * @param {string} errorMessage - Expected error message
     * @returns {Promise} Test promise
     */
    async toReject(promise, errorMessage) {
        if (errorMessage) {
            await expect(promise).rejects.toThrow(errorMessage);
        } else {
            await expect(promise).rejects.toThrow();
        }
    }
};

// Export test configuration
export { TEST_CONFIG };

// Global setup
beforeEach(() => {
    TestUtils.resetMocks();
});

console.log('Test setup initialized for Ardonie Capital platform');
