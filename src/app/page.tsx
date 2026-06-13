'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Building,
  ClipboardCheck,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Printer,
  Sun,
  Moon,
  RefreshCw,
  Database,
  Calendar,
  DollarSign,
  FileCheck,
  TrendingUp,
  ImageIcon,
  Eye
} from 'lucide-react';

import * as db from '@/lib/db';
import type { Transaction, Meeting, Lodgment, ChurchStatement } from '@/lib/db';
import SignaturePad from '@/components/SignaturePad';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Seed Sample Data if local database is empty
const sampleData = {
  transactions: [
    {
      id: 'tx-1',
      date: '2026-06-07',
      type: 'income',
      category: 'Offering',
      amount: 450.00,
      payment_method: 'Cash',
      reference: 'OFF-0607',
      description: 'Sunday Youth Service Offering collection',
      meeting_id: 'meet-1',
      lodgment_id: 'lodge-1',
      receipt_image: '',
      created_at: new Date('2026-06-07T12:00:00Z').toISOString()
    },
    {
      id: 'tx-2',
      date: '2026-06-07',
      type: 'income',
      category: 'Dues',
      amount: 180.00,
      payment_method: 'Cash',
      reference: 'DUE-0607',
      description: 'Monthly member dues collected',
      meeting_id: 'meet-1',
      lodgment_id: 'lodge-1',
      receipt_image: '',
      created_at: new Date('2026-06-07T12:05:00Z').toISOString()
    },
    {
      id: 'tx-3',
      date: '2026-06-02',
      type: 'expense',
      category: 'Transport',
      amount: 75.00,
      payment_method: 'Mobile Money',
      reference: 'TXN-998822',
      description: 'Transport reimbursement for visiting guest speaker',
      meeting_id: '',
      lodgment_id: '',
      receipt_image: '',
      created_at: new Date('2026-06-02T16:30:00Z').toISOString()
    },
    {
      id: 'tx-4',
      date: '2026-05-31',
      type: 'income',
      category: 'Offering',
      amount: 390.00,
      payment_method: 'Cash',
      reference: 'OFF-0531',
      description: 'Weekly service offering',
      meeting_id: 'meet-2',
      lodgment_id: 'lodge-2',
      receipt_image: '',
      created_at: new Date('2026-05-31T12:00:00Z').toISOString()
    },
    {
      id: 'tx-5',
      date: '2026-05-31',
      type: 'income',
      category: 'Dues',
      amount: 120.00,
      payment_method: 'Cash',
      reference: 'DUE-0531',
      description: 'Monthly dues collection',
      meeting_id: 'meet-2',
      lodgment_id: 'lodge-2',
      receipt_image: '',
      created_at: new Date('2026-05-31T12:10:00Z').toISOString()
    },
    {
      id: 'tx-6',
      date: '2026-05-15',
      type: 'expense',
      category: 'Stationery',
      amount: 45.50,
      payment_method: 'Cash',
      reference: 'CHQ-0012',
      description: 'Receipt books and registers for treasury record keeping',
      meeting_id: '',
      lodgment_id: '',
      receipt_image: '',
      created_at: new Date('2026-05-15T10:00:00Z').toISOString()
    }
  ] as Transaction[],
  meetings: [
    {
      id: 'meet-1',
      date: '2026-06-07',
      title: 'Weekly Youth Fellowship',
      dues_collected: 180.00,
      offering_collected: 450.00,
      other_collected: 0.00,
      total_collected: 630.00,
      president_name: 'David Mensah',
      president_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><text x="10" y="30" style="font: italic 20px Georgia; fill: %23059669;">D.Mensah</text></svg>',
      signed_at: '2026-06-07T13:00:00Z',
      notes: 'Well attended. Guest speaker delivered sermon on financial stewardship.'
    },
    {
      id: 'meet-2',
      date: '2026-05-31',
      title: 'Monthly Joint Service',
      dues_collected: 120.00,
      offering_collected: 390.00,
      other_collected: 0.00,
      total_collected: 510.00,
      president_name: 'David Mensah',
      president_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><text x="10" y="30" style="font: italic 20px Georgia; fill: %23059669;">D.Mensah</text></svg>',
      signed_at: '2026-05-31T13:15:00Z',
      notes: 'Monthly dues focused. Encouraged members to fulfill their backlogged dues.'
    }
  ] as Meeting[],
  lodgments: [
    {
      id: 'lodge-1',
      date: '2026-06-08',
      amount: 630.00,
      church_receipt_no: 'CH-REC-009988',
      treasurer_name: 'Elder Comfort Appiah',
      notes: 'Lodged cash from meeting of June 7th.',
      status: 'Lodged'
    },
    {
      id: 'lodge-2',
      date: '2026-06-01',
      amount: 510.00,
      church_receipt_no: 'CH-REC-009912',
      treasurer_name: 'Elder Comfort Appiah',
      notes: 'Lodged offering and dues from May 31st.',
      status: 'Reconciled'
    }
  ] as Lodgment[],
  statements: [
    {
      id: 'stmt-1',
      period_start: '2026-05-01',
      period_end: '2026-05-31',
      statement_type: 'Monthly',
      opening_balance: 1250.00,
      closing_balance: 1760.00,
      lodgments_recorded: 510.00,
      notes: 'May statement. Matches May 31st lodgment.'
    }
  ] as ChurchStatement[]
};

