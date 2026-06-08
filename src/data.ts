import { Transaction, LedgerItem, Vendor, PurchaseOrder, GoodsReceipt, UploadedInvoice } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-1042',
    vendorName: 'Meridian Supplies',
    invoiceNumber: 'INV-9821',
    amount: 24500,
    poReference: 'PO-3310',
    grReference: 'GR-4022',
    currentStage: 'PENDING APPROVAL',
    activeAgent: 'Approval Orchestrator',
    lastUpdated: '09:14:23Z',
    auditTrail: [
      {
        timestamp: '09:14:22',
        agent: 'Payables Agent',
        action: '3-way match completed',
        result: 'CLEAN'
      },
      {
        timestamp: '09:14:23',
        agent: 'Approval Orchestrator',
        action: 'Routed to VP Finance',
        result: 'Awaiting response'
      }
    ],
    matchDetails: {
      invoiceItems: [
        { id: '1', item: 'Mechanical Keyboards (Pro Edition)', qty: 100, price: 120, total: 12000 },
        { id: '2', item: 'UltraWide Curved Monitor 34"', qty: 50, price: 250, total: 12500 }
      ],
      poItems: [
        { item: 'Mechanical Keyboards (Pro Edition)', qty: 100, price: 120, total: 12000 },
        { item: 'UltraWide Curved Monitor 34"', qty: 50, price: 250, total: 12500 }
      ],
      grItems: [
        { item: 'Mechanical Keyboards (Pro Edition)', qty: 100 },
        { item: 'UltraWide Curved Monitor 34"', qty: 50 }
      ],
      status: 'CLEAN'
    },
    approvalDetails: {
      policyApplied: 'Amount > $10,000 requires VIP/Senior VP Approval',
      approverName: 'Sarah Jenkins',
      approverRole: 'Senior VP of Finance',
      approverContact: 's.jenkins@finflow-corp.com',
      slaMinutesTotal: 300,
      slaMinutesRemaining: 272, // 4 hours 32 mins
      timelineStatus: 'Awaiting Decision',
      costCenter: 'IT-ADMIN-04 (New York Office)',
      businessPurpose: 'Aesthetic hardware upgrade for engineering team desk configurations.'
    },
    reconciliationDetails: {
      bankReference: 'N/A',
      paymentDate: 'N/A',
      glAccount: '102100 - Citi Operating Account',
      matchStatus: 'UNMATCHED'
    }
  },
  {
    id: 'TXN-1041',
    vendorName: 'Apex Logistics',
    invoiceNumber: 'INV-1002',
    amount: 8200,
    poReference: 'PO-8271',
    grReference: 'GR-9081',
    currentStage: 'MATCHING',
    activeAgent: 'Payables Agent',
    lastUpdated: '07:15:13Z',
    auditTrail: [
      {
        timestamp: '07:15:10',
        agent: 'Payables Agent',
        action: 'Invoice received in queue',
        result: 'Initialized'
      },
      {
        timestamp: '07:15:12',
        agent: 'Payables Agent',
        action: 'Automatic 3-way match run',
        result: 'MISMATCH DETECTED'
      },
      {
        timestamp: '07:15:13',
        agent: 'Payables Agent',
        action: 'Quantity variance flagged on GR',
        result: 'EXCEPTION'
      }
    ],
    matchDetails: {
      invoiceItems: [
        { id: '1', item: 'Regional Expedited Courier Delivery', qty: 10, price: 820, total: 8200 }
      ],
      poItems: [
        { item: 'Regional Expedited Courier Delivery', qty: 10, price: 820, total: 8200 }
      ],
      grItems: [
        { item: 'Regional Expedited Courier Delivery', qty: 8 } // Under-delivered
      ],
      status: 'MISMATCH',
      discrepancy: {
        field: 'Quantity',
        column: 'GR',
        message: 'Goods Receipt confirms only 8 transport runs completed, but vendor invoiced for 10.'
      },
      emailDraft: `To: billing@apex-logistics.com
Subject: Notice of Invoice Quantity Discrepancy - INV-1002 (PO-8271)

Dear Billing Team,

During our standard automated 3-way audit of invoice INV-1002 (PO-8271) representing specialized logistics freight, we identified a quantity variance:

- Invoiced Quantity: 10 Runs ($8,200)
- Verified Receipts: 8 Runs ($6,560) under GR-9081

Please review your delivery logs. We request that you either provide validated proof-of-delivery for the 2 pending runs or release a corrected credit memo for $1,640 so we can process immediate payment.

Warm regards,
FinFlow Automated payables audit`
    },
    approvalDetails: {
      policyApplied: 'Amount < $10,000 requires Regional Logistics Supervisor',
      approverName: 'Austin Brody',
      approverRole: 'Logistics Supervisor',
      approverContact: 'a.brody@finflow-corp.com',
      slaMinutesTotal: 480,
      slaMinutesRemaining: 480,
      timelineStatus: 'Submitted',
      costCenter: 'LOG-OPS-60 (Warehouse East)',
      businessPurpose: 'Inbound raw component transportation logistics.'
    },
    reconciliationDetails: {
      bankReference: 'N/A',
      paymentDate: 'N/A',
      glAccount: '102100 - Citi Operating Account',
      matchStatus: 'UNMATCHED'
    }
  },
  {
    id: 'TXN-1040',
    vendorName: 'CoreTech Solutions',
    invoiceNumber: 'INV-0382',
    amount: 61000,
    poReference: 'PO-2290',
    grReference: 'GR-3118',
    currentStage: 'RECONCILING',
    activeAgent: 'Reconciliation Agent',
    lastUpdated: '07:05:10Z',
    auditTrail: [
      {
        timestamp: 'Yesterday 14:10:05',
        agent: 'Payables Agent',
        action: '3-way match completed',
        result: 'CLEAN'
      },
      {
        timestamp: 'Yesterday 14:12:00',
        agent: 'Approval Orchestrator',
        action: 'Routed to Chief Financial Officer',
        result: 'Awaiting response'
      },
      {
        timestamp: 'Yesterday 16:35:12',
        agent: 'Approval Orchestrator',
        action: 'Invoice approved by CFO Marcus Sterling',
        result: 'APPROVED'
      },
      {
        timestamp: 'Today 06:12:00',
        agent: 'Approval Orchestrator',
        action: 'ACH payment file sent to bank',
        result: 'OUTSTANDING'
      },
      {
        timestamp: 'Today 07:05:00',
        agent: 'Reconciliation Agent',
        action: 'Scanning Citigroup API feeds',
        result: 'Settlement matching'
      },
      {
        timestamp: 'Today 07:05:10',
        agent: 'Reconciliation Agent',
        action: 'Located clear transaction matching Citibank #910248231',
        result: 'UNMATCHED IN GENERAL LEDGER'
      }
    ],
    matchDetails: {
      invoiceItems: [
        { id: '1', item: 'Enterprise Database Cloud Migration Package', qty: 1, price: 61000, total: 61000 }
      ],
      poItems: [
        { item: 'Enterprise Database Cloud Migration Package', qty: 1, price: 61000, total: 61000 }
      ],
      grItems: [
        { item: 'Enterprise Database Cloud Migration Package', qty: 1 }
      ],
      status: 'CLEAN'
    },
    approvalDetails: {
      policyApplied: 'Amount > $50,000 requires CFO Sign-off',
      approverName: 'Marcus Sterling',
      approverRole: 'Chief Financial Officer',
      approverContact: 'm.sterling@finflow-corp.com',
      slaMinutesTotal: 1440,
      slaMinutesRemaining: 0,
      timelineStatus: 'Done',
      costCenter: 'CORP-INFRA-10 (Global Cloud)',
      businessPurpose: 'Strategic transition of critical relational databases to highly resilient architecture.'
    },
    reconciliationDetails: {
      bankReference: 'FT-910248231',
      paymentDate: '2026-06-04',
      glAccount: '101200 - Citibank Operating Account',
      matchStatus: 'UNMATCHED',
      unmatchedReason: 'timing difference'
    }
  },
  {
    id: 'TXN-1039',
    vendorName: 'Vantage Office Co',
    invoiceNumber: 'INV-8921',
    amount: 3100,
    poReference: 'PO-1022',
    grReference: 'GR-0919',
    currentStage: 'CLOSED',
    activeAgent: 'None',
    lastUpdated: '09:05:00Z',
    auditTrail: [
      {
        timestamp: 'Jun 2, 09:12:05',
        agent: 'Payables Agent',
        action: '3-way match completed',
        result: 'CLEAN'
      },
      {
        timestamp: 'Jun 2, 10:14:00',
        agent: 'Approval Orchestrator',
        action: 'Approve signature received',
        result: 'APPROVED'
      },
      {
        timestamp: 'Jun 2, 12:00:00',
        agent: 'Approval Orchestrator',
        action: 'Automated bank clearing ACH sent',
        result: 'DISBURSED'
      },
      {
        timestamp: 'Jun 3, 09:02:00',
        agent: 'Reconciliation Agent',
        action: 'Statement matched to journal invoice',
        result: 'CLEARED'
      },
      {
        timestamp: 'Jun 3, 09:05:00',
        agent: 'Reconciliation Agent',
        action: 'Bank ledger cleared, closing transaction',
        result: 'CLOSED'
      }
    ],
    matchDetails: {
      invoiceItems: [
        { id: '1', item: 'Executive Ergonomic Swivel Mesh Chair', qty: 4, price: 775, total: 3100 }
      ],
      poItems: [
        { item: 'Executive Ergonomic Swivel Mesh Chair', qty: 4, price: 775, total: 3100 }
      ],
      grItems: [
        { item: 'Executive Ergonomic Swivel Mesh Chair', qty: 4 }
      ],
      status: 'CLEAN'
    },
    approvalDetails: {
      policyApplied: 'Amount < $5,000 auto-assigned to Office Director',
      approverName: 'Kelly vance',
      approverRole: 'Office Director',
      approverContact: 'k.vance@finflow-corp.com',
      slaMinutesTotal: 480,
      slaMinutesRemaining: 0,
      timelineStatus: 'Done',
      costCenter: 'OP-OFFICE-WEST (Seattle)',
      businessPurpose: 'Replacing worn seating fixtures in active breakout rooms.'
    },
    reconciliationDetails: {
      bankReference: 'FT-881290312',
      paymentDate: '2026-06-02',
      glAccount: '501200 - Office Equipment Expenses',
      matchStatus: 'MATCHED',
      postedToGL: true
    }
  }
];

