# Developer Onboarding Guide - Ardonie Capital Platform

## Welcome to the Development Team

This guide will help you get up and running as a developer on the Ardonie Capital platform. We use a modern, modular architecture with comprehensive testing and deployment automation.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   npm --version
   ```

2. **Git** (latest version)
   ```bash
   # Check version
   git --version
   ```

3. **Code Editor** (VS Code recommended)
   - Install recommended extensions (see `.vscode/extensions.json`)

4. **Browser** (Chrome/Firefox with dev tools)

### Optional but Recommended

1. **AWS CLI** (for deployment)
   ```bash
   # macOS
   brew install awscli
   
   # Windows/Linux
   # Follow AWS CLI installation guide
   ```

2. **Docker** (for local services)
3. **Postman** or similar API testing tool

## Project Setup

### 1. Repository Access

1. **Clone the Repository**
   ```bash
   git clone https://github.com/stevenknowswhy/ArdonieCapital-BusinessAcquisition.git
   cd ArdonieCapital-BusinessAcquisition
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Verify Setup**
   ```bash
   # Run verification script
   node verify-setup.js
   
   # Start development server
   python3 -m http.server 8000
   
   # Open browser to http://localhost:8000
   ```

### 2. Development Environment

1. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your local settings
   nano .env.local
   ```

2. **VS Code Setup**
   ```bash
   # Install recommended extensions
   code --install-extension esbenp.prettier-vscode
   code --install-extension ms-vscode.vscode-eslint
   code --install-extension bradlc.vscode-tailwindcss
   ```

3. **Git Configuration**
   ```bash
   # Set up git hooks
   npm run prepare
   
   # Configure git user (if not already done)
   git config user.name "Your Name"
   git config user.email "your.email@company.com"
   ```

## Architecture Overview

### 1. Project Structure

```
ardonie-capital/
├── src/                    # Modular source code
│   ├── features/          # Feature-based modules
│   │   ├── authentication/
│   │   ├── marketplace/
│   │   ├── dashboard/
│   │   └── blog/
│   └── shared/            # Shared utilities
├── assets/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Legacy JavaScript
│   └── images/           # Images and media
├── tests/                 # Test suites
├── docs/                  # Documentation
├── scripts/              # Build and utility scripts
└── dist/                 # Production build output
```

### 2. Modular Architecture

**Feature-Based Organization:**
- Each feature is self-contained
- Clear public APIs via `index.js` files
- Minimal cross-feature dependencies
- Easy to test and maintain

**Key Principles:**
- **Separation of Concerns:** Each module has a single responsibility
- **Dependency Injection:** Services are injected, not imported directly
- **Interface Segregation:** Small, focused interfaces
- **Open/Closed Principle:** Open for extension, closed for modification

### 3. Technology Stack

**Frontend:**
- **HTML5** with semantic markup
- **Tailwind CSS** for styling
- **Vanilla JavaScript** with ES6+ modules
- **Service Workers** for caching and offline support

**Build Tools:**
- **Node.js** for build scripts
- **Jest** for testing
- **ESLint** for code quality
- **Prettier** for code formatting

**Deployment:**
- **AWS S3** for static hosting
- **CloudFront** for CDN
- **GitHub Actions** for CI/CD

## Development Workflow

### 1. Feature Development

**Branch Strategy:**
```bash
# Create feature branch
git checkout -b feature/marketplace-filters

# Work on feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat: add advanced marketplace filters"

# Push and create PR
git push origin feature/marketplace-filters
```

**Commit Message Format:**
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### 2. Code Standards

**JavaScript Style:**
```javascript
// Use ES6+ features
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

// Use destructuring
const { name, email, role } = user;

// Use template literals
const message = `Welcome ${name}!`;

// Use arrow functions for callbacks
const activeUsers = users.filter(user => user.active);
```

**CSS/Tailwind Standards:**
```html
<!-- Use semantic HTML -->
<article class="bg-white rounded-lg shadow-md p-6">
  <header class="mb-4">
    <h2 class="text-xl font-semibold text-gray-900">Article Title</h2>
  </header>
  <main class="prose prose-gray max-w-none">
    <!-- Content -->
  </main>
</article>

<!-- Use consistent spacing -->
<div class="space-y-4">
  <div class="p-4 bg-gray-50 rounded">Item 1</div>
  <div class="p-4 bg-gray-50 rounded">Item 2</div>
