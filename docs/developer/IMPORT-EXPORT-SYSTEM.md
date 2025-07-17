# Import/Export System Documentation

## Overview

This document describes the proper import/export system implemented for the Ardonie Capital platform, following modern ES6 module patterns with barrel exports and dynamic loading capabilities.

## Architecture Principles

### 1. Barrel Exports
Each feature module has an `index.js` file that serves as the public API, controlling what is exposed and what remains private.

### 2. Dynamic Loading
Modules are loaded dynamically to support optional features and improve performance.

### 3. Backward Compatibility
Legacy import patterns are maintained alongside modern patterns to ensure smooth migration.

### 4. Capability Detection
The system detects what modules and features are available at runtime.

## Module Structure

### Core Modules (Always Available)
```
src/
├── features/
│   ├── authentication/
│   │   ├── services/
│   │   ├── components/
│   │   └── index.js          # Barrel export
│   ├── dashboard/
│   │   ├── services/
│   │   ├── components/
│   │   └── index.js          # Barrel export
│   └── marketplace/
│       ├── services/
│       ├── components/
│       └── index.js          # Barrel export
├── shared/
│   ├── utils/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── index.js              # Barrel export
└── index.js                  # Main application entry
```

## Import Patterns

### 1. Feature Module Imports
```javascript
// Import from feature barrel exports
import { 
    AuthService, 
    authConfig,
    getAuthCapabilities 
} from './features/authentication/index.js';

import { 
    DashboardService, 
    getDashboardCapabilities,
    getAvailableComponents as getDashboardComponents 
} from './features/dashboard/index.js';
```

### 2. Shared Module Imports
```javascript
// Import shared utilities and components
import { 
    validationUtils,
    formattingUtils,
    storageUtils,
    uiUtils,
    useTheme,
    useMobileMenu
} from './shared/index.js';

import { 
    ButtonComponent,
    ModalComponent,
    CardComponent,
    InputComponent
} from './shared/components/index.js';
```

### 3. Dynamic Imports
```javascript
// Dynamic loading for optional features
const loadOptionalFeatures = async () => {
    const optionalFeatures = {};
    
    try {
        const blogModule = await import('./features/blog/index.js');
        optionalFeatures.blog = blogModule;
    } catch (e) {
        console.debug('Blog feature not available');
    }
    
    return optionalFeatures;
};
```

### 4. Conditional Exports
```javascript
// In feature index.js files
export const getAvailableServices = async () => {
    const services = {};
    
    try {
        const { analyticsService } = await import('./services/analytics.service.js');
        services.analytics = analyticsService;
    } catch (e) {
        console.debug('Analytics service not available');
    }
    
    return services;
};
```

## Export Patterns

### 1. Barrel Export Structure
```javascript
// features/authentication/index.js
/**
 * Authentication Feature - Public API
 * Central export point for all authentication functionality
 */

// Core Services - Always available
export { AuthService } from './services/auth.service.js';

// Conditional exports
export const getAvailableServices = async () => {
    // Dynamic service loading
};

// Feature metadata
export const AUTH_FEATURE_NAME = 'authentication';
export const authConfig = { /* config */ };

// Capability detection
export const getAuthCapabilities = async () => {
    // Return feature capabilities
};
```

### 2. Component Exports
```javascript
// shared/components/index.js
export * from './button.component.js';
export * from './modal.component.js';
export * from './card.component.js';
export * from './input.component.js';

// Component factory
export const componentFactory = {
    createButton: (type, text, options) => { /* factory method */ }
};
```

### 3. Utility Exports
```javascript
// shared/index.js
export * from './utils/validation.utils.js';
export * from './utils/formatting.utils.js';
export * from './utils/storage.utils.js';
export * from './utils/ui.utils.js';

// Legacy exports for backward compatibility
export { 
    formatCurrency, 
    formatDate, 
    debounce 
} from './utils/common.js';
```

## Application Integration