export const RECENT_LEDGER_ITEMS: LedgerItem[] = [
  { id: 'GL-9931', date: '2026-06-03', vendor: 'Vantage Office Co', amount: 3100, account: '501200 - Office Equipment Expenses', status: 'CLEARED' },
  { id: 'GL-9930', date: '2026-06-01', vendor: 'Hale Properties', amount: 14500, account: '501000 - Facility Rent Expenses', status: 'CLEARED' },
  { id: 'GL-9929', date: '2026-05-28', vendor: 'Cascade Energy', amount: 4120, account: '501400 - Utilities Expenses', status: 'CLEARED' },
  { id: 'GL-9928', date: '2026-05-27', vendor: 'Global Telecom', amount: 1250, account: '501500 - Communication & Network', status: 'CLEARED' },
  { id: 'GL-9927', date: '2026-05-25', vendor: 'Delta Tech Partners', amount: 19800, account: '502000 - Professional IT Consult', status: 'CLEARED' }
];

// ── Seed data for upload / match engine ───────────────────────────

export const seedVendors: Vendor[] = [
  { id: 'V001', vendor_code: 'PIONEER',   vendor_name: 'Pioneer Inc.',         tax_id: '83-4521987', status: 'active', payment_terms: 'Net 30', country: 'US' },
  { id: 'V002', vendor_code: 'APEX',      vendor_name: 'Apex & Co.',           tax_id: '61-7834521', status: 'active', payment_terms: 'Net 45', country: 'CA' },
  { id: 'V003', vendor_code: 'NOVA',      vendor_name: 'NovaCorp AG',          tax_id: '74-2198345', status: 'active', payment_terms: 'Net 60', country: 'UK' },
  { id: 'V004', vendor_code: 'GLOBALLOG', vendor_name: 'Global Logistics',     tax_id: '52-8763412', status: 'active', payment_terms: 'Net 30', country: 'DE' },
  { id: 'V005', vendor_code: 'STARLIGHT', vendor_name: 'Starlight S.A.',       tax_id: '39-5672198', status: 'active', payment_terms: 'Net 45', country: 'FR' },
  { id: 'V006', vendor_code: 'ASTRA',     vendor_name: 'Astra Industries',     tax_id: '47-1234567', status: 'active', payment_terms: 'Net 30', country: 'CN' },
  { id: 'V007', vendor_code: 'JUPITER',   vendor_name: 'Jupiter & Jupiter',    tax_id: '58-9876543', status: 'active', payment_terms: 'Net 45', country: 'IN' },
  { id: 'V008', vendor_code: 'ACCENTURE', vendor_name: 'Accenture Consulting', tax_id: '66-1357924', status: 'active', payment_terms: 'Net 30', country: 'US' },
  { id: 'V009', vendor_code: 'CAPGEMINI', vendor_name: 'Capgemini Solutions',  tax_id: '72-4681357', status: 'active', payment_terms: 'Net 30', country: 'US' },
  { id: 'V010', vendor_code: 'BAYES',     vendor_name: 'Bayes Enterprises',    tax_id: '85-3692581', status: 'active', payment_terms: 'Net 60', country: 'BR' },
  { id: 'V011', vendor_code: 'LILLY',     vendor_name: 'Lilly Enterprises',    tax_id: '91-7412589', status: 'active', payment_terms: 'Net 30', country: 'MX' },
];

