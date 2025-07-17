# Seller Authentication Flow - Implementation Guide

## Overview
This document describes the complete seller authentication flow implemented for BuyMartV1, including registration, login, dashboard access, and session management.

## Architecture Overview

### Components Implemented
1. **Enhanced Registration Form** (`auth/register.html`)
   - Role selection (buyer/seller/vendor)
   - Seller-specific business information fields
   - Conditional field validation

2. **Role-Based Authentication Service** (`src/features/authentication/services/auth.service.js`)
   - Enhanced login with role-based redirects
   - Seller profile creation with business details
   - Session management integration

3. **Protected Seller Dashboard** (`dashboard/seller-dashboard.html`)
   - Authentication middleware
   - Role verification
   - Session monitoring
   - Logout functionality

4. **Database Schema Updates** (`database/schema.sql`)
   - Added `business_details` JSONB field to profiles table
   - Proper indexing for performance

## Authentication Flow

### 1. Seller Registration Process

**URL**: `/auth/register.html`

**Steps**:
1. User selects "Sell My Business" role
2. Seller-specific fields appear:
   - Business Name (required)
   - Business Type (required)
   - Business Location (required)
   - Years in Business
   - Annual Revenue Range
   - Employee Count
   - Reason for Selling

3. Form validation ensures all required fields are completed
4. Registration creates:
   - Supabase auth user
   - Profile record with role='seller'
   - Business details stored in `business_details` JSON field

**Key Features**:
- Conditional field display based on role selection
- Enhanced validation for seller-specific fields
- Secure password requirements
- Business information storage

### 2. Login Process

**URL**: `/auth/login.html`

**Steps**:
1. User enters email and password
2. Authentication service validates credentials
3. User profile retrieved with role information
4. Role-based redirect:
   - Sellers → `/dashboard/seller-dashboard.html`
   - Buyers → `/dashboard/buyer-dashboard.html`
   - Admins → `/dashboard/admin-dashboard.html`

**Key Features**:
- Role-based automatic redirects
- Session creation with user data
- Remember me functionality
- Return URL handling

### 3. Dashboard Protection

**URL**: `/dashboard/seller-dashboard.html`

**Protection Mechanisms**:
1. **Authentication Check**: Verifies user is logged in
2. **Role Verification**: Ensures user has 'seller' role
3. **Session Validation**: Confirms session is active and valid
4. **Automatic Redirects**: 
   - Unauthenticated users → login page
   - Non-sellers → appropriate dashboard for their role

**Key Features**:
- Loading overlay during authentication check
- Dynamic user data display
- Session timeout monitoring
- Logout functionality

### 4. Session Management

**Features Implemented**:
- **Session Monitoring**: Checks session status every 5 minutes
- **Timeout Warnings**: Alerts user 5 minutes before session expires
- **Session Extension**: Allows users to extend their session
- **Automatic Logout**: Redirects to login when session expires
- **Secure Logout**: Clears all session data and redirects

## Database Schema

### Profiles Table Enhancement
```sql
ALTER TABLE profiles 
ADD COLUMN business_details JSONB;

CREATE INDEX idx_profiles_business_details ON profiles USING GIN (business_details);
```

### Business Details Structure
```json
{
  "business_type": "auto_repair",
  "years_in_business": "6-10",
  "annual_revenue": "500k_1m",
  "employee_count": "6-10",
  "reason_for_selling": "retirement"
}
```

## Security Features

1. **CSRF Protection**: Tokens included in all authentication requests
2. **Password Validation**: Strong password requirements enforced
3. **Session Security**: Secure token storage and validation
4. **Role-Based Access**: Strict role verification for dashboard access
5. **Input Validation**: Client and server-side validation
6. **Secure Redirects**: Prevents open redirect vulnerabilities

## Error Handling

1. **Authentication Failures**: Clear error messages for login issues
2. **Session Expiry**: Graceful handling with user notifications
3. **Network Errors**: Fallback mechanisms and user feedback
4. **Validation Errors**: Real-time field validation with helpful messages
5. **Authorization Errors**: Appropriate redirects for unauthorized access

## Testing Requirements

### Manual Testing Checklist
See `SELLER-AUTHENTICATION-TESTING-GUIDE.md` for detailed testing procedures.

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA for enhanced security
2. **Social Login**: Google/Facebook authentication options
3. **Password Reset**: Email-based password recovery
4. **Email Verification**: Verify email addresses during registration
5. **Account Lockout**: Prevent brute force attacks
6. **Audit Logging**: Track authentication events

## Troubleshooting

### Common Issues
1. **Session Not Persisting**: Check localStorage and session configuration
2. **Role Redirects Not Working**: Verify user profile has correct role
3. **Business Fields Not Showing**: Check JavaScript role selection logic
4. **Database Errors**: Ensure business_details column exists

### Debug Information
- Check browser console for authentication errors
- Verify Supabase connection and configuration
- Test database schema and migrations
- Validate session storage and retrieval

## Deployment Notes

1. **Database Migration**: Run migration script to add business_details field
2. **Environment Variables**: Ensure Supabase credentials are configured
3. **File Permissions**: Verify all authentication files are accessible
4. **HTTPS Required**: Authentication should only run over HTTPS in production
