import type { Transaction, Meeting, Lodgment, ChurchStatement } from '@/lib/db';

export const sampleData: {
  transactions: Transaction[];
  meetings: Meeting[];
  lodgments: Lodgment[];
  statements: ChurchStatement[];
} = {
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
  ],
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
  ],
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
  ],
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
  ]
};