export const seedPurchaseOrders: PurchaseOrder[] = [
  { id: 'P-88291-1', po_number: 'PO-88291-ENT', line_number: 1, vendor_code: 'PIONEER',   sku: 'CON-STR-10ML', description: 'Industrial Containers - 10ml', unit_price: 1.50,   quantity: 1200, tolerance_pct: 0.005, currency: 'USD', po_date: '2026-02-01' },
  { id: 'P-99281-1', po_number: 'PO-99281-ENT', line_number: 1, vendor_code: 'APEX',      sku: 'VLV-REG-02',   description: 'Regulator Valve',              unit_price: 0.85,   quantity: 2500, tolerance_pct: 0.005, currency: 'USD', po_date: '2026-03-10' },
  { id: 'P-77281-1', po_number: 'PO-77281-ENT', line_number: 1, vendor_code: 'NOVA',      sku: 'NOVA-A-9',     description: 'Specialty Compound',           unit_price: 104.25, quantity: 100,  tolerance_pct: 0.005, currency: 'USD', po_date: '2026-03-15' },
  { id: 'P-66281-1', po_number: 'PO-66281-ENT', line_number: 1, vendor_code: 'GLOBALLOG', sku: 'FRT-EU-01',    description: 'Freight Services EU',          unit_price: 15.00,  quantity: 100,  tolerance_pct: 0.005, currency: 'USD', po_date: '2026-02-20' },
  { id: 'P-55281-1', po_number: 'PO-55281-ENT', line_number: 1, vendor_code: 'STARLIGHT', sku: 'STR-LX-04',    description: 'Luxury Specialty',             unit_price: 22.50,  quantity: 20,   tolerance_pct: 0.005, currency: 'EUR', po_date: '2026-03-01' },
  { id: 'P-44281-1', po_number: 'PO-44281-ENT', line_number: 1, vendor_code: 'ASTRA',     sku: 'AST-IND-7',    description: 'Industrial Component',         unit_price: 51.50,  quantity: 100,  tolerance_pct: 0.005, currency: 'USD', po_date: '2026-02-10' },
  { id: 'P-11281-1', po_number: 'PO-11281-ENT', line_number: 1, vendor_code: 'JUPITER',   sku: 'JJ-MAT-2',     description: 'Raw Material',                 unit_price: 110.77, quantity: 20,   tolerance_pct: 0.005, currency: 'USD', po_date: '2026-03-25' },
  { id: 'P-SVC-001-1', po_number: 'PO-SVC-001', line_number: 1, vendor_code: 'ACCENTURE', sku: 'SVC-CONS',     description: 'Consulting Services',          unit_price: 15000,  quantity: 1,    tolerance_pct: 0.000, currency: 'USD', po_date: '2026-03-30' },
  { id: 'P-SVC-002-1', po_number: 'PO-SVC-002', line_number: 1, vendor_code: 'CAPGEMINI', sku: 'SVC-CONS',     description: 'Consulting Services',          unit_price: 25000,  quantity: 1,    tolerance_pct: 0.000, currency: 'USD', po_date: '2026-04-01' },
  { id: 'P-33281-1', po_number: 'PO-33281-ENT', line_number: 1, vendor_code: 'BAYES',     sku: 'BYR-CHEM-1',   description: 'Specialty Chemical',           unit_price: 91.04,  quantity: 30,   tolerance_pct: 0.005, currency: 'USD', po_date: '2026-04-05' },
  { id: 'P-22281-1', po_number: 'PO-22281-ENT', line_number: 1, vendor_code: 'LILLY',     sku: 'LLY-PRO-3',    description: 'Pharma Product',               unit_price: 124.00, quantity: 100,  tolerance_pct: 0.005, currency: 'USD', po_date: '2026-03-01' },
];

