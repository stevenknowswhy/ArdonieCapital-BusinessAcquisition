# Security Architecture - Ardonie Capital Platform

## Overview

The Ardonie Capital platform implements a comprehensive security architecture designed to protect sensitive business and financial data while maintaining usability and performance. This document outlines our security measures, implementation details, and best practices.

## Security Principles

### 1. Defense in Depth
Multiple layers of security controls to protect against various attack vectors:
- **Perimeter Security:** WAF, DDoS protection, rate limiting
- **Application Security:** Input validation, output encoding, secure coding
- **Data Security:** Encryption at rest and in transit, access controls
- **Infrastructure Security:** Secure hosting, network segmentation, monitoring

### 2. Zero Trust Architecture
Never trust, always verify:
- **Identity Verification:** Multi-factor authentication required
- **Device Verification:** Device fingerprinting and validation
- **Network Verification:** All traffic encrypted and monitored
- **Application Verification:** Continuous security monitoring

### 3. Principle of Least Privilege
Users and systems have only the minimum access required:
- **Role-Based Access Control (RBAC):** Granular permissions
- **Just-In-Time Access:** Temporary elevated permissions
- **Regular Access Reviews:** Periodic permission audits
- **Automated Deprovisioning:** Immediate access removal

## Authentication & Authorization

### 1. Multi-Factor Authentication (MFA)

**Implementation:**
```javascript
// MFA verification process
const verifyMFA = async (userId, token, method) => {
  const user = await getUserById(userId);
  
  switch (method) {
    case 'totp':
      return verifyTOTP(user.totpSecret, token);
    case 'sms':
      return verifySMS(user.phone, token);
    case 'email':
      return verifyEmail(user.email, token);
    default:
      throw new Error('Invalid MFA method');
  }
};
```

**Supported Methods:**
- **TOTP (Time-based One-Time Password):** Google Authenticator, Authy
- **SMS:** Text message verification codes
- **Email:** Email verification codes
- **Hardware Tokens:** FIDO2/WebAuthn support (planned)

### 2. JSON Web Tokens (JWT)

**Token Structure:**
```javascript
// JWT payload structure
const jwtPayload = {
  sub: userId,           // Subject (user ID)
  iat: issuedAt,        // Issued at timestamp
  exp: expiresAt,       // Expiration timestamp
  aud: 'ardoniecapital', // Audience
  iss: 'auth.ardoniecapital.com', // Issuer
  role: userRole,       // User role
  permissions: userPermissions, // Specific permissions
  sessionId: sessionId  // Session identifier
};
```

**Security Features:**
- **Short Expiration:** 1-hour access tokens
- **Refresh Tokens:** 30-day refresh tokens with rotation
- **Secure Storage:** HttpOnly cookies for web, secure storage for mobile
- **Token Blacklisting:** Immediate revocation capability

### 3. Role-Based Access Control

**Role Hierarchy:**
```javascript
const roles = {
  admin: {
    permissions: ['*'], // All permissions
    inherits: []
  },
  seller: {
    permissions: [
      'listings:create',
      'listings:edit:own',
      'listings:delete:own',
      'dashboard:view:seller',
      'messages:send',
      'documents:upload'
    ],
    inherits: ['user']
  },
  buyer: {
    permissions: [
      'listings:view',
      'listings:search',
      'dashboard:view:buyer',
      'messages:send',
      'offers:create'
    ],
    inherits: ['user']
  },
  user: {
    permissions: [
      'profile:view:own',
      'profile:edit:own',
      'auth:logout'
    ],
    inherits: []
  }
};
```

## Data Protection

### 1. Encryption

**Data at Rest:**
- **Database Encryption:** AES-256 encryption for sensitive fields
- **File Storage:** S3 server-side encryption with KMS
- **Backup Encryption:** Encrypted backups with separate keys

**Data in Transit:**
- **TLS 1.3:** All communications encrypted
- **Certificate Pinning:** Prevent man-in-the-middle attacks
- **HSTS:** HTTP Strict Transport Security enforced

**Implementation Example:**
```javascript
// Encrypt sensitive data before storage
const encryptSensitiveData = (data, key) => {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    authTag: authTag.toString('hex'),
    algorithm: 'aes-256-gcm'
  };
};
```

### 2. Data Classification

**Classification Levels:**
- **Public:** Marketing materials, public listings
- **Internal:** Business processes, internal communications
- **Confidential:** Financial data, personal information
- **Restricted:** Authentication credentials, encryption keys

**Handling Requirements:**
```javascript
const dataClassification = {
  public: {
    encryption: false,
    accessControl: false,
    auditLogging: false
  },
  internal: {
    encryption: false,
    accessControl: true,
    auditLogging: true
  },
  confidential: {
    encryption: true,
    accessControl: true,
    auditLogging: true,
    dataLossPreventionRequired: true
  },
  restricted: {
    encryption: true,
    accessControl: true,
    auditLogging: true,
    dataLossPreventionRequired: true,
    specialHandling: true
  }
};
```

