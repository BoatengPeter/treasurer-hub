# page.tsx Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the 2601-line `src/app/page.tsx` monolith into reusable components, Zustand store, and utility files with zero behavioral changes.

**Architecture:** A Zustand store holds all state + actions. Components read from the store via hooks. Utility functions (formatCurrency, uploadReceiptImage, etc.) are extracted to `lib/`. Each tab becomes a component, each modal becomes a component. page.tsx reduces to a ~30-line orchestrator.

**Tech Stack:** Next.js 16, React 19, Zustand, shadcn/ui, Tailwind v4, Lucide icons, TypeScript, Supabase

---

### Task 1: Create utility functions

**Files:**
- Create: `src/lib/format-utils.ts`
- Create: `src/lib/image-utils.ts`

**Step 1: Create format-utils.ts**

Extract from page.tsx:749-757:
```tsx
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
```

**Step 2: Create image-utils.ts**

Extract from page.tsx:270-348:
```tsx
export const compressImage = (file: File): Promise<string> => {
  // Same implementation as page.tsx:270-304
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImageToStorage = async (
  file: File,
  supabaseConnected: boolean,
  userId?: string
): Promise<string> => {
  const client = db.getSupabaseClient();
  if (client && supabaseConnected) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;
      const { data, error } = await client.storage.from('receipts').upload(filePath, file, {
        cacheControl: '3600', upsert: false,
      });
      if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
          await client.storage.createBucket('receipts', { public: true });
          const { error: retryError } = await client.storage.from('receipts').upload(filePath, file);
          if (retryError) throw retryError;
        } else { throw error; }
      }
      const { data: { publicUrl } } = client.storage.from('receipts').getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local compression', err);
    }
  }
  return compressImage(file);
};
```

**Step 3: Verify build passes**

Run: `npm run build` (or `npx tsc --noEmit`)
Expected: No errors.

- [ ] Create `src/lib/format-utils.ts` with formatCurrency and formatDate
- [ ] Create `src/lib/image-utils.ts` with compressImage and uploadReceiptImage
- [ ] Run `npx tsc --noEmit` to verify

### Task 2: Extract sample data

**Files:**
- Create: `src/lib/sample-data.ts`
- No modify yet (page.tsx will import it in Task 13)

**Step 1: Create sample-data.ts**

Move the entire `sampleData` constant from page.tsx:66-213 to this file. Export it:
```ts
import type { Transaction, Meeting, Lodgment, ChurchStatement } from '@/lib/db';

export const sampleData: {
  transactions: Transaction[];
  meetings: Meeting[];
  lodgments: Lodgment[];
  statements: ChurchStatement[];
} = { ... };
```

**Step 2: Verify tsc**

Run: `npx tsc --noEmit`
Expected: No errors (sample-data.ts is not imported anywhere yet, should be fine as an isolated module).

- [ ] Create `src/lib/sample-data.ts` with the sampleData constant
- [ ] Run `npx tsc --noEmit`

### Task 3: Create Zustand store

**Files:**
- Create: `src/stores/dashboard-store.ts`

**Step 1: Create the store**

This is the largest extraction. The store holds all state + actions from page.tsx. Key design:

