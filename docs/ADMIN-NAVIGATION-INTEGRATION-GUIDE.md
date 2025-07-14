# Admin Navigation Integration Guide

## Overview

The Admin Navigation system provides a secondary navigation bar that appears below the main navigation for privileged users (Company Admin, Super Admin roles). This guide explains how to integrate it across your website.

## Quick Start

### 1. Automatic Integration (Recommended)

For pages that already use the main navigation component, simply include the integration script:

```html
<!-- Add this script tag to your HTML pages -->
<script src="/assets/js/admin-navigation-integration.js"></script>
```

The admin navigation will automatically:
- ✅ Position itself below the main navigation
- ✅ Show/hide based on user authentication and role
- ✅ Adapt to mobile devices
- ✅ Update in real-time when auth state changes

### 2. Manual Integration

If you need more control, you can manually initialize the admin navigation:

```html
<!-- Include required files -->
<link rel="stylesheet" href="/assets/css/admin-navigation.css">
<script src="/components/admin-navigation.js"></script>

<!-- Create container (optional - will be created automatically) -->
<div id="admin-navigation-container"></div>

<script>
// Initialize manually
document.addEventListener('DOMContentLoaded', function() {
    if (window.ArdonieAdminNavigation) {
        window.ArdonieAdminNavigation.init('admin-navigation-container');
    }
});
</script>
```

## File Structure

```
/components/
├── admin-navigation.js          # Main admin navigation component
├── main-navigation.js           # Existing main navigation

/assets/
├── css/
│   └── admin-navigation.css     # Admin navigation styles
└── js/
    └── admin-navigation-integration.js  # Auto-integration script

/admin-navigation-demo.html      # Demo page for testing
```

## Configuration

### Privileged Roles

The admin navigation appears for users with these roles:
- `admin`
- `Company Admin` 
- `Super Admin`

To modify the roles, edit the `adminRoles` array in `admin-navigation.js`:

```javascript
adminRoles: ['admin', 'Company Admin', 'Super Admin', 'your-custom-role']
```

### Admin Navigation Links

Current admin links include:
- 👥 User Management (`/dashboard/admin-dashboard.html`)
- 📝 Content Management (`/dashboard/content-management.html`)
- 📊 Analytics (`/dashboard/analytics-dashboard.html`)
- ⚙️ System Settings (`/dashboard/system-settings.html`)
- 📈 Reports (`/dashboard/reports-dashboard.html`)

To modify links, edit the template in `admin-navigation.js`.

## Authentication Integration

The admin navigation automatically integrates with your existing authentication system by:

1. **Listening for auth events:**
   - `authenticationComplete`
   - `authStateChanged`
   - `userLoggedOut`

2. **Checking user storage:**
   - `localStorage.getItem('ardonie_user_session')`
   - `sessionStorage.getItem('ardonie_current_user')`
   - `localStorage.getItem('ardonie_auth_status')`

3. **Role verification:**
   - Checks `user.role` or `user.selectedRole`
   - Compares against `adminRoles` array

## Styling & Customization

### CSS Classes

Key CSS classes for customization:
- `#admin-navigation-bar` - Main admin nav container
- `.admin-badge` - Admin role badge
- `.admin-notification-badge` - Notification indicators
- `.admin-nav-loading` - Loading state

### Dark Mode Support

The admin navigation includes automatic dark mode support via CSS media queries:

```css
@media (prefers-color-scheme: dark) {
    #admin-navigation-bar {
        background: linear-gradient(135deg, #1e293b, #0f172a);
    }
}
```

### Mobile Responsiveness

- Desktop: Horizontal navigation with dropdowns
- Mobile: Collapsible hamburger menu
- Tablet: Adaptive layout

## API Reference

### Global Functions

```javascript
// Refresh admin navigation visibility
window.refreshAdminNavigation()

// Check if current user is admin
window.AdminNavIntegration.isCurrentUserAdmin()

// Enable debug mode
window.AdminNavIntegration.enableDebug()

// Manual refresh
window.AdminNavIntegration.refresh()
```

### Events

The admin navigation dispatches and listens for these events:

```javascript
// Listen for auth changes
document.addEventListener('authenticationComplete', handler);
document.addEventListener('authStateChanged', handler);
document.addEventListener('userLoggedOut', handler);
```

## Testing

### Demo Page

Visit `/admin-navigation-demo.html` to test the admin navigation with different user roles:

1. **Role Simulation:** Click buttons to simulate different user roles
2. **Real-time Updates:** See how the admin navigation responds
3. **Mobile Testing:** Resize browser to test mobile menu
4. **Debug Mode:** Enable debug logging for troubleshooting

### Manual Testing

```javascript
// Simulate admin user
localStorage.setItem('ardonie_user_session', JSON.stringify({
    role: 'admin',
    email: 'admin@example.com'
}));
localStorage.setItem('ardonie_auth_status', 'authenticated');
window.refreshAdminNavigation();

// Simulate logout
localStorage.removeItem('ardonie_user_session');
localStorage.removeItem('ardonie_auth_status');
document.dispatchEvent(new CustomEvent('userLoggedOut'));
```

## Troubleshooting

### Admin Navigation Not Appearing

1. **Check user role:**
   ```javascript
   console.log(window.AdminNavIntegration.isCurrentUserAdmin());
   ```

2. **Enable debug mode:**
   ```javascript
   window.AdminNavIntegration.enableDebug();
   ```

3. **Check console for errors:**
   - Look for authentication issues
   - Verify script loading
   - Check role matching

### Positioning Issues

1. **Main navigation not found:**
   - Ensure main navigation has proper selectors
   - Check `config.mainNavSelector` in integration script

2. **Z-index conflicts:**
   - Admin nav uses `z-index: 40`
   - Main nav should use `z-index: 50`

### Mobile Menu Issues

1. **Menu not toggling:**
   - Check for JavaScript errors
   - Verify event listeners are bound

2. **Styling conflicts:**
   - Check for CSS conflicts with existing styles
   - Verify Tailwind CSS is loaded

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Lazy Loading:** Admin navigation only loads when needed
- **Event Delegation:** Efficient event handling
- **CSS Transitions:** Smooth animations
- **Minimal DOM Impact:** Small footprint

## Security Considerations

- **Client-side Only:** Role checking is for UI purposes only
- **Server Validation:** Always validate permissions server-side
- **No Sensitive Data:** Admin navigation doesn't expose sensitive information
- **XSS Protection:** Proper input sanitization

## Migration Guide

### From Existing Admin Systems

1. **Backup existing admin navigation**
2. **Include new admin navigation files**
3. **Update authentication event dispatching**
4. **Test role-based visibility**
5. **Update admin page links**

### Updating Existing Pages

1. **Add integration script to all pages with main navigation**
2. **Remove old admin navigation code**
3. **Update CSS for proper spacing**
4. **Test on all device sizes**

## Support

For issues or questions:
1. Check the demo page for examples
2. Enable debug mode for detailed logging
3. Review browser console for errors
4. Test with different user roles