### 1. Main Application Entry
```javascript
// src/index.js
import { 
    AuthService, 
    DashboardService, 
    MarketplaceService 
} from './features/*/index.js';

import { 
    validationUtils,
    ButtonComponent 
} from './shared/index.js';

class ArdonieCapitalApp {
    async init() {
        // Initialize with proper imports
        this.capabilities = await detectFeatureCapabilities();
        await this.initializeServices();
        await this.initializeComponents();
    }
    
    async loadModule(moduleName) {
        // Dynamic module loading
        const module = await import(`./features/${moduleName}/index.js`);
        return module;
    }
}
```

### 2. HTML Integration
```html
<!-- Modern ES6 module loading -->
<script type="module">
    import { authService } from './src/features/authentication/index.js';
    import { validationUtils } from './src/shared/index.js';
    
    // Make available globally for backward compatibility
    window.ArdonieAuth = { authService, validation: validationUtils };
</script>

<!-- Fallback for legacy code -->
<script>
    setTimeout(() => {
        if (!window.ArdonieAuth) {
            const script = document.createElement('script');
            script.src = './assets/js/auth-service.js';
            document.head.appendChild(script);
        }
    }, 1000);
</script>
```

## Capability Detection

### 1. Feature Capabilities
```javascript
export const getAuthCapabilities = async () => {
    return {
        services: {
            auth: true,
            twoFactor: !!twoFactorAuth,
            social: !!socialAuth
        },
        features: {
            login: true,
            register: true,
            passwordReset: true,
            sessionManagement: true
        }
    };
};
```

### 2. Platform Capabilities
```javascript
export const getPlatformCapabilities = async () => {
    const [authCaps, dashboardCaps, marketplaceCaps] = await Promise.all([
        getAuthCapabilities?.() || {},
        getDashboardCapabilities?.() || {},
        getMarketplaceCapabilities?.() || {}
    ]);
    
    return {
        authentication: authCaps,
        dashboard: dashboardCaps,
        marketplace: marketplaceCaps
    };
};
```

## Best Practices

### 1. Module Boundaries
- Never import directly from internal module files
- Always use barrel exports (`index.js`)
- Keep internal implementation details private

### 2. Dynamic Loading
- Use dynamic imports for optional features
- Implement graceful fallbacks for missing modules
- Log availability status for debugging

### 3. Backward Compatibility
- Maintain legacy global objects
- Provide migration paths
- Document breaking changes

### 4. Error Handling
- Wrap dynamic imports in try-catch blocks
- Provide meaningful error messages
- Implement fallback mechanisms

### 5. Performance
- Use dynamic imports to reduce initial bundle size
- Implement lazy loading for non-critical features
- Cache loaded modules to avoid re-importing

## Migration Guide

### From Legacy Imports
```javascript
// Old way
window.AuthService.login();

// New way
import { authService } from './src/features/authentication/index.js';
authService.login();

// Transition way (backward compatible)
const authService = window.ArdonieAuth?.authService || window.AuthService;
authService.login();
```

### Module Conversion
1. Create `index.js` barrel export
2. Move internal files to appropriate subdirectories
3. Update imports to use barrel exports
4. Test backward compatibility
5. Update documentation

## Testing Integration

### 1. Module Testing
```javascript
// Test imports
import { authService } from '../../../src/features/authentication/index.js';

describe('Authentication Module', () => {
    test('should export authService', () => {
        expect(authService).toBeDefined();
    });
});
```

### 2. Dynamic Loading Tests
```javascript
test('should load modules dynamically', async () => {
    const module = await app.loadModule('authentication');
    expect(module.AuthService).toBeDefined();
});
```

## Conclusion

This import/export system provides:
- **Clear module boundaries** with barrel exports
- **Dynamic loading** for performance and flexibility
- **Backward compatibility** for smooth migration
- **Capability detection** for runtime feature discovery
- **Modern ES6 patterns** with legacy support

The system supports both immediate use and gradual migration, ensuring the platform can evolve while maintaining stability.