### 3. Personal Data Protection (GDPR/CCPA)

**Privacy by Design:**
- **Data Minimization:** Collect only necessary data
- **Purpose Limitation:** Use data only for stated purposes
- **Storage Limitation:** Retain data only as long as necessary
- **Consent Management:** Clear consent mechanisms

**Implementation:**
```javascript
// Privacy-compliant data handling
class PrivacyManager {
  async collectData(userId, dataType, purpose, consent) {
    // Verify consent
    if (!consent.granted) {
      throw new Error('Consent required for data collection');
    }
    
    // Log data collection
    await this.auditLog({
      action: 'data_collection',
      userId,
      dataType,
      purpose,
      timestamp: new Date(),
      legalBasis: consent.legalBasis
    });
    
    // Set retention policy
    await this.setRetentionPolicy(userId, dataType, purpose);
  }
  
  async deleteUserData(userId, dataType = 'all') {
    // Right to erasure implementation
    await this.anonymizeData(userId, dataType);
    await this.auditLog({
      action: 'data_deletion',
      userId,
      dataType,
      timestamp: new Date()
    });
  }
}
```

## Application Security

### 1. Input Validation & Sanitization

**Validation Framework:**
```javascript
// Input validation schema
const validationSchemas = {
  userRegistration: {
    email: {
      type: 'email',
      required: true,
      maxLength: 255
    },
    password: {
      type: 'string',
      required: true,
      minLength: 12,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    firstName: {
      type: 'string',
      required: true,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/
    }
  }
};

// Validation implementation
const validateInput = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required field check
    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Type validation
    if (value && !validateType(value, rules.type)) {
      errors.push(`${field} must be a valid ${rules.type}`);
    }
    
    // Length validation
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be less than ${rules.maxLength} characters`);
    }
    
    // Pattern validation
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }
  
  return errors;
};
```

### 2. Cross-Site Scripting (XSS) Prevention

**Content Security Policy (CSP):**
```javascript
// CSP configuration
const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Minimize usage
    "https://cdn.tailwindcss.com",
    "https://cdn.jsdelivr.net"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:"
  ],
  'connect-src': [
    "'self'",
    "https://api.ardoniecapital.com"
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};
```

**Output Encoding:**
```javascript
// HTML encoding for user content
const htmlEncode = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Safe DOM manipulation
const safeSetTextContent = (element, content) => {
  element.textContent = content; // Automatically escapes
};

const safeSetHTML = (element, html) => {
  // Use DOMPurify for safe HTML rendering
  element.innerHTML = DOMPurify.sanitize(html);
};
```

### 3. Cross-Site Request Forgery (CSRF) Protection

**CSRF Token Implementation:**
```javascript
// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
const validateCSRFToken = (sessionToken, requestToken) => {
  return crypto.timingSafeEqual(
    Buffer.from(sessionToken, 'hex'),
    Buffer.from(requestToken, 'hex')
  );
};

// Middleware for CSRF protection
const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const sessionToken = req.session.csrfToken;
    const requestToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!sessionToken || !requestToken || !validateCSRFToken(sessionToken, requestToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  
  next();
};
```

## Infrastructure Security

### 1. AWS Security Configuration

**S3 Bucket Security:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::ardonie-capital-ws",
        "arn:aws:s3:::ardonie-capital-ws/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

**CloudFront Security Headers:**
```yaml
# CloudFormation template excerpt
ResponseHeadersPolicy:
  Type: AWS::CloudFront::ResponseHeadersPolicy
  Properties:
    ResponseHeadersPolicyConfig:
      SecurityHeadersConfig:
        StrictTransportSecurity:
          AccessControlMaxAgeSec: 31536000
          IncludeSubdomains: true
        ContentTypeOptions:
          Override: true
        FrameOptions:
          FrameOption: DENY
          Override: true
        ReferrerPolicy:
          ReferrerPolicy: strict-origin-when-cross-origin
          Override: true
