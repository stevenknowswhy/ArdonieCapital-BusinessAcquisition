/**
 * Global Test Teardown
 * Runs once after all tests
 */

module.exports = async () => {
    console.log('🧹 Cleaning up after test suite...');
    
    // Clean up test databases, stop mock servers, etc.
    // This is where you would tear down any global test infrastructure
    
    console.log('✅ Global test teardown completed');
};
