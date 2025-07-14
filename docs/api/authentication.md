# Authentication API Documentation

## Overview

The Authentication API provides secure user authentication, authorization, and session management for the Ardonie Capital platform. It supports role-based access control with buyer, seller, and admin roles.

## Base URL
```
https://api.ardoniecapital.com/auth
```

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer", // "buyer", "seller", "admin"
  "company": "Example Corp", // Optional for buyers
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "verified": true,
    "lastLogin": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600
}
```

### 3. Token Refresh

**Endpoint:** `POST /refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token_here",
  "expiresIn": 3600
}
```

### 4. Logout

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## User Management

### Get User Profile

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "company": "Example Corp",
    "phone": "+1-555-0123",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z",
    "preferences": {
      "notifications": true,
      "newsletter": false
    }
  }
}
```

### Update User Profile

**Endpoint:** `PUT /profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company",
  "phone": "+1-555-0124",
  "preferences": {
    "notifications": false,
    "newsletter": true
  }
}
```

### Change Password

**Endpoint:** `PUT /password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

## Password Reset

### Request Password Reset

**Endpoint:** `POST /forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

**Endpoint:** `POST /reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword456!"
}
```

## Email Verification

### Send Verification Email

**Endpoint:** `POST /send-verification`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verify Email

**Endpoint:** `POST /verify-email`

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

## Role-Based Access Control

### Check Permissions

**Endpoint:** `GET /permissions`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "permissions": {
    "canViewListings": true,
    "canCreateListings": false,
    "canEditListings": false,
    "canDeleteListings": false,
    "canAccessDashboard": true,
    "canViewReports": false,
    "canManageUsers": false
  }
}
```

## Error Responses

### Authentication Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 12 characters"]
  }
}
```

## Security Features

### Password Requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management
- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Automatic token refresh
- Secure logout with token invalidation

### Rate Limiting
- Login attempts: 5 per minute per IP
- Registration: 3 per hour per IP
- Password reset: 1 per hour per email

## Code Examples

### JavaScript/Fetch
```javascript
// Login example
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Authenticated request example
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry request with new token
    return makeAuthenticatedRequest(url, options);
  }
  
  return response.json();
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/auth/profile');
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const userData = await loginUser(email, password);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

## Testing

### Unit Tests
```javascript
describe('Authentication API', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'ValidPassword123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
  
  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

## Support

For API support and questions:
- Email: api-support@ardoniecapital.com
- Documentation: https://docs.ardoniecapital.com
- Status Page: https://status.ardoniecapital.com
