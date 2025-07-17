# Testing Guide - Ardonie Capital Platform

## Overview

This guide covers the comprehensive testing strategy for the Ardonie Capital platform, including unit tests, integration tests, and end-to-end testing.

## Test Structure

### Directory Organization
```
tests/
├── setup.js                    # Global test setup and utilities
├── global-setup.js            # Global setup (runs once before all tests)
├── global-teardown.js         # Global teardown (runs once after all tests)
├── shared/
│   ├── utils/
│   │   ├── validation.utils.test.js
│   │   ├── formatting.utils.test.js
│   │   ├── storage.utils.test.js
│   │   └── ui.utils.test.js
│   └── components/
│       ├── button.component.test.js
│       ├── modal.component.test.js
│       ├── card.component.test.js
│       └── input.component.test.js
├── features/
│   ├── authentication/
│   │   ├── auth.service.test.js
│   │   ├── password-validator.test.js
│   │   └── session-manager.test.js
│   ├── dashboard/
│   │   ├── dashboard.service.test.js
│   │   └── analytics.service.test.js
│   └── marketplace/
│       ├── marketplace.service.test.js
│       └── listing.service.test.js
└── integration/
    ├── auth-flow.test.js
    ├── dashboard-integration.test.js
    └── marketplace-integration.test.js
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Feature-Specific Tests
```bash
# Test shared utilities
npm run test:shared

# Test authentication features
npm run test:auth

# Test dashboard features
npm run test:dashboard

# Test marketplace features
npm run test:marketplace

# Test UI components
npm run test:components
```

### Debug and Maintenance
```bash
# Debug tests
npm run test:debug

# Clear Jest cache
npm run test:clear-cache

# Open coverage report
npm run coverage:open
```

## Test Categories

### 1. Unit Tests
Test individual functions, classes, and components in isolation.

**Coverage Areas:**
- Utility functions (validation, formatting, storage)
- Service classes (auth, dashboard, marketplace)
- UI components (button, modal, card, input)
- Business logic functions

**Example:**
```javascript
describe('ValidationUtils', () => {
    test('should validate email addresses correctly', () => {
        expect(validationUtils.validateEmail('test@example.com')).toEqual({
            isValid: true,
            error: null
        });
    });
});
```

### 2. Integration Tests
Test how different modules work together.

**Coverage Areas:**
- Authentication flow (login → dashboard)
- Data flow between services
- Component interactions
- API integrations

**Example:**
```javascript
describe('Authentication Flow', () => {
    test('should login and redirect to dashboard', async () => {
        const result = await authService.login('user@example.com', 'password');
        expect(result.success).toBe(true);
        expect(window.location.href).toContain('dashboard');
    });
});
```

### 3. Component Tests
Test UI components for rendering, interaction, and accessibility.

**Coverage Areas:**
- Component rendering
- User interactions (click, keyboard)
- State management
- Accessibility features

**Example:**
```javascript
describe('ButtonComponent', () => {
    test('should render with correct text and handle clicks', () => {
        const button = new ButtonComponent();
        const element = button.create('Click Me');
        
        expect(element.textContent).toBe('Click Me');
        
        const clickHandler = jest.fn();
        button.onClick(clickHandler);
        element.click();
        
        expect(clickHandler).toHaveBeenCalled();
    });
});
```

## Test Utilities

### TestUtils
Provides common testing utilities:

```javascript
import { TestUtils } from '../setup.js';

// Create mock DOM elements
const element = TestUtils.createElement('button', { id: 'test-btn' });

// Create mock events
const clickEvent = TestUtils.createEvent('click', { clientX: 100 });

// Wait for conditions
await TestUtils.waitFor(() => element.classList.contains('active'));

// Mock fetch responses
global.fetch = jest.fn(() => TestUtils.mockFetch({ success: true }));

// Mock localStorage
global.localStorage = TestUtils.mockLocalStorage();
```

### Test Data
Create consistent test data:

```javascript
// Create test user
const user = TestUtils.createTestData('user', {
    email: 'custom@example.com'
});

// Create test listing
const listing = TestUtils.createTestData('listing', {
    price: 150000
});
```

## Mocking Strategy

### External Dependencies
```javascript
// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
global.localStorage = TestUtils.mockLocalStorage();

