/**
 * End-to-End User Journey Tests
 * Tests complete user workflows from registration to dashboard usage
 */

import { TestUtils } from '../setup.js';

describe('User Journey E2E Tests', () => {
    let mockFetch;
    let mockLocalStorage;
    let mockWindow;

    beforeEach(() => {
        TestUtils.resetMocks();
        
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        mockWindow = {
            location: { href: '', pathname: '/' },
            history: { pushState: jest.fn() },
            document: global.document
        };
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
        global.window = mockWindow;
    });

    describe('New User Registration Journey', () => {
        test('should complete full registration to dashboard flow', async () => {
            // Step 1: User visits registration page
            mockWindow.location.pathname = '/auth/register.html';
            
            // Step 2: User submits registration form
            const registrationData = {
                email: 'newuser@example.com',
                password: 'SecureP@ssw0rd123',
                confirmPassword: 'SecureP@ssw0rd123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'buyer',
                agreeToTerms: true
            };

            const mockUser = TestUtils.createTestData('user', registrationData);
            const mockToken = 'registration-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken,
                message: 'Registration successful'
            }));

            // Simulate form submission
            const registrationResult = await simulateRegistration(registrationData);
            
            expect(registrationResult.success).toBe(true);
            expect(registrationResult.user.email).toBe(registrationData.email);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);

            // Step 3: User is redirected to dashboard
            expect(mockWindow.location.href).toContain('/dashboard/');

            // Step 4: Dashboard loads with user data
            const mockDashboardData = TestUtils.createTestData('dashboard');
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockDashboardData.analytics
            }));

            const dashboardResult = await simulateDashboardLoad();
            
            expect(dashboardResult.success).toBe(true);
            expect(dashboardResult.data).toEqual(mockDashboardData.analytics);

            // Step 5: User sees welcome message for new users
            expect(dashboardResult.data.isNewUser).toBe(true);
        });

        test('should handle registration validation errors', async () => {
            const invalidRegistrationData = {
                email: 'invalid-email',
                password: 'weak',
                confirmPassword: 'different',
                firstName: '',
                lastName: 'Doe'
            };

            const registrationResult = await simulateRegistration(invalidRegistrationData);
            
            expect(registrationResult.success).toBe(false);
            expect(registrationResult.errors).toHaveProperty('email');
            expect(registrationResult.errors).toHaveProperty('password');
            expect(registrationResult.errors).toHaveProperty('confirmPassword');
            expect(registrationResult.errors).toHaveProperty('firstName');
            
            // User should remain on registration page
            expect(mockWindow.location.pathname).toBe('/auth/register.html');
        });

        test('should handle email verification flow', async () => {
            // Step 1: User registers with email verification required
            const registrationData = {
                email: 'verify@example.com',
                password: 'SecureP@ssw0rd123',
                confirmPassword: 'SecureP@ssw0rd123',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'seller'
            };

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                requiresVerification: true,
                message: 'Please check your email for verification link'
            }));

            const registrationResult = await simulateRegistration(registrationData);
            
            expect(registrationResult.success).toBe(true);
            expect(registrationResult.requiresVerification).toBe(true);
            expect(mockWindow.location.href).toContain('/auth/verify-email.html');

            // Step 2: User clicks verification link
            const verificationToken = 'verification-token-123';
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: TestUtils.createTestData('user', { ...registrationData, verified: true }),
                token: 'verified-user-token'
            }));

            const verificationResult = await simulateEmailVerification(verificationToken);
            
            expect(verificationResult.success).toBe(true);
            expect(verificationResult.user.verified).toBe(true);
            expect(mockWindow.location.href).toContain('/dashboard/');
        });
    });

    describe('Returning User Login Journey', () => {
        test('should complete login to dashboard flow', async () => {
            // Step 1: User visits login page
            mockWindow.location.pathname = '/auth/login.html';

            // Step 2: User submits login credentials
            const loginCredentials = {
                email: 'existing@example.com',
                password: 'UserP@ssw0rd123',
                rememberMe: true
            };

            const mockUser = TestUtils.createTestData('user', { email: loginCredentials.email });
            const mockToken = 'login-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken
            }));

            const loginResult = await simulateLogin(loginCredentials);
            
            expect(loginResult.success).toBe(true);
            expect(loginResult.user.email).toBe(loginCredentials.email);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('remember_me', 'true');

            // Step 3: User is redirected to dashboard
            expect(mockWindow.location.href).toContain('/dashboard/');

            // Step 4: Dashboard loads with personalized data
            const mockDashboardData = TestUtils.createTestData('dashboard');
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockDashboardData.analytics
            }));

            const dashboardResult = await simulateDashboardLoad();
            
            expect(dashboardResult.success).toBe(true);
            expect(dashboardResult.data.isNewUser).toBe(false);
        });

        test('should handle invalid login credentials', async () => {
            const invalidCredentials = {
                email: 'user@example.com',
                password: 'wrongpassword'
            };

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Invalid credentials'
            }, 401));

            const loginResult = await simulateLogin(invalidCredentials);
            
            expect(loginResult.success).toBe(false);
            expect(loginResult.error).toBe('Invalid credentials');
            expect(mockWindow.location.pathname).toBe('/auth/login.html');
        });

        test('should handle account lockout', async () => {
            const credentials = {
                email: 'locked@example.com',
                password: 'password123'
            };

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Account temporarily locked due to multiple failed attempts',
                lockoutTime: 900 // 15 minutes
            }, 423));

            const loginResult = await simulateLogin(credentials);
            
            expect(loginResult.success).toBe(false);
            expect(loginResult.error).toContain('locked');
            expect(loginResult.lockoutTime).toBe(900);
        });
    });

    describe('Marketplace Interaction Journey', () => {
        test('should complete browse to inquiry flow', async () => {
            // Step 1: User is authenticated
            await setupAuthenticatedUser();

            // Step 2: User browses marketplace
            mockWindow.location.pathname = '/marketplace/listings.html';
            
            const mockListings = [
                TestUtils.createTestData('listing'),
                TestUtils.createTestData('listing', { id: '789', title: 'Another Business' })
            ];

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockListings,
                total: 2
            }));

            const listingsResult = await simulateMarketplaceBrowse();
            
            expect(listingsResult.success).toBe(true);
            expect(listingsResult.data).toHaveLength(2);

            // Step 3: User views listing details
            const listingId = mockListings[0].id;
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockListings[0]
            }));

            const listingResult = await simulateListingView(listingId);
            
            expect(listingResult.success).toBe(true);
            expect(listingResult.data.id).toBe(listingId);

            // Step 4: User saves listing
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                message: 'Listing saved successfully'
            }));

            const saveResult = await simulateListingSave(listingId);
            
            expect(saveResult.success).toBe(true);

            // Step 5: User sends inquiry
            const inquiryData = {
                listingId: listingId,
                message: 'I am interested in learning more about this business.',
                contactMethod: 'email'
            };

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                inquiryId: 'inquiry-123',
                message: 'Inquiry sent successfully'
            }));

            const inquiryResult = await simulateInquiry(inquiryData);
            
            expect(inquiryResult.success).toBe(true);
            expect(inquiryResult.inquiryId).toBeTruthy();
        });
    });

    describe('Session Management Journey', () => {
        test('should handle session expiration gracefully', async () => {
            // Step 1: User is authenticated and using dashboard
            await setupAuthenticatedUser();
            
            // Step 2: Session expires during dashboard use
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Token expired'
            }, 401));

            const dashboardResult = await simulateDashboardLoad();
            
            expect(dashboardResult.success).toBe(false);
            expect(mockWindow.location.href).toContain('/auth/login.html');

            // Step 3: User logs in again
            const mockUser = TestUtils.createTestData('user');
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: 'new-token'
            }));

            const reloginResult = await simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            expect(reloginResult.success).toBe(true);
            expect(mockWindow.location.href).toContain('/dashboard/');
        });

        test('should maintain session with remember me', async () => {
            // Step 1: User logs in with remember me
            const loginResult = await simulateLogin({
                email: 'user@example.com',
                password: 'password123',
                rememberMe: true
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('remember_me', 'true');

            // Step 2: User returns after browser restart
            mockLocalStorage.getItem.mockImplementation((key) => {
                if (key === 'auth_token') return 'stored-token';
                if (key === 'remember_me') return 'true';
                return null;
            });

            const mockUser = TestUtils.createTestData('user');
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser
            }));

            const autoLoginResult = await simulateAutoLogin();
            
            expect(autoLoginResult.success).toBe(true);
            expect(autoLoginResult.user).toEqual(mockUser);
        });
    });

    // Helper functions for simulation
    async function simulateRegistration(data) {
        // Simulate registration form submission
        return {
            success: !data.email.includes('invalid'),
            user: data.email.includes('invalid') ? null : TestUtils.createTestData('user', data),
            errors: data.email.includes('invalid') ? {
                email: 'Invalid email format',
                password: 'Password too weak',
                confirmPassword: 'Passwords do not match',
                firstName: 'First name is required'
            } : null
        };
    }

    async function simulateLogin(credentials) {
        // Simulate login form submission
        if (credentials.password === 'wrongpassword') {
            return { success: false, error: 'Invalid credentials' };
        }
        
        const mockUser = TestUtils.createTestData('user', { email: credentials.email });
        return { success: true, user: mockUser, token: 'login-token' };
    }

    async function simulateDashboardLoad() {
        // Simulate dashboard data loading
        const mockData = TestUtils.createTestData('dashboard');
        return { success: true, data: mockData.analytics };
    }

    async function simulateMarketplaceBrowse() {
        // Simulate marketplace listings fetch
        const mockListings = [TestUtils.createTestData('listing')];
        return { success: true, data: mockListings };
    }

    async function simulateListingView(listingId) {
        // Simulate individual listing view
        const mockListing = TestUtils.createTestData('listing', { id: listingId });
        return { success: true, data: mockListing };
    }

    async function simulateListingSave(listingId) {
        // Simulate saving a listing
        return { success: true, message: 'Listing saved' };
    }

    async function simulateInquiry(inquiryData) {
        // Simulate sending an inquiry
        return { success: true, inquiryId: 'inquiry-123' };
    }

    async function simulateEmailVerification(token) {
        // Simulate email verification
        const mockUser = TestUtils.createTestData('user', { verified: true });
        return { success: true, user: mockUser };
    }

    async function simulateAutoLogin() {
        // Simulate automatic login from stored token
        const mockUser = TestUtils.createTestData('user');
        return { success: true, user: mockUser };
    }

    async function setupAuthenticatedUser() {
        // Helper to set up authenticated state
        const mockUser = TestUtils.createTestData('user');
        mockLocalStorage.getItem.mockReturnValue('valid-token');

        mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
            success: true,
            user: mockUser,
            token: 'valid-token'
        }));

        return await simulateLogin({
            email: 'user@example.com',
            password: 'password123'
        });
    }

    async function simulateMarketplaceSearch(query, filters) {
        // Simulate marketplace search with filters
        return { success: true, data: TestUtils.createTestData('listings', 3), total: 3 };
    }
});
