# 🔗 OAuth Authentication Testing Guide

## 📋 **OVERVIEW**

This guide provides comprehensive instructions for testing the OAuth authentication integration in BuyMartV1 using the `test-oauth-authentication.html` test page.

## 🚀 **GETTING STARTED**

### **Step 1: Open the Test Page**
1. **Local Testing**: Open `test-oauth-authentication.html` in your web browser
2. **HTTP Server** (Recommended): Serve the file via HTTP server for proper OAuth redirects
   ```bash
   # Using Python
   python -m http.server 8000
   # Then open: http://localhost:8000/test-oauth-authentication.html
   
   # Using Node.js
   npx serve .
   # Then open the provided URL
   ```

### **Step 2: Verify Initial Setup**
- ✅ Page loads with BuyMartV1 branding
- ✅ Two OAuth buttons are visible (Google and Microsoft)
- ✅ Test results section shows all tests as "Pending"
- ✅ No error messages in browser console

## 🧪 **TESTING PROCEDURES**

### **Test 1: Google OAuth Authentication**

#### **Expected Flow:**
1. **Click "Sign in with Google"**
2. **Redirect to Google**: Browser redirects to Google authentication
3. **Google Login**: Enter Google credentials (or select account)
4. **Permission Consent**: Grant permissions for email and profile access
5. **Redirect Back**: Return to test page with authentication success
6. **User Info Display**: User information appears on the page

#### **Success Criteria:**
- ✅ Google authentication page loads correctly
- ✅ User can complete Google login process
- ✅ Redirect back to test page works
- ✅ User information is displayed correctly
- ✅ "Google Authentication Flow" test shows as "Passed"

#### **Troubleshooting:**
- **Error: "redirect_uri_mismatch"**
  - Check Google Cloud Console redirect URI configuration
  - Ensure it matches: `https://pbydepsqcypwqbicnsco.supabase.co/auth/v1/callback`
- **Error: "invalid_client"**
  - Verify Google Client ID in Supabase dashboard
  - Confirm Client Secret is correctly entered

### **Test 2: Microsoft OAuth Authentication**

#### **Expected Flow:**
1. **Click "Sign in with Microsoft"**
2. **Redirect to Microsoft**: Browser redirects to Microsoft authentication
3. **Microsoft Login**: Enter Microsoft/Azure AD credentials
4. **Permission Consent**: Grant permissions for email and profile access
5. **Redirect Back**: Return to test page with authentication success
6. **User Info Display**: User information appears on the page

#### **Success Criteria:**
- ✅ Microsoft authentication page loads correctly
- ✅ User can complete Microsoft login process
- ✅ Redirect back to test page works
- ✅ User information is displayed correctly
- ✅ "Microsoft Authentication Flow" test shows as "Passed"

#### **Troubleshooting:**
- **Error: "AADSTS50011: redirect_uri_mismatch"**
  - Check Azure AD app registration redirect URI
  - Ensure it matches: `https://pbydepsqcypwqbicnsco.supabase.co/auth/v1/callback`
- **Error: "invalid_client"**
  - Verify Microsoft Client ID and Tenant ID in Supabase dashboard
  - Confirm Client Secret is correctly entered and not expired

### **Test 3: Profile Creation Integration**

#### **Expected Behavior:**
- OAuth users should automatically have profiles created in the `profiles` table
- Profile should contain user_id reference to auth.users table
- Default role should be assigned (typically 'buyer')

#### **Verification Steps:**
1. **After successful OAuth login**, check test results
2. **"Profile Creation Integration"** should show as "Passed"
3. **Manual Database Check** (Optional):
   ```sql
   -- Check if profile was created
   SELECT * FROM profiles WHERE user_id = 'USER_ID_FROM_TEST_PAGE';
   
   -- Check auth.users entry
   SELECT * FROM auth.users WHERE email = 'YOUR_TEST_EMAIL';
   ```

#### **Success Criteria:**
- ✅ Profile automatically created after OAuth login
- ✅ Profile contains correct user_id reference
- ✅ Default role assigned appropriately
- ✅ "Profile Creation Integration" test shows as "Passed"

### **Test 4: Session Management**

#### **Expected Behavior:**
- User session persists across page refreshes
- Sign out functionality works correctly
- Session cleanup happens properly

#### **Testing Steps:**
1. **After OAuth login**, refresh the page
2. **Verify**: User remains logged in and info is displayed
3. **Click "Sign Out"** button
4. **Verify**: User is logged out and login buttons reappear

