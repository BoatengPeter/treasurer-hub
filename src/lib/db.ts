import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Dues' | 'Offering' | 'Special Contribution' | 'Donation' | 'Welfare' | 'Transport' | 'Stationery' | 'Honorarium' | 'Other';
  amount: number;
  payment_method: 'Cash' | 'Cheque' | 'Mobile Money' | 'Bank Transfer';
  reference?: string;
  description: string;
  meeting_id?: string;
  lodgment_id?: string;
  created_at?: string;
}

export interface Meeting {
  id: string;
  date: string;
  title: string;
  dues_collected: number;
  offering_collected: number;
  other_collected: number;
  total_collected: number;
  president_name: string;
  president_signature: string; // Base64 dataURL
  signed_at?: string | null;
  notes?: string;
  created_at?: string;
}

export interface Lodgment {
  id: string;
  date: string;
  amount: number;
  church_receipt_no: string;
  treasurer_name: string;
  notes?: string;
  status: 'Pending' | 'Lodged' | 'Reconciled';
  created_at?: string;
}

export interface ChurchStatement {
  id: string;
  period_start: string;
  period_end: string;
  statement_type: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  opening_balance: number;
  closing_balance: number;
  lodgments_recorded: number;
  notes?: string;
  created_at?: string;
}

const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', key: '' };
  }
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');
  
  const url = localUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = localKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return { url, key };
};

let supabase: SupabaseClient | null = null;

export const initSupabase = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      supabase = createClient(url, key);
      return true;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabase = null;
      return false;
    }
  }
  supabase = null;
  return false;
};

// Initialize client-side if possible
if (typeof window !== 'undefined') {
  initSupabase();
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return !!(url && key);
};

export const getSupabaseStatus = (): boolean => {
  return supabase !== null;
};

export const saveSettings = (url: string, key: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (url && key) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
  } else {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  }
  return initSupabase();
};

export const getSettings = () => {
  const { url, key } = getSupabaseConfig();
  return { url, key };
};

