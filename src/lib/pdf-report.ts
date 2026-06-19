import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Member } from '@/lib/db';
import { formatCurrency } from '@/lib/format-utils';

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  netSurplus: number;
}

function addHeader(doc: jsPDF) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOCAL CHURCH YOUTH FELLOWSHIP', 105, 20, { align: 'center' });
  doc.setFontSize(11);
  doc.text("TREASURER'S COMPLIANCE REPORT", 105, 27, { align: 'center' });
  doc.line(20, 37, 190, 37);
}

function addDuesHeader(doc: jsPDF) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOCAL CHURCH YOUTH FELLOWSHIP', 105, 20, { align: 'center' });
  doc.setFontSize(11);
  doc.text('DUES COLLECTION REPORT', 105, 27, { align: 'center' });
  doc.line(20, 37, 190, 37);
}

function addMemberHeader(doc: jsPDF, member: Member, label: string) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOCAL CHURCH YOUTH FELLOWSHIP', 105, 20, { align: 'center' });
  doc.setFontSize(11);
  doc.text('MEMBER PAYMENT REPORT', 105, 27, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${member.name} - ${label}`, 105, 33, { align: 'center' });
  doc.line(20, 37, 190, 37);
}

function addFooter(doc: jsPDF) {
  const y = doc.internal.pageSize.getHeight() - 40;
  doc.line(30, y, 85, y);
  doc.line(125, y, 180, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By:', 57.5, y + 7, { align: 'center' });
  doc.text('Approved By:', 152.5, y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Fellowship Treasurer', 57.5, y + 14, { align: 'center' });
  doc.text('Fellowship President', 152.5, y + 14, { align: 'center' });
}

function drawTable(
  doc: jsPDF,
  head: string[][],
  body: string[][],
  foot: string[][] | undefined,
  startY: number,
  marginLeft: number,
  colStyles: Record<string, { cellWidth: number; halign?: string }>,
) {
  autoTable(doc, {
    startY,
    head,
    body,
    foot: foot ?? [],
    theme: 'plain' as const,
    tableWidth: 170,
    margin: { left: marginLeft },
    styles: { fontSize: 9, cellPadding: 1.5 },
    headStyles: { fontStyle: 'bold' as const, fillColor: [240, 240, 240] as [number, number, number] },
    footStyles: { fontStyle: 'bold' as const },
    columnStyles: colStyles as Record<string, Record<string, unknown>>,
  });
}

export function generateFinancialReportPdf(data: ReportData, quarter: string, year: string, type: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  addHeader(doc);
  const qLabels: Record<string, string> = { Q1: 'Jan 1 - Mar 31', Q2: 'Apr 1 - Jun 30', Q3: 'Jul 1 - Sep 30', Q4: 'Oct 1 - Dec 31' };
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quarter: ${quarter} - ${year} (${qLabels[quarter]}, ${year})`, 105, 33, { align: 'center' });

  const catCols = { '0': { cellWidth: 130 }, '1': { cellWidth: 40, halign: 'right' as const } } as const;
  let y = 45;

  const writeSection = (label: string, dataMap: Record<string, number>, total: number): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    y += 3;
    const rows = Object.entries(dataMap).map(([c, v]) => [c, formatCurrency(v)]);
    if (rows.length > 0) {
      drawTable(doc, [['Category', 'Amount']], rows, [['Total', formatCurrency(total)]], y, 25, catCols as Record<string, { cellWidth: number; halign?: string }>);
      y += 10 + (rows.length + 2) * 7;
    } else {
      doc.setFontSize(9);
      doc.text('No entries logged.', 25, y + 5);
      y += 14;
    }
    return y;
  };

  if (type === 'both' || type === 'receipts') {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipts & Payments Statement', 20, y);
    y += 8;
    y = writeSection('RECEIPTS (INFLOW)', data.incomeByCategory, data.totalIncome);
    y = writeSection('PAYMENTS (OUTFLOW)', data.expenseByCategory, data.totalExpense);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(data.netSurplus >= 0 ? 22 : 220, data.netSurplus >= 0 ? 163 : 38, data.netSurplus >= 0 ? 74 : 38);
    doc.text(`Net Quarterly Balance Shift: ${data.netSurplus >= 0 ? '+' : ''}${formatCurrency(data.netSurplus)}`, 20, y);
    doc.setTextColor(0);
    y += 15;
  }

  if (type === 'both' || type === 'income') {
    if (y > 220) { doc.addPage(); y = 30; }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Income & Expenditure Statement', 20, y);
    y += 8;
    y = writeSection('INCOME REVENUES', data.incomeByCategory, data.totalIncome);
    y = writeSection('EXPENDITURE CHARGES', data.expenseByCategory, data.totalExpense);
    doc.setDrawColor(0);
    doc.line(20, y, 190, y);
    y += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(data.netSurplus >= 0 ? 22 : 220, data.netSurplus >= 0 ? 163 : 38, data.netSurplus >= 0 ? 74 : 38);
    doc.text(`QUARTERLY ACCUMULATED SURPLUS / (DEFICIT): ${formatCurrency(data.netSurplus)}`, 20, y);
    doc.setTextColor(0);
    y += 15;
  }

  if (y < doc.internal.pageSize.getHeight() - 50) addFooter(doc);
  doc.save(`treasury-report-${quarter}-${year}.pdf`.replace(/\s+/g, '-').toLowerCase());
}

