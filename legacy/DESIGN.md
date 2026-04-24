# Design System Strategy: The Civic Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Civic Architect"**

The design system moves away from the aggressive, high-pressure aesthetics of traditional real estate and toward a "Civic Architect" persona: authoritative yet approachable, structured yet fluid. This system is designed to transform the friction of Philadelphia’s rental licensing and government-related processes into a calm, editorial-grade experience.

To break the "template" look, we utilize **Intentional Asymmetry**. By pairing heavy, left-aligned typography with generous right-side white space, we create a rhythmic "breathing" layout. We bypass the standard rigid grid by layering surfaces of varying tonal depths, ensuring the UI feels like a curated stack of high-end stationery rather than a digital spreadsheet. This approach conveys "Trust" not through bold colors, but through meticulous attention to spatial harmony and legibility.

---

## 2. Colors: Tonal Depth & The No-Line Rule
The color palette uses the provided brand tones not as decorative accents, but as functional layers that guide the eye through complex workflows.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Traditional borders create visual noise that increases cognitive load in complex forms. 
- **Boundaries:** Use shifts in background tokens (e.g., a `surface-container-low` card placed on a `surface` background).
- **Transitions:** Use subtle 8px–16px vertical padding shifts between tokens to signify the end of a section.

### Surface Hierarchy & Nesting
Treat the UI as a physical environment. 
- **Level 0 (Base):** `surface` (#f8f9fd) – The expansive canvas.
- **Level 1 (Sections):** `surface-container-low` (#f3f3f7) – For large grouping areas.
- **Level 2 (Active Elements):** `surface-container-lowest` (#ffffff) – For interactive cards or data entry zones. 

### Signature Textures
- **The Tonal Gradient:** For primary action areas or hero headers, use a subtle linear gradient from `primary` (#4f3887) to `primary-container` (#6750a1) at a 135-degree angle. This adds a "lithographic" quality that flat hex codes lack.
- **Glassmorphism:** For floating navigation or modal overlays, use `surface` at 80% opacity with a `24px` backdrop-blur. This keeps the user grounded in their current context.

---

## 3. Typography: Editorial Authority
By utilizing **Public Sans** for structure and **Inter** for utility (as sophisticated alternatives within the brand's requested clean aesthetic), we establish an hierarchy that feels like a modern broadsheet.

*Note: While the brand guide specifies Overpass, we use the following scale to ensure the "Civic Architect" persona is maintained across digital interfaces.*

*   **Display (Large/Medium):** `display-lg` (3.5rem) / `display-md` (2.75rem). Use these sparingly for welcoming the user or high-level status updates.
*   **Headlines:** `headline-sm` (1.5rem). Use `on-surface` (#191c1f) for these to provide a "grounded" feel.
*   **Body:** `body-lg` (1rem). Set with a generous line-height (1.6) to ensure government forms do not feel claustrophobic.
*   **Labels:** `label-md` (0.75rem). Used exclusively for metadata or form hints, utilizing the `on-surface-variant` (#494550) to de-emphasize secondary information.

---

## 4. Elevation & Depth: Tonal Layering
Traditional "drop shadows" are often too aggressive for a "calm and practical" system. We replace them with **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A white `surface-container-lowest` card on a `surface-container-low` background creates a soft, natural lift that suggests importance without shouting.
*   **Ambient Shadows:** If an element must float (e.g., a "Save" button bar), use a shadow with a 32px blur and 4% opacity. The shadow color must be tinted with `on-surface` (#191c1f) to ensure it feels like a natural shadow on a cool-toned surface.
*   **The Ghost Border:** If a boundary is required for accessibility (e.g., in high-contrast modes), use a 1px stroke of `outline-variant` (#cbc4d2) at **20% opacity**. Never use a 100% opaque border.

---

## 5. Components: Functional Elegance

### Buttons
*   **Primary:** A gradient fill (`primary` to `primary-container`). Roundedness: `md` (0.375rem). No shadow.
*   **Secondary:** `surface-container-highest` background with `on-primary-fixed-variant` text.
*   **Tertiary:** No background. Text-only with a subtle underline using `secondary` (#006b5b) at 30% opacity on hover.

### Input Fields
*   **Structure:** No 4-sided boxes. Use a "Shelf" approach: a `surface-container-high` background with a 2px bottom-stroke of `outline`. 
*   **Focus State:** The bottom stroke transitions to `secondary` (#006b5b), and the background shifts to `surface-container-highest`.

### Cards & Lists
*   **Forbidden:** Horizontal 1px dividers.
*   **The Alternative:** Use vertical whitespace (16px, 24px, or 32px) and subtle shifts between `surface-container` tiers to distinguish list items.
*   **Rental Licensing Tracker:** Use a "Timeline Card" that uses a `secondary` vertical pill to indicate progress, rather than a standard checkbox.

### Navigation (The Hub)
*   Instead of a standard top-nav, use a **Sidebar Pillar** in `tertiary` (#444554). This provides an "Office of Record" feel, signaling that HubKey is a professional partner in Philadelphia's real estate landscape.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts where the left margin is wider than the right to create an editorial feel.
*   **Do** use `secondary` (#006b5b) as the "Success" or "Action" color to provide a calming, grounded alternative to bright greens.
*   **Do** lean into the "Light grayish blue" (#e2e3e7) for large background areas to reduce eye strain during long licensing applications.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#191c1f) to maintain a premium, ink-on-paper feel.
*   **Don't** use standard "Material Design" shadows. They feel too generic for the bespoke, trustworthy HubKey brand.
*   **Don't** use more than two "surface" tiers in a single nested view. Over-nesting creates a "Russian Doll" effect that confuses the user hierarchy.