import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { UploadedInvoice, PurchaseOrder, GoodsReceipt, Vendor, MatchResult } from './types';
import { seedUploadedInvoices, seedPurchaseOrders, seedGoodsReceipts, seedVendors } from './data';
import { matchAllInvoices } from './lib/matchEngine';

// ── localStorage persistence ───────────────────────────────────────

const STORAGE_KEY = 'finflow-store-v1';

interface PersistedShape {
  version: 1;
  invoices: UploadedInvoice[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  vendors: Vendor[];
}

function loadFromStorage(): PersistedShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return null;
    if (!Array.isArray(parsed.invoices) || !Array.isArray(parsed.purchaseOrders)) return null;
    return parsed as PersistedShape;
  } catch {
    return null;
  }
}

function saveToStorage(payload: PersistedShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[finflow-store] localStorage write failed', e);
  }
}

// ── Store shape ────────────────────────────────────────────────────

interface StoreState {
  uploadedInvoices: UploadedInvoice[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  vendors: Vendor[];
  matchResults: MatchResult[];

  appendInvoices: (rows: UploadedInvoice[]) => void;
  appendPOs: (rows: PurchaseOrder[]) => void;
  appendGRs: (rows: GoodsReceipt[]) => void;
  appendVendors: (rows: Vendor[]) => void;
  resetToSeed: () => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persisted = loadFromStorage();

  const [uploadedInvoices, setInvoices] = useState<UploadedInvoice[]>(
    persisted?.invoices ?? seedUploadedInvoices,
  );
  const [purchaseOrders, setPOs] = useState<PurchaseOrder[]>(
    persisted?.purchaseOrders ?? seedPurchaseOrders,
  );
  const [goodsReceipts, setGRs] = useState<GoodsReceipt[]>(
    persisted?.goodsReceipts ?? seedGoodsReceipts,
  );
  const [vendors, setVendors] = useState<Vendor[]>(persisted?.vendors ?? seedVendors);

  // Persist on every change
  useEffect(() => {
    saveToStorage({ version: 1, invoices: uploadedInvoices, purchaseOrders, goodsReceipts, vendors });
  }, [uploadedInvoices, purchaseOrders, goodsReceipts, vendors]);

  // Live match results recomputed whenever source data changes
  const matchResults = useMemo(
    () => matchAllInvoices(uploadedInvoices, purchaseOrders, goodsReceipts),
    [uploadedInvoices, purchaseOrders, goodsReceipts],
  );

  const appendInvoices = useCallback(
    (rows: UploadedInvoice[]) => setInvoices(prev => [...prev, ...rows]),
    [],
  );
  const appendPOs = useCallback(
    (rows: PurchaseOrder[]) => setPOs(prev => [...prev, ...rows]),
    [],
  );
  const appendGRs = useCallback(
    (rows: GoodsReceipt[]) => setGRs(prev => [...prev, ...rows]),
    [],
  );
  const appendVendors = useCallback(
    (rows: Vendor[]) => setVendors(prev => [...prev, ...rows]),
    [],
  );

  const resetToSeed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setInvoices(seedUploadedInvoices);
    setPOs(seedPurchaseOrders);
    setGRs(seedGoodsReceipts);
    setVendors(seedVendors);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        uploadedInvoices,
        purchaseOrders,
        goodsReceipts,
        vendors,
        matchResults,
        appendInvoices,
        appendPOs,
        appendGRs,
        appendVendors,
        resetToSeed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
