# Enterprise Asset Operations Platform (EAOP)

# Engineering Guidelines

---

**Document ID:** EAOP-ENG-001  
**Version:** 1.1 (Minor correction — see note)
**Status:** Approved  
**Prepared By:** Frontend Engineering Team  
**Reviewed By:** Technical Lead

**Correction note:** This document was already solid in the prior draft. The only change here is adding naming examples for the Work Order, Approval, and Audit Log entities that are now confirmed core scope (see Manifest, PRD, and Frontend Scope documents), so naming conventions are demonstrated consistently across the full corrected module set.

---

# 1. Purpose

This document establishes the engineering standards, coding conventions, and architectural practices for the Enterprise Asset Operations Platform (EAOP).

Every contributor, including AI coding agents, must follow these guidelines to ensure a consistent, maintainable, and scalable codebase.

---

# 2. Engineering Principles

Development should prioritize:

- Readability
- Maintainability
- Reusability
- Simplicity
- Type Safety
- Accessibility
- Consistency

When multiple solutions exist, prefer the one that is easier for another developer to understand.

---

# 3. General Coding Standards

- Use TypeScript in strict mode.
- Write self-explanatory code.
- Avoid unnecessary abstractions.
- Keep functions focused on a single responsibility.
- Remove unused code before committing.
- Avoid commented-out code.

---

# 4. Naming Conventions

## Components

Use PascalCase.

```
DashboardCard.tsx
AssetTable.tsx
InspectionForm.tsx
KanbanBoard.tsx
KanbanCard.tsx
ApprovalActionBlock.tsx
AuditLogTimeline.tsx
```

---

## Hooks

Use camelCase and start with `use`.

```
useDashboard.ts
useAssets.ts
useDefectFilters.ts
```

---

## Services

```
dashboard.service.ts
asset.service.ts
```

---

## Types

Use PascalCase.

```
Asset
Inspection
DashboardStats
```

---

## Constants

Use UPPER_SNAKE_CASE.

```
MAX_UPLOAD_SIZE
DEFAULT_PAGE_SIZE
```

---

## Variables

Use descriptive camelCase.

Avoid abbreviations unless universally understood.

---

# 5. Component Guidelines

Components should:

- Have a single responsibility.
- Accept data through props.
- Avoid business logic.
- Be reusable where possible.

Prefer composition over inheritance.

---

# 6. Page Guidelines

Pages should:

- Compose components.
- Handle routing.
- Fetch data through hooks.
- Avoid implementing business logic directly.

---

# 7. Business Logic

Business logic belongs in:

- Backend services (preferred)
- Custom hooks (frontend when necessary)

Never place business rules inside UI components.

---

# 8. State Management

## Local State

Use `useState`.

---

## Server State

Use TanStack Query.

---

## Shared State

Use React Context only when necessary.

Avoid unnecessary global state.

---

# 9. API Communication

API requests must only be made through the service layer.

Flow:

```
Component

↓

Custom Hook

↓

Service

↓

REST API
```

Never call `fetch()` or `axios` directly inside components.

---

# 10. Forms

Use:

- React Hook Form
- Zod

Every form must include:

- Validation
- Error messages
- Loading state
- Success feedback

---

# 11. Error Handling

Handle all expected states:

- Loading
- Empty
- Error
- Success

Never leave users without feedback.

Errors should display user-friendly messages.

---

# 12. Tables

All tables should support:

- Sorting
- Filtering
- Pagination
- Loading state
- Empty state

Reuse the shared `DataTable` component whenever possible.

---

# 13. Accessibility

Every UI element must support:

- Keyboard navigation
- Visible focus indicators
- Semantic HTML
- Proper form labels
- Sufficient color contrast

Aim for WCAG AA compliance.

---

# 14. Styling

Use Tailwind CSS utilities.

Avoid inline styles.

Use design tokens defined in the Design Tokens Specification.

Do not hardcode colors or spacing values unless justified.

---

# 15. Icons

Use Lucide React exclusively.

Icons should support functionality and readability.

Avoid decorative icon usage.

---

# 16. Performance

- Lazy load route-level pages.
- Memoize expensive computations when necessary.
- Avoid unnecessary re-renders.
- Use pagination for large datasets.
- Optimize images before use.

Do not optimize prematurely.

---

# 17. File Size Guidelines

Recommended maximum sizes:

| File Type | Recommended Limit |
|------------|------------------:|
| React Component | 250 lines |
| Hook | 200 lines |
| Service | 200 lines |
| Utility | 150 lines |

If significantly larger, consider refactoring.

---

# 18. Code Comments

Write comments only when they explain **why**, not **what**.

Prefer clear code over excessive comments.

Use JSDoc for exported utilities where appropriate.

---

# 19. Logging

Development:

- Console logging allowed when debugging.

Production:

- Remove unnecessary console statements.

---

# 20. Git Commit Convention

Use Conventional Commits.

Examples:

```
feat: add dashboard KPI cards

fix: resolve inspection form validation

refactor: simplify asset table component

docs: update API contract

test: add dashboard integration tests
```

---

# 21. Pull Request Checklist

Before merging:

- Code builds successfully.
- Linting passes.
- No TypeScript errors.
- Components are reusable.
- Responsive design verified.
- Accessibility checked.
- Documentation updated.

---

# 22. Code Review Checklist

Reviewers should verify:

- Correct architecture.
- Naming consistency.
- Reusability.
- Type safety.
- Error handling.
- Accessibility.
- Performance considerations.

---

# 23. Dependency Guidelines

Before adding a new dependency:

- Check if existing libraries already solve the problem.
- Prefer actively maintained libraries.
- Minimize bundle size impact.
- Document the reason for adding the dependency.

Avoid unnecessary packages.

---

# 24. Definition of Done

A feature is complete only when:

- Functional requirements implemented.
- API integration completed.
- Responsive on supported devices.
- Accessible.
- Loading, empty, and error states implemented.
- Code reviewed.
- Documentation updated.
- Ready for deployment.

---

# 25. Engineering Philosophy

The goal is not to write the cleverest code.

The goal is to produce software that another developer can confidently understand, maintain, and extend months later.

Consistency across the codebase is more valuable than individual optimization or stylistic preferences.

---

# 26. Conclusion

These engineering guidelines establish the coding standards for the Enterprise Asset Operations Platform.

Following them ensures that all contributors produce high-quality, maintainable, and consistent software aligned with enterprise development practices.