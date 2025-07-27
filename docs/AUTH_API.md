# Auth API Endpoints

## Overview
This document describes the authentication API endpoints for the Equators project.

## Endpoints

### 1. User Registration
**POST** `/api/auth/register`

Register a new user with email and password.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "email"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. User Login
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "email"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. OAuth Login
**POST** `/api/auth/oauth`

Login or register using OAuth providers (Google/GitHub).

**Request Body:**
```json
{
  "email": "john@example.com",
  "fullName": "John Doe",
  "provider": "google",
  "providerId": "google_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth login successful",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "google"
    },
    "token": "jwt_token_here"
  }
}
```

### 4. Get User Profile
**GET** `/api/auth/profile`

Get the current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "email"
    }
  }
}
```

### 5. Update Hugging Face Token
**PATCH** `/api/auth/huggingface-token`

Update or remove the user's Hugging Face API token (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "huggingFaceToken": "hf_token_here"
}
```

To remove the token, send `null` or omit the field:
```json
{
  "huggingFaceToken": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hugging Face token updated successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "authType": "email",
      "hasHuggingFaceToken": true
    }
  }
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

JWT tokens expire after 7 days and include the following payload:
- `userId`: User's database ID
- `email`: User's email address
- `authType`: Authentication provider used

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error
