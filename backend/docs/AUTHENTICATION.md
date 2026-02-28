# Authentication System Documentation

## Overview

The ai-lab-notes backend implements a comprehensive JWT-based authentication system with support for:
- User registration and login
- Token refresh mechanism
- Password management (change, reset)
- Email verification
- Multi-device logout
- Token blacklisting for secure logout

## Authentication Flow

### Registration
```
POST /api/auth/register
├─ Create user account
├─ Hash password with bcrypt
├─ Generate email verification token
└─ Return access & refresh tokens
```

### Login
```
POST /api/auth/login
├─ Verify credentials
├─ Create refresh token record in DB
└─ Return access & refresh tokens
```

### Token Refresh
```
POST /api/auth/refresh
├─ Validate refresh token in database
├─ Generate new access token
└─ Create new refresh token record
```

### Logout
```
POST /api/auth/logout
├─ Mark refresh token as revoked
└─ User cannot refresh until login again
```

## API Endpoints

### User Registration
**POST** `/api/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Requirements:
- Username: 1-255 characters, unique
- Email: valid email format, unique
- Password: minimum 8 characters

Response (201):
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "random_token_from_db",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "emailVerified": false
  }
}
```

### User Login
**POST** `/api/auth/login`

Request body:
```json
{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

Response (200):
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "random_token_from_db",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "emailVerified": false
  }
}
```

### Refresh Access Token
**POST** `/api/auth/refresh`

Request body:
```json
{
  "refreshToken": "random_token_from_db"
}
```

Response (200):
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "new_random_token"
}
```

### Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <accessToken>
```

Response (200):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "emailVerified": false,
  "bio": null,
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Change Password
**POST** `/api/auth/change-password`

Headers:
```
Authorization: Bearer <accessToken>
```

Request body:
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

Response (200):
```json
{
  "message": "Password changed successfully. Please login again."
}
```

**Note:** Changing password logs out the user from all devices.

### Request Password Reset
**POST** `/api/auth/forgot-password`

Request body:
```json
{
  "email": "john@example.com"
}
```

Response (200):
```json
{
  "message": "Password reset link sent to email",
  "resetToken": "random_reset_token"
}
```

**Note:** In production, this token should be sent via email. For development, the token is returned in the response.

### Reset Password
**POST** `/api/auth/reset-password`

Request body:
```json
{
  "token": "random_reset_token",
  "newPassword": "NewPassword456"
}
```

Response (200):
```json
{
  "message": "Password reset successful. Please login with your new password."
}
```

### Verify Email
**POST** `/api/auth/verify-email`

Request body:
```json
{
  "token": "email_verification_token"
}
```

Response (200):
```json
{
  "message": "Email verified successfully"
}
```

### Resend Verification Email
**POST** `/api/auth/resend-verification`

Request body:
```json
{
  "email": "john@example.com"
}
```

Response (200):
```json
{
  "message": "Verification email sent",
  "verificationToken": "new_verification_token"
}
```

### Logout
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <accessToken>
```

Request body:
```json
{
  "refreshToken": "random_token_from_db"
}
```

Response (200):
```json
{
  "message": "Logged out successfully"
}
```

### Logout All Devices
**POST** `/api/auth/logout-all`

Headers:
```
Authorization: Bearer <accessToken>
```

Response (200):
```json
{
  "message": "Logged out from all devices"
}
```

## Token Management

### Access Token
- **Type**: JWT (JSON Web Token)
- **Expiration**: 24 hours (configurable)
- **Contains**: userId, username, role
- **Used for**: API requests authorization
- **Storage**: Client-side (localStorage/memory)

### Refresh Token
- **Type**: Random hex string (64 characters)
- **Expiration**: 7 days (configurable)
- **Storage**: Database for validation
- **Used for**: Obtaining new access tokens
- **Client Storage**: HttpOnly cookie (recommended) or localStorage

**Example JWT payload:**
```json
{
  "userId": 1,
  "username": "john_doe",
  "role": "user",
  "iat": 1672531200,
  "exp": 1672617600
}
```

## Security Features

### Password Security
✅ **Hashing**: bcrypt with 10 salt rounds
✅ **Minimum Length**: 8 characters (configurable)
✅ **No Plain Text**: Never stored in database
✅ **Change History**: Tracked with `lastPasswordChangeAt`

### Token Security
✅ **JWT Signature**: HMAC-SHA256
✅ **Expiration**: Automatic token expiration
✅ **Blacklisting**: Refresh tokens can be revoked
✅ **Database Storage**: Refresh tokens validated against DB
✅ **Device Tracking**: IP and User-Agent stored for tokens

### Password Reset Security
✅ **Token Expiration**: 1 hour
✅ **One-Time Use**: Token invalidated after use
✅ **Email Verification**: Link sent to registered email
✅ **No User Enumeration**: Same response for existing/non-existing emails (security best practice)

### Email Verification
✅ **Token Expiration**: 24 hours
✅ **Admin Auto-Verified**: Admin users skip email verification
✅ **Resend Capability**: Users can request new verification tokens

## Usage Examples

### Complete Authentication Flow

1. **Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new@example.com",
    "password": "SecurePass123"
  }'
```

2. **Verify Email** (optional, admin is auto-verified)
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_response"
  }'
```

3. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123"
  }'
```

Save the `accessToken` and `refreshToken` from response.

4. **Use Access Token**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

5. **Refresh Token When Expired**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

6. **Change Password**
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "oldPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

7. **Logout**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

## Client Implementation Tips

### TypeScript/React Example
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(username: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.saveTokens();
  }

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.saveTokens();
  }

  getAuthHeader() {
    return {
      'Authorization': `Bearer ${this.accessToken}`
    };
  }

  private saveTokens() {
    localStorage.setItem('tokens', JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    }));
  }
}
```

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required fields: username, email, password"
}
```

**401 Unauthorized**
```json
{
  "error": "Invalid username or password"
}
```

**400 Bad Request (Token Expired)**
```json
{
  "error": "Reset token has expired"
}
```

**400 Bad Request (Duplicate User)**
```json
{
  "error": "Username or email already exists"
}
```

## Best Practices

1. **Token Storage**
   - Access Token: Memory or SessionStorage (more secure, lost on page refresh)
   - Refresh Token: HttpOnly cookie (cannot be accessed by JavaScript)

2. **Token Refresh**
   - Refresh token automatically before expiration
   - Implement token refresh interceptor in HTTP client
   - Retry failed requests after refresh

3. **Security**
   - Use HTTPS in production
   - Set strong JWT_SECRET (minimum 32 characters)
   - Implement rate limiting on auth endpoints
   - Use secure password policy

4. **User Experience**
   - Show "token expired" notification to user
   - Automatically refresh tokens in background
   - Clear tokens on logout

5. **Password Management**
   - Enforce minimum password length
   - Encourage strong passwords
   - Implement password change periodically
   - Hash passwords with bcrypt (never store plain text)

## Future Enhancements

- [ ] Two-Factor Authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] OAuth2 integration
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Email-based OTP
- [ ] Session management UI
- [ ] Device management UI
