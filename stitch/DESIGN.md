---
name: Alpine Technical
colors:
  surface: '#f8f9fd'
  surface-dim: '#d8dade'
  surface-bright: '#f8f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8ec'
  surface-container-highest: '#e1e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#434843'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#eff1f4'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#a63b00'
  on-secondary: '#ffffff'
  secondary-container: '#fe5f00'
  on-secondary-container: '#521900'
  tertiary: '#21140c'
  on-tertiary: '#ffffff'
  tertiary-container: '#372820'
  on-tertiary-container: '#a48e83'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#f7ddd0'
  tertiary-fixed-dim: '#dac2b5'
  on-tertiary-fixed: '#261911'
  on-tertiary-fixed-variant: '#54433a'
  background: '#f8f9fd'
  on-background: '#191c1f'
  surface-variant: '#e1e2e6'
typography:
  headline-xl:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Archivo Narrow
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for a premium, high-performance outdoor equipment platform. The brand personality is rugged, precise, and authoritative—evoking the feeling of high-end mountaineering gear. It balances the raw durability of the wilderness with the sophisticated technology of modern rental logistics.

The aesthetic follows a **Modern-Technical** movement. It utilizes high-density layouts, crisp borders, and intentional whitespace to communicate professional-grade reliability. Subtle glassmorphism is used sparingly on overlays and navigation bars to suggest a layer of digital intelligence over the "earthy" core palette. The goal is to make the user feel like they are operating a piece of precision instrumentation, not just a website.

## Colors
The palette is rooted in a "Forest & Granite" foundation with high-visibility accents.

- **Primary (Forest Green):** Used for primary navigation, headers, and deep brand moments. It represents stability and the outdoors.
- **Secondary (Safety Orange):** Reserved strictly for primary calls-to-action (CTAs), urgent availability states, and critical interactions.
- **Tertiary (Earth Brown):** Used for subtle accents, category icons, and natural textures in the UI.
- **Neutral (Granite Gray):** Used for body text, borders, and secondary UI elements to provide a hard, technical edge.
- **Background (Alpine White):** A very light gray-white that reduces glare and maintains a high-density, clean workspace feel.

## Typography
The typography strategy pairings a technical, condensed sans-serif for headings with a highly legible, systematic sans-serif for UI and body text.

- **Headlines:** Uses Archivo Narrow. The condensed nature allows for high-impact titles that mimic equipment labels and technical specifications.
- **Body & UI:** Uses Inter. Chosen for its exceptional legibility at small sizes within data-heavy tables and property lists.
- **Labels:** Small labels use uppercase with increased letter spacing to emulate the stamped or printed "spec sheets" found on outdoor hardware.

## Layout & Spacing
The layout follows a **Rigid Grid** philosophy to reinforce the feeling of precision. 

- **Grid:** A 12-column grid for desktop with 20px gutters. Content should align strictly to these columns to create a structured, "engineered" look.
- **Density:** The system uses a "Compact but Calm" approach. Padding inside cards and lists is kept tight (16px) to maximize information density, while larger external margins (40px+) provide the "Calm" whitespace necessary to prevent the UI from feeling cluttered.
- **Breakpoints:** 
    - **Mobile (<768px):** Single column, 16px side margins. 
    - **Tablet (768px - 1024px):** 6-column grid. 
    - **Desktop (>1024px):** 12-column grid, max content width of 1440px.

## Elevation & Depth
Depth in this design system is achieved through physical layering rather than dramatic shadows.

- **Tonal Layers:** The primary background is Alpine White. Secondary containers (sidebars, card backgrounds) use a slightly different tint or a 1px border in Granite Gray (#D1D5DB).
- **Shadows:** Use extremely tight, low-blur "technical shadows" (e.g., `0px 2px 4px rgba(0,0,0,0.05)`) to lift interactive elements like cards.
- **Glassmorphism:** Navigation bars and sticky headers should use a `backdrop-filter: blur(12px)` with a 80% opacity white fill. This creates a "lens" effect that feels modern and high-tech.
- **Borders:** Every card and input should have a subtle 1px border. This reinforces the "constructed" feel of the UI.

## Shapes
Shapes are disciplined and "Soft-Square." While sharp corners are too aggressive, overly rounded corners feel too "consumer-soft." 

- **Standard Radius:** 0.25rem (4px) for most components (inputs, small buttons, tags).
- **Container Radius:** 0.5rem (8px) for cards and modals to provide a slight structural softening.
- **Buttons:** Maintain the 4px radius to ensure they look like tactile physical buttons found on GPS units or high-end cameras.

## Components
- **Buttons:** Primary buttons are Safety Orange with white text. Secondary buttons use Forest Green or Granite Gray outlines. Interaction states (hover) should involve a slight darkening of the fill, never a change in size.
- **Inventory Cards:** These feature a top-aligned image, a 1px Granite Gray border, and a "Technical Spec" footer. Availability is shown via a "Badge" component in the top-right corner.
- **Badges:** Use a high-contrast background (Safety Orange for "Low Stock," Forest Green for "Available") with the `label-sm` typography.
- **Input Fields:** Flat Alpine White background with a 1px Granite Gray border. On focus, the border thickens to 2px and changes to Forest Green.
- **Filtering Sidebar:** High-density vertical stack. Uses "Accordion" sections with thin dividers. Filter options use small, square checkboxes to maintain the technical theme.
- **Validation:** Errors and warnings use Safety Orange for the border and icon, but the text remains Granite Gray for maximum readability against the light background.