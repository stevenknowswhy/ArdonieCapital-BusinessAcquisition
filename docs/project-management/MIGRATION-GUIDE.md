# Migration Guide: Legacy to Modular Architecture

## Overview

This guide helps developers migrate from the legacy asset-based imports to the new modular architecture implemented in the Ardonie Capital platform.

## New Modular Structure

### Before (Legacy)
```html
<!-- Old way -->
<script src="../assets/js/common.js"></script>
<script src="../assets/js/auth-service.js"></script>
<script src="../assets/js/marketplace-listings.js"></script>
<script src="../assets/js/shadcn-components.js"></script>
```

### After (Modular)
```html
<!-- New way -->
<script type="module">
    import { authService } from '../src/features/authentication/index.js';
    import { marketplaceService } from '../src/features/marketplace/index.js';
    import { ButtonComponent, ModalComponent } from '../src/shared/components/index.js';
    import { validationUtils, formattingUtils } from '../src/shared/index.js';
</script>
```

## Import Path Mappings

### Authentication System
```javascript
// Legacy
window.AuthService.login(email, password);

// New Modular
import { authService } from './src/features/authentication/index.js';
authService.login(email, password);
```

### Marketplace System
```javascript
// Legacy
window.MarketplaceListings.filterListings(filters);

// New Modular
import { marketplaceService } from './src/features/marketplace/index.js';
marketplaceService.filterListings(filters);
```

### Dashboard System
```javascript
// Legacy
window.DashboardService.loadAnalytics();

// New Modular
import { dashboardService } from './src/features/dashboard/index.js';
dashboardService.loadAnalytics();
```

### Shared Utilities
```javascript
// Legacy
window.formatCurrency(amount);
window.validateEmail(email);

// New Modular
import { formattingUtils, validationUtils } from './src/shared/index.js';
formattingUtils.formatCurrency(amount);
validationUtils.validateEmail(email);
```

### UI Components
```javascript
// Legacy
window.ShadcnComponents.createButton();

// New Modular
import { ButtonComponent } from './src/shared/components/index.js';
const button = new ButtonComponent();
```

### Theme System
```javascript
// Legacy
window.ArdonieTheme.loader.toggleColorMode();

// New Modular
import { useTheme } from './src/shared/index.js';
useTheme.toggleTheme();
```

## Feature-Specific Imports

### Authentication Feature
```javascript
import { 
    authService,
    passwordValidator,
    sessionManager,
    twoFactorAuth,
    socialAuth
} from './src/features/authentication/index.js';
```

### Dashboard Feature
```javascript
import { 
    dashboardService,
    analyticsService,
    notificationService,
    widgetManager,
    reportGenerator
} from './src/features/dashboard/index.js';
```

### Marketplace Feature
```javascript
import { 
    marketplaceService,
    listingService,
    searchService,
    filterService,
    categoryService
} from './src/features/marketplace/index.js';
```

### Shared Utilities
```javascript
import { 
    validationUtils,
    formattingUtils,
    storageUtils,
    uiUtils,
    useTheme,
    useMobileMenu
} from './src/shared/index.js';
```

### Shared Components
```javascript
import { 
    ButtonComponent,
    ModalComponent,
    CardComponent,
    InputComponent,
    HeaderComponent
} from './src/shared/components/index.js';
```

## Backward Compatibility

All legacy files are maintained with fallback support:

### Global Objects Available
```javascript
// These are automatically created when modular system loads
window.ArdonieAuth = {
    authService,
    passwordValidator,
    sessionManager
};

window.ArdonieDashboard = {
    dashboard: dashboardService,
    analytics: analyticsService
};

window.ArdonieMarketplace = {
    marketplace: marketplaceService,
    listings: listingService
};

window.ArdonieShared = {
    validation: validationUtils,
    formatting: formattingUtils,
    ui: uiUtils
};

window.ArdonieComponents = {
    Button: ButtonComponent,
    Modal: ModalComponent
};
```

