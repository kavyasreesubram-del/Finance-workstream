export type StageType = 'MATCHING' | 'PENDING APPROVAL' | 'APPROVED' | 'RECONCILING' | 'CLOSED';

export interface AuditLog {
  timestamp: string;
  agent: string;
  action: string;
  result: string;
}

export interface LineItem {
  id: string;
  item: string;
  qty: number;
  price: number;
  total: number;
}

export interface POItem {
  item: string;
  qty: number;
  price: number;
  total: number;
}

export interface GRItem {
  item: string;
  qty: number;
}

export interface MatchDetails {
  invoiceItems: LineItem[];
  poItems: POItem[];
  grItems: GRItem[];
  status: 'CLEAN' | 'MISMATCH';
  discrepancy?: {
    field: string;
    column: 'Invoice' | 'PO' | 'GR';
    message: string;
  };
  emailDraft?: string;
  supplierEmailed?: boolean;
}

export interface ApprovalDetails {
  policyApplied: string;
  approverName: string;
  approverRole: string;
  approverContact: string;
  slaMinutesTotal: number;
  slaMinutesRemaining: number;
  timelineStatus: 'Submitted' | 'Notified' | 'Awaiting Decision' | 'Done';
  costCenter: string;
  businessPurpose: string;
  approverNotes?: string;
  escalated?: boolean;
}

export interface ReconciliationDetails {
  bankReference: string;
  paymentDate: string;
  glAccount: string;
  matchStatus: 'MATCHED' | 'UNMATCHED';
  unmatchedReason?: 'timing difference' | 'amount mismatch' | 'missing reference';
  postedToGL?: boolean;
}

export interface Transaction {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  poReference: string;
  grReference: string;
  currentStage: StageType;
  activeAgent: 'Payables Agent' | 'Approval Orchestrator' | 'Reconciliation Agent' | 'None';
  lastUpdated: string;
  auditTrail: AuditLog[];
  matchDetails: MatchDetails;
  approvalDetails: ApprovalDetails;
  reconciliationDetails: ReconciliationDetails;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'Payables Agent' | 'Approval Orchestrator' | 'Reconciliation Agent' | 'System';
  text: string;
  timestamp: string;
}

export interface LedgerItem {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  account: string;
  status: string;
}

// ── Upload / match-engine types ────────────────────────────────────

export type ExceptionCode =
  | 'CLEAN'
  | 'PRICE_VARIANCE'
  | 'QTY_VARIANCE'
  | 'GRN_MISSING'
  | 'PO_MISSING'
  | 'DUPLICATE'
  | 'TAX_ERROR'
  | 'CONTRACT_VIOLATION';

export interface Vendor {
  id: string;
  vendor_code: string;
  vendor_name: string;
  tax_id: string;
  status: 'active' | 'blocked' | 'inactive';
  payment_terms: string;
  country?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  line_number: number;
  vendor_code: string;
  sku: string;
  description: string;
  unit_price: number;
  quantity: number;
  tolerance_pct: number;
  currency: string;
  po_date: string;
}

export interface GoodsReceipt {
  id: string;
  gr_number: string;
  po_number: string;
  line_number: number;
  received_qty: number;
  received_date: string;
  plant?: string;
}

export interface UploadedInvoice {
  id: string;
  supplier: string;
  vendor_code: string;
  poNumber: string;
  line_number: number;
  billed_qty: number;
  billed_price: number;
  invoiceDate: string;
  postingDate: string;
  paymentTerm: string;
  amount: number;
  purchaseType: 'Goods' | 'Services';
  custInvoiceNo: string;
  confidence: number;
  popAttached: boolean;
  disputeReason?: string;
  paymentStatus: 'Overdue' | 'Not yet due';
  priorityScore: number;
  payerName?: string;
}

export interface MatchResult {
  invoice: UploadedInvoice;
  po: PurchaseOrder | null;
  gr: GoodsReceipt | null;
  exceptionCode: ExceptionCode;
  variancePct: number;
  varianceAmt: number;
  confidence: number;
  summary: string;
}
