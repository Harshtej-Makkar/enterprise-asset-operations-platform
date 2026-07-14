# EAOP — Entity Relationship Diagram

Generated from `database/schema/001-schema.sql` (15 tables).

```mermaid
erDiagram
    plants ||--o{ users : "employs"
    plants ||--o{ assets : "contains"
    asset_types ||--o{ assets : "categorizes"
    asset_types ||--|| checklist_templates : "has template"
    checklist_templates ||--o{ checklist_template_items : "contains"
    assets ||--o{ inspections : "inspected"
    users ||--o{ inspections : "performs"
    inspections ||--o{ inspection_items : "has items"
    checklist_template_items ||--o{ inspection_items : "fulfills"
    inspections ||--o{ defects : "may trigger"
    assets ||--o{ defects : "has"
    users ||--o{ defects : "reports"
    defects ||--|| work_orders : "1—1 maps to"
    defects ||--o| approvals : "may have"
    users ||--o{ approvals : "decides"
    users ||--o{ work_orders : "assigned to"
    work_orders ||--o{ maintenance_updates : "logged against"
    users ||--o{ maintenance_updates : "writes"
    users ||--o{ audit_logs : "generates"
    users ||--o{ notifications : "receives"

    plants {
        uuid id PK
        varchar name
        varchar city
        text address
        varchar status
    }

    users {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role "admin|plant_manager|supervisor|inspector|technician"
        uuid plant_id FK
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    asset_types {
        uuid id PK
        varchar name UK
    }

    assets {
        uuid id PK
        varchar asset_code UK
        varchar name
        uuid asset_type_id FK
        uuid plant_id FK
        varchar department
        varchar status "active|inactive|under_maintenance|retired"
    }

    checklist_templates {
        uuid id PK
        uuid asset_type_id FK_UK
    }

    checklist_template_items {
        uuid id PK
        uuid checklist_template_id FK
        varchar label
        integer order_index
        boolean requires_photo
    }

    inspections {
        uuid id PK
        uuid asset_id FK
        uuid inspector_id FK
        date scheduled_date
        timestamptz completed_at
        varchar overall_result "pass|fail|pending"
    }

    inspection_items {
        uuid id PK
        uuid inspection_id FK
        uuid checklist_template_item_id FK
        varchar result "pass|fail|na"
        text notes
        text photo_url
    }

    defects {
        uuid id PK
        uuid asset_id FK
        uuid inspection_id FK "nullable"
        uuid reported_by FK
        varchar severity "low|medium|high|critical"
        varchar category
        text description
        text_array photo_urls
        varchar status "open|pending_approval|approved|rejected|work_order_created|resolved"
    }

    approvals {
        uuid id PK
        uuid defect_id FK_UK
        uuid approver_id FK
        varchar decision "approved|rejected"
        text comment
        timestamptz decided_at
    }

    work_orders {
        uuid id PK
        uuid defect_id FK_UK
        uuid assigned_to FK "nullable"
        varchar priority "low|medium|high|urgent"
        varchar status "open|assigned|in_progress|completed"
        date deadline
    }

    maintenance_updates {
        uuid id PK
        uuid work_order_id FK
        uuid technician_id FK
        text note
        varchar status_change_to "nullable"
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb metadata
    }

    notifications {
        uuid id PK
        uuid user_id FK
        varchar type
        text message
        varchar entity_type
        uuid entity_id
        boolean read
    }
```

## Key Relationships

| Relationship | Cardinality | Notes |
|-------------|-------------|-------|
| Plant → User | 1:N | Users belong to at most one plant; admins have null plant_id |
| Plant → Asset | 1:N | Each asset is at exactly one plant |
| Asset Type → Asset | 1:N | 5 asset types, 20 seed assets |
| Asset Type → Checklist Template | 1:1 | One dynamic checklist template per asset type |
| Checklist Template → Items | 1:N | 4–6 checklist items per template |
| Asset → Inspection | 1:N | Inspections are scheduled per asset |
| Inspection → Defect | 1:N (optional) | A "fail" inspection may trigger 0+ defect reports |
| Defect → Work Order | 1:1 | After approval, exactly one work order per defect |
| Defect → Approval | 1:1 (optional) | Only critical/high severity defects require approval |
| Work Order → Maintenance Update | 1:N | Technician notes logged as work progresses |
| User → Notification | 1:N | Notifications are user-specific, marked read/unread |
| User → Audit Log | 1:N | All mutating actions produce an immutable audit record |