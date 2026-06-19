import React from 'react';
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Transaction, Meeting, Lodgment, ChurchStatement } from '@/lib/db';
import * as db from '@/lib/db';
import { uploadImageToStorage } from '@/lib/image-utils';
import { sampleData } from '@/lib/sample-data';

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

  // Hydration (client-only to avoid SSR hydration mismatches)
  hydrated: boolean;
  setHydrated: () => void;

  // Auth setters (called from page.tsx lifecycle)
  setUser: (user: User | null) => void;
  setAuthBypass: (val: boolean) => void;
  setAuthMode: (val: 'signin' | 'signup' | 'forgot' | 'update') => void;
  setSupabaseConnected: (val: boolean) => void;

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

  // Setters
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
  setSettingsStatusMsg: (val: { text: string; type: string }) => void;
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

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // Navigation & Theme
  activeTab: 'dashboard',
  darkMode: false,
  mobileMenuOpen: false,

  // Data
  transactions: [],
  meetings: [],
  lodgments: [],
  statements: [],
  loading: false,
  supabaseConnected: false,

  // Auth
  user: null,
  authBypass: false,
  authMode: 'signin',

  // Hydration
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),

  // Auth setters
  setUser: (user) => set({ user }),
  setAuthBypass: (val) => set({ authBypass: val }),
  setAuthMode: (val) => set({ authMode: val }),
  setSupabaseConnected: (val) => set({ supabaseConnected: val }),

  // Modal states
  isTxModalOpen: false,
  editingTx: null,
  txReceiptImage: '',
  isMeetModalOpen: false,
  editingMeeting: null,
  tempSignature: '',
  isLodgeModalOpen: false,
  editingLodgment: null,
  lodgReceiptImage: '',
  isStmtModalOpen: false,
  editingStatement: null,
  previewImage: '',
  uploadingTxImage: false,
  uploadingLodgImage: false,

  // Filters
  txSearch: '',
  txFilterType: 'all',
  txFilterCategory: 'all',

  // Settings
  dbSettings: { url: '', key: '' },
  settingsStatusMsg: { text: '', type: '' },

  // Reports
  reportType: 'both',
  reportQuarter: 'Q2',
  reportYear: '2026',

  // Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDarkMode: (val) => set({ darkMode: val }),
  setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),
  setTxSearch: (val) => set({ txSearch: val }),
  setTxFilterType: (val) => set({ txFilterType: val }),
  setTxFilterCategory: (val) => set({ txFilterCategory: val }),
  setReportType: (val) => set({ reportType: val }),
  setReportQuarter: (val) => set({ reportQuarter: val }),
  setReportYear: (val) => set({ reportYear: val }),
  setDbSettings: (val) => set({ dbSettings: val }),
  setSettingsStatusMsg: (val) => set({ settingsStatusMsg: val }),
  setIsTxModalOpen: (val) => set({ isTxModalOpen: val }),
  setEditingTx: (val) => set({ editingTx: val }),
  setTxReceiptImage: (val) => set({ txReceiptImage: val }),
  setIsMeetModalOpen: (val) => set({ isMeetModalOpen: val }),
  setEditingMeeting: (val) => set({ editingMeeting: val }),
  setTempSignature: (val) => set({ tempSignature: val }),
  setIsLodgeModalOpen: (val) => set({ isLodgeModalOpen: val }),
  setEditingLodgment: (val) => set({ editingLodgment: val }),
  setLodgReceiptImage: (val) => set({ lodgReceiptImage: val }),
  setIsStmtModalOpen: (val) => set({ isStmtModalOpen: val }),
  setEditingStatement: (val) => set({ editingStatement: val }),
  setPreviewImage: (val) => set({ previewImage: val }),
  setUploadingTxImage: (val) => set({ uploadingTxImage: val }),
  setUploadingLodgImage: (val) => set({ uploadingLodgImage: val }),

  // Complex actions
  loadAllData: async () => {
    set({ loading: true });
    try {
      const isConfigured = db.isSupabaseConfigured();
      set({ supabaseConnected: db.getSupabaseStatus(), dbSettings: db.getSettings() });

      let txs = await db.getTransactions();
      let meets = await db.getMeetings();
      let lodgs = await db.getLodgments();
      let stmts = await db.getStatements();

      // Seed mock data if completely empty
      if (txs.length === 0 && meets.length === 0 && lodgs.length === 0 && !isConfigured) {
        localStorage.setItem('treasurer_transactions', JSON.stringify(sampleData.transactions));
        localStorage.setItem('treasurer_meetings', JSON.stringify(sampleData.meetings));
        localStorage.setItem('treasurer_lodgments', JSON.stringify(sampleData.lodgments));
        localStorage.setItem('treasurer_church_statements', JSON.stringify(sampleData.statements));
        txs = sampleData.transactions;
        meets = sampleData.meetings;
        lodgs = sampleData.lodgments;
        stmts = sampleData.statements;
      }

      set({ transactions: txs, meetings: meets, lodgments: lodgs, statements: stmts });
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      set({ loading: false });
    }
  },

  handleLogOut: async () => {
    const client = db.getSupabaseClient();
    if (client) await client.auth.signOut();
    set({ user: null, authBypass: false });
    get().loadAllData();
  },

  handleSaveTransaction: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingTx, txReceiptImage } = get();
    const tx: Partial<Transaction> = {
      id: editingTx?.id || undefined,
      date: formData.get('date') as string,
      type: formData.get('type') as 'income' | 'expense',
      category: formData.get('category') as Transaction['category'],
      amount: parseFloat(formData.get('amount') as string),
      payment_method: formData.get('payment_method') as Transaction['payment_method'],
      reference: (formData.get('reference') as string) || '',
      description: (formData.get('description') as string) || '',
      meeting_id: (formData.get('meeting_id') as string) || '',
      lodgment_id: (formData.get('lodgment_id') as string) || '',
      receipt_image: txReceiptImage,
      created_at: editingTx?.created_at || undefined,
    };
    const saved = await db.saveTransaction(tx);
    if (saved) {
      set({
        transactions: await db.getTransactions(),
        isTxModalOpen: false,
        editingTx: null,
        txReceiptImage: '',
      });
    }
  },

  handleSaveMeeting: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingMeeting, tempSignature } = get();
    const dues = parseFloat((formData.get('dues_collected') as string) || '0');
    const offering = parseFloat((formData.get('offering_collected') as string) || '0');
    const other = parseFloat((formData.get('other_collected') as string) || '0');
    const total = dues + offering + other;
    const signature = tempSignature || editingMeeting?.president_signature || '';
    const meeting: Partial<Meeting> = {
      id: editingMeeting?.id || undefined,
      date: formData.get('date') as string,
      title: formData.get('title') as string,
      dues_collected: dues,
      offering_collected: offering,
      other_collected: other,
      total_collected: total,
      president_name: formData.get('president_name') as string,
      president_signature: signature,
      signed_at: signature ? new Date().toISOString() : null,
      notes: (formData.get('notes') as string) || '',
      created_at: editingMeeting?.created_at || undefined,
    };
    const saved = await db.saveMeeting(meeting);
    if (saved) {
      if (!editingMeeting?.id) {
        if (offering > 0) {
          await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Offering',
            amount: offering, payment_method: 'Cash',
            reference: `OFF-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Offering Collection`,
            meeting_id: saved.id,
          });
        }
        if (dues > 0) {
          await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Dues',
            amount: dues, payment_method: 'Cash',
            reference: `DUE-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Dues Collection`,
            meeting_id: saved.id,
          });
        }
        if (other > 0) {
          await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Special Contribution',
            amount: other, payment_method: 'Cash',
            reference: `OTH-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Other Collections`,
            meeting_id: saved.id,
          });
        }
      }
      set({
        meetings: await db.getMeetings(),
        transactions: await db.getTransactions(),
        isMeetModalOpen: false,
        editingMeeting: null,
        tempSignature: '',
      });
    }
  },

  handleSaveLodgment: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingLodgment, lodgReceiptImage } = get();
    const amount = parseFloat(formData.get('amount') as string);
    const lodg: Partial<Lodgment> = {
      id: editingLodgment?.id || undefined,
      date: formData.get('date') as string,
      amount,
      church_receipt_no: formData.get('church_receipt_no') as string,
      treasurer_name: formData.get('treasurer_name') as string,
      notes: (formData.get('notes') as string) || '',
      status: (formData.get('status') as 'Pending' | 'Lodged' | 'Reconciled') || 'Lodged',
      receipt_image: lodgReceiptImage,
      created_at: editingLodgment?.created_at || undefined,
    };
    const saved = await db.saveLodgment(lodg);
    if (saved) {
      set({
        lodgments: await db.getLodgments(),
        isLodgeModalOpen: false,
        editingLodgment: null,
        lodgReceiptImage: '',
      });
    }
  },

  handleSaveStatement: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingStatement } = get();
    const stmt: Partial<ChurchStatement> = {
      id: editingStatement?.id || undefined,
      period_start: formData.get('period_start') as string,
      period_end: formData.get('period_end') as string,
      statement_type: formData.get('statement_type') as ChurchStatement['statement_type'],
      opening_balance: parseFloat(formData.get('opening_balance') as string),
      closing_balance: parseFloat(formData.get('closing_balance') as string),
      lodgments_recorded: parseFloat(formData.get('lodgments_recorded') as string),
      notes: (formData.get('notes') as string) || '',
      created_at: editingStatement?.created_at || undefined,
    };
    const saved = await db.saveStatement(stmt);
    if (saved) {
      set({
        statements: await db.getStatements(),
        isStmtModalOpen: false,
        editingStatement: null,
      });
    }
  },

  handleDeleteTx: async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await db.deleteTransaction(id);
      set({ transactions: await db.getTransactions() });
    }
  },

  handleDeleteMeeting: async (id) => {
    if (confirm('Are you sure you want to delete this meeting? (Note: Linked transactions will not be deleted)')) {
      await db.deleteMeeting(id);
      set({ meetings: await db.getMeetings() });
    }
  },

  handleDeleteLodgment: async (id) => {
    if (confirm('Are you sure you want to delete this lodgment record?')) {
      await db.deleteLodgment(id);
      set({ lodgments: await db.getLodgments() });
    }
  },

  handleDeleteStatement: async (id) => {
    if (confirm('Are you sure you want to delete this statement record?')) {
      await db.deleteStatement(id);
      set({ statements: await db.getStatements() });
    }
  },

  handleSaveDbSettings: (e) => {
    e.preventDefault();
    const { dbSettings } = get();
    const success = db.saveSettings(dbSettings.url, dbSettings.key);
    if (success) {
      set({ settingsStatusMsg: { text: 'Connected and synced to Supabase!', type: 'success' }, supabaseConnected: true });
      get().loadAllData();
    } else if (!dbSettings.url && !dbSettings.key) {
      set({ settingsStatusMsg: { text: 'Using local storage fallback.', type: 'info' }, supabaseConnected: false });
      get().loadAllData();
    } else {
      set({ settingsStatusMsg: { text: 'Failed to connect. Verify your configuration.', type: 'error' }, supabaseConnected: false });
    }
  },

  handleJsonImport: (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (typeof event.target?.result === 'string') {
        const res = db.importBackup(event.target.result);
        if (res.success) {
          alert('Backup restored successfully!');
          get().loadAllData();
        } else {
          alert(`Failed to restore backup: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  },

  uploadReceiptImage: async (file) => {
    const { supabaseConnected, user } = get();
    return uploadImageToStorage(file, supabaseConnected, user?.id);
  },
}));
