# Migration Guide: Feature-Based Directory Structure

## Overview
This guide provides step-by-step instructions for migrating the existing BuyMartV1 codebase to the new feature-based directory structure.

## Migration Strategy

### Phase 1: Structure Creation ✅ COMPLETE
- [x] Created `src/features/` directory structure
- [x] Implemented core feature modules (authentication, dashboard, marketplace, blog, matchmaking, tools)
- [x] Created shared components and utilities
- [x] Established public API contracts through index.js files

### Phase 2: File Migration (Next Steps)

#### 2.1 Authentication Feature Migration
**Current Location**: `auth/`
**New Location**: `src/features/authentication/`

```bash
# Migration commands
mkdir -p src/features/authentication/pages
mkdir -p src/features/authentication/styles

# Move files
mv auth/login.html src/features/authentication/pages/
mv auth/register.html src/features/authentication/pages/

# Update paths in HTML files
# Change relative paths from "../" to "../../" for root-level resources
```

**Files to Update**:
- `auth/login.html` → `src/features/authentication/pages/login.html`
- `auth/register.html` → `src/features/authentication/pages/register.html`

#### 2.2 Dashboard Feature Migration
**Current Location**: `dashboard/`
**New Location**: `src/features/dashboard/`

```bash
# Migration commands
mkdir -p src/features/dashboard/pages
mkdir -p src/features/dashboard/styles

# Move files
mv dashboard/buyer-dashboard.html src/features/dashboard/pages/
mv dashboard/seller-dashboard.html src/features/dashboard/pages/
```

#### 2.3 Marketplace Feature Migration
**Current Location**: `marketplace/`
**New Location**: `src/features/marketplace/`

```bash
# Migration commands
mkdir -p src/features/marketplace/pages
mkdir -p src/features/marketplace/styles

# Move files
mv marketplace/listings.html src/features/marketplace/pages/
```

#### 2.4 Blog Feature Migration
**Current Location**: `blog/`
**New Location**: `src/features/blog/`

```bash
# Migration commands
mkdir -p src/features/blog/pages
mkdir -p src/features/blog/posts
mkdir -p src/features/blog/styles

# Move files
mv blog/index.html src/features/blog/pages/blog-index.html
mv blog/*.html src/features/blog/posts/
```

#### 2.5 Shared Resources Migration
**Current Locations**: `components/`, `assets/`
**New Location**: `src/shared/`

```bash
# Migration commands
mkdir -p src/shared/components
mkdir -p src/shared/assets
mkdir -p src/shared/styles

# Move files
mv components/* src/shared/components/
mv assets/* src/shared/assets/
```

### Phase 3: Path Updates

#### 3.1 HTML File Path Updates
When moving HTML files deeper into the directory structure, update relative paths:

**Before** (in root or one level deep):
```html
<link href="assets/css/style.css" rel="stylesheet">
<script src="assets/js/common.js"></script>
<a href="index.html">Home</a>
```

**After** (in `src/features/[feature]/pages/`):
```html
<link href="../../../shared/assets/css/style.css" rel="stylesheet">
<script src="../../../shared/assets/js/common.js"></script>
<a href="../../../index.html">Home</a>
```

#### 3.2 JavaScript Import Updates
**Before**:
```javascript
import { someFunction } from './utils/common.js';
import { AuthService } from './auth/auth.service.js';
```

**After**:
```javascript
import { someFunction } from '@/shared/utils/common.js';
import { AuthService } from '@/features/authentication';
```

### Phase 4: Feature Integration

#### 4.1 Update Build Configuration
Add path aliases to support the new structure:

```javascript
// webpack.config.js or similar
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  }
};
```

#### 4.2 Update Import Statements
Replace direct file imports with feature imports:

**Before**:
```javascript
import { AuthService } from '../auth/auth.service.js';
import { DashboardComponent } from '../dashboard/dashboard.component.js';
```

**After**:
```javascript
import { AuthService } from '@features/authentication';
import { DashboardComponent } from '@features/dashboard';
```

## File Mapping Reference

### Current → New Structure Mapping

| Current Location | New Location | Notes |
|------------------|--------------|-------|
| `auth/login.html` | `src/features/authentication/pages/login.html` | Update relative paths |
| `auth/register.html` | `src/features/authentication/pages/register.html` | Update relative paths |
| `dashboard/buyer-dashboard.html` | `src/features/dashboard/pages/buyer-dashboard.html` | Update relative paths |
| `dashboard/seller-dashboard.html` | `src/features/dashboard/pages/seller-dashboard.html` | Update relative paths |
| `marketplace/listings.html` | `src/features/marketplace/pages/listings.html` | Update relative paths |
| `blog/index.html` | `src/features/blog/pages/blog-index.html` | Update relative paths |
| `blog/*.html` | `src/features/blog/posts/*.html` | Move all blog posts |
| `components/*` | `src/shared/components/*` | Shared components |
| `assets/*` | `src/shared/assets/*` | Shared assets |

### Path Update Examples

#### For files moved to `src/features/[feature]/pages/`:
- `../assets/` → `../../../shared/assets/`
- `../components/` → `../../../shared/components/`
- `./` → `../../../` (for root files)
- `../auth/` → `../../authentication/pages/`

#### For files moved to `src/features/[feature]/components/`:
- `../assets/` → `../../../shared/assets/`
- `../../components/` → `../../../shared/components/`
- `../` → `../../../` (for root files)

## Testing Migration

### 1. Verify File Moves
```bash
# Check that files exist in new locations
ls -la src/features/authentication/pages/
ls -la src/features/dashboard/pages/
ls -la src/features/marketplace/pages/
ls -la src/shared/components/
```

### 2. Test Path Updates
- Open each migrated HTML file in browser
- Verify all CSS and JS files load correctly
- Check that all links work properly
- Test navigation between pages

### 3. Validate Feature APIs
```javascript
// Test feature imports
import { AuthService } from '@features/authentication';
import { DashboardService } from '@features/dashboard';
import { MarketplaceService } from '@features/marketplace';

// Verify services work correctly
console.log('Features loaded successfully');
```

## Rollback Plan

If issues arise during migration:

1. **Keep backups** of original files before moving
2. **Document changes** made to each file
3. **Test incrementally** - migrate one feature at a time
4. **Revert if needed** by moving files back to original locations

## Benefits After Migration

1. **Improved Organization**: All feature-related files in one place
2. **Better Maintainability**: Clear separation of concerns
3. **Easier Development**: Intuitive file discovery
4. **Scalable Architecture**: Easy to add new features
5. **Team Collaboration**: Clear feature ownership boundaries

## Next Steps After Migration

1. **Update Documentation**: Reflect new structure in all docs
2. **Team Training**: Ensure all developers understand new organization
3. **CI/CD Updates**: Modify build processes for new structure
4. **Monitoring**: Watch for any issues in production
5. **Continuous Improvement**: Refine structure based on usage patterns

This migration transforms the BuyMartV1 codebase into a modern, scalable, feature-based architecture that supports long-term growth and maintainability.
