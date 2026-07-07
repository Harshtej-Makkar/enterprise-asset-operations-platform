# Enterprise Asset Operations Platform (EAOP)
# Design Tokens Specification

---

**Document ID:** EAOP-DT-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the foundational design tokens for EAOP. All frontend components must consume these tokens instead of arbitrary values.

**Correction note:** An earlier draft listed only token *names* (e.g., "Primary-500," "Success," "Background") with no actual committed values — meaning an AI coding agent would have had to invent the real palette itself, most likely defaulting to generic Tailwind blue and Inter. This version commits to real, specific values.

---

# 2. Design Philosophy

Professional, industrial, dense, accessible, consistent, maintainable. Tokens map cleanly to Tailwind CSS via CSS variables.

---

# 3. Color Tokens — Fully Specified

## Background & Surface
| Token | Hex | Use |
|---|---|---|
| `--bg-primary` | `#14161A` | App shell background — near-black, slightly warm charcoal, not pure black |
| `--bg-surface` | `#1E2126` | Cards, panels, table rows |
| `--bg-surface-raised` | `#262A31` | Modals, dropdowns, hover states |
| `--bg-sidebar` | `#101215` | Sidebar — very slightly darker than the main shell, for depth |

## Borders
| Token | Hex | Use |
|---|---|---|
| `--border-default` | `#33383F` | Hairline borders, dividers |
| `--border-strong` | `#454B54` | Emphasized borders (e.g., active table row) |
| `--border-focus` | `#5B8DEF` | Focus ring |

## Text
| Token | Hex | Use |
|---|---|---|
| `--text-primary` | `#E8EAED` | Primary text |
| `--text-secondary` | `#9AA1AB` | Secondary/meta text |
| `--text-muted` | `#6B7280` | Disabled, placeholder text |
| `--text-inverse` | `#14161A` | Text on light/colored backgrounds (e.g., inside amber badges) |

## Signature & Semantic
| Token | Hex | Use |
|---|---|---|
| `--accent-signal` | `#F5A623` | **The one signature color.** Reserved exclusively for Critical severity, SLA-breach states, and urgent notifications. Not used decoratively anywhere else. |
| `--status-success` | `#3FB37F` | Passed inspections, resolved defects, completed work orders |
| `--status-warning` | `#D9A93E` | Pending/awaiting-approval states — deliberately more muted than the signature amber, so "pending" and "critical" remain visually distinct |
| `--status-critical` | `#E5484D` | Rejected, failed inspection item (distinct use from the amber accent — this is for negative/failed outcomes specifically, amber is for "needs urgent attention") |
| `--status-info` | `#5B8DEF` | Informational states, links, focus |
| `--status-neutral` | `#5B6472` | Draft, inactive, disabled |

---

# 4. Typography Tokens — Corrected

Font Family: **IBM Plex Sans** (not Inter — see UX Standards §10 for rationale)
Monospace: **IBM Plex Mono** — asset codes, timestamps, audit log entries

| Style | Size | Weight |
|---|---|---|
| Heading 1 | 32px | Bold |
| Heading 2 | 28px | Bold |
| Heading 3 | 24px | Semibold |
| Heading 4 | 20px | Semibold |
| Body Large | 16px | Regular |
| Body | 14px | Regular |
| Caption | 12px | Regular |
| Code/Mono | 13px | Regular (IBM Plex Mono) |

---

# 5. Spacing Scale

Base unit: 8px. Values: 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 96. Avoid arbitrary values.

---

# 6. Border Radius — Corrected

**An earlier draft specified up to 16px ("Extra Large") as a default option. Corrected: this platform's radius scale is deliberately sharper, matching the industrial/technical tone rather than a soft consumer look.**

| Token | Value | Use |
|---|---|---|
| Small | 4px | Buttons, inputs, badges |
| Medium | 4px | Cards (same as small — deliberately not larger) |
| Large | 6px | Modals, dialogs (the one place slightly more radius is acceptable) |
| Pill | 999px | Status badges only |

16px+ radii are not used anywhere in this design system.

---

# 7. Shadow Tokens

