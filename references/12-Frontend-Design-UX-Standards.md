# Enterprise Asset Operations Platform (EAOP)
# Frontend Design & UX Standards

---

**Document ID:** EAOP-UX-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the visual language, interaction standards, accessibility requirements, layout principles, and UX guidelines for EAOP.

**Correction note:** An earlier draft specified Inter as the typeface and a generic blue-based palette with no committed hex values, and required both light and dark themes. Inter + blue is the single most common AI-generated design default combination and would make this project visually indistinguishable from a template. This version commits to a specific, deliberate palette and typeface (fully specified with hex values in the Design Tokens Specification), and corrects theme scope to a single theme for MVP.

---

# 2. Design Philosophy

EAOP is an enterprise operations platform, not a marketing website. The interface should resemble Linear, Jira, Azure Portal, or modern SAP Fiori — but tuned specifically for **industrial operations**, not generic SaaS. Real users here are inspectors on a shop floor (often on a tablet, sometimes in imperfect lighting) and plant managers reviewing dense data at a desk. The interface should feel closer to industrial control-room software than a consumer app.

---

# 3. Visual Principles

Display important information immediately. Minimize unnecessary animation. Reduce visual clutter. Prioritize business workflows over decoration. Maintain consistent spacing.

---

# 4. Layout Structure

```
┌────────────────────────────────┐
│           Top Navigation        │
├───────────┬─────────────────────┤
│  Sidebar  │      Content        │
│           │                     │
└───────────┴─────────────────────┘
```

---

# 5. Sidebar

Dashboard, Assets, Inspections, Defects, Work Orders, Reports, Notifications, Audit Log, Settings. Always visible on desktop, collapsible to icon-only on tablet, drawer on mobile.

---

# 6. Header

Breadcrumb, Page Title, Search, Notifications, User Profile. Consistent across all authenticated pages.

---

# 7. Page Template

Header → Actions → Filters → Content → Pagination. Avoid placing actions below tables.

---

# 8. Grid System

Desktop: 12-column. Tablet: 8-column. Mobile: single-column.

---

# 9. Spacing

8px base unit: 8, 16, 24, 32, 48, 64. Avoid arbitrary values.

---

# 10. Typography — Corrected

**Font: IBM Plex Sans** (not Inter). IBM Plex's engineering/technical heritage is a deliberate fit for industrial software, and it's a meaningfully less generic choice than the default most AI tools reach for.

**Monospace: IBM Plex Mono** — used for asset codes, timestamps, and audit log entries specifically, to reinforce the "technical system of record" feel.

Hierarchy: H1 (Page Title, 32px Bold) → H2 (Section, 28px Bold) → H3 (Card Title, 24px Semibold) → H4 (20px Semibold) → Body Large (16px Regular) → Body (14px Regular) → Caption (12px Regular).

---

# 11. Color Palette — Corrected

**An earlier draft specified only generic semantic names (Primary=Blue, Success=Green, etc.) with no committed values. Full hex specification is in the Design Tokens document — summary here:**

The palette is a **dense, dark, industrial** system, not a light SaaS palette. One signature color — **amber (`#F5A623`)** — is reserved exclusively for critical/urgent states (critical defect badges, SLA breaches), echoing the universal industrial "attention" color (hazard tape, warning lights). Reserving it for exactly one meaning, rather than using it decoratively, is what gives the interface a sense of real information hierarchy rather than a generic dashboard look.

Avoid decorative gradients.

---

# 12. Buttons

Types: Primary, Secondary, Outline, Ghost, Danger, Loading. One primary action per section — avoid competing primary buttons.

---

# 13. Cards

Title, Content, Optional Actions. Used for KPIs, statistics, summaries. Avoid deeply nested cards. Corner radius: 4px max (see Design Tokens §6 for the corrected, sharper radius scale — soft, heavily rounded corners read as consumer/playful, which is the wrong tone here).

---

