# CanonKiln Style Guide

## Design Philosophy

- **Warm = creation / generation** - Ember tones for active, creative actions
- **Cool = structure / graph / system** - Teal and indigo for structural elements
- **Dark = seriousness / tooling** - Deep backgrounds convey professional focus
- Avoid pure white backgrounds
- Use glow effects only on primary actions and graph interactions

The palette keeps CanonKiln feeling: **Premium, Focused, Creative without being playful, Clearly a tool not a toy**

---

## Color Palette

### Core Brand Colors

These define the identity.

| Name | Hex | Usage |
|------|-----|-------|
| Ember Core (Primary) | `#F28C28` | Primary CTAs, active states, key highlights |
| Molten Gold (Highlight) | `#FFB703` | Hover states, progress indicators |
| Forge Orange (Accent) | `#D97706` | Secondary emphasis, generation indicators |

### Cool Contrast Colors

These balance the heat and keep it modern.

| Name | Hex | Usage |
|------|-----|-------|
| Arcane Indigo (Background) | `#1B1F2A` | App background |
| Deep Charcoal (Surface) | `#14161D` | Panels, cards, modals |
| Graph Teal (Secondary) | `#3AB7A8` | Graph edges, node glow, secondary actions |

### Neutral / Structural

For text, UI chrome, and readability.

| Name | Hex | Usage |
|------|-----|-------|
| Ash White (Primary Text) | `#E6E6E6` | Body text, headings |
| Stone Gray (Secondary) | `#9CA3AF` | Secondary labels, placeholders |
| Obsidian Black (Borders) | `#0B0D12` | Dividers, outlines, deep shadows |

### Magical Accents

Use sparingly for special states.

| Name | Hex | Usage |
|------|-----|-------|
| Ember Red (Danger) | `#C2410C` | Errors, destructive actions |
| Mystic Violet (Rare) | `#7C3AED` | Rare/special entities, high-value nodes |

---

## Theme Object

```javascript
const theme = {
  background: "#1B1F2A",
  surface: "#14161D",
  border: "#0B0D12",

  primary: "#F28C28",
  primaryHover: "#FFB703",
  accent: "#3AB7A8",

  textPrimary: "#E6E6E6",
  textSecondary: "#9CA3AF",

  danger: "#C2410C",
  rare: "#7C3AED",
}
```

---

## Tailwind CSS Variables

```css
:root {
  /* Brand */
  --ck-ember: #F28C28;
  --ck-gold: #FFB703;
  --ck-forge: #D97706;

  /* Backgrounds */
  --ck-indigo: #1B1F2A;
  --ck-charcoal: #14161D;
  --ck-obsidian: #0B0D12;

  /* Accents */
  --ck-teal: #3AB7A8;
  --ck-danger: #C2410C;
  --ck-rare: #7C3AED;

  /* Text */
  --ck-ash: #E6E6E6;
  --ck-stone: #9CA3AF;
}
```

---

## Component Guidelines

### Buttons

- **Primary**: Ember Core background, Ash White text
- **Primary Hover**: Molten Gold background
- **Secondary/Ghost**: Transparent with Ash White text, Ember Core on hover
- **Danger**: Ember Red background

### Cards & Panels

- Background: Deep Charcoal (`#14161D`)
- Border: Obsidian Black (`#0B0D12`)
- Hover: Subtle Ember Core border glow

### Text

- Headings: Ash White (`#E6E6E6`)
- Body: Ash White (`#E6E6E6`)
- Secondary/Muted: Stone Gray (`#9CA3AF`)
- Links: Graph Teal (`#3AB7A8`)

### Graph Elements

- Nodes: Deep Charcoal with Ember Core border
- Edges: Graph Teal
- Selected: Molten Gold glow
- Hover: Ember Core glow

### Form Elements

- Input Background: Deep Charcoal
- Input Border: Obsidian Black
- Focus Border: Ember Core
- Placeholder: Stone Gray

---

## Glow Effects

Use sparingly for emphasis:

```css
/* Primary action glow */
.glow-ember {
  box-shadow: 0 0 20px rgba(242, 140, 40, 0.3);
}

/* Graph node glow */
.glow-teal {
  box-shadow: 0 0 15px rgba(58, 183, 168, 0.4);
}

/* Selected/active glow */
.glow-gold {
  box-shadow: 0 0 25px rgba(255, 183, 3, 0.4);
}
```
