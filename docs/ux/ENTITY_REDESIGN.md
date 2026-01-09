# CanonKiln Entity Editor Redesign Plan

## Overview

This document describes the next iteration of the CanonKiln Entity Editor. The intent is to improve scalability, clarity, and creative flow as worlds grow in size and complexity, while keeping the editor approachable and writing‑first. The underlying data model remains graph‑based, but the interface is organized around human concepts like writing, inclusion, and organization.

The editor should feel like a place to **write, collect, and arrange ideas**, not a place to manage data structures.

---

## Editor Layout

### Primary Canvas

The main editor column remains the primary focus and contains:

* Header with breadcrumbs, avatar, inline‑editable name, and entity type badge
* Image carousel (unchanged)
* Tags (unchanged)
* Description editor (rich text, autosave, inline mentions)
* Minimal type‑specific fields for Events and Narratives

This column is calm by default and optimized for uninterrupted writing.

### Connections Area

Rather than presenting all connections as always-visible sections, the editor uses a **progressive navigation strategy** to keep the interface quiet by default and reveal structure only when useful.

Connected content is accessed through **focused navigation affordances** instead of persistent lists. These affordances let users ask questions about the current entity (who is involved, what is here, where does this appear) rather than browse exhaustive structures.

Connections are surfaced through a combination of:

* Contextual previews (small, inline summaries)
* On-demand expansion (explore / view controls)
* Writing-driven discovery (inline mentions)

The goal is to reduce visual noise while preserving fast access to related content.

---

## Navigation Model for Connected Content

Connected content is navigated through **progressive depth**, moving from awareness → context → intent → navigation. Each step adds information only when the user asks for it.

The navigation model follows four layers:

1. **Implicit Layer (Base Level)**

   * No lists or previews are shown
   * Connections are created automatically through writing and inclusion
   * Only subtle signals exist (counts, icons, lightweight text)

2. **Signal Layer**

   * Small inline indicators communicate presence, not detail
   * Examples: "5 characters involved", "3 locations", "Appears in 2 events"
   * Signals are clickable but visually quiet

3. **Preview Layer**

   * Activating a signal opens a **preview modal**
   * The modal presents a browsable summary of connected entities
   * Each preview includes:

     * Entity name and type
     * A short description excerpt
     * A medium-sized preview image (hero or fallback)
   * This layer is designed for scanning and sense-making, not commitment

4. **Navigate Layer (Final)**

   * Selecting a preview navigates to the full Entity Editor for that entity
   * Navigation is intentional and explicit
   * The user never jumps context accidentally

This progression supports fast writing, lightweight understanding, and deliberate exploration without overwhelming the editor surface.

---

## Connected Content by Entity Type

Each entity type defines potential **lenses** for exploration rather than fixed, always-visible sections. These lenses describe the kinds of questions a creator may want to ask about the entity.

### Universe

Possible lenses:

* Narratives
* Places
* Characters
* Items

### Place

Possible lenses:

* Characters here
* Items here
* Nearby or connected places

### Character

Possible lenses:

* Items carried or owned
* Associated places
* Connected characters

### Item

Possible lenses:

* Owned or held by
* Kept at or found at
* Appears in

### Narrative

Possible lenses:

* Scenes / events
* Key characters
* Key places
* Key items

### Event

Possible lenses:

* Characters involved
* Items involved
* Locations
* Part of story

Lenses are not all shown at once. They are activated through previews or explicit exploration.

---

### Place

* Characters here
* Items here
* Nearby or connected places

Actions: Add character, item, place

---

### Character

* Items carried or owned
* Associated places
* Connected characters

Actions: Add item, place, character

---

### Item

* Owned or held by (characters)
* Kept at or found at (places)
* Appears in (events or narratives)

Actions: Add character, place, event, narrative

---

### Narrative

* Scenes / events
* Key characters
* Key places
* Key items

Actions: Add event, character, place, item

---

### Event

* Characters involved
* Items involved
* Locations
* Part of story

Actions: Add character, item, location, set story

---

## Section Interaction

### Default View

* Displays up to five items
* Each item shows icon, name, and optional context badge
* Items can be removed individually

### View All

* Opens a modal or drawer
* Supports search, sorting, and bulk actions
* Allows creation of new entities in context

---

## Writing‑First Connections

### Inline Mentions

Within the description editor, typing `@` opens an autocomplete for entities in scope.

Selecting an entity:

* Inserts a rich link chip into the text
* Automatically adds the entity to the appropriate section based on context

### Inference Rules

The section an entity is added to depends on the current editor and the type of entity mentioned. For example:

* In an Event:

  * Characters → Characters involved
  * Items → Items involved
  * Places → Locations

* In a Narrative:

  * Events → Scenes / events
  * Characters → Key characters
  * Places → Key places
  * Items → Key items

* In a Place:

  * Characters → Characters here
  * Items → Items here
  * Places → Nearby or connected places

* In a Character:

  * Items → Items carried or owned
  * Places → Associated places
  * Characters → Connected characters

* In an Item:

  * Characters → Owned or held by
  * Places → Kept at or found at
  * Events or Narratives → Appears in

### Feedback

After an inline mention creates a connection, a brief confirmation appears with an undo option. Undo removes only the connection created by that action.

---

## Creation Flows

### Adding Existing Content

Each section includes an action to add existing entities of the appropriate type. The add flow supports search and multi‑select.

### Creating New Content

Creation is available directly from the add flow. Newly created entities are automatically included in the current section and can be opened immediately for editing.

---

## Provenance Handling

Connections may be created explicitly (via section actions) or implicitly (via inline mentions). This distinction is tracked internally and may be surfaced subtly in the UI when helpful (for example, as a small badge), without affecting the core interaction model.

---

## Scaling Strategy

* The default editor view never grows more complex as connections increase
* Large worlds remain manageable because structure is revealed only on demand
* Exploration tools scale independently from the writing surface
* New lenses can be added without increasing baseline visual complexity

---

## Implementation Notes

* Connections should be fetched as sectioned data rather than raw links
* UI components should be generic and driven by section definitions
* Inline mentions trigger immediate, discrete mutations
* Autosave behavior for text remains unchanged

---

## Resulting Experience

The editor supports three natural activities:

1. Writing and describing
2. Including and organizing important elements
3. Exploring what is connected when needed

The interface stays quiet by default and grows in capability only when the user asks for it.