// Mock DOM APIs
global.document.createElement = jest.fn(() => TestUtils.createElement('div'));
```

### Service Dependencies
```javascript
// Mock authentication service
jest.mock('../../../src/features/authentication/auth.service.js', () => ({
    authService: {
        login: jest.fn(),
        logout: jest.fn(),
        getCurrentUser: jest.fn()
    }
}));
```

## Coverage Requirements

### Global Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Module-Specific Thresholds
- **Shared Utilities**: 90%
- **Authentication**: 85%
- **Components**: 85%

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`

## Best Practices

### 1. Test Structure
```javascript
describe('FeatureName', () => {
    beforeEach(() => {
        // Setup for each test
    });

    describe('specific functionality', () => {
        test('should do something specific', () => {
            // Arrange
            const input = 'test data';
            
            // Act
            const result = functionUnderTest(input);
            
            // Assert
            expect(result).toBe('expected output');
        });
    });
});
```

### 2. Descriptive Test Names
```javascript
// Good
test('should validate email and return error for invalid format')

// Bad
test('email validation')
```

### 3. Test Independence
```javascript
beforeEach(() => {
    // Reset state before each test
    TestUtils.resetMocks();
    authService.currentUser = null;
});
```

### 4. Mock External Dependencies
```javascript
// Mock external APIs
beforeEach(() => {
    global.fetch = jest.fn();
});

// Mock browser APIs
beforeEach(() => {
    global.localStorage = TestUtils.mockLocalStorage();
});
```

### 5. Test Error Conditions
```javascript
test('should handle network errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    const result = await authService.login('user@example.com', 'password');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
});
```

## Accessibility Testing

### ARIA Attributes
```javascript
test('should have proper ARIA attributes', () => {
    const button = new ButtonComponent();
    const element = button.create('Submit');
    
    expect(element.getAttribute('role')).toBe('button');
    expect(element.getAttribute('aria-label')).toBeTruthy();
});
```

### Keyboard Navigation
```javascript
test('should be keyboard accessible', () => {
    const button = new ButtonComponent();
    const element = button.create('Submit');
    
    const enterEvent = TestUtils.createEvent('keydown', { key: 'Enter' });
    element.dispatchEvent(enterEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
});
```

## Performance Testing

### Memory Leaks
```javascript
test('should clean up event listeners on destroy', () => {
    const component = new ButtonComponent();
    const element = component.create('Test');
    
    const removeEventListener = jest.spyOn(element, 'removeEventListener');
    
    component.destroy();
    
    expect(removeEventListener).toHaveBeenCalled();
});
```

### Bundle Size
```javascript
test('should not exceed bundle size limits', () => {
    const componentSize = getComponentSize(ButtonComponent);
    expect(componentSize).toBeLessThan(10000); // 10KB limit
});
```

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v2
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint:fix && npm run test:ci"
    }
  }
}
```

## Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
npm run test:debug

# Debug specific test file
npx jest --debug path/to/test.js
```

### Console Output
```javascript
test('debug test', () => {
    console.log('Debug info:', testData);
    // Test implementation
});
```

### Snapshot Testing
```javascript
test('should match snapshot', () => {
    const component = new ButtonComponent();
    const element = component.create('Test');
    
    expect(element.outerHTML).toMatchSnapshot();
});
```

## Reporting

### HTML Reports
Generated at `coverage/html-report/report.html`

### JUnit Reports
Generated at `coverage/junit.xml` for CI/CD integration

### Sonar Reports
Generated for SonarQube integration

## Troubleshooting

### Common Issues

1. **Module not found**
   ```bash
   # Clear Jest cache
   npm run test:clear-cache
   ```

2. **Timeout errors**
   ```javascript
   // Increase timeout for specific tests
   test('slow test', async () => {
       // Test implementation
   }, 15000); // 15 second timeout
   ```

3. **Memory issues**
   ```bash
   # Run tests with more memory
   node --max-old-space-size=4096 node_modules/.bin/jest
   ```

## Conclusion

This testing strategy ensures:
- **High code quality** through comprehensive coverage
- **Reliable functionality** through thorough testing
- **Maintainable codebase** through good test practices
- **Continuous integration** through automated testing
- **Developer confidence** through robust test suite

Follow this guide to maintain and extend the test suite as the platform grows.