export const seedGoodsReceipts: GoodsReceipt[] = [
  { id: 'GR-88291', gr_number: '50001001', po_number: 'PO-88291-ENT', line_number: 1, received_qty: 1200, received_date: '2026-02-10', plant: '1000' },
  { id: 'GR-99281', gr_number: '50001002', po_number: 'PO-99281-ENT', line_number: 1, received_qty: 2200, received_date: '2026-03-20', plant: '1000' },
  // PO-77281-ENT (NOVA) — no GR → GRN_MISSING exception
  { id: 'GR-66281', gr_number: '50001004', po_number: 'PO-66281-ENT', line_number: 1, received_qty: 100,  received_date: '2026-03-01', plant: '2000' },
  { id: 'GR-55281', gr_number: '50001005', po_number: 'PO-55281-ENT', line_number: 1, received_qty: 20,   received_date: '2026-03-15', plant: '2000' },
  { id: 'GR-44281', gr_number: '50001006', po_number: 'PO-44281-ENT', line_number: 1, received_qty: 100,  received_date: '2026-02-26', plant: '3000' },
  { id: 'GR-11281', gr_number: '50001007', po_number: 'PO-11281-ENT', line_number: 1, received_qty: 20,   received_date: '2026-04-10', plant: '3000' },
  { id: 'GR-33281', gr_number: '50001010', po_number: 'PO-33281-ENT', line_number: 1, received_qty: 30,   received_date: '2026-04-20', plant: '4000' },
  { id: 'GR-22281', gr_number: '50001011', po_number: 'PO-22281-ENT', line_number: 1, received_qty: 100,  received_date: '2026-03-13', plant: '4000' },
];

