'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Search, CalendarRange } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function TransactionFilters() {
  const { txSearch, txFilterType, txFilterCategory, groupByWeek, setTxSearch, setTxFilterType, setTxFilterCategory, setGroupByWeek } = useDashboardStore();

  return (
    <Card className="no-print">
      <CardContent className="p-4 flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search reference, description, category..."
            value={txSearch} onChange={(e) => setTxSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="w-[150px]">
          <select value={txFilterType} onChange={(e) => setTxFilterType(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
        <div className="w-[180px]">
          <select value={txFilterCategory} onChange={(e) => setTxFilterCategory(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
        <button
          type="button"
          onClick={() => setGroupByWeek(!groupByWeek)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-md text-sm border transition-colors ${
            groupByWeek
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-card text-muted-foreground border-input hover:bg-accent'
          }`}
        >
          <CalendarRange className="h-4 w-4" />
          Group by Week
        </button>
      </CardContent>
    </Card>
  );
}