### Fallback Pattern
```javascript
// Check for modular system first, fallback to legacy
const authService = window.ArdonieAuth?.authService || window.AuthService;
const validation = window.ArdonieShared?.validation || window.validateEmail;
```

## Migration Steps

### Step 1: Update HTML Files
Replace legacy script tags with modular imports:

```html
<!-- Remove -->
<script src="../assets/js/auth-service.js"></script>

<!-- Add -->
<script type="module">
    import { authService } from '../src/features/authentication/index.js';
    window.ArdonieAuth = { authService };
</script>
```

### Step 2: Update JavaScript Code
Replace global object references:

```javascript
// Old
window.AuthService.login(email, password);

// New
const authService = window.ArdonieAuth?.authService || window.AuthService;
authService.login(email, password);
```

### Step 3: Test Functionality
Ensure all features work with both modular and legacy systems.

### Step 4: Remove Legacy Dependencies
Once confident in modular system, remove legacy script tags.

## Best Practices

### 1. Use Feature-Based Imports
```javascript
// Good: Import from feature index
import { authService } from './src/features/authentication/index.js';

// Avoid: Direct file imports
import { AuthService } from './src/features/authentication/auth.service.js';
```

### 2. Batch Related Imports
```javascript
// Good: Group related imports
import { 
    validationUtils, 
    formattingUtils, 
    uiUtils 
} from './src/shared/index.js';

// Avoid: Multiple import statements
import { validationUtils } from './src/shared/utils/validation.utils.js';
import { formattingUtils } from './src/shared/utils/formatting.utils.js';
```

### 3. Use Fallback Patterns
```javascript
// Always provide fallbacks for legacy compatibility
const service = window.ArdonieAuth?.authService || window.AuthService;
```

### 4. Check Module Availability
```javascript
// Check if modular system loaded successfully
if (!window.ArdonieAuth) {
    console.warn('Modular auth system not available, using legacy');
    // Load legacy scripts
}
```

## Common Issues and Solutions

### Issue: Module Not Found
```javascript
// Problem: Import path incorrect
import { authService } from './features/authentication/index.js';

// Solution: Use correct relative path
import { authService } from './src/features/authentication/index.js';
```

### Issue: Global Object Undefined
```javascript
// Problem: Accessing before module loads
window.ArdonieAuth.authService.login();

// Solution: Check availability first
if (window.ArdonieAuth?.authService) {
    window.ArdonieAuth.authService.login();
}
```

### Issue: Legacy Fallback Not Working
```javascript
// Problem: Legacy script not loaded
const service = window.ArdonieAuth?.authService || window.AuthService;

// Solution: Ensure legacy script loads on fallback
setTimeout(() => {
    if (!window.ArdonieAuth) {
        const script = document.createElement('script');
        script.src = '../assets/js/auth-service.js';
        document.head.appendChild(script);
    }
}, 1000);
```

## Testing Migration

### 1. Test Modular System
```javascript
// Verify modular imports work
console.log('Modular auth:', window.ArdonieAuth);
console.log('Modular shared:', window.ArdonieShared);
```

### 2. Test Legacy Fallback
```javascript
// Temporarily disable modular system
window.ArdonieAuth = null;
// Verify legacy system activates
```

### 3. Test All Features
- Authentication (login, register, logout)
- Dashboard (analytics, notifications)
- Marketplace (listings, search, filters)
- UI Components (buttons, modals, forms)
- Utilities (validation, formatting, storage)

## Performance Benefits

### Before Migration
- Multiple script files loaded separately
- Global namespace pollution
- No tree-shaking optimization
- Larger bundle sizes

### After Migration
- ES6 modules with tree-shaking
- Clean namespace organization
- Lazy loading capabilities
- Smaller bundle sizes
- Better caching strategies

## Conclusion

The modular architecture provides:
- Better code organization
- Improved maintainability
- Enhanced performance
- Modern development practices
- Backward compatibility

Follow this guide to migrate gradually while maintaining full functionality throughout the transition.
