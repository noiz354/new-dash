---
name: Apex Operational Facility System
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
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#003d28'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#5bcf9e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  metric-display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  code-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system serves mission-critical facility and field maintenance environments where downtime translates directly to operational losses. The visual character balances high-density data utility with modern technical refinement, discarding decorative ornamentation in favor of crisp boundaries, deliberate hierarchy, and immediate operational legibility.

Key brand attributes:
- **Disciplined & Reliable:** High-contrast structural lines and deliberate layouts instill trust for maintenance directors, floor managers, and technicians.
- **Instrumental Precision:** Interfaces act as calibrated instruments. Typography, status indicators, and asset metadata prioritize zero-ambiguity scanning under stress.
- **Subdued Foundation with High-Luminance Accents:** Deep slates and crisp neutral whites form an unobtrusive stage, allowing semantic status colors (operational emerald, maintenance amber, alert crimson) to pop instantly without cognitive fatigue.

The aesthetic fuses **Modern Technical Enterprise** with **Low-Contrast Structural Grid Lines**. Layouts leverage 1px border dividers (`#E2E8F0` on light, `#334155` on dark surfaces) to compartmentalize dense data attributes, complemented by micro status pills and tabular monospaced metadata.

## Colors

The color palette is built around high-legibility enterprise tiers with strict semantic roles:

### Brand & Accents
- **Primary (Cobalt / Tech Blue):** Primary actions, active navigation states, selected table rows, and key focus rings.
  - Deep Anchor: `#1E40AF`
  - Interactive Default: `#2563EB`
  - Subtle Highlight / Focus / Hover: `#3B82F6`
  - Tonal Surface Tint: `#EFF6FF`
- **Secondary (Deep Slate / Structural Navy):** Main navigation headers, structural framing, high-emphasis headings, and command bars.
  - Dark Primary: `#0F172A`
  - Slate Dark: `#1E293B`
  - Slate Mid: `#334155`

### Surface & Neutrals
- **Canvas Base:** `#F8FAFC`
- **Card & Component Surface:** `#FFFFFF`
- **Subtle Surface (Table Alt Rows, Disabled, Wells):** `#F1F5F9`
- **Structural Border (Subtle):** `#E2E8F0`
- **Structural Border (Strong / Focused):** `#CBD5E1`
- **Muted Text / Metadata:** `#64748B`
- **Body Text:** `#1E293B`
- **Heading / High-Contrast Text:** `#0F172A`

### Operational Status Palette
Each operational status pairs a rich dark text tone, a vibrant indicator dot color, and a low-saturation background tint (meeting WCAG AAA contrast requirements):
- **Operational / Normal / Completed (Emerald):** `#059669` (core), `#10B981` (vibrant dot), `#ECFDF5` (badge background), `#065F46` (badge text).
- **In Progress / Caution / Pending (Amber):** `#D97706` (core), `#F59E0B` (vibrant dot), `#FFFBEB` (badge background), `#92400E` (badge text).
- **Critical / Overdue / Emergency Downtime (Crimson):** `#DC2626` (core), `#EF4444` (vibrant dot), `#FEF2F2` (badge background), `#991B1B` (badge text).
- **Draft / Decommissioned / On Hold (Slate Neutral):** `#64748B` (core), `#94A3B8` (vibrant dot), `#F1F5F9` (badge background), `#334155` (badge text).

## Typography

Typography prioritizes technical clarity, dense data ingestion, and numerical comparability. 

- **Primary Interface Font:** **Inter** handles all primary UI prose, metric headers, and interaction targets. CSS declarations must specify `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'tnum'` across data tables, gauges, and status counters to enable open counters and uniform tabular figure alignment.
- **Machine & Asset Metadata Font:** **JetBrains Mono** is strictly mandated for discrete operational identifiers: Asset Tags (`AST-9021`), Work Order tracking numbers (`WO#88210-B`), SKU and serial codes, IP addresses, and sensor coordinates. It delivers immediate differentiation from descriptive text.
- **Uppercase Labels:** Used strictly for low-level metadata descriptors, column headers, and breadcrumb categorization (`text-transform: uppercase`, `letter-spacing: 0.05em`, size `11px`).

## Layout & Spacing

The layout model is built upon a 12-column responsive grid system tuned for Bootstrap 5 and dynamic HTMX fragment replacements.

### Grid & Canvas Structure
- **Container Philosophy:** Liquid full-width (`container-fluid`) with max-width bounding (`1600px`) for high-resolution maintenance dispatch stations, ensuring telemetry dashboards maximize display real estate.
- **Side Navigation:** Fixed 240px wide sidebar collapsible to 64px icon-rail on desktop views (1024px+). The main workspace expands dynamically.
- **Vertical Rhythm:** Root rhythm strictly adheres to a 4px base increment (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`). Density takes precedence over expansive white space. Card inner paddings use `space-lg` (16px) for normal cards and `space-md` (12px) for nested telemetry widgets.

### Responsive Breakpoints & Adaptations
- **Mobile (<768px):** Outer canvas margins clamp to `margin-mobile` (16px). Data tables collapse into stacked key-value high-density summary cards. Metric blocks stack to 2 columns or 1 column.
- **Tablet (768px - 1023px):** Side navigation collapses into an off-canvas drawer. Metric rails adapt to a 2x2 grid.
- **Desktop (1024px - 1439px):** Standard 12-column layouts; filter bars span across the table top with inline filters and search inputs.
- **Wide Command Center (1440px+):** Tri-pane layout support (Left: Asset Tree / Hierarchy, Center: Work Order Log / Dispatch Queue, Right: Live Asset Detail Drawer).

## Elevation & Depth

This design system avoids theatrical drop shadows and heavy skeuomorphic extrusions. Depth is conveyed primarily through **tonal surface stacking** combined with **precise low-contrast structural borders**.

1. **Surface 0 (Canvas Base):** `#F8FAFC`. The foundational backdrop for all page views.
2. **Surface 1 (Cards, Modules, Table Containers):** Pure `#FFFFFF` resting on Surface 0, framed by a 1px solid border in `#E2E8F0`. No shadow required in standard states.
3. **Surface 2 (Hover States, Interactive Cards, Metric Tiles):** Elevates via a hair-thin, ambient contact shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);` accompanied by a border shift to `#CBD5E1`.
4. **Surface 3 (Flyouts, Filter Dropdowns, HTMX Popover Panels):** `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03);` bordered by `#CBD5E1`.
5. **Surface 4 (Modals, Slide-over Work Order Drawers):** `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04);` with a deep `#0F172A` backdrop scrim at 40% opacity.