export function generateDuesReportPdf(
  transactions: Transaction[],
  members: Member[],
  referenceDate: string,
  period: 'weekly' | 'monthly' | 'yearly',
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const bounds = getPeriodBounds(referenceDate, period);
  const eod = new Date(bounds.end); eod.setHours(23, 59, 59, 999);
  const dues = transactions.filter(t => { const d = new Date(t.date + 'T00:00:00'); return t.category === 'Dues' && d >= bounds.start && d <= eod; });
  const total = dues.reduce((s, t) => s + Number(t.amount), 0);
  const paidIds = new Set(dues.filter(t => t.member_id).map(t => t.member_id!));
  const active = members.filter(m => m.status === 'active');
  const breakdown = active.map(m => ({
    member: m, transactions: dues.filter(t => t.member_id === m.id),
    totalPaid: dues.filter(t => t.member_id === m.id).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(m => m.totalPaid > 0).sort((a, b) => b.totalPaid - a.totalPaid);
  const nonContributors = active.filter(m => !paidIds.has(m.id));

  addDuesHeader(doc);
  doc.setFontSize(9);
  doc.text(periodLabel(bounds.start, bounds.end, period), 105, 33, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Dues Collected: ${formatCurrency(total)}`, 20, 48);
  doc.text(`Contributors: ${paidIds.size} / ${active.length}`, 20, 55);

  if (breakdown.length > 0) {
    let y = 65;
    doc.setFontSize(10);
    doc.text('Member Contributions', 20, y);
    y += 5;
    const rows: string[][] = [];
    for (const { member: m, transactions: txs, totalPaid } of breakdown) {
      txs.forEach(tx => rows.push([m.name, formatCurrency(tx.amount), tx.payment_method]));
      rows.push([`${m.name} Total`, formatCurrency(totalPaid), '']);
    }
    drawTable(doc, [['Member', 'Amount', 'Method']], rows, [['Grand Total', formatCurrency(total), '']], y, 20, { '0': { cellWidth: 100 }, '1': { cellWidth: 40, halign: 'right' }, '2': { cellWidth: 30, halign: 'right' } });
    y += 10 + (rows.length + 2) * 7;
    if (nonContributors.length > 0) {
      if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 30; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Members who did not contribute:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(nonContributors.map(m => m.name).join(', '), 20, y + 6);
    }
  }
  addFooter(doc);
  const l = periodLabel(bounds.start, bounds.end, period).replace(/[/,]\s*/g, '-').replace(/\s+/g, '-').toLowerCase();
  doc.save(`dues-report-${l}.pdf`);
}

export function generateMemberReportPdf(
  member: Member,
  transactions: Transaction[],
  _start: Date,
  _end: Date,
  periodLabelStr: string,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  addMemberHeader(doc, member, periodLabelStr);
  const inT = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const outT = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Payments: ${formatCurrency(inT)}`, 20, 48);
  doc.text(`Total Expenses: ${formatCurrency(outT)}`, 20, 55);
  doc.text(`Net: ${formatCurrency(inT - outT)}`, 20, 62);
  if (transactions.length > 0) {
    const rows = transactions.sort((a, b) => a.date.localeCompare(b.date)).map(tx => [tx.date, tx.type === 'income' ? 'In' : 'Out', tx.category, formatCurrency(tx.amount), tx.payment_method]);
    drawTable(doc, [['Date', 'Type', 'Category', 'Amount', 'Method']], rows, [['', '', 'Total', formatCurrency(transactions.reduce((s, t) => s + Number(t.amount), 0)), '']], 72, 20, { '0': { cellWidth: 30 }, '1': { cellWidth: 15 }, '2': { cellWidth: 45 }, '3': { cellWidth: 35, halign: 'right' }, '4': { cellWidth: 45 } });
  }
  addFooter(doc);
  doc.save(`member-report-${member.name.replace(/\s+/g, '-').toLowerCase()}-${periodLabelStr.replace(/[/,]\s*/g, '-').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

function getPeriodBounds(dateStr: string, period: 'weekly' | 'monthly' | 'yearly') {
  const d = new Date(dateStr + 'T00:00:00');
  if (period === 'weekly') {
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  }
  if (period === 'yearly') return { start: new Date(d.getFullYear(), 0, 1), end: new Date(d.getFullYear(), 11, 31) };
  return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 0) };
}

function periodLabel(start: Date, end: Date, period: 'weekly' | 'monthly' | 'yearly') {
  const fmt = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  if (period === 'weekly') return `Week of ${fmt(start.toISOString())} – ${fmt(end.toISOString())}`;
  if (period === 'yearly') return `Year ${start.getFullYear()}`;
  return start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
