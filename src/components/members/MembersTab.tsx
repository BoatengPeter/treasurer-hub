'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Users, Plus, X, Check, Trash2, Edit3, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MembersTab() {
  const { members, handleSaveMember, setConfirmDelete, handleBulkDuesEntry } = useDashboardStore();

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [showBulkDues, setShowBulkDues] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkAmount, setBulkAmount] = useState('10');
  const [bulkPaymentMethod, setBulkPaymentMethod] = useState('Cash');

  const addMember = async () => {
    if (!newName.trim()) return;
    await handleSaveMember({ name: newName.trim(), phone: newPhone.trim() || undefined });
    setNewName('');
    setNewPhone('');
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await handleSaveMember({ id, name: editName.trim(), phone: editPhone.trim() || undefined });
    setEditingId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const submitBulkDues = async () => {
    if (selectedIds.length === 0 || !bulkAmount || parseFloat(bulkAmount) <= 0) return;
    await handleBulkDuesEntry(selectedIds, bulkDate, parseFloat(bulkAmount), bulkPaymentMethod);
    setSelectedIds([]);
    setShowBulkDues(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Member Roster</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground">Manage your youth group members and record dues payments</p>
            <HelpButton title="Member Roster">
              <p>The member roster keeps track of everyone in the youth group. Each member can be linked to their dues payments so you know exactly who has paid.</p>
              <p><strong>What you can do here:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Add new members to the roster (name + phone)</li>
                <li>Edit or remove existing members</li>
                <li>Use Bulk Dues Entry to log payments for multiple members at once</li>
                <li>Each bulk entry creates individual transactions in the ledger</li>
                <li>Member names appear on transactions in the Ledger tab</li>
              </ul>
            </HelpButton>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkDues(!showBulkDues)} variant="outline" className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" /> {showBulkDues ? 'Close Bulk Entry' : 'Bulk Dues Entry'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> All Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {members.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No members yet. Add your first member using the form.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-6 py-3">
                      {showBulkDues && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(m.id)}
                          onChange={() => toggleSelect(m.id)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                      )}
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm max-w-[200px]" />
                          <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="h-8 text-sm max-w-[150px]" placeholder="Phone" />
                          <Button size="sm" variant="ghost" onClick={() => saveEdit(m.id)} className="h-8 w-8 p-0 text-emerald-600"><Check className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 p-0 text-rose-500"><X className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{m.name}</p>
                            {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {m.status}
                          </span>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingId(m.id); setEditName(m.name); setEditPhone(m.phone || ''); }} className="h-8 w-8 p-0">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete({ id: m.id, entity: 'member' })} className="h-8 w-8 p-0 text-rose-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" /> Add Member
              </CardTitle>
              <CardDescription>Add a new member to the youth group roster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Input placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Phone number (optional)" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                <Button onClick={addMember} disabled={!newName.trim()} className="w-full">Add to Roster</Button>
              </div>
            </CardContent>
          </Card>

          {showBulkDues && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" /> Bulk Dues Entry
                </CardTitle>
                <CardDescription>
                  {selectedIds.length === 0
                    ? 'Check members above who paid'
                    : `${selectedIds.length} member(s) selected`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Date</label>
                    <Input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Amount per person (GHS)</label>
                    <Input type="number" step="0.01" min="0.01" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Payment Method</label>
                    <select value={bulkPaymentMethod} onChange={e => setBulkPaymentMethod(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1">
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money (MoMo)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <Button onClick={submitBulkDues} disabled={selectedIds.length === 0 || !bulkAmount} className="w-full">
                    Record {selectedIds.length} Payment{selectedIds.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
