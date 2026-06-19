import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Member {
  id: string;
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Dues' | 'Offering' | 'Special Contribution' | 'Donation' | 'Welfare' | 'Transport' | 'Stationery' | 'Honorarium' | 'Other';
  amount: number;
  payment_method: 'Cash' | 'Cheque' | 'Mobile Money' | 'Bank Transfer';
  reference?: string;
  description?: string;
  meeting_id?: string;
  lodgment_id?: string;
  member_id?: string;
  receipt_image?: string;
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
  president_signature: string;
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
  receipt_image?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
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
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
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

export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};

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

// --- TRANSACTIONS ---
export const getTransactions = async (): Promise<Transaction[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Transaction[];
};

export const saveTransaction = async (transaction: Partial<Transaction> & { id?: string }): Promise<Transaction | null> => {
  if (!supabase) return null;
  const fullTx: Transaction = {
    id: transaction.id || crypto.randomUUID(),
    date: transaction.date || new Date().toISOString().split('T')[0],
    type: transaction.type || 'income',
    category: transaction.category || 'Offering',
    amount: transaction.amount || 0,
    payment_method: transaction.payment_method || 'Cash',
    reference: transaction.reference || '',
    description: transaction.description || '',
    meeting_id: transaction.meeting_id || undefined,
    lodgment_id: transaction.lodgment_id || undefined,
    member_id: transaction.member_id || undefined,
    receipt_image: transaction.receipt_image || '',
    created_at: transaction.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('transactions')
    .upsert(fullTx)
    .select();
  if (error) throw error;
  return (data && data[0]) ? data[0] as Transaction : fullTx;
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- MEETINGS ---
export const getMeetings = async (): Promise<Meeting[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Meeting[];
};

export const saveMeeting = async (meeting: Partial<Meeting> & { id?: string }): Promise<Meeting | null> => {
  if (!supabase) return null;
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

  const { data, error } = await supabase
    .from('meetings')
    .upsert(fullMeeting)
    .select();
  if (error) throw error;
  return (data && data[0]) ? data[0] as Meeting : fullMeeting;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- LODGMENTS ---
export const getLodgments = async (): Promise<Lodgment[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('lodgments')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Lodgment[];
};

export const saveLodgment = async (lodgment: Partial<Lodgment> & { id?: string }): Promise<Lodgment | null> => {
  if (!supabase) return null;
  const fullLodgment: Lodgment = {
    id: lodgment.id || crypto.randomUUID(),
    date: lodgment.date || new Date().toISOString().split('T')[0],
    amount: lodgment.amount || 0,
    church_receipt_no: lodgment.church_receipt_no || '',
    treasurer_name: lodgment.treasurer_name || '',
    notes: lodgment.notes || '',
    status: lodgment.status || 'Lodged',
    receipt_image: lodgment.receipt_image || '',
    created_at: lodgment.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('lodgments')
    .upsert(fullLodgment)
    .select();
  if (error) throw error;
  return (data && data[0]) ? data[0] as Lodgment : fullLodgment;
};

export const deleteLodgment = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('lodgments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- CHURCH STATEMENTS ---
export const getStatements = async (): Promise<ChurchStatement[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('church_statements')
    .select('*')
    .order('period_end', { ascending: false });
  if (error) throw error;
  return data as ChurchStatement[];
};

export const saveStatement = async (statement: Partial<ChurchStatement> & { id?: string }): Promise<ChurchStatement | null> => {
  if (!supabase) return null;
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

  const { data, error } = await supabase
    .from('church_statements')
    .upsert(fullStatement)
    .select();
  if (error) throw error;
  return (data && data[0]) ? data[0] as ChurchStatement : fullStatement;
};

export const deleteStatement = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('church_statements')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- MEMBERS ---
export const getMembers = async (): Promise<Member[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Member[];
};

export const saveMember = async (member: Partial<Member> & { id?: string }): Promise<Member | null> => {
  if (!supabase) return null;
  const fullMember: Member = {
    id: member.id || crypto.randomUUID(),
    name: member.name || '',
    phone: member.phone || '',
    status: member.status || 'active',
    created_at: member.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('members')
    .upsert(fullMember)
    .select();
  if (error) throw error;
  return (data && data[0]) ? data[0] as Member : fullMember;
};

export const deleteMember = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- AUDIT LOG ---
export const logAudit = async (userId: string, action: string, entityType: string, entityId?: string, details?: Record<string, unknown>): Promise<void> => {
  if (!supabase || !userId) return;
  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details || null,
  });
};
