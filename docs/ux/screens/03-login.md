# Login Page

## Overview

The login page provides authentication via Google OAuth. It's a simple, focused page for signing in or creating a new account.

## Route

- **Path:** `/login`
- **Access:** Public (redirects to Dashboard if already authenticated)
- **Component:** `src/pages/login.tsx`

## Visual Design

- Centered card layout
- Dark zinc background with subtle border
- Google OAuth button with recognizable branding
- Minimal, focused design

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │                                   │           │
│         │    Sign in to Game Planner        │           │
│         │                                   │           │
│         │  Connect your account to start    │           │
│         │       building worlds             │           │
│         │                                   │           │
│         │  ┌─────────────────────────────┐  │           │
│         │  │ [Error message if present]  │  │           │
│         │  └─────────────────────────────┘  │           │
│         │                                   │           │
│         │  ┌─────────────────────────────┐  │           │
│         │  │ [G] Continue with Google    │  │           │
│         │  └─────────────────────────────┘  │           │
│         │                                   │           │
│         │   By signing in, you agree to    │           │
│         │   our Terms of Service and       │           │
│         │         Privacy Policy           │           │
│         │                                   │           │
│         └───────────────────────────────────┘           │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Continue with Google button | Click | Redirects to Google OAuth flow |

## States

### Loading State
- Shows "Loading..." centered in viewport
- Displayed while checking authentication status

### Error State
- Red-tinted error box appears above the login button
- Error message from URL parameter is displayed
- Common error: "Authentication failed. Please try again."

### Authenticated State
- User is automatically redirected to Dashboard
- Page content not displayed

### Default State
- Card with title, description, and Google login button
- Legal text about Terms of Service and Privacy Policy

## Error Handling

Errors are passed via URL query parameter:
- `?error=auth_failed` → "Authentication failed. Please try again."
- Other error values displayed as-is

## User Flow

```
Login Page
     │
     ├──[Already logged in]──→ Redirect to Dashboard (/)
     │
     └──[Continue with Google]──→ Google OAuth
                                      │
                                      ├──[Success]──→ Dashboard (/)
                                      │
                                      └──[Failure]──→ Login (?error=auth_failed)
```

## Behavior Notes

- Breadcrumbs are cleared when navigating to this page
- Page checks auth status on load and redirects if authenticated
- Google button has white background with black text for brand consistency
- Legal disclaimer links (Terms/Privacy) are text-only (not clickable in current implementation)