#### **Success Criteria:**
- ✅ Session persists across page refreshes
- ✅ Sign out button works correctly
- ✅ UI resets to login state after sign out
- ✅ "Session Management" test shows as "Passed"

## 📊 **TEST RESULTS INTERPRETATION**

### **All Tests Passed (✅)**
```
✅ OAuth Provider Configuration - Passed
✅ Google Authentication Flow - Passed
✅ Microsoft Authentication Flow - Passed
✅ Profile Creation Integration - Passed
✅ Session Management - Passed
```
**Status**: OAuth integration is working correctly and ready for production use.

### **Partial Success (⚠️)**
Some tests passed, others failed. Common scenarios:

#### **Google Works, Microsoft Fails**
- Check Microsoft provider configuration in Supabase
- Verify Azure AD app registration settings
- Confirm client secret hasn't expired (expires 7/14/2026)

#### **OAuth Works, Profile Creation Fails**
- Check if profile creation trigger exists in database
- Verify profiles table structure and permissions
- Check RLS policies on profiles table

#### **Authentication Works, Session Management Fails**
- Check session configuration in Supabase
- Verify sign out functionality implementation
- Check for JavaScript errors in browser console

## 🔍 **DEBUGGING TOOLS**

### **Browser Developer Tools**
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor OAuth redirect requests
3. **Application Tab**: Check localStorage and session storage

### **Supabase Dashboard**
1. **Authentication → Users**: Verify users are created
2. **Table Editor → profiles**: Check profile creation
3. **Logs**: Review authentication logs for errors

### **Common Error Messages**

#### **"Provider not found"**
- OAuth provider not enabled in Supabase dashboard
- Provider name mismatch (use 'azure' for Microsoft)

#### **"Invalid credentials"**
- Client ID or Client Secret incorrect
- Credentials not saved properly in Supabase

#### **"Redirect URI mismatch"**
- OAuth provider redirect URI doesn't match Supabase callback URL
- Check both Google Cloud Console and Azure AD settings

## 📝 **TESTING CHECKLIST**

### **Pre-Testing Setup**
- [ ] OAuth providers configured in Supabase dashboard
- [ ] Google Client ID and Secret entered correctly
- [ ] Microsoft Client ID, Secret, and Tenant ID entered correctly
- [ ] Redirect URLs match in all configurations
- [ ] Test page served via HTTP (not file://)

### **Google OAuth Testing**
- [ ] Google sign-in button works
- [ ] Redirects to Google authentication
- [ ] Can complete Google login
- [ ] Redirects back to test page
- [ ] User information displays correctly
- [ ] Profile created in database

### **Microsoft OAuth Testing**
- [ ] Microsoft sign-in button works
- [ ] Redirects to Microsoft authentication
- [ ] Can complete Microsoft login
- [ ] Redirects back to test page
- [ ] User information displays correctly
- [ ] Profile created in database

### **Integration Testing**
- [ ] Session persists across page refreshes
- [ ] Sign out functionality works
- [ ] Multiple OAuth providers can be used
- [ ] User roles assigned correctly
- [ ] No JavaScript errors in console

### **Production Readiness**
- [ ] All test results show "Passed"
- [ ] No error messages during testing
- [ ] OAuth flows work consistently
- [ ] Profile integration working correctly
- [ ] Ready for integration into main application

## 🎯 **NEXT STEPS**

### **After Successful Testing**
1. **Document Results**: Record all test outcomes
2. **Integration Planning**: Plan OAuth integration into main BuyMartV1 app
3. **User Experience**: Design OAuth buttons for production UI
4. **Security Review**: Ensure all security best practices are followed

### **If Tests Fail**
1. **Review Configuration**: Double-check all OAuth provider settings
2. **Check Credentials**: Verify all Client IDs and Secrets
3. **Test Individually**: Test each provider separately
4. **Consult Documentation**: Review Supabase OAuth documentation
5. **Seek Support**: Contact support if issues persist

## 🔒 **SECURITY CONSIDERATIONS**

### **Production Deployment**
- ✅ Use HTTPS for all OAuth redirects
- ✅ Validate redirect URLs in production
- ✅ Monitor for suspicious authentication attempts
- ✅ Set up proper session timeouts
- ✅ Implement proper error handling

### **Credential Management**
- ✅ Keep OAuth credentials secure
- ✅ Set calendar reminder for Microsoft secret renewal (7/14/2026)
- ✅ Monitor for credential expiration
- ✅ Use environment variables in production

**🎉 This comprehensive testing ensures your OAuth integration is production-ready and provides a seamless authentication experience for BuyMartV1 users.**
