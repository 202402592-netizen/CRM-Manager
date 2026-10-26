---
name: ClientFlow CRM
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies high-performance, trustworthy enterprise execution. Designed for mid-market and enterprise B2B revenue teams, account executives, and operational leaders, it prioritizes clarity, data legibility, and high-velocity workflow management.

The aesthetic blends **Modern Corporate** precision with tactical **Minimalism**:
- **Clarity over Clutter:** Dense data presentation structured through consistent micro-rhythms and disciplined spatial hierarchy rather than decorative ornamentation.
- **Controlled Velocity:** High-contrast key interactive anchors guide reps smoothly through pipeline tracking, account health inspections, and multi-step deal updates without visual friction.
- **Enterprise Confidence:** Grounded slate-neutrals provide an executive foundation, balanced by sharp emerald accents signaling growth, forward momentum, and active health states.

## Colors

The color palette is built around an enterprise-grade hierarchy that preserves accessible contrast ratios (WCAG AAA for core text, AA for interactive states).

### Primary & Functional Accents
- **Primary Action (Emerald Green - `#059669`):** Primary interactive triggers, active navigation items, positive deal states, and confirmation buttons. 
- **Soft Accent (`#D1FAE5`):** Subtle success indicators, selected row highlights, soft pill badges, and active filter chips. Pair with text `#065F46` to guarantee contrast.
- **Structural Neutral (Dark Charcoal - `#1F2937`):** High-impact structural zones including persistent enterprise sidebars, master table headers, and deep contrast panels.
- **Informational Anchor (Info Blue - `#2563EB`):** Secondary interactive insights, contextual tips, and system notifications.

### Semantic & Feedback
- **Warning (`#F59E0B`):** At-risk renewals, pipeline stalls, and pending tasks. Paired with soft tint `#FEF3C7`.
- **Error & Destructive (`#DC2626`):** Destructive actions, pipeline loss states, API failures, and input validation errors. Paired with soft tint `#FEE2E2`.

### Backgrounds, Text & Surface Division
- **Canvas Base (`#F9FAFB`):** Outer app shell, table view canvas, and workspace background.
- **Surface Elevation (`#FFFFFF`):** High-priority data cards, modal dialogues, flyout side-drawers, and active input fields.
- **Primary Text (`#111827`):** Standard headline and high-priority field values (contrast ratio > 12:1 against pure white).
- **Secondary Text (`#6B7280`):** Field labels, inline metadata, audit timestamps, and table column captions.
- **Borders & Dividers (`#E5E7EB`):** Structural boundaries, inline cell dividers, and quiet container borders.

## Typography

The type hierarchy relies on **Inter** to ensure maximum scannability and mechanical neutrality across intensive data grids, pipeline kanbans, and contact dossiers.

### Execution Rules
- **Tabular Figures:** Always apply `font-feature-settings: "tnum" on, "cv05" on` across all numeric metrics, deal values, conversion percentages, and tabular views to prevent layout jitter.
- **Micro-Labels (`label-sm`):** Use for uppercase status labels, column table headers, and step markers with explicit `0.03em` tracking.
- **Monospace Integration (`mono-data`):** JetBrains Mono is designated strictly for CRM technical properties: Deal UUIDs, API tokens, currency conversions, and automated audit trails.
- **Content Density:** In dense table configurations, downgrade standard table content from `body-md` (14px) to `body-sm` (13px) while retaining 18px line-height to maintain target optical vertical rhythm.

## Layout & Spacing

The layout is architected around an **adaptive fluid-grid structure** anchored by a fixed-collapsible enterprise navigation sidebar.

### Shell Blueprint
- **Sidebar Rail:** 260px expanded (collapsible to 64px icon-rail on screens `< 1280px`).
- **Main Viewport Canvas:** Fluid layout bounded with minimum horizontal screen margins (`margin: 2rem` for desktop, `1rem` on mobile/tablet).
- **Grid Architecture:** 12-column layout with 24px (`1.5rem`) gutters on desktop screens (>1024px), reflowing to 6 columns with 16px (`1rem`) gutters on tablet devices (768px - 1023px), and a unified single column on mobile (<768px).

### Spacing Principles
- **Micro Space (`space-xs`, `space-sm`):** Inline icon-to-label gaps, chip inner padding, form field vertical internal padding, and status dot offsets.
- **Structural Space (`space-md`, `space-lg`):** Card inner content padding, form section stacking, and standard grid cell gaps.
- **Macro Space (`space-xl`):** Separation between decoupled visual domains, KPI summary blocks, and board lane divisions.

## Elevation & Depth

