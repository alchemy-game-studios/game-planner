# Landing Page

## Overview

The landing page is the public-facing entry point for unauthenticated users. It introduces CanonKiln's core value proposition and provides clear calls-to-action for signing in.

## Route

- **Path:** `/`
- **Access:** Public (unauthenticated users only)
- **Component:** `src/pages/landing.tsx`

## Visual Design

- Dark gradient background (indigo → charcoal → black)
- Centered hero layout with kiln/flame iconography
- CanonKiln logo prominently displayed
- Ember-colored accent buttons

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]                                    [Sign In Btn] │  ← Fixed header
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    🔥 Kiln Icon                         │
│                                                         │
│                   [CanonKiln Logo]                      │
│                                                         │
│            "Forge Games from Your Canon"                │
│                                                         │
│     Transform your creative IP into games, books,       │
│          and media. Build worlds, craft                 │
│       characters, and bring your stories to life.       │
│                                                         │
│                  [Get Started Btn]                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Build     │ │   Design    │ │ AI-Powered  │        │
│  │  Universes  │ │  Products   │ │             │        │
│  │             │ │             │ │             │        │
│  │ Create rich │ │ Transform   │ │ Generate    │        │
│  │ worlds...   │ │ your IP...  │ │ art...      │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Sign In button (header) | Click | Initiates Google OAuth login flow |
| Get Started button | Click | Initiates Google OAuth login flow |
| Feature cards | View only | No interaction (informational) |
| Logo (header) | View only | No interaction on this page |

## User Flow

```
Landing Page
     │
     ├──[Sign In]──→ Google OAuth ──→ Dashboard (authenticated)
     │
     └──[Get Started]──→ Google OAuth ──→ Dashboard (authenticated)
```

## Content Sections

### Header (Fixed)
- CanonKiln logo (left)
- Sign In button (right, ember-colored)

### Hero Section
- Animated kiln flame icon with glow effect
- Large CanonKiln logo
- Headline: "Forge Games from Your Canon"
- Subheadline explaining the platform's purpose
- Primary CTA: "Get Started" button

### Feature Preview (3 columns)
1. **Build Universes** - Create rich worlds with interconnected characters, places, and lore
2. **Design Products** - Transform your IP into card games, board games, books, and more
3. **AI-Powered** - Generate art, mechanics, and content with intelligent assistance

## Responsive Behavior

- Single column layout on mobile
- Three-column feature grid on tablet/desktop
- Headline scales from 4xl to 6xl based on viewport

## Notes

- This page is only shown to unauthenticated users
- Authenticated users are automatically redirected to the Dashboard
- All CTAs lead to the same Google OAuth flow
