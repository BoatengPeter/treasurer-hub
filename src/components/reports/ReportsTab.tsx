'use client';
import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';
import { Card, CardContent } from '@/components/ui/card';
import ReportsPrintArea from './ReportsPrintArea';
import DuesReportArea from './DuesReportArea';
import MemberPaymentReport from './MemberPaymentReport';
import DatePicker from '@/components/ui/DatePicker';
import { generateFinancialReportPdf, generateDuesReportPdf } from '@/lib/pdf-report';

export default function ReportsTab() {
  const [downloading, setDownloading] = useState(false);
  const {
    transactions, members,
    reportType, reportQuarter, reportYear, setReportType, setReportQuarter, setReportYear,
    duesReportPeriod, duesReportDate, setDuesReportPeriod, setDuesReportDate,
  } = useDashboardStore();

  const reportData = useMemo(() => {
    const quarterMonths = { Q1: { start: '01-01', end: '03-31' }, Q2: { start: '04-01', end: '06-30' }, Q3: { start: '07-01', end: '09-30' }, Q4: { start: '10-01', end: '12-31' } };
    const dates = quarterMonths[reportQuarter];
    const startDate = new Date(`${reportYear}-${dates.start}T00:00:00`);
    const endDate = new Date(`${reportYear}-${dates.end}T23:59:59`);
    const periodTransactions = transactions.filter(t => { const d = new Date(t.date); return d >= startDate && d <= endDate; });
    const incomeRecords = periodTransactions.filter(t => t.type === 'income');
    const expenseRecords = periodTransactions.filter(t => t.type === 'expense');
    const totalIncome = incomeRecords.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenseRecords.reduce((sum, t) => sum + Number(t.amount), 0);
    const incomeByCategory = incomeRecords.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc; }, {});
    const expenseByCategory = expenseRecords.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc; }, {});
    return { totalIncome, totalExpense, incomeByCategory, expenseByCategory, netSurplus: totalIncome - totalExpense };
  }, [transactions, reportQuarter, reportYear]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      if (reportType === 'dues') {
        generateDuesReportPdf(transactions, members, duesReportDate, duesReportPeriod);
      } else {
        generateFinancialReportPdf(reportData, reportQuarter, reportYear, reportType);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="no-print flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Financial Reports</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground">Generate quarterly statements, member payment reports, or dues reports</p>
            <HelpButton title="Financial Reports">
              <p>Generate formal financial reports for a selected period.</p>
              <p><strong>Report types:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Receipts &amp; Payments</strong> — simple cash-based quarterly summary</li>
                <li><strong>Income &amp; Expenditure</strong> — categorised by income/expense type</li>
                <li><strong>Dues Report</strong> — per-member breakdown for a selected week, month, or year</li>
                <li><strong>Member Payments</strong> — all transactions for a specific member in a month or year</li>
              </ul>
            </HelpButton>
          </div>
        </div>
        {reportType !== 'member' && (
          <Button onClick={handleDownloadPdf} disabled={downloading} className="flex items-center gap-1.5">
            <Download className="h-4 w-4" /> {downloading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        )}
      </header>
      <Card className="no-print">
        <CardContent className="p-4 flex gap-4 flex-wrap items-center">
          <div className="w-[185px]">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="both">Both Statements</option>
              <option value="receipts">Receipts & Payments</option>
              <option value="income">Income & Expenditure</option>
              <option value="dues">Dues Report</option>
              <option value="member">Member Payments</option>
            </select>
          </div>
          {reportType === 'dues' ? (
            <>
              <div className="w-[130px]">
                <select value={duesReportPeriod} onChange={(e) => setDuesReportPeriod(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="w-[170px]">
                <DatePicker value={duesReportDate} onChange={setDuesReportDate} />
              </div>
            </>
          ) : reportType === 'member' ? null : (
            <>
              <div className="w-[140px]">
                <select value={reportQuarter} onChange={(e) => setReportQuarter(e.target.value as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="Q1">Q1 (Jan - Mar)</option>
                  <option value="Q2">Q2 (Apr - Jun)</option>
                  <option value="Q3">Q3 (Jul - Sep)</option>
                  <option value="Q4">Q4 (Oct - Dec)</option>
                </select>
              </div>
              <div className="w-[120px]">
                <select value={reportYear} onChange={(e) => setReportYear(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {reportType === 'dues' ? (
        <DuesReportArea transactions={transactions} members={members} referenceDate={duesReportDate} period={duesReportPeriod} />
      ) : reportType === 'member' ? (
        <MemberPaymentReport transactions={transactions} members={members} />
      ) : (
        <ReportsPrintArea reportData={reportData} reportQuarter={reportQuarter} reportYear={reportYear} reportType={reportType} />
      )}
    </div>
  );
}