```

### 2. Network Security

**WAF Rules:**
- **SQL Injection Protection:** Block common SQL injection patterns
- **XSS Protection:** Filter malicious scripts
- **Rate Limiting:** Prevent brute force attacks
- **Geo-blocking:** Restrict access from high-risk countries
- **IP Whitelisting:** Allow only approved IP ranges for admin access

**DDoS Protection:**
- **AWS Shield Standard:** Automatic protection against common attacks
- **CloudFront:** Distributed traffic absorption
- **Rate Limiting:** Application-level request throttling

### 3. Monitoring & Incident Response

**Security Monitoring:**
```javascript
// Security event logging
class SecurityLogger {
  static logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      sessionId: event.sessionId
    };
    
    // Send to SIEM system
    this.sendToSIEM(logEntry);
    
    // Trigger alerts for high-severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      this.triggerAlert(logEntry);
    }
  }
  
  static async detectAnomalies(userId) {
    const recentEvents = await this.getRecentEvents(userId, '24h');
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      this.checkMultipleFailedLogins(recentEvents),
      this.checkUnusualLocationAccess(recentEvents),
      this.checkRapidAPIRequests(recentEvents),
      this.checkPrivilegeEscalation(recentEvents)
    ];
    
    return suspiciousPatterns.filter(pattern => pattern.detected);
  }
}
```

**Incident Response Plan:**
1. **Detection:** Automated monitoring and alerting
2. **Analysis:** Threat assessment and impact evaluation
3. **Containment:** Immediate threat isolation
4. **Eradication:** Remove threat and vulnerabilities
5. **Recovery:** Restore normal operations
6. **Lessons Learned:** Post-incident review and improvements

## Compliance & Auditing

### 1. Audit Logging

**Comprehensive Audit Trail:**
```javascript
// Audit logging implementation
class AuditLogger {
  static async logEvent(event) {
    const auditEntry = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      result: event.result,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      details: event.details,
      dataClassification: event.dataClassification
    };
    
    // Store in tamper-proof audit log
    await this.storeAuditEntry(auditEntry);
    
    // Real-time monitoring
    await this.processRealTimeAlerts(auditEntry);
  }
  
  static async generateAuditReport(startDate, endDate, filters = {}) {
    const events = await this.queryAuditLog(startDate, endDate, filters);
    
    return {
      summary: this.generateSummary(events),
      timeline: this.generateTimeline(events),
      userActivity: this.analyzeUserActivity(events),
      securityEvents: this.filterSecurityEvents(events),
      complianceMetrics: this.calculateComplianceMetrics(events)
    };
  }
}
```

### 2. Compliance Frameworks

**SOC 2 Type II Compliance:**
- **Security:** Access controls, encryption, monitoring
- **Availability:** Uptime monitoring, disaster recovery
- **Processing Integrity:** Data validation, error handling
- **Confidentiality:** Data classification, access restrictions
- **Privacy:** Consent management, data retention

**GDPR Compliance:**
- **Lawful Basis:** Clear legal basis for processing
- **Consent Management:** Granular consent controls
- **Data Subject Rights:** Access, rectification, erasure, portability
- **Data Protection Impact Assessments:** Regular privacy assessments
- **Breach Notification:** 72-hour breach reporting

## Security Testing

### 1. Automated Security Testing

**Static Application Security Testing (SAST):**
```javascript
// ESLint security rules
module.exports = {
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  }
};
```

**Dynamic Application Security Testing (DAST):**
```bash
# OWASP ZAP automated scan
zap-baseline.py -t https://staging.ardoniecapital.com -r zap-report.html

# Nuclei vulnerability scanner
nuclei -u https://staging.ardoniecapital.com -t vulnerabilities/
```

### 2. Penetration Testing

**Regular Security Assessments:**
- **Quarterly Internal Testing:** Internal security team assessments
- **Annual External Testing:** Third-party penetration testing
- **Continuous Bug Bounty:** Ongoing crowd-sourced security testing
- **Red Team Exercises:** Simulated advanced persistent threats

## Security Incident Response

### 1. Incident Classification

**Severity Levels:**
- **Critical:** Data breach, system compromise, service unavailability
- **High:** Privilege escalation, unauthorized access, data exposure
- **Medium:** Failed security controls, suspicious activity
- **Low:** Policy violations, minor security events

### 2. Response Procedures

**Immediate Response (0-1 hour):**
1. Incident detection and initial assessment
2. Incident commander assignment
3. Immediate containment actions
4. Stakeholder notification

**Short-term Response (1-24 hours):**
1. Detailed impact assessment
2. Evidence collection and preservation
3. Communication plan execution
4. Temporary mitigation measures

**Long-term Response (24+ hours):**
1. Root cause analysis
2. Permanent remediation
3. System restoration and validation
4. Post-incident review and improvements

## Security Training & Awareness

### 1. Developer Security Training

**Required Training Topics:**
- Secure coding practices
- OWASP Top 10 vulnerabilities
- Data protection and privacy
- Incident response procedures
- Security testing methodologies

### 2. User Security Awareness

**User Education Programs:**
- Phishing awareness training
- Password security best practices
- Multi-factor authentication setup
- Social engineering prevention
- Incident reporting procedures

---

*This security architecture document is regularly updated to reflect evolving threats and security best practices. For questions or security concerns, contact the security team at security@ardoniecapital.com.*
