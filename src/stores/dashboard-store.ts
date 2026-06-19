import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import type { Transaction, Meeting, Lodgment, ChurchStatement, Member } from '@/lib/db';
import * as db from '@/lib/db';
import { uploadImageToStorage } from '@/lib/image-utils';
import { transactionFormSchema } from '@/lib/validation';

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
  members: Member[];
  loading: boolean;
  supabaseConnected: boolean;

  // Auth
  user: User | null;
  authMode: 'signin' | 'forgot' | 'update';

  // Hydration (client-only to avoid SSR hydration mismatches)
  hydrated: boolean;
  setHydrated: () => void;

  // Auth setters (called from page.tsx lifecycle)
  setUser: (user: User | null) => void;
  setAuthMode: (val: 'signin' | 'forgot' | 'update') => void;

  // Confirmation dialog
  confirmDelete: { id: string; entity: string } | null;
  setConfirmDelete: (val: { id: string; entity: string } | null) => void;

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

  // Form Errors
  txFormErrors: Record<string, string[]>;
  setTxFormErrors: (val: Record<string, string[]>) => void;

  // Filters
  txSearch: string;
  txFilterType: string;
  txFilterCategory: string;

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
  handleSaveMember: (member: Partial<Member>) => Promise<void>;
  handleDeleteMember: (id: string) => Promise<void>;
  handleBulkDuesEntry: (selectedIds: string[], date: string, amount: number, paymentMethod: string, meetingId?: string) => Promise<void>;
  uploadReceiptImage: (file: File) => Promise<string>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
  // Navigation & Theme
  activeTab: 'dashboard',
  darkMode: false,
  mobileMenuOpen: false,

  // Data
  transactions: [],
  meetings: [],
  lodgments: [],
  statements: [],
  members: [],
  loading: false,
  supabaseConnected: false,

  // Auth
  user: null,
  authMode: 'signin',

  // Hydration
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),

  // Auth setters
  setUser: (user) => set({ user }),
  setAuthMode: (val) => set({ authMode: val }),

  // Confirmation dialog
  confirmDelete: null,
  setConfirmDelete: (val) => set({ confirmDelete: val }),

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

  // Form Errors
  txFormErrors: {},
  setTxFormErrors: (val) => set({ txFormErrors: val }),

  // Filters
  txSearch: '',
  txFilterType: 'all',
  txFilterCategory: 'all',

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
      db.initSupabase();
      set({ supabaseConnected: db.getSupabaseStatus() });

      const [txs, meets, lodgs, stmts, mems] = await Promise.all([
        db.getTransactions(),
        db.getMeetings(),
        db.getLodgments(),
        db.getStatements(),
        db.getMembers(),
      ]);

      set({ transactions: txs, meetings: meets, lodgments: lodgs, statements: stmts, members: mems });
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      set({ loading: false });
    }
  },

  handleLogOut: async () => {
    const client = db.getSupabaseClient();
    if (client) await client.auth.signOut();
    set({ user: null });
    get().loadAllData();
  },

  handleSaveTransaction: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingTx, txReceiptImage, user } = get();

    const raw = Object.fromEntries(formData.entries());
    const result = transactionFormSchema.safeParse({ ...raw, receipt_image: txReceiptImage });
    if (!result.success) {
      set({ txFormErrors: result.error.flatten().fieldErrors });
      return;
    }
    set({ txFormErrors: {} });

    const vals = result.data;
    const tx: Partial<Transaction> = {
      id: editingTx?.id || undefined,
      date: vals.date,
      type: vals.type,
      category: vals.category as Transaction['category'],
      amount: vals.amount,
      payment_method: vals.payment_method as Transaction['payment_method'],
      reference: vals.reference || '',
      description: vals.description || '',
      meeting_id: vals.meeting_id || undefined,
      lodgment_id: vals.lodgment_id || undefined,
      member_id: vals.member_id || undefined,
      receipt_image: txReceiptImage,
      created_at: editingTx?.created_at || undefined,
    };
    const saved = await db.saveTransaction(tx);
    if (saved) {
      const action = editingTx ? 'update' : 'create';
      db.logAudit(user?.id || '', action, 'transaction', saved.id, { description: saved.description, amount: saved.amount, category: saved.category });
      set({
        transactions: await db.getTransactions(),
        isTxModalOpen: false,
        editingTx: null,
        txReceiptImage: '',
        txFormErrors: {},
      });
    }
  },

  handleSaveMeeting: async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { editingMeeting, tempSignature, user } = get();
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
      db.logAudit(user?.id || '', editingMeeting ? 'update' : 'create', 'meeting', saved.id, { title: saved.title, date: saved.date });
      if (!editingMeeting?.id) {
        if (offering > 0) {
          const tx = await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Offering',
            amount: offering, payment_method: 'Cash',
            reference: `OFF-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Offering Collection`,
            meeting_id: saved.id,
          });
          if (tx) db.logAudit(user?.id || '', 'create', 'transaction', tx.id, { description: tx.description, amount: tx.amount, category: tx.category });
        }
        // Per-member linked dues (from MeetingModal member selector)
        const linkMemberIdsRaw = formData.get('link_member_ids') as string;
        const linkMemberAmount = formData.get('link_member_amount') as string;
        const linkedIds: string[] = linkMemberIdsRaw ? JSON.parse(linkMemberIdsRaw) : [];
        if (linkedIds.length > 0 && linkMemberAmount) {
          for (const memberId of linkedIds) {
            const tx = await db.saveTransaction({
              date: meeting.date, type: 'income', category: 'Dues',
              amount: parseFloat(linkMemberAmount), payment_method: 'Cash',
              reference: `DUE-${meeting.date?.replace(/-/g, '')}`,
              description: `${meeting.title} Dues Collection`,
              meeting_id: saved.id,
              member_id: memberId,
            });
            if (tx) db.logAudit(user?.id || '', 'create', 'transaction', tx.id, { description: tx.description, amount: tx.amount, category: tx.category, member_id: memberId });
          }
        } else if (dues > 0) {
          const tx = await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Dues',
            amount: dues, payment_method: 'Cash',
            reference: `DUE-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Dues Collection`,
            meeting_id: saved.id,
          });
          if (tx) db.logAudit(user?.id || '', 'create', 'transaction', tx.id, { description: tx.description, amount: tx.amount, category: tx.category });
        }
        if (other > 0) {
          const tx = await db.saveTransaction({
            date: meeting.date, type: 'income', category: 'Special Contribution',
            amount: other, payment_method: 'Cash',
            reference: `OTH-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Other Collections`,
            meeting_id: saved.id,
          });
          if (tx) db.logAudit(user?.id || '', 'create', 'transaction', tx.id, { description: tx.description, amount: tx.amount, category: tx.category });
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
    const { editingLodgment, lodgReceiptImage, user } = get();
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
      db.logAudit(user?.id || '', editingLodgment ? 'update' : 'create', 'lodgment', saved.id, { amount: saved.amount, status: saved.status });
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
    const { editingStatement, user } = get();
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
      db.logAudit(user?.id || '', editingStatement ? 'update' : 'create', 'statement', saved.id, { statement_type: saved.statement_type, period: `${saved.period_start} to ${saved.period_end}` });
      set({
        statements: await db.getStatements(),
        isStmtModalOpen: false,
        editingStatement: null,
      });
    }
  },

  handleDeleteTx: async (id) => {
    const { user } = get();
    const tx = get().transactions.find(t => t.id === id);
    await db.deleteTransaction(id);
    db.logAudit(user?.id || '', 'delete', 'transaction', id, tx ? { description: tx.description, amount: tx.amount, category: tx.category } : undefined);
    set({ transactions: await db.getTransactions(), confirmDelete: null });
  },

  handleDeleteMeeting: async (id) => {
    const { user } = get();
    const meeting = get().meetings.find(m => m.id === id);
    await db.deleteMeeting(id);
    db.logAudit(user?.id || '', 'delete', 'meeting', id, meeting ? { title: meeting.title, date: meeting.date } : undefined);
    set({ meetings: await db.getMeetings(), confirmDelete: null });
  },

  handleDeleteLodgment: async (id) => {
    const { user } = get();
    const lodg = get().lodgments.find(l => l.id === id);
    await db.deleteLodgment(id);
    db.logAudit(user?.id || '', 'delete', 'lodgment', id, lodg ? { amount: lodg.amount, church_receipt_no: lodg.church_receipt_no } : undefined);
    set({ lodgments: await db.getLodgments(), confirmDelete: null });
  },

  handleDeleteStatement: async (id) => {
    const { user } = get();
    const stmt = get().statements.find(s => s.id === id);
    await db.deleteStatement(id);
    db.logAudit(user?.id || '', 'delete', 'statement', id, stmt ? { statement_type: stmt.statement_type, period: `${stmt.period_start} to ${stmt.period_end}` } : undefined);
    set({ statements: await db.getStatements(), confirmDelete: null });
  },

  handleSaveMember: async (member) => {
    const { user } = get();
    const saved = await db.saveMember(member);
    if (saved) {
      db.logAudit(user?.id || '', member.id ? 'update' : 'create', 'member', saved.id, { name: saved.name });
      set({ members: await db.getMembers() });
    }
  },

  handleDeleteMember: async (id) => {
    const { user } = get();
    const member = get().members.find(m => m.id === id);
    await db.deleteMember(id);
    db.logAudit(user?.id || '', 'delete', 'member', id, member ? { name: member.name } : undefined);
    set({ members: await db.getMembers(), confirmDelete: null });
  },

  handleBulkDuesEntry: async (selectedIds, date, amount, paymentMethod, meetingId) => {
    const { user } = get();
    for (const memberId of selectedIds) {
      const tx = await db.saveTransaction({
        date,
        type: 'income',
        category: 'Dues',
        amount,
        payment_method: paymentMethod as Transaction['payment_method'],
        description: `Dues payment - ${date}`,
        member_id: memberId,
        meeting_id: meetingId || undefined,
      });
      if (tx) db.logAudit(user?.id || '', 'create', 'transaction', tx.id, { description: tx.description, amount: tx.amount, category: tx.category, member_id: memberId });
    }
    set({ transactions: await db.getTransactions() });
  },

  uploadReceiptImage: async (file) => {
    const { supabaseConnected, user } = get();
    return uploadImageToStorage(file, supabaseConnected, user?.id);
  },
}), { name: 'treasurer-store', partialize: (state) => ({ activeTab: state.activeTab }) }));
