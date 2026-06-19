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
  const { transactions, lodgments, meetings, statements, setActiveTab } = useDashboardStore();

  const metrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
    const totalLodged = lodgments.filter(l => l.status === 'Lodged' || l.status === 'Reconciled').reduce((a, l) => a + Number(l.amount), 0);
    const pendingLodgmentAmount = transactions.filter(t => t.type === 'income' && !t.lodgment_id).reduce((a, t) => a + Number(t.amount), 0);
    const cashOnHand = totalIncome - totalLodged - totalExpense;
    return { totalIncome, totalExpense, totalLodged, pendingLodgmentAmount, cashOnHand, netBalance: totalIncome - totalExpense };
  }, [transactions, lodgments]);

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />
      <MetricsCards metrics={metrics} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ComplianceChecklist metrics={metrics} meetings={meetings} statements={statements} />
          <RecentMeetingsTable meetings={meetings} onViewAll={() => setActiveTab('meetings')} />
        </div>
        <div className="flex flex-col gap-6">
          <FundsDistributionChart metrics={metrics} />
          <PendingDepositsQueue transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
