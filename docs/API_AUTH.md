# CanonKiln Authentication API

## Overview

CanonKiln uses JWT (JSON Web Token) based authentication for user management and project ownership. All authenticated requests include a Bearer token in the Authorization header.

## Authentication Flow

```
1. User registers → receives JWT token
2. User logs in → receives JWT token
3. Client stores token (localStorage/cookie)
4. Client includes token in all GraphQL requests
5. Server validates token and extracts userId
6. Resolvers use userId for authorization
```

## Environment Variables

```env
# Required for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d  # Token expiration (default: 7 days)
```

## GraphQL API

### Registration

Create a new user account.

**Mutation:**
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      displayName
      createdAt
    }
  }
}
```

**Input:**
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123",
    "displayName": "John Doe"  // optional
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "displayName": "John Doe",
        "createdAt": "2026-02-21T17:56:00.000Z"
      }
    }
  }
}
```

**Validation:**
- Email must be valid format
- Password must be at least 8 characters
- Email must be unique

---

### Login

Authenticate with existing credentials.

**Mutation:**
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      displayName
      createdAt
      lastLogin
    }
  }
}
```

**Input:**
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123"
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "displayName": "John Doe",
        "createdAt": "2026-02-21T17:56:00.000Z",
        "lastLogin": "2026-02-21T18:30:00.000Z"
      }
    }
  }
}
```

**Errors:**
- `Invalid email or password` (generic for security)

---

### Get Current User

Get the authenticated user's profile.

**Query:**
```graphql
query Me {
  me {
    id
    email
    displayName
    createdAt
    updatedAt
    lastLogin
  }
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "data": {
    "me": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "displayName": "John Doe",
      "createdAt": "2026-02-21T17:56:00.000Z",
      "updatedAt": "2026-02-21T18:00:00.000Z",
      "lastLogin": "2026-02-21T18:30:00.000Z"
    }
  }
}
```

**Errors:**
- `Not authenticated` (401) - Missing or invalid token

---

### Get Public User Profile

Get a user's public profile by ID.

**Query:**
```graphql
query User($id: ID!) {
  user(id: $id) {
    id
    email
    displayName
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "displayName": "John Doe",
      "createdAt": "2026-02-21T17:56:00.000Z"
    }
  }
}
```

**Note:** Returns only public fields (no password, email is included for now but could be removed in future versions)

---

### Update Profile

Update the authenticated user's profile.

**Mutation:**
```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    email
    displayName
    updatedAt
  }
}
```

**Input:**
```json
{
  "input": {
    "displayName": "Jane Doe"
  }
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "data": {
    "updateProfile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "displayName": "Jane Doe",
      "updatedAt": "2026-02-21T19:00:00.000Z"
    }
  }
}
```

---

### Change Password

Change the authenticated user's password.

**Mutation:**
```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    message
  }
}
```

**Input:**
```json
{
  "input": {
    "currentPassword": "oldpassword123",
    "newPassword": "newsecurepassword456"
  }
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "data": {
    "changePassword": {
      "message": "Password updated successfully"
    }
  }
}
```

**Validation:**
- Current password must be correct
- New password must be at least 8 characters

**Errors:**
- `Current password is incorrect`
- `New password must be at least 8 characters`

---

## Project Authorization

All project queries and mutations require authentication. Projects are scoped to the authenticated user.

**Protected Queries:**
```graphql
# Only returns projects owned by authenticated user
projects: [Project!]!

# Only returns project if owned by authenticated user
project(id: ID!): Project
```

**Protected Mutations:**
```graphql
# Creates project with authenticated user as owner
createProject(input: CreateProjectInput!): Project!

# Only allows updates to projects owned by authenticated user
updateProject(id: ID!, input: UpdateProjectInput!): Project!

# Only allows deletion of projects owned by authenticated user
deleteProject(id: ID!): Response!
```

**Authorization Pattern:**
```javascript
// All project resolvers check:
if (!context.userId) {
  throw new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHENTICATED' }
  });
}

// All project operations filtered by userId:
MATCH (p:Project {id: $id, userId: $userId})
```

---

## Client Integration

### React (Apollo Client)

**Setup:**
```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

**Usage:**
```javascript
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from './graphql/mutations';

function RegisterForm() {
  const [register, { data, loading, error }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await register({
      variables: {
        input: {
          email: 'user@example.com',
          password: 'password123',
          displayName: 'John Doe',
        },
      },
    });
    
    // Store token
    localStorage.setItem('authToken', data.register.token);
    
    // Redirect or update UI
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Security Best Practices

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Use HTTPS in production (tokens sent over secure connection)
- [ ] Set secure cookie flags if using cookies
- [ ] Implement rate limiting on auth endpoints
- [ ] Add password strength requirements
- [ ] Implement account lockout after failed login attempts
- [ ] Add email verification flow
- [ ] Implement password reset functionality
- [ ] Log auth events for security monitoring
- [ ] Add CSRF protection if using cookies
- [ ] Implement refresh token rotation
- [ ] Add 2FA support for sensitive operations

### Current Security Measures

✅ Passwords hashed with bcrypt (10 salt rounds)
✅ JWTs signed with secret key
✅ 7-day token expiration
✅ Input validation (email format, password length)
✅ Generic error messages (don't reveal user existence)
✅ User data scoped to authenticated user
✅ Authorization checks on all protected operations

---

## Testing

### Manual Testing with GraphQL Playground

1. **Register a user:**
```graphql
mutation {
  register(input: {
    email: "test@example.com"
    password: "password123"
    displayName: "Test User"
  }) {
    token
    user { id email displayName }
  }
}
```

2. **Copy the token from response**

3. **Add to HTTP headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

4. **Test protected query:**
```graphql
query {
  me {
    id
    email
    displayName
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | Missing or invalid auth token |
| `NOT_FOUND` | User or resource not found |
| `BAD_USER_INPUT` | Invalid input (email format, password length, etc.) |

---

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Refresh token rotation
- [ ] OAuth providers (Google, GitHub)
- [ ] Role-based access control (ADMIN, USER)
- [ ] API key authentication for external integrations
- [ ] Session management (view active sessions, revoke tokens)
- [ ] Account deletion with data export