export const seedUploadedInvoices: UploadedInvoice[] = [
  { id: 'INV-88291', supplier: 'Pioneer Inc.',        vendor_code: 'PIONEER',   poNumber: 'PO-88291-ENT', line_number: 1, billed_qty: 1200, billed_price: 1.50,   invoiceDate: '15/02/2026', postingDate: '16/02/2026', paymentTerm: 'Net 30', amount: 5150.00,  purchaseType: 'Goods',    custInvoiceNo: 'PZ-2026-0372',  confidence: 94, popAttached: true,  disputeReason: 'Price mismatch',        paymentStatus: 'Overdue',     priorityScore: 95 },
  { id: 'INV-99281', supplier: 'Apex & Co.',          vendor_code: 'APEX',      poNumber: 'PO-99281-ENT', line_number: 1, billed_qty: 2500, billed_price: 0.85,   invoiceDate: '25/03/2026', postingDate: '26/03/2026', paymentTerm: 'Net 45', amount: 5425.00,  purchaseType: 'Goods',    custInvoiceNo: 'MRK-202606-0',  confidence: 78, popAttached: true,  disputeReason: 'Quantity mismatch',     paymentStatus: 'Overdue',     priorityScore: 65 },
  { id: 'INV-77281', supplier: 'NovaCorp AG',         vendor_code: 'NOVA',      poNumber: 'PO-77281-ENT', line_number: 1, billed_qty: 100,  billed_price: 104.25, invoiceDate: '28/03/2026', postingDate: '29/03/2026', paymentTerm: 'Net 60', amount: 10425.33, purchaseType: 'Goods',    custInvoiceNo: 'NOV-2026-X',    confidence: 68, popAttached: true,  disputeReason: 'GRN missing',           paymentStatus: 'Overdue',     priorityScore: 45 },
  { id: 'INV-66281', supplier: 'Global Logistics',    vendor_code: 'GLOBALLOG', poNumber: 'PO-66281-ENT', line_number: 1, billed_qty: 100,  billed_price: 15.00,  invoiceDate: '05/03/2026', postingDate: '06/03/2026', paymentTerm: 'Net 30', amount: 1500.00,  purchaseType: 'Goods',    custInvoiceNo: 'GSK-INV-26',    confidence: 92, popAttached: true,  disputeReason: 'Tax error',             paymentStatus: 'Overdue',     priorityScore: 88 },
  { id: 'INV-55281', supplier: 'Starlight S.A.',      vendor_code: 'STARLIGHT', poNumber: 'PO-55281-ENT', line_number: 1, billed_qty: 20,   billed_price: 22.50,  invoiceDate: '10/03/2026', postingDate: '11/03/2026', paymentTerm: 'Net 45', amount: 450.75,   purchaseType: 'Goods',    custInvoiceNo: 'SNF-2026-09',   confidence: 72, popAttached: true,  disputeReason: 'Duplicate invoice',     paymentStatus: 'Overdue',     priorityScore: 55 },
  { id: 'INV-44281', supplier: 'Astra Industries',    vendor_code: 'ASTRA',     poNumber: 'PO-44281-ENT', line_number: 1, billed_qty: 100,  billed_price: 51.50,  invoiceDate: '20/02/2026', postingDate: '21/02/2026', paymentTerm: 'Net 30', amount: 5150.00,  purchaseType: 'Goods',    custInvoiceNo: 'AZ-202606-1',   confidence: 62, popAttached: false, disputeReason: 'PO missing',            paymentStatus: 'Overdue',     priorityScore: 92 },
  { id: 'INV-11281', supplier: 'Jupiter & Jupiter',   vendor_code: 'JUPITER',   poNumber: 'PO-11281-ENT', line_number: 1, billed_qty: 20,   billed_price: 110.77, invoiceDate: '05/04/2026', postingDate: '06/04/2026', paymentTerm: 'Net 45', amount: 2215.40,  purchaseType: 'Goods',    custInvoiceNo: 'JJ-JULY-26',    confidence: 91, popAttached: true,  disputeReason: 'Master data error',     paymentStatus: 'Overdue',     priorityScore: 15 },
  { id: 'INV-SVC01', supplier: 'Accenture Consulting',vendor_code: 'ACCENTURE', poNumber: 'PO-SVC-001',   line_number: 1, billed_qty: 1,    billed_price: 15000,  invoiceDate: '10/04/2026', postingDate: '11/04/2026', paymentTerm: 'Net 30', amount: 15000.00, purchaseType: 'Services', custInvoiceNo: 'ACC-2026-04',   confidence: 85, popAttached: true,  disputeReason: 'Service not approved',  paymentStatus: 'Overdue',     priorityScore: 70 },
  { id: 'INV-SVC02', supplier: 'Capgemini Solutions', vendor_code: 'CAPGEMINI', poNumber: 'PO-SVC-002',   line_number: 1, billed_qty: 1,    billed_price: 25000,  invoiceDate: '12/04/2026', postingDate: '13/04/2026', paymentTerm: 'Net 30', amount: 25000.00, purchaseType: 'Services', custInvoiceNo: 'CAP-2026-04',   confidence: 82, popAttached: true,  disputeReason: 'Contract violation',    paymentStatus: 'Overdue',     priorityScore: 75 },
  { id: 'INV-33281', supplier: 'Bayes Enterprises',   vendor_code: 'BAYES',     poNumber: 'PO-33281-ENT', line_number: 1, billed_qty: 30,   billed_price: 91.04,  invoiceDate: '18/04/2026', postingDate: '19/04/2026', paymentTerm: 'Net 60', amount: 2731.26,  purchaseType: 'Goods',    custInvoiceNo: 'BYR-202606-1',  confidence: 88, popAttached: true,  paymentStatus: 'Not yet due', priorityScore: 30 },
  { id: 'INV-22281', supplier: 'Lilly Enterprises',   vendor_code: 'LILLY',     poNumber: 'PO-22281-ENT', line_number: 1, billed_qty: 100,  billed_price: 124.00, invoiceDate: '10/03/2026', postingDate: '11/03/2026', paymentTerm: 'Net 30', amount: 12400.00, purchaseType: 'Goods',    custInvoiceNo: 'LLY-2026-9921', confidence: 96, popAttached: true,  paymentStatus: 'Overdue',     priorityScore: 20 },
];

