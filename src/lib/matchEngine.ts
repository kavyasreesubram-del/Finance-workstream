import { UploadedInvoice, PurchaseOrder, GoodsReceipt, ExceptionCode, MatchResult } from '../types';

function detectDuplicates(invoices: UploadedInvoice[]): Set<string> {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const inv of invoices) {
    const key = inv.custInvoiceNo.trim().toLowerCase();
    if (seen.has(key)) dupes.add(key);
    seen.add(key);
  }
  return dupes;
}

export function matchAllInvoices(
  invoices: UploadedInvoice[],
  pos: PurchaseOrder[],
  grs: GoodsReceipt[],
): MatchResult[] {
  const poIndex = new Map<string, PurchaseOrder>();
  for (const po of pos) {
    poIndex.set(`${po.po_number}|${po.line_number}`, po);
  }

  const grIndex = new Map<string, GoodsReceipt>();
  for (const gr of grs) {
    grIndex.set(`${gr.po_number}|${gr.line_number}`, gr);
  }

  const duplicateKeys = detectDuplicates(invoices);

  return invoices.map((invoice): MatchResult => {
    const key = `${invoice.poNumber}|${invoice.line_number}`;
    const po = poIndex.get(key) ?? null;
    const gr = grIndex.get(key) ?? null;

    let exceptionCode: ExceptionCode = 'CLEAN';
    let variancePct = 0;
    let varianceAmt = 0;
    let summary = '3-way match clean.';

    const invoiceKey = invoice.custInvoiceNo.trim().toLowerCase();
    if (duplicateKeys.has(invoiceKey)) {
      exceptionCode = 'DUPLICATE';
      summary = `Duplicate invoice detected: ${invoice.custInvoiceNo} appears more than once.`;
    } else if (!po) {
      exceptionCode = 'PO_MISSING';
      summary = `No Purchase Order found for ${invoice.poNumber} line ${invoice.line_number}.`;
    } else if (!gr) {
      exceptionCode = 'GRN_MISSING';
      summary = `No Goods Receipt found for ${invoice.poNumber} line ${invoice.line_number}.`;
    } else {
      const priceDiff = Math.abs(invoice.billed_price - po.unit_price);
      const pricePct = po.unit_price > 0 ? priceDiff / po.unit_price : 0;

      if (pricePct > po.tolerance_pct) {
        exceptionCode = 'PRICE_VARIANCE';
        variancePct = Math.round(pricePct * 10000) / 100;
        varianceAmt = Math.round((invoice.billed_price - po.unit_price) * invoice.billed_qty * 100) / 100;
        summary = `Price variance: invoiced $${invoice.billed_price} vs PO $${po.unit_price} (${variancePct}% — tolerance ${po.tolerance_pct * 100}%).`;
      } else if (invoice.billed_qty > gr.received_qty) {
        exceptionCode = 'QTY_VARIANCE';
        const shortfall = invoice.billed_qty - gr.received_qty;
        varianceAmt = Math.round(shortfall * po.unit_price * 100) / 100;
        variancePct = Math.round((shortfall / invoice.billed_qty) * 10000) / 100;
        summary = `Quantity shortfall: invoiced ${invoice.billed_qty} but GR confirms only ${gr.received_qty} received (short by ${shortfall}).`;
      } else {
        summary = `3-way match clean. PO ${po.po_number}, GR ${gr.gr_number}, invoice ${invoice.custInvoiceNo} all agree.`;
      }
    }

    // Confidence degrades per exception
    const exceptionPenalty: Record<ExceptionCode, number> = {
      CLEAN: 0,
      PRICE_VARIANCE: 15,
      QTY_VARIANCE: 15,
      GRN_MISSING: 20,
      PO_MISSING: 25,
      DUPLICATE: 30,
      TAX_ERROR: 15,
      CONTRACT_VIOLATION: 20,
    };
    const confidence = Math.max(50, (invoice.confidence ?? 95) - exceptionPenalty[exceptionCode]);

    return { invoice, po, gr, exceptionCode, variancePct, varianceAmt, confidence, summary };
  });
}
