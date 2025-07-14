/**
 * Global Test Setup
 * Runs once before all tests
 */

module.exports = async () => {
    console.log('🚀 Starting Ardonie Capital test suite...');
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.TEST_TIMEOUT = '10000';
    
    // Mock external services
    process.env.MOCK_API = 'true';
    process.env.MOCK_STORAGE = 'true';
    
    // Set up test database or external services if needed
    // This is where you would initialize test databases, start mock servers, etc.
    
    console.log('✅ Global test setup completed');
};
