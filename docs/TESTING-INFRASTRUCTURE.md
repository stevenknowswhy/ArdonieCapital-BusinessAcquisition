# Testing Infrastructure Documentation

## Overview

This document describes the comprehensive testing infrastructure implemented for the Ardonie Capital platform, providing multiple layers of testing to ensure code quality, reliability, and performance.

## Testing Architecture

### Testing Pyramid Structure

```
                    E2E Tests
                   /           \
              Integration Tests
             /                   \
        Unit Tests (Foundation)
```

1. **Unit Tests** (Foundation) - Test individual components and functions in isolation
2. **Integration Tests** (Middle) - Test interactions between modules and services
3. **End-to-End Tests** (Top) - Test complete user workflows and scenarios

## Test Configuration

### Jest Configuration (`jest.config.js`)

Our Jest configuration provides:
- **Multi-project setup** for different test types
- **Coverage thresholds** with specific targets per module
- **Custom reporters** for HTML and JUnit output
- **Module path mapping** for clean imports
- **Global setup/teardown** for test environment

```javascript
// Key configuration highlights
{
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    './src/shared/utils/': { branches: 90, functions: 90, lines: 90, statements: 90 }
  },
  projects: [
    { displayName: 'Shared Utilities', testMatch: ['<rootDir>/tests/shared/**/*.test.js'] },
    { displayName: 'Authentication', testMatch: ['<rootDir>/tests/features/authentication/**/*.test.js'] },
    { displayName: 'Dashboard', testMatch: ['<rootDir>/tests/features/dashboard/**/*.test.js'] },
    { displayName: 'Marketplace', testMatch: ['<rootDir>/tests/features/marketplace/**/*.test.js'] }
  ]
}
```

### Test Scripts (`package.json`)

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --watchAll=false",
  "test:shared": "jest --selectProjects=\"Shared Utilities\"",
  "test:auth": "jest --selectProjects=\"Authentication\"",
  "test:dashboard": "jest --selectProjects=\"Dashboard\"",
  "test:marketplace": "jest --selectProjects=\"Marketplace\"",
  "test:components": "jest --selectProjects=\"Components\"",
  "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
}
```

## Test Structure

### Directory Organization

```
tests/
├── setup.js                           # Global test setup and utilities
├── global-setup.js                    # Jest global setup
├── global-teardown.js                 # Jest global teardown
├── features/                          # Feature-specific tests
│   ├── authentication/
│   │   └── auth.service.test.js       # Authentication service tests
│   ├── dashboard/
│   │   └── dashboard.service.test.js  # Dashboard service tests
│   └── marketplace/
│       └── marketplace.service.test.js # Marketplace service tests
├── shared/                            # Shared module tests
│   ├── utils/
│   │   ├── validation.utils.test.js   # Validation utility tests
│   │   └── formatting.utils.test.js   # Formatting utility tests
│   └── components/
│       └── header.component.test.js   # Header component tests
├── integration/                       # Integration tests
│   └── auth-dashboard.integration.test.js
└── e2e/                              # End-to-end tests
    └── user-journey.e2e.test.js
```

## Test Utilities

### TestUtils Class (`tests/setup.js`)

Comprehensive utilities for testing:

```javascript
export const TestUtils = {
  // DOM manipulation
  createElement(tagName, attributes = {}) { /* Mock DOM elements */ },
  createEvent(type, properties = {}) { /* Mock events */ },
  
  // Async utilities
  wait(ms) { /* Promise-based delays */ },
  waitFor(condition, timeout = 5000) { /* Condition waiting */ },
  
  // Mock utilities
  mockFetch(data, status = 200) { /* Mock fetch responses */ },
  mockLocalStorage() { /* Mock localStorage */ },
  mockConsole() { /* Mock console methods */ },
  
  // Test data generation
  createTestData(type, overrides = {}) { /* Generate test data */ },
  
  // Mock management
  resetMocks() { /* Reset all mocks */ }
};
```

### TestAssertions Class

Custom assertions for common testing patterns:

```javascript
export const TestAssertions = {
  toHaveClass(element, className) { /* Assert CSS class */ },
  toHaveAttribute(element, attribute, value) { /* Assert attributes */ },
  toHaveBeenCalledWith(fn, ...args) { /* Assert function calls */ },
  async toResolve(promise) { /* Assert promise resolution */ },
  async toReject(promise, errorMessage) { /* Assert promise rejection */ }
};
```

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, classes, and components in isolation

**Examples**:
- Authentication service methods (login, register, logout)
- Validation utility functions (email, phone, password)
- Dashboard service analytics calculations
- Marketplace service filtering and sorting

**Key Features**:
- Mock external dependencies
- Test edge cases and error conditions
- Verify input validation
- Check return values and side effects

```javascript
// Example unit test
describe('AuthService', () => {
  test('should login successfully with valid credentials', async () => {
    const mockResponse = { success: true, user: mockUser, token: 'token' };
    mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

    const result = await authService.login('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
    expect(authService.isAuthenticated).toBe(true);
  });
});
```

### 2. Integration Tests

**Purpose**: Test interactions between different modules and services

**Examples**:
- Authentication + Dashboard integration
- Marketplace + User profile integration
- Component + Service interactions

**Key Features**:
- Test module boundaries
- Verify data flow between services
- Check session management
- Test role-based access control

```javascript
// Example integration test
describe('Authentication-Dashboard Integration', () => {
  test('should allow dashboard access when authenticated', async () => {
    // Login user
    const loginResult = await authService.login('test@example.com', 'password123');
    expect(loginResult.success).toBe(true);

    // Access dashboard
    const dashboardResult = await dashboardService.getAnalytics();
    expect(dashboardResult.success).toBe(true);
    
    // Verify auth token was sent
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/dashboard/analytics',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`
        })
      })
    );
  });
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows from start to finish

