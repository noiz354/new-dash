---
name: Apex Ops CMMS
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410002'
  on-tertiary-container: '#f63a35'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system serves field technicians, plant engineers, and maintenance crews operating in harsh physical environments—from glaring direct sunlight to oily, low-light industrial utility rooms. The UI balances utilitarian brutalism with crisp, modern ergonomic clarity. Every interaction emphasizes high contrast, operational certainty, and zero ambiguity.

Key visual tenets:
- **Zero-Friction Utility**: Immediate readability under rapid scan, dirty tablet screens, or protective equipment (gloves).
- **Physical Feedback Metaphor**: Flat, high-visibility surfaces paired with dense structural framing; components feel mechanical, durable, and decisive.
- **Data Densified Yet Glancable**: High information density structured strictly into segmented panels, clear delineations, and prominent operational states.

## Colors

The palette is engineered specifically for field legibility and harsh outdoor glare:
- **Primary (`#0f172a` Slate 900)**: Used for core structural boundaries, critical headers, and primary active states to guarantee high luminance contrast against clean field backdrops.
- **Secondary (`#059669` Emerald Green)**: Designates verified operational conditions, "PASS" status, healthy telemetry, and affirmative completion actions.
- **Tertiary (`#dc2626` Crimson Red)**: Designates critical equipment failures, safety violations, lockout/tagout warnings, and "FAIL" status.
- **Neutral (`#64748b` Slate 500)**: Serves secondary metadata, inactive states, and structural grid rules.
- **Canvas Base (`#ffffff` & `#f8fafc`)**: High-luminance, anti-glare canvas tones ensuring clear visibility through toughened screen protectors.
- **Warning (`#d97706` Amber 600)**: Reserved strictly for non-critical inspection warnings or service-due alerts.

## Typography

The typographic hierarchy uses a deliberate three-tier typeface allocation:
- **Headlines (`Space Grotesk`)**: Provides sharp, semi-technical geometry for fast equipment and work order identification.
- **Body (`Inter`)**: Tuned for hyper-legibility across dynamic screen reflections and field observations.
- **Labels & System Tags (`JetBrains Mono`)**: Mandatory for all serial numbers, Asset IDs, barcode values, telemetry metrics, and LOTO IDs. Monospaced character alignment guarantees visual stability during rapid scrolling and scanning checks.

## Layout & Spacing

The layout is built on a responsive, high-density fluid grid system:
- **Mobile (Handheld rugged devices, <768px)**: 4-column layout with 16px margins and gutters. Single-column stacked work orders, anchored bottom action trays, and large thumb-zone triggers.
- **Tablet (Rugged field tablets, 768px–1199px)**: 8-column layout with 24px margins and gutters. Side-by-side asset diagnostics and checklist executions.
- **Desktop / Docked Mode (>=1200px)**: 12-column layout with 32px margins. Multi-pane operations dispatch, telemetry splits, and batch asset management.

All interactive elements conform to an absolute minimum dimension of 48px by 48px, with interactive row gaps maintaining a minimum of 8px (`space-sm`) to avoid accidental taps while wearing industrial work gloves.

## Elevation & Depth

This design system rejects deep soft ambient shadows and blur filters, which wash out under direct sunlight and high ambient field illumination. Instead, it employs **structural high-contrast borders and tonal stratification**:
- **Layer 0 (Canvas)**: `#f8fafc` background base.
- **Layer 1 (Cards & Work Units)**: Solid `#ffffff` with a crisp 1.5px or 2px solid border (`#cbd5e1` resting, `#0f172a` selected).
- **Layer 2 (Modals, Overlays, Floating Action Trays)**: Solid `#ffffff` bounded by a 2px `#0f172a` border and a hard, high-offset shadow: `0 4px 0 0 rgba(15, 23, 42, 0.9)`.
- **Status Elevation**: When an asset fails inspection, the entire card perimeter elevates to a 2px solid `#dc2626` outline with a flat 4px red structural accent strip on the leading edge.

## Shapes

A low roundedness level (`roundedness: 1` — Soft, 4px base radius) is strictly enforced throughout the system. This produces structured, industrial-grade surfaces reminiscent of physical rugged hardware bezels and equipment data plates. Rounded corners are restricted to 4px (`rounded-sm`), increasing to 8px (`rounded-lg`) exclusively for outer dialog surfaces. Circular treatments are limited to icon toggles and status indicator dots.

## Components

### Buttons
- **Touch Footprint**: Height is standardized to 48px (compact) or 56px (standard field action) with a minimum 48px width.
- **Primary**: Solid `#0f172a` fill, `#ffffff` bold text, 4px border radius. Active state inverts to `#ffffff` background with 2px solid `#0f172a` border.
- **Pass / Affirmative Action**: Background `#059669`, white text, high contrast. Used for inspection approvals.
- **Fail / Abort Action**: Background `#dc2626`, white text, high contrast. Used for tagging out equipment and rejecting checkpoints.

### Monospace Asset Tags & Chips
- **Asset ID Chips**: Styled using `JetBrains Mono` with an enclosed container: `#f1f5f9` fill, 1.5px `#94a3b8` border, uppercase tracking. Example: `AST-8842-PUMP`.
- **PASS Status Chip**: Fill `#ecfdf5`, border `#059669`, text `#059669`, accompanied by a solid checkmark icon.
- **FAIL Status Chip**: Fill `#fef2f2`, border `#dc2626`, text `#dc2626`, accompanied by an exclamation or cross icon.

### Inspection Lists & Check items
- Full-width tap targets with minimum 56px row height.
- Dual-action binary toggle buttons: Large segmented PASS (`#059669`) / FAIL (`#dc2626`) buttons embedded directly into the row, preventing accidental menu navigation.

### Inputs & Text Fields
- Minimum height 48px with 2px borders (`#94a3b8` default, `#0f172a` focus).
- Numeric telemetry inputs (e.g., PSI, RPM, Temperature) automatically trigger high-contrast numeric keypads with trailing unit labels displayed in `JetBrains Mono`.

### Cards & Modular Diagnostics
- Flat white surface with 1.5px `#cbd5e1` structural frame.
- Header bars feature high-contrast inverted title plates (e.g., deep slate bar with white asset designation) for rapid visual scanning across dense equipment yards.