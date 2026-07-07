# Enterprise Asset Operations Platform (EAOP)
# Business Workflow Document (BWF)

---

**Document ID:** EAOP-BWF-001
**Version:** 1.1 (Minor corrections for cross-document consistency)
**Status:** Approved

---

# 1. Purpose

This document defines the business workflows implemented by EAOP. Unlike the Application Flow document (navigation between screens), this document explains how operational activities occur inside the client's organization. The frontend is designed around these workflows.

**Note:** This document was already internally consistent with the corrected MVP scope in earlier drafts — it always treated Work Orders and Approval as core lifecycle steps. The corrections applied elsewhere in this document set (PRD, Architecture, Data Model, API Contract, Frontend Scope, Implementation Plan, Component Library) bring those documents into alignment with what this one already specified.

---

# 2. Business Workflow Philosophy

The software is workflow-driven. Users complete business tasks, not isolated screens. Every workflow begins with a business event, produces measurable outcomes, updates organizational data, and improves operational visibility.

---

# 3. Primary Operational Workflow

```
Asset Registered → Inspection Scheduled → Inspection Performed → Inspection Submitted
→ Defect Identified? 
   → NO → Asset Status Updated → Dashboard Updated
   → YES → Severity Assigned → Supervisor Review
        → Critical?
           → NO → Maintenance Work Order → Repair → Inspection Closed → Dashboard Updated
           → YES → Manager Approval → Maintenance Work Order → Repair → Verification
                → Closed → Dashboard Updated
```

---

# 4. Workflow 1 — Asset Registration

**Objective:** Maintain a centralized inventory of industrial assets.
**Actors:** Administrator
**Trigger:** New asset installed.
**Inputs:** Asset Name, Category, Plant, Department, Manufacturer, Installation Date.
**Outputs:** Asset Record, Asset ID, generated QR code image (display only — see Client Profile §7 for the scanning-vs-display distinction).
**Business Rules:** Asset ID must be unique. Assets cannot be deleted after inspections exist. Asset history is permanent.

---

# 5. Workflow 2 — Inspection Scheduling

**Objective:** Assign inspections to inspectors.
**Actors:** Supervisor
**Trigger:** Scheduled inspection cycle.
**Inputs:** Asset, Inspector, Due Date, Inspection Template.
**Outputs:** Inspection Assignment.
**Business Rules:** One active inspection per asset. Due dates cannot be in the past.

---

# 6. Workflow 3 — Inspection Execution

**Objective:** Record inspection observations.
**Actors:** Inspector
**Steps:** Login → Select Assigned Inspection → Review Asset → Complete Checklist → Add Notes → Upload Photos → Submit.
**Outputs:** Completed inspection record.
**Business Rules:** Mandatory fields required. Images optional. Timestamp automatically recorded.

---

# 7. Workflow 4 — Defect Management

**Objective:** Record operational issues identified during inspections (or logged standalone).
**Actors:** Inspector
**Inputs:** Category, Severity, Description, Photos.
**Severity Levels:** Low, Medium, High, Critical.
**Outputs:** Defect Record.
**Business Rules:** Critical defects require approval before a work order can be generated. Non-critical (Low/Medium/High) defects proceed directly to work order generation.

---

# 8. Workflow 5 — Supervisor Review (Approval)

**Objective:** Review submitted Critical-severity defects.
**Actors:** Supervisor, Plant Manager
**Actions:** Approve, Reject, Request clarification.
**Outputs:** Approved defect (proceeds to Work Order) or Rejected defect (returned to Inspector).
**Business Rules:** This action lives on the Defect Detail screen, not a separate approval module — see Frontend Scope document for why this keeps the feature lean.

---

# 9. Workflow 6 — Work Order Creation

**Objective:** Convert approved (or non-critical) defects into maintenance work.
**Actors:** Backend System (automatic generation), Maintenance Manager (assignment)
**Inputs:** Approved or non-critical defect.
**Outputs:** Maintenance work order, visible on the Kanban board in the "Open" column.
**Business Rules:** Every work order references exactly one defect.

---

# 10. Workflow 7 — Maintenance Execution

**Objective:** Repair affected assets.
**Actors:** Maintenance Technician
**Steps:** View Work Order (on Kanban board) → Move to "Assigned" → Move to "In Progress" → Add Notes → Move to "Completed".
**Outputs:** Updated work order status, updated asset history.

---

# 11. Workflow 8 — Reporting

**Objective:** Provide operational reporting.
**Actors:** Supervisor, Plant Manager
**Available Reports:** Inspection Report, Defect Report, Maintenance Report, Compliance Report, Asset History.
**Outputs:** CSV export (MVP requirement); PDF export (stretch goal); on-screen preview; feeds Dashboard.

---

# 12. Workflow 9 — Executive Monitoring

**Objective:** Provide real-time visibility.
**Actors:** Plant Manager, Operations Director
**Dashboard KPIs:** Assets, Completed Inspections, Pending Inspections, Open Defects, Critical Defects (awaiting approval), Open Work Orders, Inspection Compliance, Maintenance SLA.

---

# 13. Exception Workflows

**Missed Inspection:** Inspection overdue → Notification → Supervisor Alert → Reschedule.

**Inspection Rejected:** Inspection → Review → Returned to Inspector → Correction → Resubmit.

**Critical Defect:** Critical → Immediate Notification → Approval → Priority Work Order → Repair.

---

# 14. Notifications

Events generating notifications: Inspection Assigned, Inspection Due, Inspection Overdue, Defect Created, Critical Defect Raised, Work Order Assigned, Work Order Completed.

---

# 15. Audit Trail

Every workflow records: User, Action, Timestamp, Entity, Previous Value, New Value. Audit records are immutable and displayed as a read-only timeline (see Component Library — `Timeline` component). No custom logging UI is required; the timeline reads from the same action log that powers notifications.

---

# 16. Dashboard Data Sources

Dashboard widgets are not manually updated. They are calculated from:

```
Assets → Inspections → Defects → Approvals → Work Orders → Maintenance → Reports
```

Dashboard = Derived Data, not Primary Data.

---

# 17. Backend Responsibilities

Authentication, validation, workflow rules (e.g., severity-to-approval-requirement logic), notifications, business logic, database, audit trail. (Represented by the minimal mock/stub backend in this build — see doc 09.)

---

# 18. Frontend Responsibilities

Displaying workflow status, collecting user input, rendering reports, showing KPIs, validation feedback, role-based UI, API integration. The frontend does not implement business rules — the severity-to-approval-requirement check happens on the mock backend, even though it's simple, to keep the "frontend consumes, doesn't decide" principle intact.

---

# 19. Workflow Principles

Every workflow should have one clear owner, produce one measurable outcome, leave an audit trail, support reporting, and be understandable by non-technical users (this last point matters directly for your viva — if you can't explain a workflow simply, it's a sign the workflow itself is over-engineered).

---

# 20. Future Workflows

Predictive Maintenance, IoT Alerts, QR Camera Scanning, Offline Inspections, Vendor Work Orders, Spare Parts Tracking, Machine Learning Recommendations.

---

# 21. Conclusion

EAOP digitizes the operational lifecycle of industrial asset inspections and maintenance. Every screen, API, and database entity within the platform should directly support one or more of these workflows — including Work Orders and Approval, which are core to this lifecycle, not future additions.