export default function Home() {
  // Navigation & Theme States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [lodgments, setLodgments] = useState<Lodgment[]>([]);
  const [statements, setStatements] = useState<ChurchStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Modal & Form States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txReceiptImage, setTxReceiptImage] = useState('');
  
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [tempSignature, setTempSignature] = useState('');
  
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [editingLodgment, setEditingLodgment] = useState<Lodgment | null>(null);
  const [lodgReceiptImage, setLodgReceiptImage] = useState('');
  
  const [isStmtModalOpen, setIsStmtModalOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<ChurchStatement | null>(null);

  // Receipt Preview Lightbox State
  const [previewImage, setPreviewImage] = useState('');

  // Filter States
  const [txSearch, setTxSearch] = useState('');
  const [txFilterType, setTxFilterType] = useState('all');
  const [txFilterCategory, setTxFilterCategory] = useState('all');

  // Supabase Credentials Settings
  const [dbSettings, setDbSettings] = useState({ url: '', key: '' });
  const [settingsStatusMsg, setSettingsStatusMsg] = useState({ text: '', type: '' });

  // Quarterly and Income/Expenditure variables
  const [reportType, setReportType] = useState('both');
  const [reportQuarter, setReportQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2');
  const [reportYear, setReportYear] = useState('2026');

  // Image Compress helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800; // max size

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75); // compress quality
          resolve(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Theme Syncing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load Database Data & Seed if empty
  const loadAllData = async () => {
    setLoading(true);
    try {
      const isConfigured = db.isSupabaseConfigured();
      setSupabaseConnected(db.getSupabaseStatus());
      setDbSettings(db.getSettings());

      let txs = await db.getTransactions();
      let meets = await db.getMeetings();
      let lodgs = await db.getLodgments();
      let stmts = await db.getStatements();

      // Seed mock data if completely empty
      if (txs.length === 0 && meets.length === 0 && lodgs.length === 0 && !isConfigured) {
        localStorage.setItem(`treasurer_transactions`, JSON.stringify(sampleData.transactions));
        localStorage.setItem(`treasurer_meetings`, JSON.stringify(sampleData.meetings));
        localStorage.setItem(`treasurer_lodgments`, JSON.stringify(sampleData.lodgments));
        localStorage.setItem(`treasurer_church_statements`, JSON.stringify(sampleData.statements));

        txs = sampleData.transactions;
        meets = sampleData.meetings;
        lodgs = sampleData.lodgments;
        stmts = sampleData.statements;
      }

      setTransactions(txs);
      setMeetings(meets);
      setLodgments(lodgs);
      setStatements(stmts);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalLodged = lodgments
      .filter(l => l.status === 'Lodged' || l.status === 'Reconciled')
      .reduce((acc, l) => acc + Number(l.amount), 0);

    const pendingLodgmentAmount = transactions
      .filter(t => t.type === 'income' && !t.lodgment_id)
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const cashOnHand = totalIncome - totalLodged - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalLodged,
      pendingLodgmentAmount,
      cashOnHand,
      netBalance: totalIncome - totalExpense
    };
  }, [transactions, lodgments]);

  // Handle transaction save/edit
  const handleSaveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tx: Partial<Transaction> = {
      id: editingTx?.id || undefined,
      date: formData.get('date') as string,
      type: formData.get('type') as 'income' | 'expense',
      category: formData.get('category') as any,
      amount: parseFloat(formData.get('amount') as string),
      payment_method: formData.get('payment_method') as any,
      reference: (formData.get('reference') as string) || '',
      description: (formData.get('description') as string) || '',
      meeting_id: (formData.get('meeting_id') as string) || '',
      lodgment_id: (formData.get('lodgment_id') as string) || '',
      receipt_image: txReceiptImage,
      created_at: editingTx?.created_at || undefined
    };

    const saved = await db.saveTransaction(tx);
    if (saved) {
      setTransactions(await db.getTransactions());
      setIsTxModalOpen(false);
      setEditingTx(null);
      setTxReceiptImage('');
    }
  };

  // Handle meeting save/edit
  const handleSaveMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
      created_at: editingMeeting?.created_at || undefined
    };

    const saved = await db.saveMeeting(meeting);
    if (saved) {
      // Automate creating Income entries in the Ledger if this is a new meeting
      if (!editingMeeting?.id) {
        if (offering > 0) {
          await db.saveTransaction({
            date: meeting.date,
            type: 'income',
            category: 'Offering',
            amount: offering,
            payment_method: 'Cash',
            reference: `OFF-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Offering Collection`,
            meeting_id: saved.id
          });
        }
        if (dues > 0) {
          await db.saveTransaction({
            date: meeting.date,
            type: 'income',
            category: 'Dues',
            amount: dues,
            payment_method: 'Cash',
            reference: `DUE-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Dues Collection`,
            meeting_id: saved.id
          });
        }
        if (other > 0) {
          await db.saveTransaction({
            date: meeting.date,
            type: 'income',
            category: 'Special Contribution',
            amount: other,
            payment_method: 'Cash',
            reference: `OTH-${meeting.date?.replace(/-/g, '')}`,
            description: `${meeting.title} Other Collections`,
            meeting_id: saved.id
          });
        }
      }

      setMeetings(await db.getMeetings());
      setTransactions(await db.getTransactions());
      setIsMeetModalOpen(false);
      setEditingMeeting(null);
      setTempSignature('');
    }
  };

  // Handle Lodgments save/edit
  const handleSaveLodgment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const lodg: Partial<Lodgment> = {
      id: editingLodgment?.id || undefined,
      date: formData.get('date') as string,
      amount: amount,
      church_receipt_no: formData.get('church_receipt_no') as string,
      treasurer_name: formData.get('treasurer_name') as string,
      notes: (formData.get('notes') as string) || '',
      status: (formData.get('status') as 'Pending' | 'Lodged' | 'Reconciled') || 'Lodged',
      receipt_image: lodgReceiptImage,
      created_at: editingLodgment?.created_at || undefined
    };

    const saved = await db.saveLodgment(lodg);
    if (saved) {
      setLodgments(await db.getLodgments());
      setIsLodgeModalOpen(false);
      setEditingLodgment(null);
      setLodgReceiptImage('');
    }
  };

  // Handle statements save/edit
  const handleSaveStatement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stmt: Partial<ChurchStatement> = {
      id: editingStatement?.id || undefined,
      period_start: formData.get('period_start') as string,
      period_end: formData.get('period_end') as string,
      statement_type: formData.get('statement_type') as any,
      opening_balance: parseFloat(formData.get('opening_balance') as string),
      closing_balance: parseFloat(formData.get('closing_balance') as string),
      lodgments_recorded: parseFloat(formData.get('lodgments_recorded') as string),
      notes: (formData.get('notes') as string) || '',
      created_at: editingStatement?.created_at || undefined
    };

    const saved = await db.saveStatement(stmt);
    if (saved) {
      setStatements(await db.getStatements());
      setIsStmtModalOpen(false);
      setEditingStatement(null);
    }
  };

  // Delete handlers
  const handleDeleteTx = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await db.deleteTransaction(id);
      setTransactions(await db.getTransactions());
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting? (Note: Linked transactions will not be deleted)')) {
      await db.deleteMeeting(id);
      setMeetings(await db.getMeetings());
    }
  };

  const handleDeleteLodgment = async (id: string) => {
    if (confirm('Are you sure you want to delete this lodgment record?')) {
      await db.deleteLodgment(id);
      setLodgments(await db.getLodgments());
    }
  };

  const handleDeleteStatement = async (id: string) => {
    if (confirm('Are you sure you want to delete this statement record?')) {
      await db.deleteStatement(id);
      setStatements(await db.getStatements());
    }
  };

  // Save Settings
  const handleSaveDbSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = db.saveSettings(dbSettings.url, dbSettings.key);
    if (success) {
      setSettingsStatusMsg({ text: 'Connected and synced to Supabase!', type: 'success' });
      setSupabaseConnected(true);
      loadAllData();
    } else if (!dbSettings.url && !dbSettings.key) {
      setSettingsStatusMsg({ text: 'Using local storage fallback.', type: 'info' });
      setSupabaseConnected(false);
      loadAllData();
    } else {
      setSettingsStatusMsg({ text: 'Failed to connect. Verify your configuration.', type: 'error' });
      setSupabaseConnected(false);
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (typeof event.target?.result === 'string') {
        const res = db.importBackup(event.target.result);
        if (res.success) {
          alert('Backup restored successfully!');
          loadAllData();
        } else {
          alert(`Failed to restore backup: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Filtered ledger transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.reference?.toLowerCase().includes(txSearch.toLowerCase());
      const matchesType = txFilterType === 'all' || t.type === txFilterType;
      const matchesCategory = txFilterCategory === 'all' || t.category === txFilterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, txSearch, txFilterType, txFilterCategory]);

  // Reports computing
  const reportData = useMemo(() => {
    const quarterMonths = {
      Q1: { start: '01-01', end: '03-31' },
      Q2: { start: '04-01', end: '06-30' },
      Q3: { start: '07-01', end: '09-30' },
      Q4: { start: '10-01', end: '12-31' }
    };
    
    const dates = quarterMonths[reportQuarter];
    const startDate = new Date(`${reportYear}-${dates.start}T00:00:00`);
    const endDate = new Date(`${reportYear}-${dates.end}T23:59:59`);

    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const incomeRecords = periodTransactions.filter(t => t.type === 'income');
    const expenseRecords = periodTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeRecords.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenseRecords.reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeByCategory = incomeRecords.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const expenseByCategory = expenseRecords.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpense,
      incomeByCategory,
      expenseByCategory,
      netSurplus: totalIncome - totalExpense
    };
  }, [transactions, reportQuarter, reportYear]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="no-print hidden md:flex flex-col w-[280px] bg-card border-r border-border p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            YT
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Treasurer Hub
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Youth Accounts Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Financial Position
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'ledger' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> Transactions Ledger
          </button>
          <button 
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'meetings' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" /> Meeting Sign-offs
          </button>
          <button 
            onClick={() => setActiveTab('lodgments')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'lodgments' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building className="h-4 w-4" /> Church Lodgments
          </button>
          <button 
            onClick={() => setActiveTab('reconciliation')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'reconciliation' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" /> Reconciliation
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" /> Accounts Reports
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </nav>

        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${supabaseConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></span>
            {supabaseConnected ? 'Supabase Connected' : 'Offline Storage fallback'}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAV */}
      <div className="no-print flex md:hidden absolute top-0 left-0 right-0 h-16 bg-card border-b border-border items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow">
            YT
          </div>
          <span className="font-heading font-bold text-sm">Treasurer Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            Menu
          </Button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-xl p-6 flex flex-col gap-2 z-40" onClick={() => setMobileMenuOpen(false)}>
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <LayoutDashboard className="h-4 w-4" /> Position
            </button>
            <button onClick={() => setActiveTab('ledger')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <FileSpreadsheet className="h-4 w-4" /> Ledger
            </button>
            <button onClick={() => setActiveTab('meetings')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <Users className="h-4 w-4" /> Meetings
            </button>
            <button onClick={() => setActiveTab('lodgments')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <Building className="h-4 w-4" /> Lodgments
            </button>
            <button onClick={() => setActiveTab('reconciliation')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <ClipboardCheck className="h-4 w-4" /> Reconciliation
            </button>
            <button onClick={() => setActiveTab('reports')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <FileText className="h-4 w-4" /> Reports
            </button>
            <button onClick={() => setActiveTab('settings')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
              <Settings className="h-4 w-4" /> Settings
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN APP ROUTER DISPLAY AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 mt-16 md:mt-0">
        
        {/* Supabase status info banner */}
        <div className="no-print mb-6 p-4 rounded-lg bg-card border border-border flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${supabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span>
              {supabaseConnected 
                ? 'Cloud sync enabled. All records, files, and signature grids are securely synchronized.'
                : 'Using browser fallback storage. Setup Supabase settings to synchronise with mobile devices.'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadAllData} className="h-7 px-2">
            <RefreshCw className="h-3 w-3 mr-1" /> Sync
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Syncing transaction registry...</p>
          </div>
        ) : (
          <>
            {/* TABS LOGICAL SWITCHES */}

            {/* TAB: OVERVIEW / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-8">
                <header className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Financial Position</h2>
                    <p className="text-xs text-muted-foreground">Compliance indicators and real-time ledger holdings</p>
                  </div>
                  <div className="no-print flex items-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingMeeting(null);
                        setTempSignature('');
                        setIsMeetModalOpen(true);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Users className="h-4 w-4" /> Log Meeting
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditingTx(null);
                        setTxReceiptImage('');
                        setIsTxModalOpen(true);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Log Transaction
                    </Button>
                  </div>
                </header>

                {/* DASHBOARD STATUS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="stats-glow-primary border-l-4 border-l-emerald-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Total Youth Balance</span>
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.netBalance)}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">Accumulated ledger holdings surplus</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-emerald-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Lodged in Vault</span>
                      <Building className="h-4 w-4 text-emerald-700" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.totalLodged)}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">Lodged and reconciled with church treasurer</p>
                    </CardContent>
                  </Card>

                  <Card className="stats-glow-accent border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Deposit</span>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-500">{formatCurrency(metrics.pendingLodgmentAmount)}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">Collected income pending lodgment</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-slate-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Operational Held</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.cashOnHand)}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">Funds held locally for petty expenses</p>
                    </CardContent>
                  </Card>
                </div>

                {/* DOUBLE COLUMN COMPLIANCE & HISTORICAL SUMMARY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column (2 spans): Compliance Checklists and Meetings */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-emerald-600" />
                          Compliance Audit Checklist
                        </CardTitle>
                        <CardDescription>Verify operational alignment with your 7 treasurer duties</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border">
                          <div>
                            <p className="text-sm font-semibold">Rule i: Collect but Do Not Keep Funds</p>
                            <p className="text-[11px] text-muted-foreground">Keep operational cash minimal. Vault deposits should exceed operational holdings.</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.cashOnHand > 500 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {metrics.cashOnHand > 500 ? 'High Cash: Lodge' : 'Compliant'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-border">
                          <div>
                            <p className="text-sm font-semibold">Rule iv: President Meeting Sign-offs</p>
                            <p className="text-[11px] text-muted-foreground">Verify that the president has signed off on the collected sums of all services.</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${meetings.some(m => !m.president_signature) ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {meetings.some(m => !m.president_signature) ? 'Pending Signatures' : 'Compliant'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold">Rule vii: periodic Statements called</p>
                            <p className="text-[11px] text-muted-foreground">Upload and reconcile the church treasurer statements against your records.</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statements.length === 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {statements.length === 0 ? 'Request Statement' : 'Statements logged'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Recent Meeting Collections</CardTitle>
                          <CardDescription>Signed dues and offerings summaries</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('meetings')} className="h-8">View All</Button>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Fellowship Meeting</TableHead>
                              <TableHead>Dues</TableHead>
                              <TableHead>Offering</TableHead>
                              <TableHead>Total Sum</TableHead>
                              <TableHead>Sign-off</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {meetings.slice(0, 3).map(m => (
                              <TableRow key={m.id}>
                                <TableCell className="font-mono text-xs">{m.date}</TableCell>
                                <TableCell className="font-semibold">{m.title}</TableCell>
                                <TableCell>{formatCurrency(m.dues_collected)}</TableCell>
                                <TableCell>{formatCurrency(m.offering_collected)}</TableCell>
                                <TableCell className="font-bold text-emerald-600">{formatCurrency(m.total_collected)}</TableCell>
                                <TableCell>
                                  {m.president_signature ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                      <img src={m.president_signature} alt="Sig" className="h-5 max-w-[60px] object-contain" />
                                      <span>✓ Signed</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-amber-600 font-semibold">Pending</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {meetings.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-sm">
                                  No meetings registered.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (1 span): Distribution Charts & Pending Lodgment Queue */}
                  <div className="flex flex-col gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Funds Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center flex-col py-6">
                        {metrics.totalIncome > 0 ? (
                          <div className="w-full flex flex-col gap-4">
                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>Deposited in Vault</span>
                                <span>{((metrics.totalLodged / metrics.totalIncome) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600" style={{ width: `${(metrics.totalLodged / metrics.totalIncome) * 100}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>Pending Deposit</span>
                                <span>{((metrics.pendingLodgmentAmount / metrics.totalIncome) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${(metrics.pendingLodgmentAmount / metrics.totalIncome) * 100}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>Operational Outflow</span>
                                <span>{((metrics.totalExpense / metrics.totalIncome) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: `${(metrics.totalExpense / metrics.totalIncome) * 100}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground py-6">No data registered.</span>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Pending Deposits Queue</CardTitle>
                        <CardDescription>Income collections waiting to be lodged in church</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {transactions
                          .filter(t => t.type === 'income' && !t.lodgment_id)
                          .slice(0, 4)
                          .map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{t.category} - {t.reference || 'No Ref'}</p>
                                <p className="text-[10px] text-muted-foreground">{t.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-600">{formatCurrency(t.amount)}</p>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium mt-0.5 inline-block">Pending</span>
                              </div>
                            </div>
                          ))
                        }
                        {transactions.filter(t => t.type === 'income' && !t.lodgment_id).length === 0 && (
                          <div className="text-center text-xs text-muted-foreground py-6">
                            All income lodged! 100% compliance.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: LEDGER TRANSACTIONS */}
            {activeTab === 'ledger' && (
              <div className="flex flex-col gap-8">
                <header className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Ledger Registry</h2>
                    <p className="text-xs text-muted-foreground">Interactive spreadsheet interface for all transactions</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingTx(null);
                      setTxReceiptImage('');
                      setIsTxModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Transaction
                  </Button>
                </header>

                {/* FILTER CARD */}
                <Card className="no-print">
                  <CardContent className="p-4 flex gap-4 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search reference, description, category..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="w-[150px]">
                      <select
                        value={txFilterType}
                        onChange={(e) => setTxFilterType(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expenses</option>
                      </select>
                    </div>

                    <div className="w-[180px]">
                      <select
                        value={txFilterCategory}
                        onChange={(e) => setTxFilterCategory(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="all">All Categories</option>
                        <option value="Offering">Offering</option>
                        <option value="Dues">Dues</option>
                        <option value="Donation">Donation</option>
                        <option value="Special Contribution">Special Contribution</option>
                        <option value="Transport">Transport</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Honorarium">Honorarium</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* TRANSACTION SPREADSHEET */}
                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Vault Lodged</TableHead>
                          <TableHead>Receipt</TableHead>
                          <TableHead className="no-print text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map(t => (
                          <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">{t.date}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {t.type === 'income' ? 'IN' : 'OUT'}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">{t.category}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{t.reference || '-'}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={t.description}>{t.description}</TableCell>
                            <TableCell className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-800 dark:text-slate-200">
                                {t.payment_method}
                              </span>
                            </TableCell>
                            <TableCell>
                              {t.type === 'expense' ? (
                                <span className="text-[10px] text-muted-foreground">N/A</span>
                              ) : t.lodgment_id ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">Lodged</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {t.receipt_image ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(t.receipt_image || '')}
                                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer font-semibold"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="no-print text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setEditingTx(t);
                                    setTxReceiptImage(t.receipt_image || '');
                                    setIsTxModalOpen(true);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteTx(t.id)}
                                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-sm">
                              No transactions match your search filter.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: MEETINGS & SIGN-OFFS */}
            {activeTab === 'meetings' && (
              <div className="flex flex-col gap-8">
                <header className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Fellowship Sign-offs</h2>
                    <p className="text-xs text-muted-foreground">Gather signature approvals for meeting collections in real-time</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingMeeting(null);
                      setTempSignature('');
                      setIsMeetModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Log Meeting
                  </Button>
                </header>

                <div className="flex flex-col gap-6">
                  {meetings.map(m => (
                    <Card key={m.id}>
                      <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-border flex-wrap gap-4">
                        <div>
                          <CardTitle className="text-lg">{m.title}</CardTitle>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(m.date)}
                          </p>
                        </div>
                        <div className="no-print flex items-center gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingMeeting(m);
                              setTempSignature(m.president_signature);
                              setIsMeetModalOpen(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit Info
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          {/* Financial values */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collections Breakdown</h4>
                            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                              <span>Fellowship Offering:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.offering_collected)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                              <span>Weekly Member Dues:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.dues_collected)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                              <span>Special Contribution:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.other_collected)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 text-base font-bold">
                              <span>Total Collected Sum:</span>
                              <span className="text-emerald-600">{formatCurrency(m.total_collected)}</span>
                            </div>
                          </div>

                          {/* Signature view */}
                          <div className="flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                            {m.president_signature ? (
                              <div className="text-center w-full max-w-[280px]">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Acknowledgement Sign-off</span>
                                <div className="border border-border rounded-lg p-3 bg-white flex justify-center items-center max-h-[100px]">
                                  <img 
                                    src={m.president_signature} 
                                    alt="President Signature" 
                                    className="max-h-[80px] object-contain"
                                  />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                  Signed by <strong>{m.president_name}</strong> on {formatDate(m.signed_at || m.created_at || '')}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center no-print">
                                <p className="text-sm font-semibold text-amber-600 mb-3">⚠️ Pending President Signature</p>
                                <Button 
                                  onClick={() => {
                                    setEditingMeeting(m);
                                    setTempSignature('');
                                    setIsMeetModalOpen(true);
                                  }}
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                  Provide Signature
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {m.notes && (
                          <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs border border-border">
                            <strong>Service notes:</strong> {m.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {meetings.length === 0 && (
                    <Card className="p-10 text-center text-muted-foreground text-sm">
                      No service records logged yet. Use the button to log your first meeting collections and collect approval.
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CHURCH LODGMENTS */}
            {activeTab === 'lodgments' && (
              <div className="flex flex-col gap-8">
                <header className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Deposit Lodgments</h2>
                    <p className="text-xs text-muted-foreground">Log money lodged in the main church vault</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingLodgment(null);
                      setLodgReceiptImage('');
                      setIsLodgeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Record Lodgment
                  </Button>
                </header>

                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deposit Date</TableHead>
                          <TableHead>Amount Deposited</TableHead>
                          <TableHead>Official Receipt No.</TableHead>
                          <TableHead>Receiving Church Treasurer</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Receipt Image</TableHead>
                          <TableHead className="no-print text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lodgments.map(l => (
                          <TableRow key={l.id}>
                            <TableCell className="font-mono text-xs">{l.date}</TableCell>
                            <TableCell className="font-bold text-emerald-600">{formatCurrency(l.amount)}</TableCell>
                            <TableCell className="font-mono font-semibold text-xs">{l.church_receipt_no}</TableCell>
                            <TableCell>{l.treasurer_name}</TableCell>
                            <TableCell>{l.notes || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                l.status === 'Reconciled' 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {l.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {l.receipt_image ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(l.receipt_image || '')}
                                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer font-semibold"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="no-print text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setEditingLodgment(l);
                                    setLodgReceiptImage(l.receipt_image || '');
                                    setIsLodgeModalOpen(true);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteLodgment(l.id)}
                                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {lodgments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                              No lodgment deposits recorded yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: RECONCILIATION */}
            {activeTab === 'reconciliation' && (
              <div className="flex flex-col gap-8">
                <header className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Account Reconciliation</h2>
                    <p className="text-xs text-muted-foreground">Compare official statements called from the church treasurer</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingStatement(null);
                      setIsStmtModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Log Church Statement
                  </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column (2 spans): Statements ledger */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Logged Statements Registry</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Period</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Opening Bal</TableHead>
                              <TableHead>Closing Bal</TableHead>
                              <TableHead>Vault Lodgments</TableHead>
                              <TableHead className="no-print text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {statements.map(s => (
                              <TableRow key={s.id}>
                                <TableCell className="font-semibold text-xs">
                                  {formatDate(s.period_start)} - {formatDate(s.period_end)}
                                </TableCell>
                                <TableCell>{s.statement_type}</TableCell>
                                <TableCell>{formatCurrency(s.opening_balance)}</TableCell>
                                <TableCell className="font-bold text-emerald-600">{formatCurrency(s.closing_balance)}</TableCell>
                                <TableCell className="font-bold">{formatCurrency(s.lodgments_recorded)}</TableCell>
                                <TableCell className="no-print text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        setEditingStatement(s);
                                        setIsStmtModalOpen(true);
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleDeleteStatement(s.id)}
                                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {statements.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                                  No statement sheets registered yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (1 span): Variance check */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Auto-Variance Checker</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {statements.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            <p className="text-xs text-muted-foreground">
                              Comparing the statement period ending <strong>{formatDate(statements[0].period_end)}</strong> 
                              with app deposits logged up to that date:
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg border border-border flex flex-col gap-3">
                              <div className="flex justify-between text-xs font-semibold">
                                <span>Statement Recorded:</span>
                                <span>{formatCurrency(statements[0].lodgments_recorded)}</span>
                              </div>

                              {(() => {
                                const endLimit = new Date(statements[0].period_end);
                                const appDeposits = lodgments
                                  .filter(l => new Date(l.date) <= endLimit)
                                  .reduce((sum, l) => sum + Number(l.amount), 0);
                                const diff = appDeposits - statements[0].lodgments_recorded;
                                const isMatch = Math.abs(diff) < 0.01;

                                return (
                                  <>
                                    <div className="flex justify-between text-xs font-semibold pb-2 border-b border-border">
                                      <span>Ledger Recorded:</span>
                                      <span>{formatCurrency(appDeposits)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm font-bold pt-1">
                                      <span>Variance:</span>
                                      <span className={isMatch ? 'text-emerald-600' : 'text-rose-500'}>
                                        {isMatch ? 'Balanced' : formatCurrency(diff)}
                                      </span>
                                    </div>

                                    <div className="mt-4">
                                      {isMatch ? (
                                        <span className="w-full text-center text-xs font-medium text-emerald-600 bg-emerald-500/10 py-2 rounded block">
                                          ✓ Balanced & Reconciled!
                                        </span>
                                      ) : (
                                        <div className="p-3 text-[11px] border border-rose-500/20 text-rose-500 bg-rose-500/10 rounded">
                                          ⚠️ Variance detected. Check receipt book entries or bank details.
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-center text-muted-foreground py-10">
                            Log a statement to trigger auto-reconciliation analysis.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: ACCOUNTS REPORTS */}
            {activeTab === 'reports' && (
              <div className="flex flex-col gap-8">
                <header className="no-print flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Financial Reports</h2>
                    <p className="text-xs text-muted-foreground">Generate quarterly Receipts & Payments or Income & Expenditure summaries</p>
                  </div>
                  <Button 
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> Print Statement
                  </Button>
                </header>

                {/* FILTERS */}
                <Card className="no-print">
                  <CardContent className="p-4 flex gap-4 flex-wrap items-center">
                    <div className="w-[185px]">
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="both">Both Statements</option>
                        <option value="receipts">Receipts & Payments</option>
                        <option value="income">Income & Expenditure</option>
                      </select>
                    </div>

                    <div className="w-[140px]">
                      <select
                        value={reportQuarter}
                        onChange={(e) => setReportQuarter(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Q1">Q1 (Jan - Mar)</option>
                        <option value="Q2">Q2 (Apr - Jun)</option>
                        <option value="Q3">Q3 (Jul - Sep)</option>
                        <option value="Q4">Q4 (Oct - Dec)</option>
                      </select>
                    </div>

                    <div className="w-[120px]">
                      <select
                        value={reportYear}
                        onChange={(e) => setReportYear(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* PRINT AREA CONTAINER */}
                <Card className="p-10 md:p-14" id="printable-area">
                  <div className="text-center pb-6 border-b-4 border-double border-slate-300 dark:border-slate-800 mb-8">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      LOCAL CHURCH YOUTH FELLOWSHIP
                    </h2>
                    <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mt-1">
                      TREASURER'S COMPLIANCE REPORT
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                      Quarter: {reportQuarter} - {reportYear} ({
                        reportQuarter === 'Q1' ? 'Jan 1 - Mar 31' : 
                        reportQuarter === 'Q2' ? 'Apr 1 - Jun 30' : 
                        reportQuarter === 'Q3' ? 'Jul 1 - Sep 30' : 'Oct 1 - Dec 31'
                      }, {reportYear})
                    </p>
                  </div>

                  {/* Receipts & Payments Account */}
                  {(reportType === 'both' || reportType === 'receipts') && (
                    <div className="mb-10 print-page-break">
                      <h3 className="text-sm font-bold uppercase border-b border-slate-900 dark:border-slate-100 pb-2 mb-4">
                        Receipts & Payments Statement
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Receipts */}
                        <div>
                          <span className="text-xs font-bold font-mono text-emerald-600 block pb-1 border-b border-dashed border-border mb-3">
                            RECEIPTS (INFLOW)
                          </span>
                          <div className="flex flex-col gap-2 text-xs">
                            {Object.entries(reportData.incomeByCategory).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                                <span>{cat} Dues / Offerings</span>
                                <span>{formatCurrency(val)}</span>
                              </div>
                            ))}
                            {Object.keys(reportData.incomeByCategory).length === 0 && (
                              <span className="text-muted-foreground italic">No inflows logged.</span>
                            )}
                            <div className="flex justify-between font-bold pt-3 border-t border-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                              <span>Total Receipts:</span>
                              <span className="text-emerald-600">{formatCurrency(reportData.totalIncome)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payments */}
                        <div>
                          <span className="text-xs font-bold font-mono text-rose-500 block pb-1 border-b border-dashed border-border mb-3">
                            PAYMENTS (OUTFLOW)
                          </span>
                          <div className="flex flex-col gap-2 text-xs">
                            {Object.entries(reportData.expenseByCategory).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                                <span>{cat} Outflow</span>
                                <span>{formatCurrency(val)}</span>
                              </div>
                            ))}
                            {Object.keys(reportData.expenseByCategory).length === 0 && (
                              <span className="text-muted-foreground italic">No outflows logged.</span>
                            )}
                            <div className="flex justify-between font-bold pt-3 border-t border-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                              <span>Total Payments:</span>
                              <span className="text-rose-500">{formatCurrency(reportData.totalExpense)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-border text-xs flex justify-between font-bold">
                        <span>Net Quarterly Balance Shift:</span>
                        <span className={reportData.netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                          {reportData.netSurplus >= 0 ? '+' : ''}{formatCurrency(reportData.netSurplus)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Income & Expenditure Account */}
                  {(reportType === 'both' || reportType === 'income') && (
                    <div>
                      <h3 className="text-sm font-bold uppercase border-b border-slate-900 dark:border-slate-100 pb-2 mb-4">
                        Income & Expenditure Statement
                      </h3>
                      <div className="flex flex-col gap-6 text-xs">
                        
                        {/* Income */}
                        <div>
                          <span className="font-semibold text-emerald-600 block mb-2 text-xs">INCOME REVENUES</span>
                          <div className="flex flex-col gap-2 pl-4">
                            {Object.entries(reportData.incomeByCategory).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                                <span>{cat} Collections</span>
                                <span className="font-mono">{formatCurrency(val)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 text-slate-800 dark:text-slate-200">
                              <span>Total Revenues:</span>
                              <span className="font-mono">{formatCurrency(reportData.totalIncome)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expenditures */}
                        <div>
                          <span className="font-semibold text-rose-500 block mb-2 text-xs">EXPENDITURE CHARGES</span>
                          <div className="flex flex-col gap-2 pl-4">
                            {Object.entries(reportData.expenseByCategory).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                                <span>{cat} Expense</span>
                                <span className="font-mono">{formatCurrency(val)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 text-slate-800 dark:text-slate-200">
                              <span>Total Expenditures:</span>
                              <span className="font-mono">{formatCurrency(reportData.totalExpense)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Final Balance Sheet surplus */}
                        <div className="border-t-2 border-b-2 border-slate-900 dark:border-slate-100 py-3 mt-4 flex justify-between font-bold text-sm">
                          <span>QUARTERLY ACCUMULATED SURPLUS / (DEFICIT):</span>
                          <span className={reportData.netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                            {formatCurrency(reportData.netSurplus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auditor and official signatures on paper reports */}
                  <div className="mt-16 grid grid-cols-2 gap-10 print-only">
                    <div className="border-t border-slate-800 pt-3 text-center text-xs">
                      <p className="font-bold">Prepared By:</p>
                      <p className="mt-4">Fellowship Treasurer</p>
                    </div>
                    <div className="border-t border-slate-800 pt-3 text-center text-xs">
                      <p className="font-bold">Approved By:</p>
                      <p className="mt-4">Fellowship President</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-8">
                <header>
                  <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Portal Settings</h2>
                  <p className="text-xs text-muted-foreground">Setup Supabase endpoints or perform local data backups</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Database syncing settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-600" />
                        Supabase Connection
                      </CardTitle>
                      <CardDescription>Sync data in real-time to the cloud for multi-device access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveDbSettings} className="flex flex-col gap-4">
                        {settingsStatusMsg.text && (
                          <div className={`p-3 rounded text-xs border ${
                            settingsStatusMsg.type === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {settingsStatusMsg.text}
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider">Supabase URL</label>
                          <Input
                            type="url"
                            placeholder="https://your-project.supabase.co"
                            value={dbSettings.url}
                            onChange={(e) => setDbSettings({ ...dbSettings, url: e.target.value })}
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider">Anon Public Key</label>
                          <Input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1Ni..."
                            value={dbSettings.key}
                            onChange={(e) => setDbSettings({ ...dbSettings, key: e.target.value })}
                          />
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDbSettings({ url: '', key: '' })}
                          >
                            Clear
                          </Button>
                          <Button type="submit">
                            Connect & Sync
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Backups Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Download className="h-5 w-5 text-emerald-600" />
                        Data Portability
                      </CardTitle>
                      <CardDescription>Export backups or restore records from JSON backup files</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      <Button onClick={db.exportBackup} className="w-full flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" /> Download Backup File (.json)
                      </Button>

                      <div className="border-t border-border pt-4">
                        <span className="text-xs font-semibold uppercase tracking-wider block mb-2">Restore Backup File</span>
                        <Input
                          type="file"
                          accept=".json"
                          onChange={handleJsonImport}
                          className="text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* 4. MODALS DIALOGS */}

      {/* MODAL: TRANSACTION LOGGING */}
      <Dialog open={isTxModalOpen} onOpenChange={setIsTxModalOpen}>
        <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Modify Transaction Record' : 'Record Ledger Transaction'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTransaction} className="flex flex-col gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Date</label>
                <Input
                  type="date"
                  name="date"
                  required
                  defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Type</label>
                <select
                  name="type"
                  required
                  defaultValue={editingTx?.type || 'income'}
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="income">Income (Inflow)</option>
                  <option value="expense">Expense (Outflow)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Category</label>
                <select
                  name="category"
                  required
                  defaultValue={editingTx?.category || 'Offering'}
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="Offering">Offering</option>
                  <option value="Dues">Dues</option>
                  <option value="Donation">Donation</option>
                  <option value="Special Contribution">Special Contribution</option>
                  <option value="Transport">Transport</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Honorarium">Honorarium</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Amount (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  required
                  placeholder="0.00"
                  defaultValue={editingTx?.amount || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Payment Method</label>
                <select
                  name="payment_method"
                  required
                  defaultValue={editingTx?.payment_method || 'Cash'}
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Mobile Money">Mobile Money (MoMo)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Reference No. (optional)</label>
                <Input
                  type="text"
                  name="reference"
                  placeholder="Cheque #, TxID, receipt #"
                  defaultValue={editingTx?.reference || ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Description</label>
              <Textarea
                name="description"
                required
                placeholder="Log context notes for this transaction..."
                defaultValue={editingTx?.description || ''}
              />
            </div>

            {/* Receipt upload input */}
            <div className="flex flex-col gap-1.5 border-t border-border pt-4 mt-2">
              <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Upload Receipt Image (optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImage(file);
                    setTxReceiptImage(compressed);
                  }
                }}
                className="text-xs cursor-pointer"
              />
              {txReceiptImage && (
                <div className="mt-2 relative inline-block self-start">
                  <img src={txReceiptImage} alt="Receipt Preview" className="h-20 w-20 object-cover rounded border border-border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                    onClick={() => setTxReceiptImage('')}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>

            <input type="hidden" name="meeting_id" defaultValue={editingTx?.meeting_id || ''} />
            <input type="hidden" name="lodgment_id" defaultValue={editingTx?.lodgment_id || ''} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsTxModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: MEETING LOGGING */}
      <Dialog open={isMeetModalOpen} onOpenChange={setIsMeetModalOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? 'Fellowship Review & Sign-off' : 'Log Weekly Meeting collections'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMeeting} className="flex flex-col gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Meeting Date</label>
                <Input
                  type="date"
                  name="date"
                  required
                  defaultValue={editingMeeting?.date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Meeting Title</label>
                <Input
                  type="text"
                  name="title"
                  required
                  placeholder="Weekly fellowship, Joint service"
                  defaultValue={editingMeeting?.title || 'Weekly Youth Fellowship'}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Dues (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="dues_collected"
                  placeholder="0.00"
                  defaultValue={editingMeeting?.dues_collected || ''}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Offering (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="offering_collected"
                  placeholder="0.00"
                  defaultValue={editingMeeting?.offering_collected || ''}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Other (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="other_collected"
                  placeholder="0.00"
                  defaultValue={editingMeeting?.other_collected || ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Remarks / Notes</label>
              <Textarea
                name="notes"
                placeholder="Fellowship sermon topic, speakers, attendance logs..."
                defaultValue={editingMeeting?.notes || ''}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">President Full Name</label>
              <Input
                type="text"
                name="president_name"
                required
                placeholder="David Mensah"
                defaultValue={editingMeeting?.president_name || ''}
              />
            </div>

            <div className="mt-2">
              <SignaturePad
                value={editingMeeting?.president_signature}
                onSave={(dataUrl) => setTempSignature(dataUrl)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsMeetModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Meeting Logs</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: RECORD LODGMENT */}
      <Dialog open={isLodgeModalOpen} onOpenChange={setIsLodgeModalOpen}>
        <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLodgment ? 'Modify Deposit Record' : 'Record Deposit Lodgment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLodgment} className="flex flex-col gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Date of Deposit</label>
                <Input
                  type="date"
                  name="date"
                  required
                  defaultValue={editingLodgment?.date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Amount Lodged (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  required
                  placeholder="0.00"
                  defaultValue={editingLodgment?.amount || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Church official Receipt #</label>
                <Input
                  type="text"
                  name="church_receipt_no"
                  required
                  placeholder="CH-REC-00123"
                  defaultValue={editingLodgment?.church_receipt_no || ''}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Receiving Treasurer Name</label>
                <Input
                  type="text"
                  name="treasurer_name"
                  required
                  placeholder="Elder Comfort Appiah"
                  defaultValue={editingLodgment?.treasurer_name || ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Verification Status</label>
              <select
                name="status"
                defaultValue={editingLodgment?.status || 'Lodged'}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="Pending">Pending Verification</option>
                <option value="Lodged">Lodged (Confirmed with Receipt)</option>
                <option value="Reconciled">Reconciled (Appears on Church Statement)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Notes / Remarks</label>
              <Textarea
                name="notes"
                placeholder="Any special remarks..."
                defaultValue={editingLodgment?.notes || ''}
              />
            </div>

            {/* Receipt upload input */}
            <div className="flex flex-col gap-1.5 border-t border-border pt-4 mt-2">
              <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Upload Church Receipt Image (optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImage(file);
                    setLodgReceiptImage(compressed);
                  }
                }}
                className="text-xs cursor-pointer"
              />
              {lodgReceiptImage && (
                <div className="mt-2 relative inline-block self-start">
                  <img src={lodgReceiptImage} alt="Receipt Preview" className="h-20 w-20 object-cover rounded border border-border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                    onClick={() => setLodgReceiptImage('')}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsLodgeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Deposit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: LOG CHURCH STATEMENT */}
      <Dialog open={isStmtModalOpen} onOpenChange={setIsStmtModalOpen}>
        <DialogContent className="max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingStatement ? 'Edit Church Statement Record' : 'Log Official Church Statement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStatement} className="flex flex-col gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Period Start Date</label>
                <Input
                  type="date"
                  name="period_start"
                  required
                  defaultValue={editingStatement?.period_start || ''}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Period End Date</label>
                <Input
                  type="date"
                  name="period_end"
                  required
                  defaultValue={editingStatement?.period_end || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Statement Type</label>
                <select
                  name="statement_type"
                  required
                  defaultValue={editingStatement?.statement_type || 'Monthly'}
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Opening Balance (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="opening_balance"
                  required
                  placeholder="0.00"
                  defaultValue={editingStatement?.opening_balance || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Closing Balance (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="closing_balance"
                  required
                  placeholder="0.00"
                  defaultValue={editingStatement?.closing_balance || ''}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Recorded Lodgments (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="lodgments_recorded"
                  required
                  placeholder="Total deposits on this statement"
                  defaultValue={editingStatement?.lodgments_recorded || ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Notes / Remarks</label>
              <Textarea
                name="notes"
                placeholder="Audit verification details..."
                defaultValue={editingStatement?.notes || ''}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsStmtModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Statement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX DIALOG: RECEIPT PHOTO REVIEW */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage('')}>
        <DialogContent className="max-w-[700px] flex flex-col items-center justify-center p-6">
          <DialogHeader className="w-full">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Receipt Photo Review
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 border border-border rounded-lg overflow-hidden bg-white max-h-[60vh] flex justify-center items-center w-full shadow-inner p-2">
            <img 
              src={previewImage} 
              alt="Receipt Preview Fullscreen" 
              className="max-w-full max-h-[50vh] object-contain rounded"
            />
          </div>
          <DialogFooter className="w-full mt-4 flex justify-between items-center gap-4 flex-wrap">
            <Button variant="outline" onClick={() => setPreviewImage('')}>
              Close Preview
            </Button>
            {previewImage.startsWith('data:') && (
              <a 
                href={previewImage} 
                download={`receipt_upload_${new Date().toISOString().split('T')[0]}.jpg`}
              >
                <Button>
                  <Download className="h-4 w-4 mr-2" /> Download Photo
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