**Examples**:
- User registration to dashboard access
- Marketplace browsing to inquiry submission
- Login session management across pages

**Key Features**:
- Test complete user journeys
- Verify cross-page functionality
- Check session persistence
- Test error recovery flows

```javascript
// Example E2E test
describe('User Journey E2E Tests', () => {
  test('should complete full registration to dashboard flow', async () => {
    // Step 1: User registration
    const registrationResult = await simulateRegistration(userData);
    expect(registrationResult.success).toBe(true);

    // Step 2: Redirect to dashboard
    expect(mockWindow.location.href).toContain('/dashboard/');

    // Step 3: Dashboard loads with user data
    const dashboardResult = await simulateDashboardLoad();
    expect(dashboardResult.success).toBe(true);
  });
});
```

## Advanced Testing Features

### 1. Coverage Analysis

**Thresholds**:
- Global: 80% coverage (branches, functions, lines, statements)
- Shared utilities: 90% coverage (higher standard for core utilities)
- Authentication: 85% coverage (critical security component)

**Reports**:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- JSON format: `coverage/coverage-final.json`

### 2. Performance Testing

**Benchmarks**:
- Authentication service response time < 100ms
- Dashboard data loading < 200ms
- Marketplace search < 300ms
- Component render time < 50ms

### 3. Test Runner Script

**Advanced test runner** (`scripts/test-runner.js`) provides:
- **Selective test execution** (unit, integration, e2e, performance)
- **Comprehensive reporting** with JSON and Markdown output
- **Performance benchmarking** with target validation
- **Coverage analysis** with threshold checking
- **Recommendations** for improvement

**Usage**:
```bash
# Run all tests
node scripts/test-runner.js --all

# Run specific test types
node scripts/test-runner.js --unit --integration
node scripts/test-runner.js --e2e --performance
node scripts/test-runner.js --coverage
```

## Test Data Management

### Mock Data Generation

```javascript
// Centralized test data creation
const testData = {
  user: {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'buyer',
    verified: true
  },
  listing: {
    id: '456',
    title: 'Test Business',
    price: 100000,
    category: 'technology'
  },
  dashboard: {
    analytics: {
      totalViews: 1000,
      totalInquiries: 50,
      conversionRate: 5.0
    }
  }
};

// Usage
const mockUser = TestUtils.createTestData('user', { role: 'seller' });
```

### Environment Setup

**Global Setup** (`tests/global-setup.js`):
- Initialize test database
- Set up mock services
- Configure test environment variables

**Global Teardown** (`tests/global-teardown.js`):
- Clean up test data
- Close database connections
- Reset environment state

## Best Practices

### 1. Test Organization
- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the expected behavior
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests independent** and isolated

### 2. Mock Management
- **Reset mocks** between tests using `beforeEach`
- **Mock external dependencies** (APIs, localStorage, etc.)
- **Use realistic mock data** that represents actual usage
- **Verify mock interactions** when testing side effects

### 3. Async Testing
- **Always await** async operations in tests
- **Use proper error handling** for rejected promises
- **Test both success and failure scenarios**
- **Set appropriate timeouts** for long-running operations

### 4. Coverage Goals
- **Aim for high coverage** but focus on meaningful tests
- **Test edge cases** and error conditions
- **Cover all code paths** including error handling
- **Don't test implementation details**, test behavior

## Continuous Integration

### CI Pipeline Integration

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

### Quality Gates

- **All tests must pass** before merging
- **Coverage must meet thresholds** (80% global, 90% utilities)
- **No critical performance regressions**
- **Integration tests must pass** for cross-module changes

## Debugging Tests

### Debug Configuration

```bash
# Debug specific test
npm run test:debug -- --testNamePattern="should login successfully"

# Debug with breakpoints
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="AuthService"
```

### Common Issues

1. **Async test failures**: Ensure all promises are awaited
2. **Mock leakage**: Reset mocks between tests
3. **DOM cleanup**: Clear DOM state after component tests
4. **Memory leaks**: Properly clean up event listeners and timers

## Reporting and Analytics

### Test Reports

- **HTML Report**: Visual test results with drill-down capability
- **JUnit XML**: CI/CD integration format
- **JSON Report**: Programmatic analysis and custom reporting
- **Coverage Report**: Detailed coverage analysis with line-by-line view

### Metrics Tracking

- **Test execution time** trends
- **Coverage percentage** over time
- **Flaky test** identification
- **Performance benchmark** tracking

## Conclusion

This testing infrastructure provides:
- **Comprehensive coverage** across all application layers
- **Automated quality assurance** with CI/CD integration
- **Performance monitoring** with benchmark validation
- **Developer-friendly tools** for debugging and analysis
- **Scalable architecture** that grows with the application

The testing strategy ensures **high code quality**, **reliable deployments**, and **confident refactoring** while maintaining **fast feedback loops** for developers.
