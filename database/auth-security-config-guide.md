# Authentication Security Configuration Guide

This guide provides step-by-step instructions for enabling additional authentication security features in Supabase to address the security warnings identified by the database linter.

## 🔒 Security Issues to Address

1. **Leaked Password Protection**: Currently disabled - needs to be enabled
2. **Insufficient MFA Options**: Limited multi-factor authentication methods available

---

## 📋 Configuration Steps

### 1. Enable Leaked Password Protection

**Purpose**: Prevent users from using passwords that have been compromised in data breaches by checking against the HaveIBeenPwned.org database.

**Steps**:

1. **Access Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/pbydepsqcypwqbicnsco
   - Go to **Authentication** → **Settings**

2. **Enable Password Protection**
   - Scroll to **Password Protection** section
   - Toggle **Enable password breach detection** to **ON**
   - This will check passwords against HaveIBeenPwned.org database
   - Users will be prevented from using compromised passwords

3. **Configure Password Strength Requirements** (Recommended)
   - Set **Minimum password length**: 8 characters
   - Enable **Require uppercase letters**: ON
   - Enable **Require lowercase letters**: ON
   - Enable **Require numbers**: ON
   - Enable **Require special characters**: ON

4. **Test the Configuration**
   - Try registering with a known weak password (e.g., "password123")
   - Should be rejected with appropriate error message

### 2. Enable Additional MFA Options

**Purpose**: Strengthen account security by providing multiple multi-factor authentication methods.

**Steps**:

1. **Access MFA Settings**
   - In Supabase Dashboard: **Authentication** → **Settings**
   - Scroll to **Multi-Factor Authentication** section

2. **Enable TOTP (Time-based One-Time Password)**
   - Toggle **Enable TOTP** to **ON**
   - This allows users to use apps like Google Authenticator, Authy, etc.

3. **Enable Phone/SMS MFA** (if available)
   - Toggle **Enable Phone** to **ON**
   - Configure SMS provider settings if required
   - Note: May require additional setup with SMS provider

4. **Configure MFA Enforcement** (Optional but Recommended)
   - Set **MFA Enforcement Level**:
     - **Optional**: Users can choose to enable MFA
     - **Required for Admin**: Enforce MFA for admin users
     - **Required for All**: Enforce MFA for all users
   - Recommended: Start with "Optional" and gradually move to "Required for Admin"

5. **Test MFA Setup**
   - Log in to a test account
   - Navigate to account settings
   - Verify MFA setup options are available
   - Test the setup process with a TOTP app

### 3. Additional Security Configurations (Recommended)

1. **Session Management**
   - Set **Session timeout**: 24 hours (or appropriate for your use case)
   - Enable **Refresh token rotation**: ON
   - Set **Refresh token expiry**: 30 days

2. **Rate Limiting**
   - Enable **Rate limiting for authentication**: ON
   - Set appropriate limits for login attempts
   - Configure lockout duration for failed attempts

3. **Email Security**
   - Enable **Email confirmation required**: ON
   - Set **Email confirmation timeout**: 24 hours
   - Enable **Secure email change**: ON (requires confirmation from both old and new email)

---

## ✅ Verification Steps

### Test Leaked Password Protection

```bash
# Test with a known compromised password
curl -X POST 'https://pbydepsqcypwqbicnsco.supabase.co/auth/v1/signup' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'

# Expected: Should return error about compromised password
```

### Test MFA Availability

1. **Frontend Test**:
   - Log in to your application
   - Navigate to user settings/security
   - Verify MFA setup options are visible
   - Test TOTP setup process

2. **API Test**:
   ```javascript
   // Check if MFA is available for user
   const { data, error } = await supabase.auth.mfa.listFactors()
   console.log('Available MFA factors:', data)
   ```

### Verify Configuration

1. **Dashboard Check**:
   - Confirm all settings are enabled in Supabase Dashboard
   - Check that security policies are active

2. **User Experience Test**:
   - Create test accounts with various password strengths
   - Test MFA enrollment process
   - Verify security features work as expected

---

## 🚨 Important Notes

### Security Considerations

1. **Gradual Rollout**: Implement MFA gradually to avoid user disruption
2. **User Communication**: Notify users about new security requirements
3. **Backup Codes**: Ensure users can generate backup codes for MFA
4. **Admin Access**: Ensure admin accounts have MFA enabled first

### Monitoring

1. **Track Failed Attempts**: Monitor authentication failures
2. **MFA Adoption**: Track MFA enrollment rates
3. **Security Events**: Monitor for suspicious authentication patterns

### Troubleshooting

1. **Password Issues**: Users may need to reset passwords if they're using compromised ones
2. **MFA Problems**: Provide clear instructions for MFA setup and recovery
3. **Rate Limiting**: Monitor for legitimate users being rate-limited

---

## 📊 Expected Outcomes

After implementing these configurations:

1. **Leaked Password Protection**: ✅ Enabled
   - Users cannot use compromised passwords
   - Password strength requirements enforced

2. **Enhanced MFA Options**: ✅ Available
   - TOTP authentication available
   - Multiple MFA methods supported
   - Optional or enforced MFA policies

3. **Security Warnings Resolved**: ✅ Fixed
   - Supabase database linter warnings addressed
   - Authentication security significantly improved

4. **User Security**: ✅ Enhanced
   - Stronger password requirements
   - Multi-factor authentication available
   - Reduced risk of account compromise

---

## 🔄 Next Steps

1. **Deploy Function Security Fix**: Run `database/function-security-fix.sql`
2. **Configure Authentication Settings**: Follow steps above in Supabase Dashboard
3. **Test All Security Features**: Verify everything works as expected
4. **Update User Documentation**: Inform users about new security features
5. **Monitor Security Metrics**: Track adoption and effectiveness

This completes the authentication security configuration to address all identified security warnings.