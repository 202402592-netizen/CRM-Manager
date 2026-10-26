# ClientFlow CRM — B2B Enterprise SaaS (Phase 1 Frontend)

ClientFlow CRM is an enterprise-grade customer relationship management application designed for high-velocity B2B revenue teams, account executives, and operational leaders.

> **CRITICAL EXECUTION NOTICE:** This repository contains **PHASE 1 (Frontend Only)**. Phase 2 (Node.js, Express, MongoDB, JWT backend) is reserved for explicit subsequent authorization.

---

## 🎨 Design System & Visual Palette

Strictly conforming to `DESIGN.md` and enterprise WCAG accessible contrast ratios:

| Token | Hex Value | Application |
|---|---|---|
| **Dark Charcoal** | `#1F2937` | Persistent Enterprise Sidebar, structural contrast panels |
| **Primary Emerald** | `#059669` | Primary CTAs, active route states, healthy pipeline indicators |
| **Canvas Background** | `#F9FAFB` | Main workspace canvas base |
| **Soft Emerald** | `#D1FAE5` | Positive badges, selected row highlights, stage pills |
| **White Cards** | `#FFFFFF` | Tier 1 elevated data cards, modals, and input fields |
| **Primary Text** | `#111827` | Headings, high-contrast numbers, and table data |
| **Secondary Text** | `#6B7280` | Micro-labels, captions, and secondary metadata |
| **Hairline Borders** | `#E5E7EB` | Subtle card dividers and table cell boundaries |
| **Semantic Warning** | `#F59E0B` | At-risk renewals and pending follow-ups |
| **Semantic Error** | `#DC2626` | Destructive actions, validation errors, and lost deals |
| **Information Blue** | `#2563EB` | Secondary insights, tech badges, and verification markers |

---

## 📁 Project Structure

```
ClientFlow-CRM/
├── index.html                   # Redirect and entry point
├── DESIGN.md                    # Core design system specification (Preserved)
├── README.md                    # Architecture and operational documentation
├── pages/
│   ├── login.html               # Enterprise sign-in matching Screenshot 1
│   ├── forgot-password.html     # Single-use reset password workflow
│   ├── dashboard.html           # Main command center matching Screenshot 2
│   ├── contacts.html            # Contacts directory matching Screenshot 4
│   ├── contact-details.html     # Elena Martinez contact dossier matching Screenshot 3
│   ├── deals.html               # Sales pipeline Kanban matching Screenshot 5
│   ├── deal-details.html        # Deal progression & milestone dossier
│   ├── tasks.html               # Action items, checklists & follow-ups
│   ├── calendar.html            # Monthly sales & milestone calendar
│   ├── reports.html             # Revenue velocity, conversion funnel & leaderboards
│   ├── team.html                # Team organization, quotas & member directory
│   ├── profile.html             # User profile, password update & notifications
│   ├── settings.html            # Workspace configuration, integrations & demo data reset
│   ├── notifications.html       # Notifications center with unread badges
│   ├── audit-log.html           # Splunk/Datadog SIEM audit log, raw JSON telemetry & filters
│   ├── help.html                # Knowledge base, FAQ & keyboard shortcuts
│   ├── 404.html                 # Resource not found error page
│   └── access-denied.html       # RBAC 403 access restriction page
├── css/
│   ├── style.css                # CSS variables, typography, reset & utility classes
│   ├── components.css           # Buttons, forms, cards, metrics, badges, tables & modals
│   ├── dashboard.css            # Enterprise sidebar, topbar, kanban & timeline styles
│   └── responsive.css           # Desktop, tablet & mobile bottom navigation layouts
└── js/
    ├── storage.js               # Clean CRUD repository abstraction & demo data
    ├── app.js                   # Toast manager, modals, global search & shortcuts
    ├── navigation.js            # Active route detection, mobile drawer & bottom nav
    ├── auth.js                  # Login validation, password toggling & demo autofill
    ├── dashboard.js             # Metrics aggregation, Chart.js & quick modals
    ├── contacts.js              # Contact filtering, search, pagination & dossier notes
    ├── deals.js                 # HTML5 drag-and-drop Kanban & deal advancement
    ├── tasks.js                 # Task checkoffs, filtering & monthly calendar view
    ├── reports.js               # Conversion funnel, won/lost & revenue velocity charts
    ├── team.js                  # Team directory, roles & invitation simulations
    └── settings.js              # Profile editing, password change & JSON data backup
```

---

## 🚀 How to Run the Application

The frontend is built using **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No Node.js backend is required to run the application.