Small (cards), Medium (dropdowns), Large (dialogs), Extra Large (page overlays) — kept subtle; this is a dense, dark UI where heavy drop shadows read as noise, not depth.

---

# 8. Border Tokens

Default: 1px. Strong: 2px. Focus Ring: 2px, `--border-focus` color. Dashed: for drag-and-drop target areas (Kanban board, if drag-and-drop is implemented).

---

# 9. Layout Tokens

Max Content Width: 1440px. Sidebar Width: 280px (expanded) / 72px (collapsed to icons). Header Height: 64px. Content Padding: 32px (desktop) / 16px (tablet). Card Gap: 24px.

---

# 10. Grid System

Desktop: 12 columns. Tablet: 8 columns. Mobile: 4 columns.

---

# 11. Breakpoints

Mobile: 0px · Tablet: 768px · Laptop: 1024px · Desktop: 1280px · Wide: 1536px

(See TRD §16 and UX Standards §24 for which modules target which breakpoint as primary.)

---

# 12. Icon Tokens

Library: Lucide React. Sizes: 16, 20, 24, 32. Align to spacing scale.

---

# 13. Motion Tokens

Duration: Fast 150ms · Normal 250ms · Slow 350ms. Easing: Ease Out (default). Allowed: Fade, Slide, Scale. Disallowed: Bounce, Flip, Elastic.

---

# 14. Z-Index Scale

Dropdown 100 · Sticky Header 200 · Sidebar Overlay 300 · Dialog 400 · Toast 500 · Tooltip 600

---

# 15. Opacity

Disabled 40% · Hover Overlay 8% · Pressed Overlay 12% · Modal Overlay 60%

---

# 16. Table Tokens

Row Height: 48px (dense — see UX Standards §14 on tables as the primary pattern). Header Height: 52px. Cell Padding: 12px horizontal, 8px vertical (tighter than a typical consumer app, deliberately — information density matters more than breathing room here). Border Radius: 4px. Sticky Header: enabled.

---

# 17. Form Tokens

Input Height: 40px. Label Gap: 6px. Field Gap: 20px. Error Gap: 4px. Button Height: 40px.

---

# 18. Chart Tokens

Maximum Colors: 6 (drawn from the semantic palette in §3 — success, warning, critical, info, neutral, and the signature amber reserved for the single most important series if one exists). Grid Lines: subtle (`--border-default` at reduced opacity). Legend: bottom. Tooltip: enabled. Animation: minimal.

---

# 19. Status Colors — Exact Mapping

| Status Value | Token | Hex |
|---|---|---|
| Active / Resolved / Completed / Approved | `--status-success` | `#3FB37F` |
| Pending / Pending Approval / In Progress | `--status-warning` | `#D9A93E` |
| Critical (severity) / SLA Breach | `--accent-signal` | `#F5A623` |
| Rejected / Failed | `--status-critical` | `#E5484D` |
| Open / Info / Assigned | `--status-info` | `#5B8DEF` |
| Inactive / Draft / Closed | `--status-neutral` | `#5B6472` |

This mapping must be used identically everywhere — see UX Standards §17.

---

# 20. Accessibility Tokens

Minimum Contrast: WCAG AA (4.5:1 for body text). Focus Ring: required, visible, using `--border-focus`. Touch Target: minimum 44×44px. Keyboard Navigation: required throughout.

---

# 21. Theme — Corrected Scope

**Single dark theme for MVP** (all values above). No light theme token set exists in this version — see TRD §18 and UX Standards §27 for rationale. The CSS variable architecture (rather than hardcoded Tailwind classes) means a light theme could be added later as a second value set without restructuring components, but building that second set is explicitly out of scope now.

---

# 22. Implementation Notes

Implement via Tailwind theme extension + CSS variables + shadcn/ui theme configuration. Components must reference tokens, never hardcoded hex values or arbitrary spacing.

---

# 23. Genuinely Future Extensions

Light theme, high contrast theme, client branding/white-labeling, density modes, RTL support.

---

# 24. Conclusion

This Design Tokens Specification is now a real, committed design system — not a structural placeholder — establishing the specific dark, industrial, amber-accented visual foundation for EAOP.
