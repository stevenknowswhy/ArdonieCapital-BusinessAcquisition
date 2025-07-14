# 🔧 Microsoft OAuth Query String Fix

## 🔍 **ISSUE IDENTIFIED**
**Error**: `AADSTS90015: Requested query string is too long`
**Cause**: Microsoft Azure AD has strict limits on OAuth request URL length

## ✅ **FIXES APPLIED**

### **1. Reduced Scopes**
```javascript
// Before (Too long)
scopes: 'openid email profile'

// After (Optimized)
scopes: 'openid email'
```

### **2. Simplified Redirect URL**
```javascript
// Before (Dynamic, potentially long)
redirectTo: window.location.href

// After (Fixed, shorter)
redirectTo: `${window.location.origin}/test-oauth-authentication.html`
```

### **3. Removed Extra Parameters**
- Removed unnecessary query parameters that were adding to URL length
- Simplified OAuth configuration to essential parameters only

## 🚀 **ADDITIONAL SUPABASE DASHBOARD FIX**

If the issue persists, check your Supabase Microsoft provider configuration:

### **Navigate to**: https://supabase.com/dashboard/project/pbydepsqcypwqbicnsco/auth/providers?provider=Azure

### **Verify These Settings**:
```
✅ Application (Client) ID: 4fcfca69-91d2-4e5b-9b93-782838de19d5
✅ Client Secret: [AZURE_AD_CLIENT_SECRET] (stored securely in environment variables)
✅ Directory (Tenant) ID: 5cfe6f19-5a75-4ac6-a28d-0ccfdff006db
✅ Redirect URL: https://pbydepsqcypwqbicnsco.supabase.co/auth/v1/callback
```

### **Advanced Settings (if available)**:
- **Scopes**: Set to `openid email` (minimal scopes)
- **Additional Parameters**: Remove any extra parameters
- **Prompt**: Leave empty or set to `select_account`

## 🧪 **TESTING STEPS**

1. **Refresh the test page**: Hard refresh (Ctrl+F5)
2. **Clear browser cache**: Clear all storage and cookies
3. **Test Microsoft OAuth**: Click "Sign in with Microsoft"
4. **Expected Result**: Should redirect to Microsoft without the query string error

## 🔄 **ALTERNATIVE APPROACH**

If the issue still persists, try this minimal Microsoft OAuth configuration:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
        redirectTo: 'http://localhost:8000/test-oauth-authentication.html'
        // No additional options to minimize URL length
    }
});
```

## 📊 **SUCCESS INDICATORS**

After the fix, you should see:
- ✅ No "query string too long" error
- ✅ Successful redirect to Microsoft authentication
- ✅ Ability to complete Microsoft login
- ✅ Successful redirect back to test page
- ✅ User information displayed correctly

## 🚨 **IF ISSUE PERSISTS**

### **Check Azure AD Configuration**:
1. **Login to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory → App registrations
3. **Find your app**: `4fcfca69-91d2-4e5b-9b93-782838de19d5`
4. **Check Redirect URIs**: Ensure they match Supabase exactly
5. **Review API Permissions**: Minimize to essential scopes only

### **Supabase Provider Reset**:
1. **Disable Microsoft provider** in Supabase dashboard
2. **Save changes**
3. **Re-enable Microsoft provider**
4. **Re-enter all credentials**
5. **Save and test again**

## 🎯 **EXPECTED OUTCOME**

The Microsoft OAuth flow should now work without the query string length error, allowing successful authentication and integration testing.