### Option 1: Python Simple HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 8080
```
Then open your browser to:
```
http://localhost:8080/
```

### Option 2: Node static server (npx)
```bash
npx serve .
```

### Option 3: VS Code Live Server Extension
Right-click on `index.html` or `pages/login.html` and click **"Open with Live Server"**.

---

## ✨ Features Implemented (Phase 1)

1. **Authentication UI**:
   - Matches Screenshot 1 with enterprise emerald branding, SSL/SOC2 badge, cloud node status indicator.
   - Quick "Autofill Demo Credentials" button for instant testing as Sarah Jenkins.
   - Show/hide password visibility toggle, client-side validation, and SSO simulation.
2. **Dashboard Overview**:
   - Matches Screenshot 2 with KPI cards (Contacts 1,428, Active Deals 38, Revenue Q4 $184.2k, Pending 14).
   - Interactive Revenue & Velocity line chart (with gradient fill, points, and fallback).
   - Segmented Pipeline Distribution bar ($482,500 total).
   - Recent Activity feed with contract, call, and deal won items.
   - Interactive Action Required checklist with real-time checkoff states.
   - Account of the Week spotlight card for Apex Global Industries.
   - Working Quick Add Deal and Log Activity modals.
3. **Contacts Management & Dossier**:
   - Matches Screenshot 4 with segment chips (All, Customers, Leads, VIP, Inactive).
   - Live search by contact name, company, or email with copy-to-clipboard buttons.
   - Pagination controls (`Showing 1-4 of 1,428`).
   - Add Contact modal, Edit modal, and Delete confirmation.
   - Contact Dossier view matching Screenshot 3 with verified lead badge, active pipeline deals, activity timeline, and quick internal note form that dynamically appends to the log.
4. **Sales Pipeline (Visual Kanban)**:
   - Matches Screenshot 5 with 6 stages: *New Lead*, *Contacted*, *Qualified*, *Proposal Sent*, *Won*, *Lost*.
   - Live Health metric banner with weighted probability progress bar ($642,000 active pipeline).
   - Native HTML5 Drag and Drop across lanes with visual hover drop targets.
   - 1-Click "Advance →" button on deal cards.
   - Latest Team Win celebration card (CloudScale +$78k) with interactive "👏 Kudos" toast.
   - Add and Edit Deal modals with full validation.
5. **Tasks and Follow-ups**:
   - Matches Screenshot 6 with Active Workstream Daily Execution, Pending 18, Overdue 3, Due Today 8 metrics.
   - Quick Add follow-up bar with mic and calendar triggers.
   - Overdue Attention Required section with high-priority Elena Martinez MSA card (Call, Reschedule, Complete actions).
   - Today's Schedule (Oct 24) with interactive check-offs and strikethrough.
   - "Momentum is strong! (+24% pace)" motivational banner.
   - Interactive Monthly Calendar grid mapping tasks and deals across October 2024 (`calendar.html`).
6. **Reports and Analytics**:
   - Matches Screenshot 7 with Live Executive Metric Feed ($328,400 Revenue Closed, 68.4% Win Rate, 18.5d Avg Cycle, $642,000 Active Pipeline).
   - Revenue Velocity line chart with Oct Closed tooltip and Nov projection.
   - Deal Outcomes donut chart with 68% WON RATIO in center, plus Primary Lost Drivers breakdown.
   - Funnel Velocity step dropoff bars (1,428 leads -> 980 contacted -> 412 qualified -> 148 proposals -> 84 won).
   - Quota Performance AE Leaderboard (#1 Sarah Jenkins $142,000 118%, #2 Alex Rivera $112,000 96%, #3 Marcus Vance $74,400 84%).
   - AI Pipeline Forecast Ready banner.
7. **Team Management**:
   - Matches Screenshot 8 with 12 Active Members header, Expand Sales Roster card, and 4 KPI metrics.
   - Role filter pills (All 12, Sales Execs 6, Account Managers 3).
   - Member cards: Sarah Jenkins (Lead Enterprise AE), Alex Rivera (Mid-Market AE), Marcus Vance (Growth & Inbound AE), Elena Rostova (VP RevOps with system permission tags), David Kim (Lead Solutions Engineer with POCs).
   - Collapsible Pending Invitations card (Jordan Hayes, Priya Patel with Resend & Cancel actions).
   - Role Permissions Guide callout.
8. **User Profile & Settings (All 4 Tabs Fully Pixel-Matched)**:
   - Unified tab pills: *Profile*, *Company*, *Notifications*, *Security*.
   - **User Profile (`profile.html`)**: Matches Screenshot 9 with Sarah Jenkins avatar, online status, verified email badge, direct phone, department, timezone, reporting currency, Save/Discard actions, and remote session signout trigger.
   - **Company Settings (`settings.html?tab=company`)**: Matches Screenshot 10 with Acme Brand Assets box, Legal Entity Name, Industry vertical, Corporate website, Tax ID US-849201948 Verified badge, headquarters address, workspace defaults, 30-day velocity, and $1,440/mo Enterprise Annual Plan seat utilization.
   - **Notifications Tab (`settings.html?tab=notifications`)**: Matches Screenshot 11 with Delivery Channels (Push, Email, Desktop, Slack `#sales-pipeline`), Sales & Pipeline Alerts (New Inbound Leads, Deal Stage Advanced/Won `High Value`, High-Value Risk >$50k, Form Submissions), Tasks & Reminders (Overdue, Morning Agenda, Post-Meeting Prompts), and Frequency / Quiet Hours (10:00 PM - 7:00 AM EST).
   - **Security Tab (`settings.html?tab=security`)**: Matches Screenshot 12 with Password & Auth (`42d ago`, entropy bar `Strong 85%`, 12+ chars / special symbols / numbers), Multi-Factor Auth (Authenticator App, SMS Recovery Codes, download codes), 3 Active Sessions (iPhone 15 Pro, MacBook Pro 16", iPad Air), and Governance & API (Okta SAML 2.0 SSO, API tokens, SIEM audit logs).
   - **Session Revocation Modal**: Matches Screenshots 14 & 15 with bottom sheet dialog, telemetry, Immediate Operational Impact warning, MFA recheck requirement, and `#SEC-8921-REV` audit trail.
   - **Post-Revocation Audit View**: Matches Screenshot 13 with green "Session Successfully Revoked" banner, 7s undo countdown, 3 metrics (2 Active Devices, 1 Revoked Today, 0 Suspicious), Recently Terminated Sessions card, and SIEM Synced audit trail.
9. **SIEM Audit Log & Telemetry (`audit-log.html`)**:
   - Matches Screenshot 18 with Splunk/Datadog SIEM stream header, `TLS 1.3 Strict`, 38ms ingest latency, 365-day immutable WORM, live search, 24h / 7d / 30d range filters, and category tabs.
   - Comprehensive event cards: `#SEC-8921-REV` (Critical Session Revocation Enforced), `#AUTH-9042-MFA` (Biometric Enclave Passed), `#SSO-4410-OKTA` (Lease Refreshed), `#ANOM-1029-BLK` (Blocked Tor Exit Node).
   - **Raw JSON Telemetry Modal**: Matches Screenshot 19 with `#SEC-8921-REV` SHA-256 Validated badge, copy JSON, download `.json`, formatted syntax code box, and immutable SOC2 Type II audit hash.
   - **Filter Audit Events Modal**: Matches Screenshot 20 with real-time log stream status (1,248 records), UTC synced time horizon, 5 severity risk levels, 4 category checkboxes, and actor scope filters.
   - Signed CSV/JSON export and SHA-256 cryptographic compliance callout.
10. **Global Usability**:
   - Global search dialog accessible from any page by clicking the search bar or pressing `/`.
   - Toast notification system with custom styling for success, error, warning, and info.
   - Confirmation dialogs for all destructive operations.
   - Fully responsive for Desktop, Tablet, and Mobile devices (including 6-tab mobile bottom navigation bar).

---

## 🔒 Phase 2 Preparation

The data access layer in `js/storage.js` is structured cleanly around a repository interface (`getContacts()`, `saveDeal()`, `getMetrics()`, etc.). When Phase 2 is authorized, this abstraction will connect directly to Express.js REST endpoints and MongoDB without altering the frontend page components.
## Real backend (NestJS + MongoDB Atlas)

The original HTML/CSS/vanilla-JS interface is preserved. Business data is now accessed through `apps/api`, and `js/storage.js` is a centralized API repository; localStorage only retains the access token, session summary, and the optional remembered login email.

### Run locally

1. Copy `apps/api/.env.example` to `apps/api/.env` and set `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.
2. Install and build the API: `npm run api:install` then `npm run api:build`.
3. Add development records without deleting existing data: `npm run api:seed`.
4. Start the API: `npm run api:dev`.
5. Serve this folder at port 8080, for example `npx serve . -l 8080`.

The API is available at `http://localhost:5000/api/v1`; Swagger is at `/api/docs` when `ENABLE_SWAGGER=true`, and health is `GET /api/v1/health`. Seed credentials are `sarah.jenkins@acmecorp.com` / `ClientFlow2024!`.

### Implemented backend scope

The API contains workspace-scoped Mongoose collections for workspaces, users, contacts, deals, tasks, activities, notifications, invitations, settings, sessions, and immutable audit events. Login uses bcrypt and JWT access tokens plus refresh-session records. Contacts/deals/tasks are server CRUD with pagination/search parameters, safe archive behavior, stage/activity history, task completion, dashboard/report aggregations, team invitations, notifications, settings, sessions, and audit endpoints.

MFA, Okta/SAML, API-token issuance, email delivery, and SIEM streaming remain intentionally deferred; the existing UI is not falsely backed by success responses for those functions. Invitation records are real and return a development-only token outside production because email transport is not configured.

The seed is additive and idempotent for the development workspace. It never calls `dropDatabase()` and never contains Atlas credentials.
