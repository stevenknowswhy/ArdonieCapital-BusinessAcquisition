/**
 * Jest Configuration for Ardonie Capital Platform
 * Comprehensive test configuration with coverage and reporting
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Files to ignore during transformation
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/index.js',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/shared/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/features/authentication/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/shared/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Notify mode
  notify: false,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Ardonie Capital Test Report'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Watch ignore patterns
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Force exit after tests complete
  forceExit: false,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Preset
  preset: null,
  
  // Projects (for multi-project setup)
  projects: [
    {
      displayName: 'Shared Utilities',
      testMatch: ['<rootDir>/tests/shared/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/shared'
    },
    {
      displayName: 'Authentication',
      testMatch: ['<rootDir>/tests/features/authentication/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/authentication'
    },
    {
      displayName: 'Dashboard',
      testMatch: ['<rootDir>/tests/features/dashboard/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/dashboard'
    },
    {
      displayName: 'Marketplace',
      testMatch: ['<rootDir>/tests/features/marketplace/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/marketplace'
    },
    {
      displayName: 'Components',
      testMatch: ['<rootDir>/tests/shared/components/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/components'
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/integration'
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      coverageDirectory: '<rootDir>/coverage/e2e'
    }
  ],
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Test name pattern
  testNamePattern: undefined,
  
  // Update snapshot
  updateSnapshot: false,
  
  // Use stderr
  useStderr: false,
  
  // Watch
  watch: false,
  
  // Watch all
  watchAll: false
};
