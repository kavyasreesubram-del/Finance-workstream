import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { UploadedInvoice, PurchaseOrder, GoodsReceipt } from '../types';
import { useStore } from '../store';

// ── Required columns per document type ───────────────────────────

export const INVOICE_COLS = [
  'id','supplier','vendor_code','poNumber','line_number',
  'billed_qty','billed_price','invoiceDate','postingDate',
  'paymentTerm','amount','purchaseType','custInvoiceNo',
  'confidence','popAttached','paymentStatus','priorityScore',
];
export const PO_COLS = [
  'id','po_number','line_number','vendor_code','sku',
  'description','unit_price','quantity','tolerance_pct',
  'currency','po_date',
];
export const GR_COLS = [
  'id','gr_number','po_number','line_number','received_qty','received_date',
];

type DocType = 'invoice' | 'po' | 'gr';

interface ParseState {
  rows: Record<string, string>[];
  missingCols: string[];
  error: string | null;
}

function parseCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: r => resolve(r.data),
      error: e => reject(e),
    });
  });
}

function validateCols(rows: Record<string, string>[], required: string[]): string[] {
  if (!rows.length) return [];
  const present = new Set(Object.keys(rows[0]));
  return required.filter(c => !present.has(c));
}

export function coerceInvoice(r: Record<string, string>): UploadedInvoice {
  return {
    id: r.id,
    supplier: r.supplier,
    vendor_code: r.vendor_code,
    poNumber: r.poNumber,
    line_number: Number(r.line_number) || 1,
    billed_qty: Number(r.billed_qty) || 0,
    billed_price: Number(r.billed_price) || 0,
    invoiceDate: r.invoiceDate,
    postingDate: r.postingDate,
    paymentTerm: r.paymentTerm,
    amount: Number(r.amount) || 0,
    purchaseType: (r.purchaseType === 'Services' ? 'Services' : 'Goods') as 'Goods' | 'Services',
    custInvoiceNo: r.custInvoiceNo,
    confidence: Number(r.confidence) || 80,
    popAttached: r.popAttached?.toLowerCase() === 'true',
    disputeReason: r.disputeReason || undefined,
    paymentStatus: (r.paymentStatus === 'Not yet due' ? 'Not yet due' : 'Overdue') as 'Overdue' | 'Not yet due',
    priorityScore: Number(r.priorityScore) || 50,
  };
}

export function coercePO(r: Record<string, string>): PurchaseOrder {
  return {
    id: r.id,
    po_number: r.po_number,
    line_number: Number(r.line_number) || 1,
    vendor_code: r.vendor_code,
    sku: r.sku,
    description: r.description,
    unit_price: Number(r.unit_price) || 0,
    quantity: Number(r.quantity) || 0,
    tolerance_pct: Number(r.tolerance_pct) || 0,
    currency: r.currency || 'USD',
    po_date: r.po_date,
  };
}

export function coerceGR(r: Record<string, string>): GoodsReceipt {
  return {
    id: r.id,
    gr_number: r.gr_number,
    po_number: r.po_number,
    line_number: Number(r.line_number) || 1,
    received_qty: Number(r.received_qty) || 0,
    received_date: r.received_date,
    plant: r.plant || undefined,
  };
}

// ── Template download helpers ─────────────────────────────────────

