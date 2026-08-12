---
name: Entrepreneurial Precision
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#44474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#6bfe9c'
  on-secondary-container: '#00743a'
  tertiary: '#350000'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c0001'
  on-tertiary-container: '#fb5a48'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#910807'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  numeric-data:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is engineered for entrepreneurs who require clarity, speed, and institutional-grade reliability. The brand personality is **authoritative yet accessible**, stripping away decorative excess to focus on financial data visualization. 

The design style follows a **Corporate Modern** approach with **Minimalist** tendencies. It prioritizes high-density information without visual clutter, utilizing purposeful whitespace and a structured grid to instill a sense of calm control over complex cash flows. The emotional response should be one of "effortless oversight"—the user should feel that their capital is secure and their trajectory is clear.

## Colors

The palette is anchored by **Deep Navy (#1A2B3C)**, providing a sophisticated, stable foundation for navigation and primary actions. **Emerald Green (#2ECC71)** and **Soft Red (#E74C3C)** are reserved strictly for semantic data—representing gains/positive cash flow and spending/negative trends respectively.

**Light Gray (#F5F7FA)** serves as the global canvas, reducing eye strain during long sessions of expense auditing. Interaction states (hover/active) should use 10% opacity overlays of the primary color rather than introducing new hues, maintaining a disciplined and professional appearance.

## Typography

**Inter** is utilized across all levels to take advantage of its exceptional legibility and systematic feel. For a finance-first application, we implement **tabular figures (tnum)** for all numerical data to ensure decimal points and currency symbols align perfectly in columns and lists.

Hierarchy is established through weight rather than dramatic size shifts. Headlines use Semi-Bold (600) for a confident stance, while body text remains in Regular (400) for maximum breathability. Label styles are slightly tracked out to distinguish them from interactive text.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 8px spacing scale ensures mathematical harmony across all components.

- **Desktop:** 40px outer margins with 24px gutters. Dashboard widgets should span increments of 3 or 4 columns.
- **Mobile:** 16px outer margins. Content is primarily stacked vertically, utilizing full-width cards.
- **Rhythm:** Use 16px (base * 2) for internal card padding and 32px (base * 4) for vertical section separation.

## Elevation & Depth

To maintain a "professional and efficient" feel, depth is created through **Tonal Layering** rather than heavy shadows. 

- **Level 0 (Background):** Light Gray (#F5F7FA).
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a subtle 1px border (#E2E8F0).
- **Level 2 (Modals/Overlays):** Pure White (#FFFFFF) with a soft, neutral shadow (0px 10px 15px -3px rgba(0, 0, 0, 0.05)).

Avoid colorful shadows or high-diffusion glows. The interface should feel flat and "pressed," ensuring that content remains the primary focus.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This subtle rounding provides a modern touch without sacrificing the professional, "square-shouldered" appearance expected of a financial tool. 

- **Standard Buttons & Inputs:** 4px radius.
- **Dashboard Cards:** 8px (rounded-lg) to provide a distinct container feel.
- **Interactive Chips:** Fully rounded (pill) to differentiate them from static labels and buttons.

## Components

### Buttons
Primary buttons use the Deep Navy (#1A2B3C) background with White text. Secondary buttons use a White background with a 1px Navy border. Success/Positive actions (e.g., "Confirm Deposit") may use the Emerald Green palette to signify gain.

### Data Cards
The core of the interface. Cards must have a 1px #E2E8F0 border and 24px internal padding. They should always feature a clear header and a "View Details" text link in the top right.

### Input Fields
Inputs should be White with a 1px Gray border. On focus, the border transitions to Deep Navy with a 2px outer ring of 10% opacity Navy. Use "Inter" at 16px to prevent iOS zoom issues on mobile.

### Progress Bars & Gauges
Used for budget tracking. Use a neutral gray background track with Emerald Green or Soft Red fills to indicate status against a goal.

### Transaction Lists
Row-based layouts with a 1px bottom border. Icons for transaction categories should be contained in a 40px circle with a subtle 10% opacity tint of the primary color.