```ts
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Transaction, Meeting, Lodgment, ChurchStatement } from '@/lib/db';
import * as db from '@/lib/db';

interface DashboardState {
  // Navigation & Theme
  activeTab: string;
  darkMode: boolean;
  mobileMenuOpen: boolean;
  
  // Data
  transactions: Transaction[];
  meetings: Meeting[];
  lodgments: Lodgment[];
  statements: ChurchStatement[];
  loading: boolean;
  supabaseConnected: boolean;
  
  // Auth
  user: User | null;
  authBypass: boolean;
  authMode: 'signin' | 'signup' | 'forgot' | 'update';
  
  // Modal states
  isTxModalOpen: boolean;
  editingTx: Transaction | null;
  txReceiptImage: string;
  isMeetModalOpen: boolean;
  editingMeeting: Meeting | null;
  tempSignature: string;
  isLodgeModalOpen: boolean;
  editingLodgment: Lodgment | null;
  lodgReceiptImage: string;
  isStmtModalOpen: boolean;
  editingStatement: ChurchStatement | null;
  previewImage: string;
  uploadingTxImage: boolean;
  uploadingLodgImage: boolean;
  
  // Filters
  txSearch: string;
  txFilterType: string;
  txFilterCategory: string;
  
  // Settings
  dbSettings: { url: string; key: string };
  settingsStatusMsg: { text: string; type: string };
  
  // Reports
  reportType: string;
  reportQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  reportYear: string;
  
  // Auth setters (called from page.tsx lifecycle)
  setUser: (user: User | null) => void;
  setAuthBypass: (val: boolean) => void;
  setAuthMode: (val: 'signin' | 'signup' | 'forgot' | 'update') => void;
  setSupabaseConnected: (val: boolean) => void;

  // Actions
  setActiveTab: (tab: string) => void;
  setDarkMode: (val: boolean) => void;
  setMobileMenuOpen: (val: boolean) => void;
  setTxSearch: (val: string) => void;
  setTxFilterType: (val: string) => void;
  setTxFilterCategory: (val: string) => void;
  setReportType: (val: string) => void;
  setReportQuarter: (val: 'Q1' | 'Q2' | 'Q3' | 'Q4') => void;
  setReportYear: (val: string) => void;
  setDbSettings: (val: { url: string; key: string }) => void;
  setIsTxModalOpen: (val: boolean) => void;
  setEditingTx: (val: Transaction | null) => void;
  setTxReceiptImage: (val: string) => void;
  setIsMeetModalOpen: (val: boolean) => void;
  setEditingMeeting: (val: Meeting | null) => void;
  setTempSignature: (val: string) => void;
  setIsLodgeModalOpen: (val: boolean) => void;
  setEditingLodgment: (val: Lodgment | null) => void;
  setLodgReceiptImage: (val: string) => void;
  setIsStmtModalOpen: (val: boolean) => void;
  setEditingStatement: (val: ChurchStatement | null) => void;
  setPreviewImage: (val: string) => void;
  setUploadingTxImage: (val: boolean) => void;
  setUploadingLodgImage: (val: boolean) => void;
  
  // Complex actions
  loadAllData: () => Promise<void>;
  handleLogOut: () => Promise<void>;
  handleSaveTransaction: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSaveMeeting: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSaveLodgment: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSaveStatement: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteTx: (id: string) => Promise<void>;
  handleDeleteMeeting: (id: string) => Promise<void>;
  handleDeleteLodgment: (id: string) => Promise<void>;
  handleDeleteStatement: (id: string) => Promise<void>;
  handleSaveDbSettings: (e: React.FormEvent<HTMLFormElement>) => void;
  handleJsonImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadReceiptImage: (file: File) => Promise<string>;
}
```

Implementation notes:
- Move the logic from page.tsx:395-433 for `loadAllData`
- Move page.tsx:435-443 for `handleLogOut`
- Move page.tsx:476-501 for `handleSaveTransaction`
- Move page.tsx:504-576 for `handleSaveMeeting`
- Move page.tsx:580-603 for `handleSaveLodgment`
- Move page.tsx:606-627 for `handleSaveStatement`
- Move page.tsx:630-656 for delete handlers
- Move page.tsx:659-692 for settings/import handlers
- Move page.tsx:350-368 for theme useEffect logic
- The useEffect for auth (page.tsx:371-392) stays in page.tsx since it uses React lifecycle

The store `uploadReceiptImage` action wraps `uploadImageToStorage` from `@/lib/image-utils` with store state:
```ts
uploadReceiptImage: async (file) => {
  const { supabaseConnected, user } = get();
  return uploadImageToStorage(file, supabaseConnected, user?.id);
}
```
For setter actions like `setActiveTab`, use Zustand's pattern: `set((state) => ({ ...state, activeTab: tab }))`.

**Step 2: Install zustand**

Run: `npm install zustand`
Verify: zustand appears in package.json dependencies

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors in dashboard-store.ts (it may have unused imports — suppress with inline comments).

- [ ] Install zustand: `npm install zustand`
- [ ] Create `src/stores/dashboard-store.ts` with all state + setters + complex actions
- [ ] Run `npx tsc --noEmit` to check for type errors

### Task 4: Layout components

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MobileHeader.tsx`
- Create: `src/components/layout/StatusBanner.tsx`
- Create: `src/components/layout/LoadingScreen.tsx`

**Step 1: Sidebar.tsx**

Extract from page.tsx:767-880. Reads `activeTab`, `darkMode`, `supabaseConnected`, `user` from store. Calls `setActiveTab`, `setDarkMode`, `handleLogOut` from store.

```tsx
'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { LayoutDashboard, FileSpreadsheet, Users, Building, ClipboardCheck, FileText, Settings, Sun, Moon, LogOut, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as db from '@/lib/db';

