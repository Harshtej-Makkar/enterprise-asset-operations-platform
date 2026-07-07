# Enterprise Asset Operations Platform (EAOP)
# API Contract Specification

---

**Document ID:** EAOP-API-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the REST API contract between frontend and (mock/stub) backend. Authoritative reference for all API integration work.

**Correction note:** An earlier draft omitted Work Order, Approval, and Audit Log endpoints entirely, listing them under "Future Endpoints" (§21). This contradicted the rest of the document set. Corrected below.

---

# 2. API Principles

RESTful, JSON bodies, stateless, JWT authentication (simplified/mock), consistent response structure, resource-oriented URLs, versioned.

---

# 3. Base URL

Development: `http://localhost:5000/api/v1`

---

# 4. Authentication

All protected endpoints require `Authorization: Bearer <jwt_token>`. Public: `/auth/login`. All others require authentication.

---

# 5. Standard Response Format

Success:
```json
{ "success": true, "message": "Inspection submitted successfully.", "data": {}, "meta": {} }
```

Error:
```json
{ "success": false, "message": "Validation failed.", "errors": [{ "field": "assetId", "message": "Asset is required." }] }
```

---

# 6. Pagination

`?page=1&limit=20` → `{ "data": [], "meta": { "page": 1, "limit": 20, "total": 245, "pages": 13 } }`

---

# 7. Filtering

Supported: `status`, `severity`, `plant`, `dateFrom`, `dateTo`, `search`. Example: `GET /assets?status=active&search=pump`

---

# 8. Sorting

`?sort=name` (ascending) · `?sort=-createdAt` (descending)

---

# 9. Authentication Module

`POST /auth/login` → `{ token, user }`
`POST /auth/logout`
`GET /auth/me`

---

# 10. Dashboard Module

`GET /dashboard` — KPI Cards, Charts, Recent Activity, Inspection Summary, Defect Summary
`GET /dashboard/kpis` — Assets, Open Defects, Pending Inspections, **Open Work Orders** *(corrected — prior draft mentioned this in the return value but the endpoint existed inconsistently with the rest of the document set that excluded Work Orders)*
`GET /dashboard/recent` — recent activities

---

# 11. Asset Module

`GET /assets` — list, supports search/pagination/filters
`GET /assets/{id}` — general info, inspection history, defects, maintenance summary, QR code image reference

---

# 12. Inspection Module

`GET /inspections` — list
`GET /inspections/{id}` — details
`POST /inspections` — create draft
`POST /inspections/{id}/submit` — submit; becomes read-only

---

# 13. Defect Module — Corrected to Include Approval

`GET /defects` — list, supports severity/status/search filters
`GET /defects/{id}` — details
`POST /defects` — create
`PATCH /defects/{id}/status` — allowed values: `open, pending_approval, approved, rejected, work_order_created, resolved`
**`POST /defects/{id}/approval`** *(added — missing from prior draft)* — body: `{ decision: "approved" | "rejected", comment }`. Only valid for Critical-severity defects with status `pending_approval`. On `approved`, triggers automatic Work Order creation (mock backend logic — see Frontend Scope §16 for how simple this should stay).

---

# 14. Work Order Module *(new section — entirely absent from prior draft)*

`GET /work-orders` — list, supports status filter (for Kanban columns)
`GET /work-orders/{id}` — details
`PATCH /work-orders/{id}/status` — allowed values: `open, assigned, in_progress, completed`
`PATCH /work-orders/{id}/assign` — body: `{ technicianId }`
`POST /work-orders/{id}/notes` — add a maintenance update note

---

# 15. Audit Log Module *(new section — entirely absent from prior draft)*

`GET /audit-log` — supports filters: `entityType`, `userId`, `dateFrom`, `dateTo`. Read-only — no POST/PATCH/DELETE exist for this resource; entries are written internally by other endpoints' mock logic, not created directly by the frontend.

---

# 16. Reports Module

`GET /reports` — list
`POST /reports/generate` — input: `{ type, dateFrom, dateTo, plant }`
`GET /reports/{id}` — preview

---

# 17. Notifications

`GET /notifications`
`PATCH /notifications/{id}/read`

---

# 18. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# 19. Role Permissions — Corrected

**An earlier draft's permission table omitted the Technician role entirely, despite it being a defined persona everywhere else in the document set, and omitted Work Orders/Approval/Audit Log rows. Corrected below.**

| Endpoint Group | Admin | Plant Manager | Supervisor | Inspector | Technician |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Assets | ✓ | ✓ | ✓ | ✓ | Read Only |
| Inspections | ✓ | ✓ | ✓ | ✓ (own) | Read Only |
| Defects | ✓ | ✓ | ✓ | ✓ (create) | Read Only |
| Defect Approval | ✓ | ✓ | ✓ | ✗ | ✗ |
| Work Orders | ✓ | ✓ | ✓ | Read Only | ✓ (assigned only) |
| Reports | ✓ | ✓ | ✓ | Read Only | Read Only |
| Audit Log | ✓ | ✓ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✗ | ✗ | ✗ | ✗ |

---

# 20. Frontend Consumption Guidelines

All API requests: use TanStack Query, go through the service layer, handle loading/empty/error states, never call `fetch()` directly inside components.

```
Component → Custom Hook → API Service → REST Endpoint
```

---

# 21. API Versioning

Current: `v1`. Future breaking changes require `/api/v2`.

---

# 22. Non-Goals

The API does not expose database schema, internal business logic implementation, authentication implementation details, or infrastructure details.

---

# 23. Genuinely Future Endpoints

Maintenance vendor management, QR camera scan-event logging, predictive maintenance scoring, asset image galleries beyond defect photos.

**Correction:** Work Orders, Approval, and Audit Log are no longer listed here — see §13, §14, §15 above.

---

# 24. Conclusion

This API Contract Specification defines the communication interface between frontend and (mock) backend for EAOP, now including the full Work Order, Approval, and Audit Log surface that the rest of the document set always assumed existed.