## Shapes

The design system maintains a **Soft / Technical (Level 1)** shape radius to project disciplined, utilitarian competence:

- **Base Radius (`rounded`, 4px / `0.25rem`):** Form inputs, buttons, table cell selections, dropdown items, tabs, and micro status chips.
- **Container Radius (`rounded-lg`, 8px / `0.5rem`):** Cards, metric blocks, panels, slide-out drawers, modal windows, and notification toasts.
- **Pill Radius (`rounded-pill`, 9999px):** Exclusively reserved for status indicator tags, count indicators, and technician avatar frames.

## Components

### 1. Buttons
- **Primary Action:** Background `#2563EB`, text `#FFFFFF`, border `1px solid transparent`, height `36px` (compact enterprise default), font size `13px`, font weight `600`. Hover: `#1E40AF`. Active: `#1D4ED8`. Focus: outline `2px solid #3B82F6` with `2px` offset.
- **Secondary / Outline:** Background `#FFFFFF`, text `#1E293B`, border `1px solid #CBD5E1`. Hover: background `#F8FAFC`, border `#94A3B8`.
- **Destructive:** Background `#FEF2F2`, text `#DC2626`, border `1px solid #FECACA`. Hover: background `#DC2626`, text `#FFFFFF`.
- **HTMX Request State:** When triggering an HTMX request (`htmx-request` class), buttons display an integrated inline SVG spinner and disable pointer events while preserving element width.

### 2. Status Badges & Pill Indicators
- **Structure:** Height `22px`, padding `0 8px`, border radius `9999px`, font size `11px`, font weight `600`.
- **Visual Composition:** Flex layout containing a 6px circular dot (`margin-right: 5px`) followed by uppercase status text.
  - *Operational / Pass:* Background `#ECFDF5`, text `#065F46`, dot `#10B981`.
  - *In Progress / Warning:* Background `#FFFBEB`, text `#92400E`, dot `#F59E0B`.
  - *Critical / Downtime:* Background `#FEF2F2`, text `#991B1B`, dot `#EF4444` (with an optional subtle CSS pulse on active downtime alerts).
  - *Draft / On Hold:* Background `#F1F5F9`, text `#334155`, dot `#94A3B8`.

### 3. Data Cards & KPI Metric Blocks
- **Card Wrapper:** Solid white surface, 1px border `#E2E8F0`, rounded 8px.
- **KPI Metric Layout:** 
  - Top: Label caps (`label-caps`, color `#64748B`) paired with an optional micro contextual icon.
  - Middle: Metric display value (`metric-display`, color `#0F172A`, tabular numbers).
  - Bottom: Delta indicator (+3.4% from last shift) with a subtle directional arrow and micro sparkline or secondary status badge.

### 4. Input Fields & Filter Toolbars
- **Input Elements:** Background `#FFFFFF`, border `1px solid #CBD5E1`, border radius `4px`, height `34px`, font size `13px`, color `#1E293B`. Focus state: border `#2563EB`, shadow ring `0 0 0 1px #2563EB`.
- **Toolbar Bar:** A unified, single-line horizontal bar (`gap: 8px`) holding search input with integrated clear icon, quick-filter dropdown buttons (Severity, Facility Zone, Assignee), and view switcher icons.

### 5. High-Density Data Tables
- **Table Headers:** Height `36px`, background `#F8FAFC`, border-bottom `1px solid #E2E8F0`, typography `label-caps` in `#64748B`.
- **Table Rows:** Height `40px` (dense operational view), alternating row background `#FFFFFF` and `#FBFCFD`, border-bottom `1px solid #F1F5F9`. Hover: background `#F1F5F9`.
- **Cells:** Align baseline, numbers set in `font-feature-settings: "tnum"`, identifiers set in JetBrains Mono (`AST-1049`).

### 6. Breadcrumb Hierarchy
- **Typography:** `12px`, font weight `500`.
- **Divider:** Forward slash (`/`) in `#CBD5E1`. Root and intermediate items rendered in `#64748B`; active leaf item rendered in `#0F172A` with weight `600`.

### 7. Audit Logs & Activity Feeds
- **Structure:** Left-aligned 2px vertical rail (`#E2E8F0`) with 8px circular nodes representing event types.
- **Entry Content:** Timestamps formatted in JetBrains Mono `code-xs` (`12:44:02 UTC`), actor name in bold `13px`, action summary, and expandable HTMX delta diff panels (e.g., parameter shifts in set points or calibration results).