const navItems = [
  { tab: 'dashboard', label: 'Financial Position', icon: LayoutDashboard },
  { tab: 'ledger', label: 'Transactions Ledger', icon: FileSpreadsheet },
  { tab: 'meetings', label: 'Meeting Sign-offs', icon: Users },
  { tab: 'lodgments', label: 'Church Lodgments', icon: Building },
  { tab: 'reconciliation', label: 'Reconciliation', icon: ClipboardCheck },
  { tab: 'reports', label: 'Accounts Reports', icon: FileText },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activeTab, darkMode, supabaseConnected, user, setActiveTab, setDarkMode, handleLogOut } = useDashboardStore();
  // ... render same JSX as page.tsx:767-880
}
```

**Step 2: MobileHeader.tsx**

Extract from page.tsx:883-929. Same pattern — reads/writes store state.

**Step 3: StatusBanner.tsx**

Extract from page.tsx:936-948. Reads `supabaseConnected`, `loadAllData` from store.

**Step 4: LoadingScreen.tsx**

Extract from page.tsx:951-954. Simple presentational component (no store needed, just a `loading` prop or read from store).

**Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: No errors (components won't be imported yet, but should compile independently).

- [ ] Create `Sidebar.tsx` with nav, theme toggle, logout, status indicator
- [ ] Create `MobileHeader.tsx` with mobile nav and drawer
- [ ] Create `StatusBanner.tsx` with supabase status
- [ ] Create `LoadingScreen.tsx` with spinner
- [ ] Run `npx tsc --noEmit`

### Task 5: Dashboard tab + sub-components

**Files:**
- Create: `src/components/dashboard/DashboardHeader.tsx`
- Create: `src/components/dashboard/MetricsCards.tsx`
- Create: `src/components/dashboard/ComplianceChecklist.tsx`
- Create: `src/components/dashboard/RecentMeetingsTable.tsx`
- Create: `src/components/dashboard/FundsDistributionChart.tsx`
- Create: `src/components/dashboard/PendingDepositsQueue.tsx`
- Create: `src/components/dashboard/DashboardTab.tsx`

**Step 1: Create each sub-component**

Each extracts its JSX from page.tsx. They read needed data from the Zustand store.

- `DashboardHeader.tsx` — page.tsx:962-990, calls `setEditingTx/setEditingMeeting/setIsTxModalOpen/setIsMeetModalOpen/setTxReceiptImage/setTempSignature` from store
- `MetricsCards.tsx` — page.tsx:993-1037, reads `formatCurrency`, `metrics` (computed from store), uses useMemo internally
- `ComplianceChecklist.tsx` — page.tsx:1044-1083, reads `metrics`, `meetings`, `statements`
- `RecentMeetingsTable.tsx` — page.tsx:1085-1135, reads `meetings`, `formatCurrency`, `formatDate`
- `FundsDistributionChart.tsx` — page.tsx:1140-1181, reads `metrics`, `formatCurrency`
- `PendingDepositsQueue.tsx` — page.tsx:1183-1211, reads `transactions`, `formatCurrency`

**Step 2: Create DashboardTab.tsx**

Composes all sub-components and adds the wrapper div from page.tsx:960-1216. Computes `metrics` via `useMemo` in this component.

```tsx
'use client';
import { useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import DashboardHeader from './DashboardHeader';
import MetricsCards from './MetricsCards';
import ComplianceChecklist from './ComplianceChecklist';
import RecentMeetingsTable from './RecentMeetingsTable';
import FundsDistributionChart from './FundsDistributionChart';
import PendingDepositsQueue from './PendingDepositsQueue';

export default function DashboardTab() {
  const { transactions, lodgments, meetings, statements } = useDashboardStore();
  
  const metrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
    const totalLodged = lodgments.filter(l => l.status === 'Lodged' || l.status === 'Reconciled').reduce((a, l) => a + Number(l.amount), 0);
    const pendingLodgmentAmount = transactions.filter(t => t.type === 'income' && !t.lodgment_id).reduce((a, t) => a + Number(t.amount), 0);
    const cashOnHand = totalIncome - totalLodged - totalExpense;
    return { totalIncome, totalExpense, totalLodged, pendingLodgmentAmount, cashOnHand, netBalance: totalIncome - totalExpense };
  }, [transactions, lodgments]);
  
  // render the wrapper from page.tsx:960-1216
}
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] Create `DashboardHeader.tsx`
- [ ] Create `MetricsCards.tsx`
- [ ] Create `ComplianceChecklist.tsx`
- [ ] Create `RecentMeetingsTable.tsx`
- [ ] Create `FundsDistributionChart.tsx`
- [ ] Create `PendingDepositsQueue.tsx`
- [ ] Create `DashboardTab.tsx` that composes them all with metrics computation
- [ ] Run `npx tsc --noEmit`