# 14. Tables

Search, sort, filter, pagination. Optional: column visibility, export. Sticky headers preferred. Tables are the **primary UI pattern** for this platform — dense, information-rich, not cards-in-a-grid.

---

# 15. Forms

Labels, placeholder text, validation, helper text, required indicators. Never rely on placeholders as labels.

---

# 16. Charts

Recharts. Bar, Line, Area, Pie. No unnecessary 3D effects, no excessive colors (max 6 per chart — see Design Tokens §18). Legends and tooltips required.

---

# 17. Status Badges — Corrected

**Supported statuses, aligned with the corrected Data Model:** Open, Pending Approval, Approved, Rejected, Work Order Created, Resolved, Assigned, In Progress, Completed, Active, Inactive, Low, Medium, High, Critical.

**The severity/status badge system is the platform's signature element.** Every entity (defect, inspection, work order) carries a severity or status, represented identically everywhere — same color, same badge shape, same label — from the inspection checklist item to the dashboard KPI to the audit log entry. This consistency is what makes the platform read as one coherent system rather than several separately-built screens.

Colors must remain consistent throughout the application — see Design Tokens §19 for the exact color-to-status mapping.

---

# 18. Icons

Lucide React. Icons accompany navigation, status, and actions — never purely decorative.

---

# 19. Dialogs

Confirmation, deletion, critical actions only. Never as a substitute for a full page.

---

# 20. Toast Notifications

Success, Error, Warning, Info. Auto-dismiss except for critical errors, which require acknowledgement.

---

# 21. Empty States

Meaningful, instructional messages with a clear call-to-action — e.g., "No inspections have been completed yet," not a decorative illustration with a joke caption (wrong tone register for this software).

---

# 22. Loading States

Skeleton loaders, not blocking spinners. Loading preserves page layout.

---

# 23. Error States

Handle network errors, authorization errors, empty data, validation errors, unexpected server errors — always with a recovery action.

---

# 24. Responsive Behavior — Corrected

**An earlier draft specified "Desktop: Primary experience" as a blanket rule. Corrected per TRD §16: this is module-dependent, not blanket desktop-first.**

Inspection Execution and Defect Logging are tablet-first (this is where field users actually work). Dashboard, Reports, Work Order Kanban, and Asset Registry are desktop-first, functional down to tablet. Mobile phone width is graceful degradation for the two tablet-first modules only, not a general design target.

---

# 25. Accessibility

WCAG AA minimum. Keyboard navigation, visible focus, ARIA labels, semantic HTML, contrast compliance. Accessibility is mandatory, not optional polish.

---

# 26. Animation

Subtle only: fade, slide, scale. No bounce, no excessive motion, no decorative transitions. Respect `prefers-reduced-motion`.

---

# 27. Theme — Corrected

**An earlier draft required both light and dark themes for MVP. Corrected: single dark theme only for this build** (see TRD §18 for full rationale — this halves design/QA surface with no narrative cost). The token architecture is still structured so a second theme could be added later without restructuring — see Design Tokens §21.

---

# 28. Information Density

Enterprise operations users value efficiency over whitespace. Prioritize more useful information, fewer decorative graphics. This is deliberately not a spacious, airy consumer layout.

---

# 29. UX Principles

Every screen should answer: What happened? What requires attention? What action should the user take next? If unclear, redesign the screen.

---

# 30. Design Consistency Rules

All modules use shared components, shared spacing, shared typography, shared status colors, shared interaction patterns. No one-off UI patterns.

---

# 31. Genuinely Future Enhancements

Light theme / theme switching, compact mode, high contrast mode, multi-language support, custom dashboards.

---

# 32. Conclusion

EAOP's interface should read as serious, deliberate industrial software — dense, consistent, workflow-oriented — built around a specific palette and typeface rather than generic AI-default choices, and scoped to one theme so the 6-week timeline goes toward workflow richness instead of duplicate theme maintenance.