</div>
```

### 3. Testing Requirements

**Unit Tests:**
```javascript
// tests/features/authentication/auth.service.test.js
import { AuthService } from '../../../src/features/authentication';

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('should login with valid credentials', async () => {
    const result = await authService.login('test@example.com', 'password');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    await expect(
      authService.login('test@example.com', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

**Integration Tests:**
```javascript
// tests/integration/marketplace.test.js
describe('Marketplace Integration', () => {
  test('should load listings page', async () => {
    const response = await fetch('/marketplace/listings.html');
    expect(response.status).toBe(200);
    
    const html = await response.text();
    expect(html).toContain('marketplace-listings');
  });
});
```

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service.test.js

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

## Working with Features

### 1. Creating a New Feature

**Step 1: Create Feature Structure**
```bash
mkdir -p src/features/new-feature/{components,services,utils,tests}
touch src/features/new-feature/index.js
```

**Step 2: Implement Feature**
```javascript
// src/features/new-feature/services/new-feature.service.js
export class NewFeatureService {
  constructor() {
    this.baseUrl = '/api/new-feature';
  }

  async getData() {
    try {
      const response = await fetch(this.baseUrl);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }
}
```

**Step 3: Create Public API**
```javascript
// src/features/new-feature/index.js
export { NewFeatureService } from './services/new-feature.service.js';
export { NewFeatureComponent } from './components/new-feature.component.js';
```

**Step 4: Add Tests**
```javascript
// src/features/new-feature/tests/new-feature.service.test.js
import { NewFeatureService } from '../services/new-feature.service.js';

describe('NewFeatureService', () => {
  // Add tests here
});
```

### 2. Modifying Existing Features

**Best Practices:**
1. **Understand the Feature:** Read existing code and tests
2. **Check Dependencies:** See what other features depend on this one
3. **Write Tests First:** Add tests for new functionality
4. **Maintain Backward Compatibility:** Don't break existing APIs
5. **Update Documentation:** Keep docs current

### 3. Feature Integration

**Adding to Pages:**
```html
<!-- In HTML file -->
<script type="module">
  import { NewFeatureService } from '/src/features/new-feature/index.js';
  
  const service = new NewFeatureService();
  // Use the service
</script>
```

**Dynamic Loading:**
```javascript
// Lazy load features
const loadFeature = async () => {
  try {
    const { NewFeatureService } = await import('/src/features/new-feature/index.js');
    return new NewFeatureService();
  } catch (error) {
    console.error('Failed to load feature:', error);
    return null;
  }
};
```

## Debugging and Troubleshooting

### 1. Common Issues

**Module Loading Errors:**
```javascript
// Problem: Module not found
// Solution: Check file paths and exports

// Correct export
export { MyService } from './services/my-service.js';

// Correct import
import { MyService } from '/src/features/my-feature/index.js';
```

**CORS Issues:**
```javascript
// Problem: CORS errors in development
// Solution: Use proper development server

// Use Python server for development
python3 -m http.server 8000

// Or use Node.js serve
npx serve -s . -p 8000
```

### 2. Debugging Tools

**Browser DevTools:**
- Use Network tab for API calls
- Use Console for JavaScript errors
- Use Sources tab for debugging
- Use Application tab for storage inspection

**VS Code Debugging:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 3. Performance Monitoring

**Lighthouse Audits:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:8000 --output html --output-path ./lighthouse-report.html
```

**Performance Monitoring:**
```javascript
// Add performance marks
performance.mark('feature-start');
// ... feature code ...
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

// Log performance
const measures = performance.getEntriesByType('measure');
console.log('Performance measures:', measures);
```

## Deployment

### 1. Local Testing

**Pre-deployment Checklist:**
```bash
# Run all tests
npm test

# Check code quality
npm run lint

# Build for production
npm run build

# Test production build
npm run serve:dist
```

### 2. Staging Deployment

**Deploy to Staging:**
```bash
# Deploy to staging environment
npm run deploy:staging

# Verify deployment
npm run verify:staging
```

### 3. Production Deployment

**Production Checklist:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance audit passed
- [ ] Security scan completed
- [ ] Documentation updated

**Deploy to Production:**
```bash
# Deploy to production
npm run deploy:production

# Monitor deployment
npm run monitor:production
```

## Getting Help

### 1. Documentation

**Available Resources:**
- **API Documentation:** `/docs/api/`
- **Architecture Guide:** `/docs/developer/architecture.md`
- **Testing Guide:** `/docs/developer/testing.md`
- **Deployment Guide:** `/docs/deployment/`

### 2. Team Communication

**Channels:**
- **Slack:** #development channel
- **Email:** dev-team@ardoniecapital.com
- **Stand-ups:** Daily at 9 AM CT
- **Code Reviews:** GitHub pull requests

### 3. Support

**Technical Issues:**
- Create GitHub issue with detailed description
- Include error messages and steps to reproduce
- Tag appropriate team members

**Questions:**
- Ask in Slack #development channel
- Schedule 1:1 with senior developers
- Attend weekly architecture discussions

## Next Steps

### Week 1: Getting Familiar
- [ ] Complete environment setup
- [ ] Read through existing code
- [ ] Run all tests successfully
- [ ] Make a small documentation improvement

### Week 2: First Contribution
- [ ] Pick up a "good first issue"
- [ ] Write tests for your changes
- [ ] Submit your first pull request
- [ ] Participate in code review

### Week 3: Feature Work
- [ ] Work on a small feature
- [ ] Collaborate with other developers
- [ ] Learn the deployment process
- [ ] Contribute to team discussions

### Ongoing Development
- [ ] Stay updated with architecture changes
- [ ] Contribute to documentation
- [ ] Mentor new team members
- [ ] Propose improvements and optimizations

---

*Welcome to the team! We're excited to have you contribute to the Ardonie Capital platform. Don't hesitate to ask questions and seek help when needed.*