// --- Fallback Local Storage Data Helper ---
const getLocalData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`treasurer_${key}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`treasurer_${key}`, JSON.stringify(data));
};

// --- TRANSACTIONS ---
export const getTransactions = async (): Promise<Transaction[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) return data as Transaction[];
    console.warn('Supabase fetch failed, falling back to local storage', error);
  }
  return getLocalData<Transaction>('transactions').sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveTransaction = async (transaction: Partial<Transaction> & { id?: string }): Promise<Transaction> => {
  const fullTx: Transaction = {
    id: transaction.id || crypto.randomUUID(),
    date: transaction.date || new Date().toISOString().split('T')[0],
    type: transaction.type || 'income',
    category: transaction.category || 'Offering',
    amount: transaction.amount || 0,
    payment_method: transaction.payment_method || 'Cash',
    reference: transaction.reference || '',
    description: transaction.description || '',
    meeting_id: transaction.meeting_id || '',
    lodgment_id: transaction.lodgment_id || '',
    created_at: transaction.created_at || new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .upsert(fullTx)
      .select();
    if (!error && data && data[0]) return data[0] as Transaction;
    console.warn('Supabase save failed, writing to local storage', error);
  }

  const local = getLocalData<Transaction>('transactions');
  const index = local.findIndex(t => t.id === fullTx.id);
  if (index >= 0) {
    local[index] = { ...local[index], ...fullTx };
  } else {
    local.push(fullTx);
  }
  saveLocalData('transactions', local);
  return fullTx;
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.warn('Supabase delete failed, removing from local storage', error);
  }

  const local = getLocalData<Transaction>('transactions');
  const filtered = local.filter(t => t.id !== id);
  saveLocalData('transactions', filtered);
  return true;
};

// --- MEETINGS ---
export const getMeetings = async (): Promise<Meeting[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) return data as Meeting[];
    console.warn('Supabase fetch failed, falling back to local storage', error);
  }
  return getLocalData<Meeting>('meetings').sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveMeeting = async (meeting: Partial<Meeting> & { id?: string }): Promise<Meeting> => {
  const fullMeeting: Meeting = {
    id: meeting.id || crypto.randomUUID(),
    date: meeting.date || new Date().toISOString().split('T')[0],
    title: meeting.title || 'Weekly Youth Fellowship',
    dues_collected: meeting.dues_collected || 0,
    offering_collected: meeting.offering_collected || 0,
    other_collected: meeting.other_collected || 0,
    total_collected: meeting.total_collected || 0,
    president_name: meeting.president_name || '',
    president_signature: meeting.president_signature || '',
    signed_at: meeting.signed_at || (meeting.president_signature ? new Date().toISOString() : null),
    notes: meeting.notes || '',
    created_at: meeting.created_at || new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('meetings')
      .upsert(fullMeeting)
      .select();
    if (!error && data && data[0]) return data[0] as Meeting;
    console.warn('Supabase save failed, writing to local storage', error);
  }

  const local = getLocalData<Meeting>('meetings');
  const index = local.findIndex(m => m.id === fullMeeting.id);
  if (index >= 0) {
    local[index] = { ...local[index], ...fullMeeting };
  } else {
    local.push(fullMeeting);
  }
  saveLocalData('meetings', local);
  return fullMeeting;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.warn('Supabase delete failed, removing from local storage', error);
  }

  const local = getLocalData<Meeting>('meetings');
  const filtered = local.filter(m => m.id !== id);
  saveLocalData('meetings', filtered);
  return true;
};

// --- LODGMENTS ---
export const getLodgments = async (): Promise<Lodgment[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('lodgments')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) return data as Lodgment[];
    console.warn('Supabase fetch failed, falling back to local storage', error);
  }
  return getLocalData<Lodgment>('lodgments').sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveLodgment = async (lodgment: Partial<Lodgment> & { id?: string }): Promise<Lodgment> => {
  const fullLodgment: Lodgment = {
    id: lodgment.id || crypto.randomUUID(),
    date: lodgment.date || new Date().toISOString().split('T')[0],
    amount: lodgment.amount || 0,
    church_receipt_no: lodgment.church_receipt_no || '',
    treasurer_name: lodgment.treasurer_name || '',
    notes: lodgment.notes || '',
    status: lodgment.status || 'Lodged',
    created_at: lodgment.created_at || new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('lodgments')
      .upsert(fullLodgment)
      .select();
    if (!error && data && data[0]) return data[0] as Lodgment;
    console.warn('Supabase save failed, writing to local storage', error);
  }

  const local = getLocalData<Lodgment>('lodgments');
  const index = local.findIndex(l => l.id === fullLodgment.id);
  if (index >= 0) {
    local[index] = { ...local[index], ...fullLodgment };
  } else {
    local.push(fullLodgment);
  }
  saveLocalData('lodgments', local);
  return fullLodgment;
};

export const deleteLodgment = async (id: string): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('lodgments')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.warn('Supabase delete failed, removing from local storage', error);
  }

  const local = getLocalData<Lodgment>('lodgments');
  const filtered = local.filter(l => l.id !== id);
  saveLocalData('lodgments', filtered);
  return true;
};

// --- CHURCH STATEMENTS ---
export const getStatements = async (): Promise<ChurchStatement[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('church_statements')
      .select('*')
      .order('period_end', { ascending: false });
    if (!error && data) return data as ChurchStatement[];
    console.warn('Supabase fetch failed, falling back to local storage', error);
  }
  return getLocalData<ChurchStatement>('church_statements').sort(
    (a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
  );
};

export const saveStatement = async (statement: Partial<ChurchStatement> & { id?: string }): Promise<ChurchStatement> => {
  const fullStatement: ChurchStatement = {
    id: statement.id || crypto.randomUUID(),
    period_start: statement.period_start || new Date().toISOString().split('T')[0],
    period_end: statement.period_end || new Date().toISOString().split('T')[0],
    statement_type: statement.statement_type || 'Monthly',
    opening_balance: statement.opening_balance || 0,
    closing_balance: statement.closing_balance || 0,
    lodgments_recorded: statement.lodgments_recorded || 0,
    notes: statement.notes || '',
    created_at: statement.created_at || new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('church_statements')
      .upsert(fullStatement)
      .select();
    if (!error && data && data[0]) return data[0] as ChurchStatement;
    console.warn('Supabase save failed, writing to local storage', error);
  }

  const local = getLocalData<ChurchStatement>('church_statements');
  const index = local.findIndex(s => s.id === fullStatement.id);
  if (index >= 0) {
    local[index] = { ...local[index], ...fullStatement };
  } else {
    local.push(fullStatement);
  }
  saveLocalData('church_statements', local);
  return fullStatement;
};

export const deleteStatement = async (id: string): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('church_statements')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.warn('Supabase delete failed, removing from local storage', error);
  }

  const local = getLocalData<ChurchStatement>('church_statements');
  const filtered = local.filter(s => s.id !== id);
  saveLocalData('church_statements', filtered);
  return true;
};

// --- Backups Import/Export ---
export const exportBackup = (): void => {
  if (typeof window === 'undefined') return;
  const backup = {
    transactions: getLocalData<Transaction>('transactions'),
    meetings: getLocalData<Meeting>('meetings'),
    lodgments: getLocalData<Lodgment>('lodgments'),
    church_statements: getLocalData<ChurchStatement>('church_statements'),
    supabase_url: localStorage.getItem('supabase_url') || '',
    supabase_anon_key: localStorage.getItem('supabase_anon_key') || '',
    exported_at: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `treasurer_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importBackup = (jsonData: string): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Not running in browser environment' };
  try {
    const backup = JSON.parse(jsonData);
    if (backup.transactions) saveLocalData('transactions', backup.transactions);
    if (backup.meetings) saveLocalData('meetings', backup.meetings);
    if (backup.lodgments) saveLocalData('lodgments', backup.lodgments);
    if (backup.church_statements) saveLocalData('church_statements', backup.church_statements);

    if (backup.supabase_url) localStorage.setItem('supabase_url', backup.supabase_url);
    if (backup.supabase_anon_key) localStorage.setItem('supabase_anon_key', backup.supabase_anon_key);

    initSupabase();
    return { success: true };
  } catch (e: any) {
    console.error('Failed to import backup:', e);
    return { success: false, error: e.message };
  }
};