export const VENDOR_PRESETS = [
  {
    vendorName: 'Zephyr Manufacturing',
    amount: 14200,
    poReference: 'PO-3901',
    grReference: 'GR-1290',
    costCenter: 'MFG-LINE-2 (Chicago)',
    businessPurpose: 'Replacement turbine nozzles and tooling seals.',
    items: [
      { item: 'Industrial Turbine Seals', qty: 200, price: 50, total: 10000 },
      { item: 'Calibration Tooling Jet-Set', qty: 2, price: 2100, total: 4200 }
    ],
    policy: 'Amount > $10,000 requires Engineering VP',
    approverName: 'Gregory Finch',
    approverRole: 'VP Product Engineering',
    approverContact: 'g.finch@finflow-corp.com'
  },
  {
    vendorName: 'Summit Media Agency',
    amount: 4500,
    poReference: 'PO-4482',
    grReference: 'GR-4820',
    costCenter: 'MKT-GLOBAL (San Francisco)',
    businessPurpose: 'Quarterly optimization consulting fee for search engines.',
    items: [
      { item: 'Consulting Retainer & Audit', qty: 1, price: 4500, total: 4500 }
    ],
    policy: 'Amount < $5,000 requires Brand Lead',
    approverName: 'Fiona Gallagher',
    approverRole: 'Director of Brand Marketing',
    approverContact: 'f.gallagher@finflow-corp.com'
  }
];
