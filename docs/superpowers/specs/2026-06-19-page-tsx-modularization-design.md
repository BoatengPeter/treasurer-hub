# page.tsx Modularization Design

## Goal

Refactor the 2601-line `src/app/page.tsx` monolith into a clean architecture of reusable components, stores, and utilities. No behavioral changes — every feature, modal, and handler must work identically.

## Architecture

### State Management: Zustand

A single `stores/dashboard-store.ts` holds all application state and actions:

```
State:
  transactions, meetings, lodgments, statements
  loading, supabaseConnected, user, authBypass, authMode
  activeTab, darkMode, mobileMenuOpen
  modal states (isTxModalOpen, isMeetModalOpen, ...)
  editing states (editingTx, editingMeeting, ...)
  image states (txReceiptImage, lodgReceiptImage, previewImage)
  filter states (txSearch, txFilterType, txFilterCategory)
  report states (reportType, reportQuarter, reportYear)
  settings states (dbSettings, settingsStatusMsg)
  uploading states (uploadingTxImage, uploadingLodgImage)

Actions:
  loadAllData, handleLogOut
  handleSaveTransaction, handleSaveMeeting, handleSaveLodgment, handleSaveStatement
  handleDeleteTx, handleDeleteMeeting, handleDeleteLodgment, handleDeleteStatement
  handleSaveDbSettings, handleJsonImport
  compressImage, uploadReceiptImage
```

### File Structure

```
src/
├── app/page.tsx                    # ~30 lines: auth guard + layout shell
├── stores/
│   └── dashboard-store.ts          # Zustand store (all state + actions moved here)
├── lib/
│   ├── format-utils.ts             # formatCurrency, formatDate
│   └── image-utils.ts              # compressImage, uploadReceiptImage
├── lib/sample-data.ts              # sampleData constant
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Desktop sidebar (nav + theme toggle + logout)
│   │   ├── MobileHeader.tsx        # Mobile top bar + drawer menu
│   │   ├── StatusBanner.tsx        # Supabase status banner
│   │   └── LoadingScreen.tsx       # Loading spinner
│   ├── dashboard/
│   │   ├── DashboardTab.tsx        # Orchestrator for dashboard section
│   │   ├── DashboardHeader.tsx     # Title + Log Meeting / Log Transaction buttons
│   │   ├── MetricsCards.tsx        # 4 metric stat cards
│   │   ├── ComplianceChecklist.tsx # 3 compliance rules
│   │   ├── RecentMeetingsTable.tsx # Recent meeting summary table
│   │   ├── FundsDistributionChart.tsx # Progress bars
│   │   └── PendingDepositsQueue.tsx
│   ├── ledger/
│   │   ├── LedgerTab.tsx            # Orchestrator + header
│   │   ├── TransactionFilters.tsx
│   │   └── TransactionTable.tsx
│   ├── meetings/
│   │   ├── MeetingsTab.tsx          # Orchestrator + header
│   │   └── MeetingCard.tsx          # Single meeting display card
│   ├── lodgments/
│   │   ├── LodgmentsTab.tsx         # Orchestrator + header
│   │   └── LodgmentTable.tsx        # Table with rows
│   ├── reconciliation/
│   │   ├── ReconciliationTab.tsx    # Orchestrator
│   │   └── VarianceChecker.tsx      # Auto-variance comparison
│   ├── reports/
│   │   ├── ReportsTab.tsx           # Orchestrator + filters
│   │   └── ReportsPrintArea.tsx     # Full print layout
│   ├── settings/
│   │   └── SettingsTab.tsx          # Both cards
│   └── modals/
│       ├── TransactionModal.tsx
│       ├── MeetingModal.tsx
│       ├── LodgmentModal.tsx
│       ├── StatementModal.tsx
│       └── ReceiptPreview.tsx
```

### Component Hierarchy

```
page.tsx
  ├─ Sidebar (desktop only)
  ├─ MobileHeader (mobile only)
  ├─ StatusBanner (always visible)
  ├─ LoadingScreen (when loading)
  └─ [conditional tabs]
       ├─ DashboardTab
       │   ├─ DashboardHeader
       │   ├─ MetricsCards
       │   ├─ ComplianceChecklist
       │   ├─ RecentMeetingsTable
       │   ├─ FundsDistributionChart
       │   └─ PendingDepositsQueue
       ├─ LedgerTab
       │   ├─ TransactionFilters
       │   └─ TransactionTable
       ├─ MeetingsTab
       │   └─ MeetingCard[] (mapped)
       ├─ LodgmentsTab
       │   └─ LodgmentTable
       ├─ ReconciliationTab
       │   └─ VarianceChecker
       ├─ ReportsTab
       │   └─ ReportsPrintArea
       └─ SettingsTab
  +─ TransactionModal
  +─ MeetingModal
  +─ LodgmentModal
  +─ StatementModal
  +─ ReceiptPreview
```

### Data Flow

```
User Interaction → Component calls store action → Store updates state → React re-renders
                         ↕
                    lib/db.ts (CRUD) → localStorage / Supabase
```

### Migration Strategy

1. Create the Zustand store with all state + actions extracted from page.tsx
2. Extract utility functions to lib/ files
3. Extract sample data to its own file
4. Create layout components (Sidebar, MobileHeader, StatusBanner, LoadingScreen)
5. Create tab components one-by-one, moving JSX from page.tsx
6. Create modal components one-by-one
7. Clean page.tsx to bare minimum

### What stays unchanged

- `lib/db.ts` — database CRUD interface
- `components/AuthScreen.tsx` — authentication screen
- `components/SignaturePad.tsx` — signature capture pad
- `components/ui/*` — shadcn primitives
- `app/layout.tsx` — root layout