### Task 6: Ledger tab + sub-components

**Files:**
- Create: `src/components/ledger/TransactionFilters.tsx`
- Create: `src/components/ledger/TransactionTable.tsx`
- Create: `src/components/ledger/LedgerTab.tsx`

**Step 1: TransactionFilters.tsx**

Extract filter card from page.tsx:1239-1282. Reads/writes `txSearch`, `txFilterType`, `txFilterCategory` from store.

**Step 2: TransactionTable.tsx**

Extract table from page.tsx:1285-1383. Reads `filteredTransactions` (useMemo computed in LedgerTab), `formatCurrency`. Actions call `setEditingTx/setTxReceiptImage/setIsTxModalOpen/handleDeleteTx/setPreviewImage` from store.

**Step 3: LedgerTab.tsx**

Extract from page.tsx:1219-1385. Computes `filteredTransactions` via useMemo (page.tsx:695-704). Orchestrates header + TransactionFilters + TransactionTable.

**Step 4: Verify**

Run: `npx tsc --noEmit`

- [ ] Create `TransactionFilters.tsx`
- [ ] Create `TransactionTable.tsx`
- [ ] Create `LedgerTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 7: Meetings tab + sub-components

**Files:**
- Create: `src/components/meetings/MeetingCard.tsx`
- Create: `src/components/meetings/MeetingsTab.tsx`

**Step 1: MeetingCard.tsx**

Extract a single meeting card from page.tsx:1409-1504. Takes `meeting: Meeting` as a prop. Renders the card with financial breakdown, signature view, and notes.

**Step 2: MeetingsTab.tsx**

Extract from page.tsx:1388-1513. Maps `meetings` to `MeetingCard[]`, renders the header with "Log Meeting" button.

**Step 3: Verify**

Run: `npx tsc --noEmit`

- [ ] Create `MeetingCard.tsx`
- [ ] Create `MeetingsTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 8: Lodgments tab

**Files:**
- Create: `src/components/lodgments/LodgmentTable.tsx`
- Create: `src/components/lodgments/LodgmentsTab.tsx`

**Step 1: LodgmentTable.tsx**

Extract table from page.tsx:1537-1617. Reads `lodgments` from store.

**Step 2: LodgmentsTab.tsx**

Extract from page.tsx:1516-1619. Header + LodgmentTable.

**Step 3: Verify**

- [ ] Create `LodgmentTable.tsx`
- [ ] Create `LodgmentsTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 9: Reconciliation tab

**Files:**
- Create: `src/components/reconciliation/VarianceChecker.tsx`
- Create: `src/components/reconciliation/ReconciliationTab.tsx`

**Step 1: VarianceChecker.tsx**

Extract auto-variance checker from page.tsx:1710-1770. Takes `statements` and `lodgments` as props (or reads from store). Computes variance inline (page.tsx:1728-1763).

**Step 2: ReconciliationTab.tsx**

Extract from page.tsx:1622-1777. Header + statement table + VarianceChecker.

**Step 3: Verify**

- [ ] Create `VarianceChecker.tsx`
- [ ] Create `ReconciliationTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 10: Reports tab

**Files:**
- Create: `src/components/reports/ReportsPrintArea.tsx`
- Create: `src/components/reports/ReportsTab.tsx`

**Step 1: ReportsPrintArea.tsx**

Extract the printable report from page.tsx:1837-1979. Takes `reportData`, `reportQuarter`, `reportYear`, `reportType`, `formatCurrency` as props/reads from store.

**Step 2: ReportsTab.tsx**

Extract from page.tsx:1780-1982. Computes `reportData` via useMemo (page.tsx:707-747). Header + filter card + ReportsPrintArea.

**Step 3: Verify**

- [ ] Create `ReportsPrintArea.tsx`
- [ ] Create `ReportsTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 11: Settings tab

**Files:**
- Create: `src/components/settings/SettingsTab.tsx`

**Step 1: SettingsTab.tsx**

Extract from page.tsx:1985-2079. Two cards: Supabase Connection form + Data Portability panel. Reads/writes `dbSettings`, `settingsStatusMsg`, `supabaseConnected`, calls `handleSaveDbSettings`, `handleJsonImport` from store.

- [ ] Create `SettingsTab.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 12: Modal components

**Files:**
- Create: `src/components/modals/TransactionModal.tsx`
- Create: `src/components/modals/MeetingModal.tsx`
- Create: `src/components/modals/LodgmentModal.tsx`
- Create: `src/components/modals/StatementModal.tsx`
- Create: `src/components/modals/ReceiptPreview.tsx`