function downloadTemplate(type: DocType) {
  const cols: Record<DocType, string[]> = {
    invoice: INVOICE_COLS,
    po: PO_COLS,
    gr: GR_COLS,
  };
  const header = cols[type].join(',');
  const blob = new Blob([header + '\n'], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `template_${type}.csv`;
  a.click();
}

// ── Sub-panel for one upload type ─────────────────────────────────

interface UploadPanelProps {
  type: DocType;
  label: string;
  requiredCols: string[];
  onConfirm: (rows: Record<string, string>[]) => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ type, label, requiredCols, onConfirm }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ParseState | null>(null);
  const [done, setDone] = useState(false);

  const handleFile = async (file: File) => {
    setDone(false);
    try {
      const rows = await parseCsv(file);
      const missing = validateCols(rows, requiredCols);
      setState({ rows, missingCols: missing, error: null });
    } catch {
      setState({ rows: [], missingCols: [], error: 'Failed to parse CSV. Ensure the file is valid.' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConfirm = () => {
    if (!state || state.missingCols.length > 0) return;
    onConfirm(state.rows);
    setDone(true);
    setState(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <button
          onClick={() => downloadTemplate(type)}
          className="text-xs text-[#E87722] hover:underline"
        >
          ↓ Download template
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#E87722] hover:bg-orange-50/30 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <p className="text-sm text-slate-500">
          {state ? `${state.rows.length} row(s) parsed` : 'Drag & drop a CSV or click to browse'}
        </p>
      </div>

      {/* Validation errors */}
      {state?.missingCols.length ? (
        <div className="rounded bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
          <span className="font-semibold">Missing columns: </span>
          {state.missingCols.join(', ')}
        </div>
      ) : null}
      {state?.error ? (
        <div className="rounded bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
          {state.error}
        </div>
      ) : null}

      {/* Preview table */}
      {state && !state.error && state.rows.length > 0 && (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {Object.keys(state.rows[0]).slice(0, 6).map(col => (
                  <th key={col} className="px-2 py-1 text-left font-semibold text-slate-500 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                {Object.keys(state.rows[0]).length > 6 && (
                  <th className="px-2 py-1 text-slate-400">…</th>
                )}
              </tr>
            </thead>
            <tbody>
              {state.rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {Object.values(row).slice(0, 6).map((val, j) => (
                    <td key={j} className="px-2 py-1 text-slate-700 whitespace-nowrap max-w-[120px] truncate">
                      {val}
                    </td>
                  ))}
                  {Object.values(row).length > 6 && <td className="px-2 py-1 text-slate-400">…</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {state.rows.length > 5 && (
            <p className="px-3 py-1 text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
              +{state.rows.length - 5} more rows
            </p>
          )}
        </div>
      )}

      {/* Confirm button */}
      {state && !state.error && !state.missingCols.length && state.rows.length > 0 && (
        <button
          onClick={handleConfirm}
          className="w-full py-2 rounded-lg bg-[#E87722] hover:bg-[#c05a00] text-white text-sm font-medium transition-colors"
        >
          Upload {state.rows.length} row{state.rows.length !== 1 ? 's' : ''}
        </button>
      )}

      {done && (
        <p className="text-xs text-emerald-600 font-medium">✓ Uploaded successfully — queue updated.</p>
      )}
    </div>
  );
};

// ── Main drawer ───────────────────────────────────────────────────

interface UploadDrawerProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { key: DocType; label: string; cols: string[] }[] = [
  { key: 'invoice', label: 'Invoices', cols: INVOICE_COLS },
  { key: 'po',      label: 'Purchase Orders', cols: PO_COLS },
  { key: 'gr',      label: 'Goods Receipts', cols: GR_COLS },
];

const UploadDrawer: React.FC<UploadDrawerProps> = ({ open, onClose }) => {
  const { appendInvoices, appendPOs, appendGRs, matchResults } = useStore();
  const [activeTab, setActiveTab] = useState<DocType>('invoice');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleConfirm = (type: DocType, rows: Record<string, string>[]) => {
    if (type === 'invoice') {
      const invoices = rows.map(coerceInvoice);
      appendInvoices(invoices);
      const exceptions = matchResults.filter(r => r.exceptionCode !== 'CLEAN').length;
      showToast(`${invoices.length} invoice(s) uploaded. ${exceptions} exception(s) detected in queue.`);
    } else if (type === 'po') {
      appendPOs(rows.map(coercePO));
      showToast(`${rows.length} PO line(s) uploaded.`);
    } else {
      appendGRs(rows.map(coerceGR));
      showToast(`${rows.length} GR line(s) uploaded.`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 h-full w-[480px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">DOCUMENT UPLOAD</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload CSV files — queue updates instantly</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'border-b-2 border-[#E87722] text-[#E87722]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {TABS.map(t =>
            activeTab === t.key ? (
              <UploadPanel
                key={t.key}
                type={t.key}
                label={t.label}
                requiredCols={t.cols}
                onConfirm={rows => handleConfirm(t.key, rows)}
              />
            ) : null,
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="mx-5 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium shadow">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDrawer;
