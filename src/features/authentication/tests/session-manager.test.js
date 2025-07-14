
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};

/**
 * Session Manager Service Tests
 * Unit tests for session management and timeout functionality
 */

import { SessionManagerService } from '../services/session-manager.service.js';

describe('SessionManagerService', () => {
    let sessionManager;
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage
        });

        // Mock timers
        jest.useFakeTimers();

        // Mock crypto.getRandomValues
        Object.defineProperty(global, 'crypto', {
            value: {
                getRandomValues: jest.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                })
            }
        });

        // Create fresh instance
        sessionManager = new SessionManagerService();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('Session Creation', () => {
        test('should start new session with user data', () => {
            const userData = {
                id: 1,
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
            };

            sessionManager.startSession(userData, false);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ardonie_session',
                expect.stringContaining('"user":')
            );
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ardonie_last_activity',
                expect.any(String)
            );
        });

        test('should start session with remember me option', () => {
            const userData = { id: 1, email: 'test@example.com' };

            sessionManager.startSession(userData, true);

            const sessionCall = mockLocalStorage.setItem.mock.calls.find(
                call => call[0] === 'ardonie_session'
            );
            const sessionData = JSON.parse(sessionCall[1]);

            expect(sessionData.rememberMe).toBe(true);
            expect(sessionData.expiresAt).toBeGreaterThan(Date.now() + 24 * 60 * 60 * 1000); // More than 1 day
        });

        test('should generate unique session ID', () => {
            const userData = { id: 1, email: 'test@example.com' };

            sessionManager.startSession(userData, false);

            const sessionCall = mockLocalStorage.setItem.mock.calls.find(
                call => call[0] === 'ardonie_session'
            );
            const sessionData = JSON.parse(sessionCall[1]);

            expect(sessionData.sessionId).toBeDefined();
            expect(sessionData.sessionId).toHaveLength(32); // 16 bytes * 2 hex chars
        });
    });

    describe('Session Status', () => {
        test('should return true for active session', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now(),
                lastActivity: Date.now(),
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes from now
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            expect(sessionManager.isSessionActive()).toBe(true);
        });

        test('should return false for expired session', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now() - 60 * 60 * 1000, // 1 hour ago
                lastActivity: Date.now() - 60 * 60 * 1000, // 1 hour ago
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() - 10 * 60 * 1000 // 10 minutes ago
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            expect(sessionManager.isSessionActive()).toBe(false);
        });

        test('should return false for non-existent session', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            expect(sessionManager.isSessionActive()).toBe(false);
        });

        test('should handle corrupted session data', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid_json');

            expect(sessionManager.isSessionActive()).toBe(false);
        });
    });

    describe('Session Data Management', () => {
        test('should retrieve current user from session', () => {
            const userData = { id: 1, email: 'test@example.com', firstName: 'Test' };
            const sessionData = {
                user: userData,
                startTime: Date.now(),
                lastActivity: Date.now(),
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            const currentUser = sessionManager.getCurrentUser();

            expect(currentUser).toEqual(userData);
        });

        test('should return null when no session exists', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const currentUser = sessionManager.getCurrentUser();

            expect(currentUser).toBeNull();
        });

        test('should update last activity timestamp', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now(),
                lastActivity: Date.now() - 10000, // 10 seconds ago
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            const originalActivity = sessionData.lastActivity;
            sessionManager.updateLastActivity();

            const updatedCall = mockLocalStorage.setItem.mock.calls.find(
                call => call[0] === 'ardonie_session'
            );
            const updatedData = JSON.parse(updatedCall[1]);

            expect(updatedData.lastActivity).toBeGreaterThan(originalActivity);
        });
    });

    describe('Session Extension', () => {
        test('should extend session duration', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now(),
                lastActivity: Date.now(),
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            const originalExpiry = sessionData.expiresAt;
            sessionManager.extendSession(20 * 60 * 1000); // Extend by 20 minutes

            const updatedCall = mockLocalStorage.setItem.mock.calls.find(
                call => call[0] === 'ardonie_session'
            );
            const updatedData = JSON.parse(updatedCall[1]);

            expect(updatedData.expiresAt).toBeGreaterThan(originalExpiry);
        });

        test('should not extend session if none exists', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            sessionManager.extendSession(20 * 60 * 1000);

            // Should not call setItem for session extension
            const sessionCalls = mockLocalStorage.setItem.mock.calls.filter(
                call => call[0] === 'ardonie_session'
            );
            expect(sessionCalls).toHaveLength(0);
        });
    });

    describe('Session Termination', () => {
        test('should end session and clear data', () => {
            sessionManager.endSession();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ardonie_session');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ardonie_last_activity');
        });

        test('should call session expired callback when ending session', () => {
            const mockCallback = jest.fn();
            sessionManager.onSessionExpired(mockCallback);

            sessionManager.endSession();

            expect(mockCallback).toHaveBeenCalled();
        });
    });

    describe('Session Timers', () => {
        test('should set timeout warning callback', () => {
            const mockCallback = jest.fn();
            sessionManager.onTimeoutWarning(mockCallback);

            expect(sessionManager.timeoutWarningCallback).toBe(mockCallback);
        });

        test('should set session expired callback', () => {
            const mockCallback = jest.fn();
            sessionManager.onSessionExpired(mockCallback);

            expect(sessionManager.sessionExpiredCallback).toBe(mockCallback);
        });

        test('should clear timers when ending session', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now(),
                lastActivity: Date.now(),
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));
            sessionManager.startSessionTimers();

            expect(sessionManager.sessionTimer).toBeDefined();
            expect(sessionManager.warningTimer).toBeDefined();

            sessionManager.clearTimers();

            expect(sessionManager.sessionTimer).toBeNull();
            expect(sessionManager.warningTimer).toBeNull();
        });
    });

    describe('Session Statistics', () => {
        test('should return session statistics', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now() - 10 * 60 * 1000, // 10 minutes ago
                lastActivity: Date.now() - 5 * 60 * 1000, // 5 minutes ago
                rememberMe: true,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 20 * 60 * 1000 // 20 minutes from now
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            const stats = sessionManager.getSessionStats();

            expect(stats).toBeDefined();
            expect(stats.sessionId).toBe('test_session_id');
            expect(stats.rememberMe).toBe(true);
            expect(stats.isActive).toBe(true);
            expect(stats.timeRemaining).toBeGreaterThan(0);
            expect(stats.startTime).toBeInstanceOf(Date);
            expect(stats.lastActivity).toBeInstanceOf(Date);
            expect(stats.expiresAt).toBeInstanceOf(Date);
        });

        test('should return null stats when no session exists', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const stats = sessionManager.getSessionStats();

            expect(stats).toBeNull();
        });

        test('should calculate time remaining correctly', () => {
            const sessionData = {
                user: { id: 1, email: 'test@example.com' },
                startTime: Date.now(),
                lastActivity: Date.now(),
                rememberMe: false,
                sessionId: 'test_session_id',
                expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes from now
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

            const timeRemaining = sessionManager.getTimeRemaining();

            expect(timeRemaining).toBeGreaterThan(14 * 60 * 1000); // At least 14 minutes
            expect(timeRemaining).toBeLessThanOrEqual(15 * 60 * 1000); // At most 15 minutes
        });
    });

    describe('Utility Functions', () => {
        test('should throttle function calls', () => {
            const mockFn = jest.fn();
            const throttledFn = sessionManager.throttle(mockFn, 1000);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(mockFn).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(1000);

            throttledFn();

            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        test('should generate unique session IDs', () => {
            const id1 = sessionManager.generateSessionId();
            const id2 = sessionManager.generateSessionId();

            expect(id1).not.toBe(id2);
            expect(id1).toHaveLength(32);
            expect(id2).toHaveLength(32);
        });
    });
});