**Step 1: TransactionModal.tsx**

Extract from page.tsx:2088-2238. Reads `isTxModalOpen`, `editingTx`, `txReceiptImage`, `uploadingTxImage` from store. Calls `setIsTxModalOpen`, `setEditingTx`, `setTxReceiptImage`, `handleSaveTransaction`, `uploadReceiptImage`.

**Step 2: MeetingModal.tsx**

Extract from page.tsx:2241-2337. Reads `isMeetModalOpen`, `editingMeeting`, `tempSignature` from store. Uses `SignaturePad` component.

**Step 3: LodgmentModal.tsx**

Extract from page.tsx:2340-2463. Reads `isLodgeModalOpen`, `editingLodgment`, `lodgReceiptImage`, `uploadingLodgImage` from store.

**Step 4: StatementModal.tsx**

Extract from page.tsx:2466-2563. Reads `isStmtModalOpen`, `editingStatement` from store.

**Step 5: ReceiptPreview.tsx**

Extract from page.tsx:2566-2597. Reads `previewImage`, calls `setPreviewImage` from store.

**Step 6: Verify**

- [ ] Create `TransactionModal.tsx`
- [ ] Create `MeetingModal.tsx`
- [ ] Create `LodgmentModal.tsx`
- [ ] Create `StatementModal.tsx`
- [ ] Create `ReceiptPreview.tsx`
- [ ] Run `npx tsc --noEmit`

### Task 13: Clean up page.tsx

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

**Step 1: Rewrite page.tsx**

Replace the entire 2601-line file with:

```tsx
'use client';

import React, { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import * as db from '@/lib/db';
import { User } from '@supabase/supabase-js';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import StatusBanner from '@/components/layout/StatusBanner';
import LoadingScreen from '@/components/layout/LoadingScreen';

// Tab views
import DashboardTab from '@/components/dashboard/DashboardTab';
import LedgerTab from '@/components/ledger/LedgerTab';
import MeetingsTab from '@/components/meetings/MeetingsTab';
import LodgmentsTab from '@/components/lodgments/LodgmentsTab';
import ReconciliationTab from '@/components/reconciliation/ReconciliationTab';
import ReportsTab from '@/components/reports/ReportsTab';
import SettingsTab from '@/components/settings/SettingsTab';

// Modals
import TransactionModal from '@/components/modals/TransactionModal';
import MeetingModal from '@/components/modals/MeetingModal';
import LodgmentModal from '@/components/modals/LodgmentModal';
import StatementModal from '@/components/modals/StatementModal';
import ReceiptPreview from '@/components/modals/ReceiptPreview';

import AuthScreen from '@/components/AuthScreen';

export default function Home() {
  const { user, authBypass, loading, supabaseConnected, activeTab, darkMode, setDarkMode, loadAllData, setAuthBypass, setUser, setAuthMode, setSupabaseConnected, setDbSettings } = useDashboardStore();

  // Theme initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }
  }, [setDarkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth listener
  useEffect(() => {
    const configured = db.isSupabaseConfigured();
    if (configured) {
      db.initSupabase();
      const client = db.getSupabaseClient();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });
        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          if (event === 'PASSWORD_RECOVERY') {
            setAuthBypass(false);
            setAuthMode('update');
          }
        });
        return () => subscription.unsubscribe();
      }
    }
  }, [supabaseConnected, setUser, setAuthBypass, setAuthMode]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  if (db.isSupabaseConfigured() && !user && !authBypass) {
    return <AuthScreen onSuccess={() => loadAllData()} onDemoMode={() => setAuthBypass(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 mt-16 md:mt-0">
        <StatusBanner />
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'ledger' && <LedgerTab />}
            {activeTab === 'meetings' && <MeetingsTab />}
            {activeTab === 'lodgments' && <LodgmentsTab />}
            {activeTab === 'reconciliation' && <ReconciliationTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>
      <TransactionModal />
      <MeetingModal />
      <LodgmentModal />
      <StatementModal />
      <ReceiptPreview />
    </div>
  );
}
```

**Step 2: Build and test**

Run: `npm run build`
Expected: Build succeeds. Test all features.

**Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] Rewrite `src/app/page.tsx` to ~70 lines with imports only
- [ ] Handle useEffect dependency issues (theme sync, auth listener)
- [ ] Run `npm run build` — must pass
- [ ] Run `npm run lint` — must pass
- [ ] Hand-test: navigate tabs, open modals, verify dark mode toggle works
