# Seller Authentication Flow - Manual Testing Guide

## Prerequisites

### Environment Setup
1. **Database**: Ensure Supabase is configured and accessible
2. **Migration**: Run the business_details migration script
3. **Server**: Start local development server
4. **Browser**: Use modern browser with developer tools

### Test Data Preparation
- Have test email addresses ready
- Prepare various business information scenarios
- Clear browser storage before testing

## Test Scenarios

### Scenario 1: Seller Registration Flow

**Objective**: Test complete seller registration process

**Steps**:
1. Navigate to `/auth/register.html`
2. Select "Sell My Business" radio button
3. Verify seller-specific fields appear:
   - Business Name field
   - Business Type dropdown
   - Business Location field
   - Years in Business dropdown
   - Annual Revenue dropdown
   - Employee Count dropdown
   - Reason for Selling dropdown

4. Fill out basic information:
   - First Name: "John"
   - Last Name: "Smith"
   - Email: "john.seller@test.com"
   - Phone: "555-123-4567"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"

5. Fill out business information:
   - Business Name: "Smith Auto Repair"
   - Business Type: "Auto Repair Shop"
   - Business Location: "Dallas, TX"
   - Years in Business: "6-10 years"
   - Annual Revenue: "$500K - $1M"
   - Employee Count: "6-10 employees"
   - Reason for Selling: "Retirement"

6. Check terms and conditions
7. Click "Create Account"

**Expected Results**:
- Form validates all required fields
- Success message appears
- Redirect to login page after 2 seconds
- Database contains new profile with role='seller'
- Business details stored in business_details JSON field

**Validation Points**:
- Required field validation works
- Password strength validation
- Email format validation
- Business fields only required when seller selected

### Scenario 2: Seller Login Flow

**Objective**: Test seller login and role-based redirect

**Steps**:
1. Navigate to `/auth/login.html`
2. Enter seller credentials:
   - Email: "john.seller@test.com"
   - Password: "SecurePass123!"
3. Optionally check "Remember me"
4. Click "Sign In"

**Expected Results**:
- Login successful message appears
- Automatic redirect to `/dashboard/seller-dashboard.html`
- Dashboard loads with seller-specific content
- User name appears in header
- Express Seller badge visible

**Validation Points**:
- Correct role-based redirect
- Session created and stored
- User data populated in dashboard
- Authentication state maintained

### Scenario 3: Dashboard Access Protection

**Objective**: Test unauthorized access prevention

**Steps**:
1. **Test Unauthenticated Access**:
   - Clear browser storage/cookies
   - Navigate directly to `/dashboard/seller-dashboard.html`
   - Should redirect to login page

2. **Test Wrong Role Access**:
   - Login as buyer (if available)
   - Navigate to `/dashboard/seller-dashboard.html`
   - Should redirect to buyer dashboard

3. **Test Authenticated Seller Access**:
   - Login as seller
   - Navigate to `/dashboard/seller-dashboard.html`
   - Should load dashboard successfully

**Expected Results**:
- Unauthenticated users redirected to login
- Users with wrong role redirected to correct dashboard
- Sellers can access seller dashboard
- Loading overlay shows during authentication check

### Scenario 4: Session Management

**Objective**: Test session timeout and management features

**Steps**:
1. Login as seller
2. Access seller dashboard
3. **Test Session Monitoring**:
   - Wait for session check (every 5 minutes)
   - Verify no errors in console
   - Session should remain active

4. **Test Session Warning** (requires session modification):
   - Manually modify session expiry in localStorage
   - Set expiry to 4 minutes from now
   - Wait for warning notification
   - Click "Extend Session"
   - Verify warning disappears

5. **Test Session Expiry**:
   - Set session expiry to past time
   - Wait for automatic check
   - Verify session expired message
   - Verify redirect to login

**Expected Results**:
- Session monitoring works without errors
- Warning appears before expiry
- Session extension works
- Expired sessions handled gracefully

### Scenario 5: Logout Functionality

**Objective**: Test logout process

**Steps**:
1. Login as seller
2. Access seller dashboard
3. Click user profile dropdown
4. Click "Sign Out" button

**Expected Results**:
- Logout process completes
- Session data cleared
- Redirect to login page
- Cannot access dashboard without re-authentication

### Scenario 6: Error Handling

**Objective**: Test various error conditions

**Steps**:
1. **Invalid Login**:
   - Try login with wrong password
   - Verify error message appears
   - Form remains accessible

2. **Network Errors**:
   - Disconnect network during login
   - Verify appropriate error handling

3. **Invalid Registration**:
   - Try registering with existing email
   - Verify error handling

4. **Session Corruption**:
   - Manually corrupt session data
   - Verify graceful fallback to login

**Expected Results**:
- Clear error messages for all scenarios
- No application crashes
- Graceful fallback behaviors

## Performance Testing

### Load Time Testing
1. Measure dashboard load time after authentication
2. Verify authentication check doesn't block UI
3. Test with slow network conditions

### Memory Testing
1. Check for memory leaks during session monitoring
2. Verify cleanup on logout
3. Test multiple login/logout cycles

## Browser Compatibility

### Test Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- Test responsive design
- Touch interactions
- Mobile browser compatibility

## Security Testing

### Authentication Security
1. Verify HTTPS enforcement
2. Test CSRF protection
3. Validate session security
4. Check for XSS vulnerabilities

### Authorization Testing
1. Test role-based access controls
2. Verify session validation
3. Test unauthorized access attempts

## Regression Testing

### After Code Changes
1. Re-run all test scenarios
2. Verify no existing functionality broken
3. Test edge cases and error conditions

## Test Documentation

### Record Test Results
- Document any failures or issues
- Note browser-specific behaviors
- Record performance metrics
- Save screenshots of key flows

### Issue Reporting
- Clear description of issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and environment details

## Automated Testing Considerations

### Future Test Automation
- Consider Cypress or Playwright for E2E tests
- Unit tests for authentication service
- Integration tests for database operations
- Performance monitoring setup

## Success Criteria

### Complete Flow Success
✅ Seller can register with business information
✅ Seller can login and access dashboard
✅ Unauthorized access is prevented
✅ Session management works correctly
✅ Logout functionality works
✅ Error handling is graceful
✅ Performance is acceptable
✅ Security measures are effective

### Ready for Production
- All test scenarios pass
- No critical security issues
- Performance meets requirements
- Error handling is comprehensive
- Documentation is complete