Visual depth is achieved through **low-contrast outlines combined with ambient, diffused drop shadows**. This prevents visual heaviness while ensuring clear card detachment from the `#F9FAFB` base canvas.

### Surface Tiers
- **Tier 0 (Base Canvas - `#F9FAFB`):** Un-elevated application foundation.
- **Tier 1 (Cards, Metric Containers, Data Tables - `#FFFFFF`):** Bound by a hairline border (`1px solid #E5E7EB`) and an ultra-subtle ambient shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`.
- **Tier 2 (Interactive Flyouts, Filter Dropdowns, Popovers):** Elevated above standard data cards. Bound by a hairline border (`1px solid #E5E7EB`) and ambient shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`.
- **Tier 3 (Modals, Pipeline Drawers, Confirmation Overlays):** High focal point. Anchored over a scrim (`rgba(17, 24, 39, 0.45)`) with depth shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`.

## Shapes

The shape system utilizes controlled, modern rounding (`roundedness: 2`) to deliver an enterprise SaaS visual signature that remains polished without feeling toy-like.

### Corner Radius Allocation
- **Base Components (`rounded` - `0.5rem` / `8px`):** Input fields, buttons, drop-down menus, select triggers, and action popovers.
- **Structural Surfaces (`rounded-lg` - `1rem` / `16px`):** Standard dashboard widgets, KPI cards, table card shells, and context drawers.
- **Hero Containers (`rounded-xl` - `1.5rem` / `24px`):** Large standalone modals, workspace onboarding panels, and floating notification modules.
- **System Pills (`full` / `9999px`):** Status indicator tags, workflow stage indicators, avatar frames, and analytical counter chips.

## Components

### Buttons
- **Primary:** Background `#059669`, text `#FFFFFF`, radius 8px (`rounded`). Hover: `#047857`. Focus ring: 2px offset with `#059669`.
- **Secondary / Default:** Background `#FFFFFF`, border `1px solid #E5E7EB`, text `#1F2937`. Hover: `#F9FAFB`, border `#D1D5DB`.
- **Destructive:** Background `#DC2626`, text `#FFFFFF`. Hover: `#B91C1C`.
- **Ghost / Minimal:** Background transparent, text `#6B7280`. Hover: background `#F3F4F6`, text `#111827`.

### Input Fields & Controls
- **Text Inputs:** Height 38px, background `#FFFFFF`, border `1px solid #E5E7EB`, radius 8px, text `#111827`, typography `body-md`. Placeholder `#9CA3AF`. Hover border `#D1D5DB`. Active/Focus: border `#059669`, outline `2px solid rgba(5, 150, 105, 0.2)`.
- **Checkboxes & Radios:** 16x16px, border `1px solid #D1D5DB`, radius 4px (checkbox) / circular (radio). Checked state: `#059669` fill with pure white icon checkmark.

### Chips & Badges
- **Status Success / Active:** Background `#D1FAE5`, text `#065F46`, radius full, padding 2px 10px, typography `label-md`.
- **Status Warning / At-Risk:** Background `#FEF3C7`, text `#92400E`, radius full, padding 2px 10px, typography `label-md`.
- **Status Inactive / Closed:** Background `#F3F4F6`, text `#374151`, radius full, padding 2px 10px, typography `label-md`.
- **Status Destructive / Lost:** Background `#FEE2E2`, text `#991B1B`, radius full, padding 2px 10px, typography `label-md`.

### Cards & Surfaces
- Background `#FFFFFF`, border `1px solid #E5E7EB`, corner radius 16px (`rounded-lg`), elevation Tier 1.
- Internal padding follows `space-lg` (24px) for standard cards; `space-md` (16px) for compact analytical grids.
- Header bars within cards incorporate bottom border `1px solid #E5E7EB` with `space-md` padding.

### Data Tables
- **Header:** Background `#F9FAFB`, typography `label-sm` uppercase, text `#6B7280`, height 40px, border-bottom `1px solid #E5E7EB`.
- **Rows:** Height 48px standard (40px compact), alternating transparent to hover background `#F9FAFB`. Border-bottom `1px solid #E5E7EB`. Selected row background `#ECFDF5`.
- **Numeric Alignment:** Right-aligned with tabular numbers enabled.

### Pipeline Kanban Lane
- Lane background `#F3F4F6`, corner radius 12px, padding 12px.
- Lane headers feature stage name in `label-lg` (`#1F2937`) accompanied by deal value rollups in `mono-data` (`#6B7280`).
- Kanban cards implement Tier 1 card specs with corner radius 8px (`rounded`).