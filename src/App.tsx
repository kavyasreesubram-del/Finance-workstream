import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowRight,
  Clock,
  Check,
  X,
  AlertTriangle,
  Send,
  Plus,
  Database,
  Search,
  FileText,
  CheckCircle2,
  ShieldAlert,
  FileCheck2,
  UploadCloud,
  ChevronRight,
  User,
  RefreshCw,
  SlidersHorizontal,
  ThumbsUp,
  Mail,
  ChevronLeft,
  BarChart2
} from 'lucide-react';
import { INITIAL_TRANSACTIONS, RECENT_LEDGER_ITEMS, VENDOR_PRESETS } from './data';
import { Transaction, AuditLog, StageType, ChatMessage, LedgerItem, ExceptionCode } from './types';
import { useStore } from './store';
import UploadDrawer from './components/UploadDrawer';
import InsightsPanel from './components/InsightsPanel';
import CoreFinanceTriad from './components/CoreFinanceTriad';

export default function App() {
  // Navigation & View States
  const [appView, setAppView] = useState<'landing' | 'dashboard' | 'workflow' | 'triad'>('landing');
  const [activeTab, setActiveTab] = useState<'payables' | 'approval' | 'reconciliation'>('payables');
  const [payablesView, setPayablesView] = useState<'queue' | 'review'>('queue');
  
  // High-fidelity active memory
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Inject some helpful extra fields to map directly to the user requirements for the columns
    return INITIAL_TRANSACTIONS.map(tx => {
      // Add custom dates and details to existing records if missing
      return {
        ...tx,
        // Fallback items if not set
        invoiceDate: tx.id === 'TXN-1042' ? '2026-06-03' : tx.id === 'TXN-1041' ? '2026-06-01' : '2026-05-28',
        postingDate: tx.id === 'TXN-1042' ? '2026-06-04' : tx.id === 'TXN-1041' ? '2026-06-02' : '2026-06-01',
        paymentTerm: tx.id === 'TXN-1042' ? 'Net 30' : tx.id === 'TXN-1041' ? 'Net 45' : 'Net 15',
        slaText: tx.id === 'TXN-1042' ? '12D REMAINING' : tx.id === 'TXN-1041' ? '9D OVERDUE' : 'COMPLETED',
        slaStatus: tx.id === 'TXN-1042' ? 'remaining' : tx.id === 'TXN-1041' ? 'overdue' : 'completed',
        payerName: tx.id === 'TXN-1042' ? 'Sarah Jenkins' : tx.id === 'TXN-1041' ? 'Austin Brody' : 'Kelly Vance',
        purchaseType: tx.id === 'TXN-1042' ? 'Goods' : tx.id === 'TXN-1041' ? 'Logistics' : 'Services',
        aiConfidence: tx.id === 'TXN-1041' ? 74 : 98
      } as any;
    });
  });

  const [activeTxnId, setActiveTxnId] = useState<string>('TXN-1042');
  const [selectedPayablesInvoiceId, setSelectedPayablesInvoiceId] = useState<string>('TXN-1041');
  const [ledger, setLedger] = useState<LedgerItem[]>(RECENT_LEDGER_ITEMS);

  // Store — uploaded invoices + live match results
  const { matchResults } = useStore();

  // Tab 1 (Payables) Filters state
  const [filterPurchaseType, setFilterPurchaseType] = useState<string>('All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('All');
  const [filterAiConfidence, setFilterAiConfidence] = useState<string>('All');
  const [filterException, setFilterException] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payables queue sub-tab
  const [payablesQueueTab, setPayablesQueueTab] = useState<'review_required' | 'history'>('review_required');

  // Tab 2 (Approval) Queue state
  const [approvalFilter, setApprovalFilter] = useState<'All' | 'Exceptions' | 'Closed'>('All');

  // Chat window state (Right slide overlay)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeAgentBot, setActiveAgentBot] = useState<'Payables Agent' | 'Approval Orchestrator' | 'Reconciliation Agent'>('Payables Agent');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'Payables Agent': [
      { id: '1', sender: 'Payables Agent', text: 'Hello! I am scanning all invoices matching line-level Purchase Orders and Received Slips for exceptions.', timestamp: '11:15:00' }
    ],
    'Approval Orchestrator': [
      { id: '1', sender: 'Approval Orchestrator', text: 'Hi, I handle workflow delegation and escalation checks for Tier limits. Select an transaction to run audit checks.', timestamp: '11:16:00' }
    ],
    'Reconciliation Agent': [
      { id: '1', sender: 'Reconciliation Agent', text: 'Operational account tracking online. I am listening for Citibank operating ACH reference matching cycles.', timestamp: '11:17:00' }
    ],
  });
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Custom document uploader simulation modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: 'Invoice' | 'PO' | 'GR' | null}[]>([]);
  const [uploadScenario, setUploadScenario] = useState<'clean' | 'mismatch'>('clean');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Suggested solutions drawer state
  const [suggestedDraftMsg, setSuggestedDraftMsg] = useState<string | null>(null);

  // Approver decision confirmation inline state
  const [approverNotes, setApproverNotes] = useState<string>('');
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  // Live UTC Clock simulation
  const [systemTime, setSystemTime] = useState<string>(new Date().toISOString());
  useEffect(() => {
    const clock = setInterval(() => {
      setSystemTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Sync selected agent chat based on current tab
  useEffect(() => {
    if (activeTab === 'payables') {
      setActiveAgentBot('Payables Agent');
    } else if (activeTab === 'approval') {
      setActiveAgentBot('Approval Orchestrator');
    } else {
      setActiveAgentBot('Reconciliation Agent');
    }
  }, [activeTab]);

  // Current active transaction computed properties
  const activeTxn = transactions.find(t => t.id === activeTxnId) || transactions[0];

  // Resolve selectedPayablesInvoice — prefer live match result (store) over hardcoded transactions
  const _selectedMatchResult = matchResults.find(r => r.invoice.custInvoiceNo === selectedPayablesInvoiceId);
  const _selectedFromTx = transactions.find(t => t.id === selectedPayablesInvoiceId);
  const selectedPayablesInvoice: any = _selectedMatchResult ? {
    id: _selectedMatchResult.invoice.custInvoiceNo,
    vendorName: _selectedMatchResult.invoice.supplier,
    invoiceNumber: _selectedMatchResult.invoice.custInvoiceNo,
    poReference: _selectedMatchResult.invoice.poNumber,
    grReference: _selectedMatchResult.gr?.gr_number ?? null,
    amount: _selectedMatchResult.invoice.amount,
    invoiceDate: _selectedMatchResult.invoice.invoiceDate,
    paymentTerm: _selectedMatchResult.invoice.paymentTerm,
    purchaseType: _selectedMatchResult.invoice.purchaseType,
    exceptionCode: _selectedMatchResult.exceptionCode,
    confidence: _selectedMatchResult.confidence,
    summary: _selectedMatchResult.summary,
    variancePct: _selectedMatchResult.variancePct,
    varianceAmt: _selectedMatchResult.varianceAmt,
    matchDetails: {
      status: _selectedMatchResult.exceptionCode === 'CLEAN' ? 'MATCH' : 'MISMATCH',
      poItems: _selectedMatchResult.po ? [{
        item: _selectedMatchResult.po.description,
        qty: _selectedMatchResult.po.quantity,
        price: _selectedMatchResult.po.unit_price,
        total: Math.round(_selectedMatchResult.po.unit_price * _selectedMatchResult.po.quantity * 100) / 100,
      }] : [],
      grItems: _selectedMatchResult.gr ? [{
        item: _selectedMatchResult.po?.description || 'Received Item',
        qty: _selectedMatchResult.gr.received_qty,
        date: _selectedMatchResult.gr.received_date,
        plant: _selectedMatchResult.gr.plant,
      }] : [],
      invoiceItems: [{
        item: _selectedMatchResult.po?.description || (_selectedMatchResult.invoice.supplier + ' — Invoice Item'),
        qty: _selectedMatchResult.invoice.billed_qty || 0,
        price: _selectedMatchResult.invoice.billed_price || 0,
        total: _selectedMatchResult.invoice.amount,
      }],
    },
    _isFromStore: true,
  } : (_selectedFromTx ? {
    ..._selectedFromTx,
    exceptionCode: _selectedFromTx.matchDetails?.status === 'MISMATCH' ? 'QTY_VARIANCE' : 'CLEAN',
    _isFromStore: false,
  } : {
    ...transactions[0],
    exceptionCode: transactions[0]?.matchDetails?.status === 'MISMATCH' ? 'QTY_VARIANCE' : 'CLEAN',
    _isFromStore: false,
  });

  // Contextual flags for review screen document panels
  const _reviewCode: ExceptionCode = selectedPayablesInvoice.exceptionCode || 'CLEAN';
  const _isPOMissing = _reviewCode === 'PO_MISSING';
  const _isGRNMissing = _reviewCode === 'GRN_MISSING';
  const _isServices = selectedPayablesInvoice.purchaseType === 'Services';
  const _isDuplicate = _reviewCode === 'DUPLICATE';
  const _isPriceVariance = _reviewCode === 'PRICE_VARIANCE';
  const _isQtyVariance = _reviewCode === 'QTY_VARIANCE';
  const _noGRExpected = _isGRNMissing || _isServices;

  // Resolve actions simulations
  const handleResolveAction = (actionType: 'credit' | 'accept' | 'escalate') => {
    // Generate simulated notification log
    const updated = transactions.map(tx => {
      if (tx.id === selectedPayablesInvoiceId) {
        let actionMsg = "";
        let nextStage: StageType = tx.currentStage;
        let nextAgent = tx.activeAgent;

        if (actionType === 'credit') {
          actionMsg = "Requested $1,640 Credit Note from supplier. Marked under dispute resolution.";
          nextStage = 'PENDING APPROVAL'; 
          nextAgent = 'Approval Orchestrator';
        } else if (actionType === 'accept') {
          actionMsg = "Discrepancy overwritten: accepted shortfall of 2 runs with direct ledger adjustment.";
          nextStage = 'PENDING APPROVAL';
          nextAgent = 'Approval Orchestrator';
        } else {
          actionMsg = "Escalated exception to Regional Accounts Payable Team and General Manager.";
          nextStage = 'PENDING APPROVAL';
          nextAgent = 'Approval Orchestrator';
        }

        const newAudit: AuditLog = {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          agent: 'Payables Agent',
          action: 'Discrepancy Remediation Selected',
          result: actionMsg
        };

        return {
          ...tx,
          currentStage: nextStage,
          activeAgent: nextAgent,
          auditTrail: [...tx.auditTrail, newAudit],
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }) + 'Z'
        };
      }
      return tx;
    });

    setTransactions(updated);
    setPayablesView('queue');
    setSuggestedDraftMsg(null);
    
    // Inject success message in system
    alert(`Success: Invoice ${selectedPayablesInvoiceId} exception processed with action code: ${actionType.toUpperCase()}. Routing context updated inside workflow ledger.`);
  };

  // Perform Gemini Chat calls or local simulation
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeAgentBot]: [...(prev[activeAgentBot] || []), userMsg]
    }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          activeAgentName: activeAgentBot,
          activeTransaction: activeTab === 'payables' ? selectedPayablesInvoice : activeTxn
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: activeAgentBot,
          text: data.text || 'Context analyzed. Please continue with your invoice review.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        };
        setChatMessages(prev => ({ ...prev, [activeAgentBot]: [...(prev[activeAgentBot] || []), botMsg] }));
      } else {
        throw new Error('Fallback response needed');
      }
    } catch (e) {
      setTimeout(() => {
        let reply = "";
        if (activeAgentBot === 'Payables Agent') {
          reply = `Recognized query on "${selectedPayablesInvoice.vendorName}" (${selectedPayablesInvoice.id}). Current 3-Way status: ${selectedPayablesInvoice.matchDetails.status}. Let me know if you would like me to draft an email or execute a short discrepancy adjustment.`;
        } else if (activeAgentBot === 'Approval Orchestrator') {
          reply = `Reviewing governance card for ${activeTxn.id}. The required approval limit is verified. Waiting for sign-off assignee: Sarah Jenkins. Click Approve Invoice to proceed.`;
        } else {
          reply = `The bank ledger references are scanned against Citibank wire feed FT-910248231. Status matches 100%. Ready to trigger reconciliation post ledger pipeline.`;
        }
        
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: activeAgentBot,
          text: reply,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        };
        setChatMessages(prev => ({ ...prev, [activeAgentBot]: [...(prev[activeAgentBot] || []), botMsg] }));
      }, 500);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Document simulation upload dispatch
  const handleMockUploadFile = (fileType: 'Invoice' | 'PO' | 'GR') => {
    const nameMap = {
      Invoice: 'INV_DRAFT_8812_APEX.pdf',
      PO: 'PO_MATCH_8812_REQS.csv',
      GR: 'GOODS_RECEIPT_8812_CONFIRM.png'
    };
    setUploadedFiles(prev => [...prev, { name: nameMap[fileType], type: fileType }]);
  };

  const handleExecuteMockIngest = () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one document (Invoice, PO, or GR Receipt) to run automated matching.");
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Generate a brand new transaction in the list
            const newTxnId = `TXN-${Math.floor(1043 + Math.random() * 8000)}`;
            const isClean = uploadScenario === 'clean';
            
            const newInvoice: Transaction = {
              id: newTxnId,
              vendorName: uploadScenario === 'clean' ? 'Alpha Tech Distribution' : 'Quantum Global Freight',
              invoiceNumber: `INV-${Math.floor(2000 + Math.random() * 7000)}`,
              amount: uploadScenario === 'clean' ? 14200 : 9800,
              poReference: `PO-${Math.floor(4000 + Math.random() * 5000)}`,
              grReference: `GR-${Math.floor(4000 + Math.random() * 5000)}`,
              currentStage: 'MATCHING',
              activeAgent: 'Payables Agent',
              lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }) + 'Z',
              auditTrail: [
                {
                  timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                  agent: 'Payables Agent',
                  action: 'Ingested raw scanner OCR parameters',
                  result: `Ingesting ${uploadedFiles.length} matched payloads`
                },
                {
                  timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                  agent: 'Payables System',
                  action: '3-way rule analysis completed',
                  result: isClean ? '3-WAY MATCH SUCCESSFUL (CLEAN)' : 'VARIANCE DETECTED (QUANTITY SHORTFALL)'
                }
              ],
              matchDetails: {
                invoiceItems: [
                  { id: '1', item: uploadScenario === 'clean' ? 'Industrial Servers Level-3A' : 'High Performance Coolant Units', qty: 10, price: uploadScenario === 'clean' ? 1420 : 980, total: uploadScenario === 'clean' ? 14200 : 9800 }
                ],
                poItems: [
                  { item: uploadScenario === 'clean' ? 'Industrial Servers Level-3A' : 'High Performance Coolant Units', qty: 10, price: uploadScenario === 'clean' ? 1420 : 980, total: uploadScenario === 'clean' ? 14200 : 9800 }
                ],
                grItems: [
                  { item: uploadScenario === 'clean' ? 'Industrial Servers Level-3A' : 'High Performance Coolant Units', qty: isClean ? 10 : 7 } // short units
                ],
                status: isClean ? 'CLEAN' : 'MISMATCH',
                discrepancy: isClean ? undefined : {
                  field: 'Quantity',
                  column: 'GR',
                  message: 'Goods received confirms only 7 cooler tanks arrived compared to invoice 10 billed quantity.'
                },
                emailDraft: `To: ar@quantum-freight.com
Subject: Discrepancy Notice for Invoice - QUANTUM FREIGHT
Dear Quantum billing, our automated 3-way check detected that only 7 units of Cooling Units were logged by our East Warehouse registry under PO, while 10 were invoiced. Please verify or issue a credit note for $2,940.`
              },
              approvalDetails: {
                policyApplied: 'Standard rule audit for warehouse procurement limits > $5,000',
                approverName: 'Sarah Jenkins',
                approverRole: 'VP of Finance',
                approverContact: 's.jenkins@finflow-cop.com',
                slaMinutesTotal: 180,
                slaMinutesRemaining: 175,
                timelineStatus: 'Submitted',
                costCenter: 'PROCUREMENT-WEST-GLO',
                businessPurpose: 'Server array replacement deployment cooling arrays.'
              },
              reconciliationDetails: {
                bankReference: 'N/A',
                paymentDate: 'N/A',
                glAccount: '102100 - Citi Operating Account',
                matchStatus: 'UNMATCHED'
              }
            } as any;

            setTransactions(prev => [newInvoice, ...prev]);
            setSelectedPayablesInvoiceId(newTxnId);
            setUploadProgress(null);
            setUploadedFiles([]);
            setShowUploadModal(false);
            setPayablesView('review'); // Bring user directly to view the match results!
          }, 600);
        }
        return p + 15;
      });
    }, 120);
  };

  // Map store MatchResults into the same shape the queue table renders
  const EXCEPTION_LABELS: Record<ExceptionCode, string> = {
    CLEAN: 'Clean', PRICE_VARIANCE: 'Price Variance', QTY_VARIANCE: 'Qty Mismatch',
    GRN_MISSING: 'GRN Missing', PO_MISSING: 'PO Missing', DUPLICATE: 'Duplicate',
    TAX_ERROR: 'Tax Error', CONTRACT_VIOLATION: 'Contract Violation',
  };

  const storeQueueItems = matchResults.map(r => ({
    id: r.invoice.custInvoiceNo,
    vendorName: r.invoice.supplier,
    poReference: r.invoice.poNumber,
    amount: r.invoice.amount,
    invoiceDate: r.invoice.invoiceDate,
    postingDate: r.invoice.postingDate,
    paymentTerm: r.invoice.paymentTerm,
    purchaseType: r.invoice.purchaseType,
    payerName: r.invoice.vendor_code,
    aiConfidence: r.confidence,
    exceptionCode: r.exceptionCode,
    exceptionLabel: EXCEPTION_LABELS[r.exceptionCode],
    matchStatus: r.exceptionCode === 'CLEAN' ? 'CLEAN' : 'MISMATCH',
    slaText: r.invoice.paymentStatus === 'Overdue' ? 'OVERDUE' : 'OK',
    slaStatus: r.invoice.paymentStatus === 'Overdue' ? 'overdue' : 'remaining',
    priorityScore: r.invoice.priorityScore || 50,
    paymentStatus: r.invoice.paymentStatus,
    _isFromStore: true,
  } as any));

  // Combine store rows with existing hardcoded transactions
  const allQueueItems = [...storeQueueItems, ...transactions.map(tx => ({
    ...tx,
    exceptionCode: tx.matchDetails.status === 'MISMATCH' ? 'QTY_VARIANCE' : 'CLEAN',
    exceptionLabel: tx.matchDetails.status === 'MISMATCH' ? 'Qty Mismatch' : 'Clean',
    matchStatus: tx.matchDetails.status,
    _isFromStore: false,
  } as any))];

  // Filter conditions computed lists
  const filteredInvoiceQueue = allQueueItems.filter((tx: any) => {
    // Search filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (tx.vendorName || '').toLowerCase().includes(q) ||
      (tx.id || '').toLowerCase().includes(q) ||
      (tx.poReference || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    // Top-level filters matching Payables requirements
    const matchesPurchaseType = filterPurchaseType === 'All' || tx.purchaseType === filterPurchaseType;

    // Status resolution filter
    let matchesStatus = true;
    if (filterPaymentStatus !== 'All') {
      if (filterPaymentStatus === 'Exception') {
        matchesStatus = tx.matchStatus === 'MISMATCH';
      } else if (filterPaymentStatus === 'Under Review') {
        matchesStatus = !tx._isFromStore && tx.currentStage === 'PENDING APPROVAL';
      } else if (filterPaymentStatus === 'Closed') {
        matchesStatus = !tx._isFromStore && tx.currentStage === 'CLOSED';
      }
    }

    // AI Confidence filter
    let matchesConfidence = true;
    if (filterAiConfidence !== 'All') {
      const conf = tx.aiConfidence || 95;
      if (filterAiConfidence === 'High') matchesConfidence = conf >= 95;
      if (filterAiConfidence === 'Medium') matchesConfidence = conf >= 80 && conf < 95;
      if (filterAiConfidence === 'Low') matchesConfidence = conf < 80;
    }

    // Exception code filter
    const matchesException = filterException === 'All' || tx.exceptionCode === filterException;

    return matchesPurchaseType && matchesStatus && matchesConfidence && matchesException;
  });

  // Approval filters computed lists
  const filteredApprovalList = transactions.filter(tx => {
    if (approvalFilter === 'All') return tx.currentStage !== 'CLOSED';
    if (approvalFilter === 'Exceptions') return tx.matchDetails.status === 'MISMATCH' && tx.currentStage !== 'CLOSED';
    if (approvalFilter === 'Closed') return tx.currentStage === 'CLOSED';
    return true;
  });

  // Action executed inside Approval workflow card
  const handleApproveInvoice = (disputed: boolean) => {
    setTransactions(prev => {
      return prev.map(t => {
        if (t.id === activeTxnId) {
          const newStage: StageType = disputed ? 'MATCHING' : 'RECONCILING';
          const newAgent = disputed ? 'Payables Agent' : 'Reconciliation Agent';
          const trailMsg = disputed 
            ? `Rejected & Disputed by ${activeTxn.approvalDetails.approverName}. Note: ${approverNotes || 'None'}` 
            : `Approved by VIP Governance signoff: ${activeTxn.approvalDetails.approverName}. Note: ${approverNotes || 'Cleared for release'}`;

          const newAudit: AuditLog = {
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            agent: 'Approval Orchestrator',
            action: disputed ? 'REJECTED' : 'APPROVED',
            result: trailMsg
          };

          return {
            ...t,
            currentStage: newStage,
            activeAgent: newAgent,
            auditTrail: [...t.auditTrail, newAudit],
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }) + 'Z',
            approvalDetails: {
              ...t.approvalDetails,
              timelineStatus: 'Done',
              approverNotes: approverNotes || 'Invoice matched and authorised.'
            }
          };
        }
        return t;
      });
    });

    setApproverNotes('');
    alert(disputed 
      ? `Transaction ${activeTxnId} disputed. Dispatched back to matches queue for adjustment.` 
      : `Transaction Approved! Advanced to Reconciliation Clearing stage.`
    );
  };

  // Action executed inside Reconciliation panel
  const handlePostToGL = () => {
    // Generate new ledger element
    const newLedgerItem: LedgerItem = {
      id: `GL-${Math.floor(125000 + Math.random() * 90000)}`,
      date: new Date().toISOString().substring(0, 10),
      vendor: activeTxn.vendorName,
      amount: activeTxn.amount,
      account: activeTxn.reconciliationDetails.glAccount || '102100 - Citi Operating',
      status: 'CLEARED'
    };

    setLedger(prev => [newLedgerItem, ...prev]);

    setTransactions(prev => {
      return prev.map(t => {
        if (t.id === activeTxn.id) {
          const newAudit: AuditLog = {
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            agent: 'Reconciliation Agent',
            action: 'Post Clearing Completed',
            result: `Cleared Citibank Operating Account entries. Ledger ID generated: ${newLedgerItem.id}`
          };
          return {
            ...t,
            currentStage: 'CLOSED',
            activeAgent: 'None',
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }) + 'Z',
            auditTrail: [...t.auditTrail, newAudit],
            reconciliationDetails: {
              ...t.reconciliationDetails,
              matchStatus: 'MATCHED',
              postedToGL: true,
              bankReference: 'CITI-ACH-2026-FT91024'
            }
          };
        }
        return t;
      });
    });

    alert(`Successfully Post to General Ledger ledger reference: ${newLedgerItem.id}. All matches locked and closed.`);
  };

  // ── Landing Page ──────────────────────────────────────────────────
  if (appView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
        <header className="bg-[#404040] text-white px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E87722] rounded-lg shadow-sm">
              <Database size={20} />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider text-sm block">FINFLOW ENGINE</span>
              <span className="text-[10px] text-gray-300 font-semibold">Autonomous AP, Workflow Governance &amp; Reconciliation</span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">HOME CONSOLE</span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-display">Select Your Workspace</h1>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              Access the right module for your task — analytics dashboard, full three-agent payables workflow, or centralized financial controls.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl w-full">
            {/* Dashboard Card */}
            <button
              onClick={() => setAppView('dashboard')}
              className="group bg-white border-2 border-slate-200 hover:border-[#E87722] rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full justify-between animate-fadeIn"
              id="landing-dashboard-card"
            >
              <div className="flex flex-col flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5 group-hover:bg-[#E87722] transition-colors duration-200 shrink-0">
                  <BarChart2 size={22} className="text-[#E87722] group-hover:text-white transition-colors duration-200" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2 font-display">Dashboard</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Live insights and analytics — exception breakdown, invoice status mix, and pipeline KPIs at a glance.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Insights Monitor</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Pipeline KPIs</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Exception Analytics</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#E87722] flex items-center gap-1 mt-4">
                Open Dashboard <ChevronRight size={14} />
              </span>
            </button>

            {/* Payables Workflow Card */}
            <button
              onClick={() => setAppView('workflow')}
              className="group bg-white border-2 border-slate-200 hover:border-[#E87722] rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full justify-between animate-fadeIn"
              id="landing-payables-card"
            >
              <div className="flex flex-col flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5 group-hover:bg-[#E87722] transition-colors duration-200 shrink-0">
                  <FileCheck2 size={22} className="text-[#E87722] group-hover:text-white transition-colors duration-200" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2 font-display">Payables Workflow</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Three-agent autonomous workflow for end-to-end invoice processing, governance approval, and bank reconciliation.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Payables Agent</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Approval Orchestrator</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Reconciliation Agent</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#E87722] flex items-center gap-1 mt-4">
                Launch Workflow <ChevronRight size={14} />
              </span>
            </button>

            {/* Core Finance Triad Card */}
            <button
              onClick={() => setAppView('triad')}
              className="group bg-white border-2 border-slate-200 hover:border-[#E87722] rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full justify-between animate-fadeIn"
              id="landing-triad-card"
            >
              <div className="flex flex-col flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5 group-hover:bg-[#E87722] transition-colors duration-200 shrink-0">
                  <SlidersHorizontal size={22} className="text-[#E87722] group-hover:text-white transition-colors duration-200" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2 font-display">Core Finance Triad</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Integrated Treasury liquidity, Reporting scorecards, and Audit controls for continuous workspace governance.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Treasury Matrix</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">MIS Scorecard</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Audit &amp; Compliance</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#E87722] flex items-center gap-1 mt-4">
                Open Finance Triad <ChevronRight size={14} />
              </span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Core Finance Triad View ────────────────────────────────────────
  if (appView === 'triad') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans select-none animate-fadeIn">
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-mono tracking-tight shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E87722] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E87722] animate-pulse"></span>
              ACTIVE NETWORK: CORE ENTERPRISES
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">LEDGERS VALIDATED: 100% INTERNAL AUDIT OK</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-mono">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[11px]">UTC DATE STAMP:</span>
            <span className="text-slate-700 font-semibold">{systemTime}</span>
          </div>
        </div>

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAppView('landing')}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer bg-transparent border-0"
            >
              <ChevronLeft size={14} />
              <span>Back to Hub</span>
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="p-2 bg-[#404040] rounded-lg shadow-sm text-white ml-1">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-wider text-sm block">GOVERNANCE &amp; CONTROLS</span>
              <span className="text-[10px] text-slate-500 font-semibold">Centralised corporate metrics</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">TRIAD CONSOLE</span>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 px-8 py-8">
          <CoreFinanceTriad onBack={() => setAppView('landing')} systemTime={systemTime} />
        </main>
      </div>
    );
  }

  // ── Dashboard View ─────────────────────────────────────────────────
  if (appView === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans select-none">
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-mono tracking-tight shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E87722] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E87722] animate-pulse"></span>
              ACTIVE NETWORK: CORE ENTERPRISES
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">LEDGERS VALIDATED: 100% INTERNAL AUDIT OK</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[11px]">UTC DATE STAMP:</span>
            <span className="text-slate-700 font-semibold">{systemTime}</span>
          </div>
        </div>

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAppView('landing')}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              Back to Hub
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="p-2 bg-[#404040] rounded-lg shadow-sm text-white ml-1">
              <BarChart2 size={20} />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-wider text-sm block">PAYABLES AUDIT PIPELINE</span>
              <span className="text-[10px] text-slate-500 font-semibold">Live analytics &amp; exception insights</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DASHBOARD</span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <InsightsPanel matchResults={matchResults} />
          <div className="grid grid-cols-4 gap-4 mt-2">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">SCANNER STATUS</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900">ONLINE</span>
                <span className="text-xs text-emerald-600 font-semibold">99.8% Efficiency</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">TOTAL INVOICES</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-[#E87722]">{matchResults.length + transactions.length}</span>
                <span className="text-xs text-slate-500 font-medium">in pipeline</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">AI EXTRACTION METRICS</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900">94%</span>
                <span className="text-xs text-slate-500 font-medium">Avg Confidence</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">OLDEST OUTSTANDING</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-rose-600">9D Overdue</span>
                <span className="text-xs text-slate-500 font-medium">Escalated</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Workflow View ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Dynamic Sub-header Status Indicator Line (Professional Polish) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-mono tracking-tight shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#E87722] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E87722] animate-pulse"></span>
            ACTIVE NETWORK: CORE ENTERPRISES
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">LEDGERS VALIDATED: 100% INTERNAL AUDIT OK</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            <span className="text-slate-450 text-[11px]">UTC DATE STAMP:</span>
            <span className="text-slate-700 font-semibold">{systemTime}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600 font-semibold cursor-pointer hover:underline flex items-center gap-1" onClick={() => setIsChatOpen(true)}>
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
            Agent Chat Ready
          </span>
        </div>
      </div>

      {/* Primary Top Navigation Tab Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAppView('landing')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            Back to Hub
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="p-2 bg-gradient-to-tr from-[#404040] to-[#2d2d2d] rounded-lg shadow-sm text-white ml-1">
            <Database size={20} />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-wider text-sm block">FINFLOW ENGINE</span>
            <span className="text-[10px] text-slate-500 font-semibold">Autonomous AP, Workflow Governance &amp; Reconciliation</span>
          </div>
        </div>

        {/* The Three Main Requested Top-Level Tab Selectors */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
          <button 
            id="tab-payables"
            onClick={() => { setActiveTab('payables'); setPayablesView('queue'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'payables'
                ? 'bg-white text-[#E87722] shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <FileText size={14} />
            <span>1. Payables Agent</span>
          </button>

          <button 
            id="tab-approval"
            onClick={() => { setActiveTab('approval'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'approval'
                ? 'bg-white text-[#E87722] shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <ShieldAlert size={14} />
            <span>2. Approval Orchestrator</span>
          </button>

          <button 
            id="tab-reconciliation"
            onClick={() => { setActiveTab('reconciliation'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'bg-white text-[#E87722] shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>3. Reconciliation Agent</span>
          </button>
        </div>

        {/* Global stats and trigger */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            id="global-upload-btn"
            className="bg-white border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UploadCloud size={13} className="text-[#E87722]" />
            <span>Document Ingestion</span>
          </button>
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative bg-orange-50 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-orange-200 text-[#E87722] flex items-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span>Agent Assistant</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Tab Space */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* ======================================= */}
        {/* TAB 1: PAYABLES AGENT WORKFLOW          */}
        {/* ======================================= */}
        {activeTab === 'payables' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-transparent" id="tab-content-payables">
            {payablesView === 'queue' ? (
              
              /* View A: The Invoice Queue (Default View) */
              <div id="payables-view-queue" className="flex-1 flex flex-col gap-6 animate-fadeIn">

                {/* Metrics top strip */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">SCANNER STATUS</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-900 font-sans">ONLINE</span>
                      <span className="text-xs text-emerald-600 font-semibold">99.8% Efficiency</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">UNMATCHED DETECTOR</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-[#E87722] font-sans">1 FLAG</span>
                      <span className="text-xs text-slate-500 font-medium">Apex Logistics</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider block font-sans">AI EXTRACTION METRICS</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-900 font-sans">94%</span>
                      <span className="text-xs text-slate-500 font-medium">Avg Confidence</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">OLDEST OUTSTANDING</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-rose-600 font-sans">9D Overdue</span>
                      <span className="text-xs text-slate-500 font-medium">Escalated</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Queue Panel — Review Required / History tabs */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">

                  {/* Tab bar + upload */}
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/40">
                    <div className="flex">
                      <button
                        onClick={() => setPayablesQueueTab('review_required')}
                        className={`px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                          payablesQueueTab === 'review_required'
                            ? 'border-b-2 border-[#E87722] text-[#E87722]'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Review Required
                        <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                          {filteredInvoiceQueue.filter((i: any) => (i.exceptionCode || 'CLEAN') !== 'CLEAN').length}
                        </span>
                      </button>
                      <button
                        onClick={() => setPayablesQueueTab('history')}
                        className={`px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                          payablesQueueTab === 'history'
                            ? 'border-b-2 border-[#E87722] text-[#E87722]'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        History
                        <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
                          {filteredInvoiceQueue.filter((i: any) => (i.exceptionCode || 'CLEAN') === 'CLEAN').length}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pr-4">
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[#E87722] hover:bg-[#c05a00] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border-0"
                      >
                        <UploadCloud size={13} />
                        <span>Upload OCR Document</span>
                      </button>
                    </div>
                  </div>

                  {/* Search + Filter bar */}
                  <div className="px-4 pt-3 pb-2 border-b border-slate-100 space-y-2.5">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search supplier, ID, or PO..."
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722] bg-white text-slate-700 placeholder-slate-400"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <SlidersHorizontal size={12} className="text-slate-400" />
                        Filter:
                      </span>
                      <select
                        className="bg-white border border-slate-200 text-xs px-2 py-1 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722]"
                        value={filterPurchaseType} onChange={(e) => setFilterPurchaseType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option value="Goods">Goods</option>
                        <option value="Services">Services</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                      <select
                        className="bg-white border border-slate-200 text-xs px-2 py-1 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722]"
                        value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Exception">With Exceptions</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <select
                        className="bg-white border border-slate-200 text-xs px-2 py-1 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722]"
                        value={filterAiConfidence} onChange={(e) => setFilterAiConfidence(e.target.value)}
                      >
                        <option value="All">All Confidence</option>
                        <option value="High">High (&gt;95%)</option>
                        <option value="Medium">Medium (80–95%)</option>
                        <option value="Low">Low (&lt;80%)</option>
                      </select>
                      {(filterPurchaseType !== 'All' || filterPaymentStatus !== 'All' || filterAiConfidence !== 'All' || !!searchQuery) && (
                        <button
                          onClick={() => { setFilterPurchaseType('All'); setFilterPaymentStatus('All'); setFilterAiConfidence('All'); setFilterException('All'); setSearchQuery(''); }}
                          className="text-xs text-[#E87722] hover:text-[#c05a00] font-semibold flex items-center gap-1"
                        >
                          <RefreshCw size={11} /> RESET
                        </button>
                      )}
                      <span className="ml-auto text-xs text-slate-400 font-medium">
                        {filteredInvoiceQueue.filter((i: any) => payablesQueueTab === 'review_required' ? (i.exceptionCode || 'CLEAN') !== 'CLEAN' : (i.exceptionCode || 'CLEAN') === 'CLEAN').length} record(s)
                      </span>
                    </div>
                  </div>

                  {/* Table — horizontally scrollable, Invoice ID column frozen */}
                  <div className="overflow-x-auto">
                    <table className="text-left border-collapse" style={{minWidth: payablesQueueTab === 'review_required' ? '1380px' : '1200px'}}>
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                          <th className="px-4 py-3 sticky left-0 z-20 bg-slate-50 border-r border-slate-200 whitespace-nowrap">Invoice ID #</th>
                          {payablesQueueTab === 'review_required' ? (
                            <>
                              <th className="px-4 py-3 whitespace-nowrap">Supplier Name</th>
                              <th className="px-4 py-3 text-right whitespace-nowrap">Amount</th>
                              <th className="px-4 py-3 whitespace-nowrap">AI Rec.</th>
                              <th className="px-4 py-3 whitespace-nowrap">Approval Status</th>
                              <th className="px-4 py-3 whitespace-nowrap">Dispute Reason</th>
                              <th className="px-4 py-3 whitespace-nowrap">Purchase Type</th>
                              <th className="px-4 py-3 whitespace-nowrap">Payment Status</th>
                              <th className="px-4 py-3 whitespace-nowrap">Prioritization Score</th>
                              <th className="px-4 py-3 text-center whitespace-nowrap">Review</th>
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-3 whitespace-nowrap">Supplier Name</th>
                              <th className="px-4 py-3 whitespace-nowrap">PO Number</th>
                              <th className="px-4 py-3 whitespace-nowrap">Invoice Date</th>
                              <th className="px-4 py-3 whitespace-nowrap">Posting Date</th>
                              <th className="px-4 py-3 whitespace-nowrap">Payment Term</th>
                              <th className="px-4 py-3 whitespace-nowrap">SLA</th>
                              <th className="px-4 py-3 whitespace-nowrap">Payer Name</th>
                              <th className="px-4 py-3 text-center whitespace-nowrap">Review</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {filteredInvoiceQueue
                          .filter((i: any) =>
                            payablesQueueTab === 'review_required'
                              ? (i.exceptionCode || 'CLEAN') !== 'CLEAN'
                              : (i.exceptionCode || 'CLEAN') === 'CLEAN'
                          )
                          .map((item: any) => {
                            const code: ExceptionCode = item.exceptionCode || 'CLEAN';
                            const conf: number = item.aiConfidence || 95;
                            const score: number = item.priorityScore || 50;
                            const isOverdue = item.slaStatus === 'overdue' || item.paymentStatus === 'Overdue';

                            // Compute a rich SLA label from invoice date + payment term
                            const getSla = (): { text: string; overdue: boolean } => {
                              if (item.slaText && item.slaText !== 'OK' && item.slaText !== 'OVERDUE') {
                                return { text: item.slaText, overdue: item.slaStatus === 'overdue' };
                              }
                              try {
                                const invDate = new Date(item.invoiceDate);
                                const termDays = parseInt((item.paymentTerm || 'Net 30').match(/(\d+)/)?.[1] || '30');
                                const dueDate = new Date(invDate.getTime() + termDays * 86400000);
                                const diffDays = Math.round((dueDate.getTime() - Date.now()) / 86400000);
                                if (diffDays < 0) return { text: `${Math.abs(diffDays)}D OVERDUE`, overdue: true };
                                if (diffDays === 0) return { text: 'DUE TODAY', overdue: true };
                                return { text: `${diffDays}D REMAINING`, overdue: false };
                              } catch {
                                return { text: isOverdue ? 'OVERDUE' : 'NOT YET DUE', overdue: isOverdue };
                              }
                            };
                            const sla = getSla();

                            if (payablesQueueTab === 'review_required') {
                              const aiRecLabel = code === 'DUPLICATE' ? 'REVIEW DISC.' : code !== 'CLEAN' ? 'FLAG REJECTION' : 'REC. APPROVAL';
                              const aiRecColor = code === 'DUPLICATE' ? 'bg-amber-50 text-amber-700 border-amber-200' : code !== 'CLEAN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                              const barColor = code === 'DUPLICATE' ? 'bg-amber-500' : code !== 'CLEAN' ? 'bg-rose-500' : 'bg-emerald-500';
                              const approvalStatus = code === 'CLEAN' ? 'APPROVED' : code === 'DUPLICATE' ? 'PARKED' : 'BLOCKED';
                              const approvalColor = approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : approvalStatus === 'PARKED' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200';
                              const approvalDot = approvalStatus === 'APPROVED' ? 'bg-emerald-500' : approvalStatus === 'PARKED' ? 'bg-slate-400' : 'bg-rose-500';
                              const disputeLabel: Record<string, string> = {
                                CLEAN: '—', PRICE_VARIANCE: 'Price variance', QTY_VARIANCE: 'Quantity variance',
                                GRN_MISSING: 'GR missing', PO_MISSING: 'PO missing', DUPLICATE: 'Duplicate invoice',
                                TAX_ERROR: 'Tax error', CONTRACT_VIOLATION: 'Contract violation',
                              };
                              return (
                                <tr key={item.id} className="group hover:bg-slate-50/60 transition-all">
                                  <td className="px-4 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-100 font-bold text-[#E87722] font-mono text-[11px] max-w-[200px]">
                                    <span className="block truncate" title={item.id}>{item.id}</span>
                                  </td>
                                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.vendorName || '—'}</td>
                                  <td className="px-4 py-3 text-right text-slate-900 font-bold font-mono whitespace-nowrap">${(item.amount ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1 min-w-[130px]">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${aiRecColor}`}>{aiRecLabel}</span>
                                        <span className="text-[10px] font-bold text-slate-700">{conf}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${barColor}`} style={{width: `${conf}%`}} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 whitespace-nowrap ${approvalColor}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${approvalDot}`}></span>
                                      {approvalStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 italic whitespace-nowrap">{disputeLabel[code] || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">{item.purchaseType || 'Goods'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {isOverdue ? (
                                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded whitespace-nowrap">OVERDUE</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded whitespace-nowrap">NOT YET DUE</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 min-w-[100px]">
                                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#E87722] rounded-full" style={{width: `${score}%`}} />
                                      </div>
                                      <span className="text-xs font-bold text-slate-700 w-6 text-right shrink-0">{score}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => { setSelectedPayablesInvoiceId(item.id); setPayablesView('review'); }}
                                      className="bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer transition-all whitespace-nowrap"
                                    >
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              );
                            }

                            // History tab row — metadata-focused columns
                            return (
                              <tr key={item.id} className="group hover:bg-slate-50/60 transition-all">
                                <td className="px-4 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-100 font-bold text-[#E87722] font-mono text-[11px] max-w-[200px]">
                                  <span className="block truncate" title={item.id}>{item.id}</span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.vendorName || '—'}</td>
                                <td className="px-4 py-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">{item.poReference || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.invoiceDate || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.postingDate || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.paymentTerm || '—'}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${sla.overdue ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                                    {sla.text}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">{item.payerName || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => { setSelectedPayablesInvoiceId(item.id); setPayablesView('review'); }}
                                    className="bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer transition-all whitespace-nowrap"
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        {filteredInvoiceQueue.filter((i: any) =>
                          payablesQueueTab === 'review_required'
                            ? (i.exceptionCode || 'CLEAN') !== 'CLEAN'
                            : (i.exceptionCode || 'CLEAN') === 'CLEAN'
                        ).length === 0 && (
                          <tr>
                            <td colSpan={payablesQueueTab === 'review_required' ? 10 : 9} className="py-12 text-center text-slate-400 italic">
                              {payablesQueueTab === 'history' ? 'No clean/approved invoices yet.' : 'No items pending review.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              
              /* View B: 3-Way Match Review */
              <div id="payables-view-review" className="flex-1 flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => { setPayablesView('queue'); setSuggestedDraftMsg(null); }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Back to Invoice Inbounds Queue</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">CURRENT STEP:</span>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-orange-50 text-[#E87722] border border-orange-200/60 rounded font-mono">
                      AUTONOMOUS AUDIT
                    </span>
                  </div>
                </div>

                {/* Subheader banner detailing selected review */}
                <div className="bg-white border border-slate-250 p-5 rounded-xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-[#E87722] rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {selectedPayablesInvoice.vendorName}
                        <span className="text-xs text-[#E87722] font-mono font-normal">({selectedPayablesInvoice.id})</span>
                      </h2>
                      <p className="text-xs mt-1 text-slate-550">
                        Invoice Code: <b className="text-slate-800 font-mono">{selectedPayablesInvoice.invoiceNumber}</b> &nbsp;·&nbsp;
                        PO: {_isPOMissing ? <span className="text-rose-600 font-bold">NOT FOUND</span> : <b className="text-slate-800 font-mono">{selectedPayablesInvoice.poReference}</b>} &nbsp;·&nbsp;
                        GR: {_isServices ? <span className="text-slate-400 italic">N/A (Services)</span> : _isGRNMissing ? <span className="text-rose-600 font-bold">NOT POSTED</span> : <b className="text-slate-800 font-mono">{selectedPayablesInvoice.grReference || '—'}</b>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">INVOICED AMOUNT</span>
                    <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                      ${selectedPayablesInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                {/* Three side-by-side document viewer panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Panel 1: Purchase Order — contextual */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${_isPOMissing ? 'bg-rose-500' : 'bg-[#E87722]'}`}></span>
                        1. PURCHASE ORDER
                      </span>
                      {_isPOMissing ? (
                        <span className="text-[9px] text-rose-600 font-bold flex items-center gap-1"><AlertTriangle size={9} /> NOT FOUND</span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><Check size={9} /> OCR EXTRACTED</span>
                      )}
                    </div>

                    {_isPOMissing ? (
                      /* PO Missing placeholder */
                      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-3">
                        <div className="w-14 h-14 bg-rose-50 border-2 border-dashed border-rose-300 rounded-full flex items-center justify-center">
                          <AlertTriangle size={26} className="text-rose-500" />
                        </div>
                        <p className="text-sm font-bold text-rose-700">Purchase Order Not Found</p>
                        <p className="text-xs text-slate-500 leading-relaxed">No PO matching reference <span className="font-mono font-bold text-slate-700">{selectedPayablesInvoice.poReference}</span> exists in the system. This invoice is <span className="font-bold text-rose-600">orphaned</span> — it cannot be validated or paid without a registered PO.</p>
                        <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-3 py-1.5 rounded-full border border-rose-200">ACTION: Create PO or Reject Invoice</span>
                      </div>
                    ) : (
                      <>
                        {/* Document image simulation */}
                        <div className="mx-4 mt-4 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                          <div className="bg-[#404040] text-white px-4 py-2.5 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Purchase Order</p>
                              <p className="text-sm font-bold font-mono">{selectedPayablesInvoice.poReference}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 uppercase">Issued By</p>
                              <p className="text-[10px] font-semibold">CORE ENTERPRISES</p>
                            </div>
                          </div>
                          <div className="bg-[#FAFAF8] px-4 py-3 space-y-2.5 font-mono text-[10px]">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Vendor</span>
                                <span className="text-slate-800 font-semibold truncate block">{selectedPayablesInvoice.vendorName}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">PO Date</span>
                                <span className="text-slate-800 font-semibold">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.poDate || selectedPayablesInvoice.invoiceDate || '2026-06-01'}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Payment Terms</span>
                                <span className="text-slate-800 font-semibold">{selectedPayablesInvoice.paymentTerm || 'Net 30'}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Tolerance</span>
                                <span className="text-amber-700 font-bold">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.tolerance ? `${(selectedPayablesInvoice.matchDetails.poItems[0].tolerance * 100).toFixed(1)}%` : '0.50% Default'}</span>
                              </div>
                            </div>
                            <table className="w-full border-collapse mt-1">
                              <thead>
                                <tr className="bg-slate-100 text-[9px] text-slate-500 uppercase">
                                  <th className="px-1.5 py-1 text-left">Description</th>
                                  <th className="px-1.5 py-1 text-right">Qty</th>
                                  <th className="px-1.5 py-1 text-right">Unit</th>
                                  <th className="px-1.5 py-1 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-slate-200">
                                  <td className="px-1.5 py-1.5 text-slate-700 truncate max-w-[80px]">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.item || 'Item'}</td>
                                  <td className="px-1.5 py-1.5 text-right text-slate-700">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.qty || '—'}</td>
                                  <td className={`px-1.5 py-1.5 text-right font-bold ${_isPriceVariance ? 'text-emerald-700' : 'text-slate-700'}`}>${(selectedPayablesInvoice.matchDetails.poItems?.[0]?.price || 0).toFixed(2)}</td>
                                  <td className="px-1.5 py-1.5 text-right text-slate-800 font-bold">${(selectedPayablesInvoice.matchDetails.poItems?.[0]?.total || 0).toLocaleString()}</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="flex justify-end pt-1">
                              <span className="border-2 border-emerald-600 text-emerald-600 font-bold text-[9px] px-2 py-0.5 inline-block opacity-60 tracking-widest rotate-[-6deg]">APPROVED</span>
                            </div>
                          </div>
                        </div>
                        {/* Extracted fields */}
                        <div className="p-4 space-y-2 mt-1">
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div><span className="text-slate-400 text-[10px] block">ORDERED QTY</span><span className="text-slate-800 font-bold">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.qty || '—'} units</span></div>
                            <div><span className="text-slate-400 text-[10px] block">UNIT PRICE</span><span className={`font-bold ${_isPriceVariance ? 'text-emerald-700' : 'text-slate-800'}`}>${(selectedPayablesInvoice.matchDetails.poItems?.[0]?.price || 0).toFixed(2)}</span></div>
                            <div><span className="text-slate-400 text-[10px] block">LINE TOTAL</span><span className="text-emerald-700 font-bold">${(selectedPayablesInvoice.matchDetails.poItems?.[0]?.total || 0).toLocaleString()}</span></div>
                            <div><span className="text-slate-400 text-[10px] block">PO REF</span><span className="text-slate-700 font-mono text-[10px]">{selectedPayablesInvoice.poReference}</span></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Panel 2: Goods Receipt — contextual */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${_isGRNMissing ? 'bg-rose-500' : _isServices ? 'bg-slate-400' : 'bg-yellow-500'}`}></span>
                        2. GOODS RECEIPT (GR)
                      </span>
                      {_isGRNMissing ? (
                        <span className="text-[9px] text-rose-600 font-bold flex items-center gap-1"><AlertTriangle size={9} /> NOT POSTED</span>
                      ) : _isServices ? (
                        <span className="text-[9px] text-slate-400 font-bold">N/A — SERVICES</span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><Check size={9} /> OCR EXTRACTED</span>
                      )}
                    </div>

                    {_isGRNMissing ? (
                      /* GR Not Found placeholder */
                      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-3">
                        <div className="w-14 h-14 bg-rose-50 border-2 border-dashed border-rose-300 rounded-full flex items-center justify-center">
                          <AlertTriangle size={26} className="text-rose-500" />
                        </div>
                        <p className="text-sm font-bold text-rose-700">Goods Receipt Not Posted</p>
                        <p className="text-xs text-slate-500 leading-relaxed">No Goods Receipt has been recorded for PO <span className="font-mono font-bold text-slate-700">{selectedPayablesInvoice.poReference}</span>. The vendor claims delivery, but the warehouse has <span className="font-bold text-rose-600">no record of receiving</span> this shipment.</p>
                        <div className="flex flex-col gap-1.5 w-full">
                          <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-3 py-1.5 rounded-full border border-rose-200">ACTION: Post GR or Request Proof of Delivery</span>
                          <span className="text-[10px] text-slate-400">Until a GR is posted, this invoice is <span className="font-bold text-rose-500">blocked from payment</span></span>
                        </div>
                      </div>
                    ) : _isServices ? (
                      /* Services — GR not applicable */
                      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-3">
                        <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center">
                          <FileCheck2 size={24} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Not Applicable</p>
                        <p className="text-xs text-slate-400 leading-relaxed">This is a <span className="font-bold text-slate-600">Services</span> invoice. Goods Receipts are not required for services-based POs. Validation relies on service completion confirmation and the agreed contract terms.</p>
                        <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-full border border-slate-200">Validated via Service Confirmation</span>
                      </div>
                    ) : (
                      <>
                        {/* Document image simulation */}
                        <div className="mx-4 mt-4 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                          <div className="bg-slate-600 text-white px-4 py-2.5 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Goods Receipt Note</p>
                              <p className="text-sm font-bold font-mono">{selectedPayablesInvoice.grReference || selectedPayablesInvoice.matchDetails.grItems?.[0]?.grNumber || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 uppercase">Plant / Warehouse</p>
                              <p className="text-[10px] font-semibold">{selectedPayablesInvoice.matchDetails.grItems?.[0]?.plant || 'EAST-DEPOT-1A'}</p>
                            </div>
                          </div>
                          <div className="bg-[#FAFAF8] px-4 py-3 space-y-2.5 font-mono text-[10px]">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Received From</span>
                                <span className="text-slate-800 font-semibold truncate block">{selectedPayablesInvoice.vendorName}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Receipt Date</span>
                                <span className="text-slate-800 font-semibold">{selectedPayablesInvoice.matchDetails.grItems?.[0]?.date || '2026-06-02'}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">Receiving Status</span>
                                <span className={`font-bold ${_isQtyVariance ? 'text-rose-600' : 'text-emerald-700'}`}>{_isQtyVariance ? 'PARTIAL RECEIPT' : 'POSTED INBOUND'}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-300 pb-1.5">
                                <span className="text-slate-400 text-[9px] uppercase block">PO Reference</span>
                                <span className="text-slate-800 font-semibold font-mono">{selectedPayablesInvoice.poReference}</span>
                              </div>
                            </div>
                            <table className="w-full border-collapse mt-1">
                              <thead>
                                <tr className="bg-slate-100 text-[9px] text-slate-500 uppercase">
                                  <th className="px-1.5 py-1 text-left">Item</th>
                                  <th className="px-1.5 py-1 text-right">Expected</th>
                                  <th className="px-1.5 py-1 text-right">Received</th>
                                  <th className="px-1.5 py-1 text-right">Δ</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-slate-200">
                                  <td className="px-1.5 py-1.5 text-slate-700 truncate max-w-[70px]">{selectedPayablesInvoice.matchDetails.grItems?.[0]?.item || 'Item'}</td>
                                  <td className="px-1.5 py-1.5 text-right text-slate-700">{selectedPayablesInvoice.matchDetails.poItems?.[0]?.qty ?? '—'}</td>
                                  <td className={`px-1.5 py-1.5 text-right font-bold ${_isQtyVariance ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {selectedPayablesInvoice.matchDetails.grItems?.[0]?.qty ?? '—'}
                                  </td>
                                  <td className={`px-1.5 py-1.5 text-right font-bold ${_isQtyVariance ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {_isQtyVariance
                                      ? `−${(selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.qty || 0) - (selectedPayablesInvoice.matchDetails.grItems?.[0]?.qty || 0)}`
                                      : '✓'}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="flex justify-end pt-1">
                              <span className={`border-2 font-bold text-[9px] px-2 py-0.5 inline-block opacity-60 tracking-widest rotate-[-6deg] ${_isQtyVariance ? 'border-rose-500 text-rose-500' : 'border-slate-500 text-slate-500'}`}>
                                {_isQtyVariance ? 'SHORT RECEIPT' : 'RECEIVED'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Extracted fields */}
                        <div className="p-4 space-y-2 mt-1">
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 text-[10px] block">UNITS RECEIVED</span>
                              <span className={`font-bold flex items-center gap-1 ${_isQtyVariance ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {selectedPayablesInvoice.matchDetails.grItems?.[0]?.qty ?? '—'} units
                                {_isQtyVariance && <AlertTriangle size={11} />}
                              </span>
                            </div>
                            <div><span className="text-slate-400 text-[10px] block">PLANT</span><span className="text-slate-700 font-medium">{selectedPayablesInvoice.matchDetails.grItems?.[0]?.plant || 'EAST-DEPOT-1A'}</span></div>
                            <div><span className="text-slate-400 text-[10px] block">RECEIPT DATE</span><span className="text-slate-700">{selectedPayablesInvoice.matchDetails.grItems?.[0]?.date || '2026-06-02'}</span></div>
                            <div><span className="text-slate-400 text-[10px] block">GR NUMBER</span><span className="text-slate-700 font-mono text-[10px]">{selectedPayablesInvoice.grReference || '—'}</span></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Panel 3: Vendor Invoice — always shown, highlights vary by exception */}
                  <div className={`bg-white rounded-xl overflow-hidden shadow-sm flex flex-col ${_isDuplicate ? 'border-2 border-amber-400' : 'border border-slate-200'}`}>
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#E87722]"></span>
                        3. VENDOR INVOICE
                      </span>
                      {_isDuplicate ? (
                        <span className="text-[9px] text-amber-700 font-bold flex items-center gap-1"><AlertTriangle size={9} /> DUPLICATE DETECTED</span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><Check size={9} /> OCR EXTRACTED</span>
                      )}
                    </div>

                    {/* Duplicate warning banner */}
                    {_isDuplicate && (
                      <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <p className="text-[10px] text-amber-800 font-semibold">This invoice number has already been submitted. Processing it again may result in a double payment. Verify with the vendor before approving.</p>
                      </div>
                    )}

                    {/* Document image simulation */}
                    <div className="mx-4 mt-3 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-[#E87722] text-white px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold tracking-widest text-orange-100 uppercase">{_isServices ? 'Services Invoice' : 'Tax Invoice'}</p>
                          <p className="text-sm font-bold font-mono">{selectedPayablesInvoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-orange-100 uppercase">Invoice Date</p>
                          <p className="text-[10px] font-semibold">{selectedPayablesInvoice.invoiceDate || '2026-06-01'}</p>
                        </div>
                      </div>
                      <div className="bg-[#FAFAF8] px-4 py-3 space-y-2.5 font-mono text-[10px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border-b border-dashed border-slate-300 pb-1.5">
                            <span className="text-slate-400 text-[9px] uppercase block">From</span>
                            <span className="text-slate-800 font-semibold truncate block">{selectedPayablesInvoice.vendorName}</span>
                          </div>
                          <div className="border-b border-dashed border-slate-300 pb-1.5">
                            <span className="text-slate-400 text-[9px] uppercase block">To</span>
                            <span className="text-slate-800 font-semibold">CORE ENTERPRISES</span>
                          </div>
                          <div className="border-b border-dashed border-slate-300 pb-1.5">
                            <span className="text-slate-400 text-[9px] uppercase block">PO Reference</span>
                            <span className={`font-semibold font-mono ${_isPOMissing ? 'text-rose-600' : 'text-slate-800'}`}>{selectedPayablesInvoice.poReference}</span>
                          </div>
                          <div className="border-b border-dashed border-slate-300 pb-1.5">
                            <span className="text-slate-400 text-[9px] uppercase block">Payment Terms</span>
                            <span className="text-slate-800 font-semibold">{selectedPayablesInvoice.paymentTerm || 'Net 30'}</span>
                          </div>
                        </div>
                        <table className="w-full border-collapse mt-1">
                          <thead>
                            <tr className="bg-slate-100 text-[9px] text-slate-500 uppercase">
                              <th className="px-1.5 py-1 text-left">Description</th>
                              <th className="px-1.5 py-1 text-right">Qty</th>
                              <th className="px-1.5 py-1 text-right">Rate</th>
                              <th className="px-1.5 py-1 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-slate-200">
                              <td className="px-1.5 py-1.5 text-slate-700 truncate max-w-[80px]">{selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.item || 'Invoice Item'}</td>
                              <td className={`px-1.5 py-1.5 text-right font-bold ${_isQtyVariance ? 'text-rose-600' : 'text-slate-700'}`}>
                                {selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.qty ?? '—'}
                                {_isQtyVariance && ' ⚠'}
                              </td>
                              <td className={`px-1.5 py-1.5 text-right font-bold ${_isPriceVariance ? 'text-rose-600' : 'text-slate-700'}`}>
                                ${(selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.price || 0).toFixed(2)}
                                {_isPriceVariance && ' ⚠'}
                              </td>
                              <td className="px-1.5 py-1.5 text-right text-slate-800 font-bold">${selectedPayablesInvoice.amount.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className={`border-2 font-bold text-[9px] px-2 py-0.5 inline-block opacity-60 tracking-widest rotate-[-6deg] ${_isDuplicate ? 'border-amber-500 text-amber-500' : 'border-[#E87722] text-[#E87722]'}`}>
                            {_isDuplicate ? 'DUPLICATE' : 'PAYMENT DUE'}
                          </span>
                          <span className="text-slate-800 font-bold text-xs">Total: ${selectedPayablesInvoice.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Extracted fields */}
                    <div className="p-4 space-y-2 mt-1">
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block">BILLED QTY</span>
                          <span className={`font-bold ${_isQtyVariance ? 'text-rose-600' : 'text-slate-800'}`}>
                            {selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.qty ?? '—'} units
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">BILLED RATE</span>
                          <span className={`font-bold ${_isPriceVariance ? 'text-rose-600' : 'text-slate-800'}`}>
                            ${(selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.price || 0).toLocaleString()}
                          </span>
                        </div>
                        <div><span className="text-slate-400 text-[10px] block">INVOICE DATE</span><span className="text-slate-700">{selectedPayablesInvoice.invoiceDate || '2026-06-01'}</span></div>
                        <div><span className="text-slate-400 text-[10px] block">TOTAL CLAIMED</span><span className="text-[#E87722] font-bold">${selectedPayablesInvoice.amount.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Contextual Exception Summary */}
                {(() => {
                  const isClean = _reviewCode === 'CLEAN';
                  const bgClass = isClean ? 'bg-emerald-50 border-emerald-200' : _isDuplicate ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
                  const iconColor = isClean ? 'text-emerald-600' : _isDuplicate ? 'text-amber-600' : 'text-rose-600';
                  const poQty = selectedPayablesInvoice.matchDetails.poItems?.[0]?.qty ?? 0;
                  const poPrice = selectedPayablesInvoice.matchDetails.poItems?.[0]?.price ?? 0;
                  const grQty = selectedPayablesInvoice.matchDetails.grItems?.[0]?.qty ?? 0;
                  const invQty = selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.qty ?? 0;
                  const invPrice = selectedPayablesInvoice.matchDetails.invoiceItems?.[0]?.price ?? 0;
                  const shortfall = invQty - grQty;
                  const priceDiff = (invPrice - poPrice).toFixed(2);

                  const messageMap: Record<string, React.ReactNode> = {
                    CLEAN: <span className="text-emerald-700">All three documents match. PO quantities, GR receipts, and invoice amounts are fully reconciled. Recommended for immediate AP sign-off.</span>,
                    PRICE_VARIANCE: <span>Price variance detected: Vendor billed <b className="text-rose-700">${invPrice.toFixed(2)}</b> per unit vs PO rate of <b className="text-emerald-700">${poPrice.toFixed(2)}</b> — a difference of <b className="text-rose-700">${priceDiff}</b> per unit ({selectedPayablesInvoice.variancePct ?? '—'}% deviation). Exceeds contracted tolerance. Vendor must issue a credit note or revised invoice.</span>,
                    QTY_VARIANCE: <span>Quantity shortfall: Invoice claims <b className="text-rose-700">{invQty} units</b> but Goods Receipt confirms only <b className="text-emerald-700">{grQty} units</b> delivered — a shortfall of <b className="text-rose-700">{shortfall} unit(s)</b>. Disputed value: <b className="text-rose-700">${(shortfall * poPrice).toLocaleString()}</b>. Vendor must provide proof of delivery or issue a partial credit.</span>,
                    GRN_MISSING: <span>No Goods Receipt has been posted for PO <b className="text-slate-800 font-mono">{selectedPayablesInvoice.poReference}</b>. The vendor's delivery claim cannot be verified against warehouse records. <b className="text-rose-700">Invoice is blocked</b> until a GR is created or the vendor provides a signed proof of delivery.</span>,
                    PO_MISSING: <span>No Purchase Order matching <b className="text-slate-800 font-mono">{selectedPayablesInvoice.poReference}</b> exists in the system. This invoice is <b className="text-rose-700">orphaned</b> — it cannot be processed or paid without a valid, approved PO. Raise a PO retroactively or reject this invoice.</span>,
                    DUPLICATE: <span>Duplicate invoice detected: <b className="text-amber-700 font-mono">{selectedPayablesInvoice.invoiceNumber}</b> has been submitted more than once. The earlier copy may already be in process or paid. <b className="text-amber-700">Do not pay</b> until confirmed unique with the vendor.</span>,
                    TAX_ERROR: <span>Tax amount on this invoice does not match the expected rate for this vendor classification. This may indicate incorrect tax code application by the vendor. Refer to the master vendor agreement for applicable tax rates before approving.</span>,
                    CONTRACT_VIOLATION: <span>This invoice violates contracted terms for <b>{selectedPayablesInvoice.vendorName}</b>. The billed rates or scope exceed what is stipulated in the master service agreement. Escalate to procurement or legal for review before processing payment.</span>,
                  };

                  return (
                    <div className={`border p-5 rounded-xl flex items-start justify-between shadow-xs ${bgClass}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${isClean ? 'bg-emerald-100' : _isDuplicate ? 'bg-amber-100' : 'bg-rose-100'}`}>
                          {isClean ? <Check size={20} className={iconColor} /> : <AlertTriangle size={20} className={iconColor} />}
                        </div>
                        <div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${isClean ? 'text-emerald-700' : _isDuplicate ? 'text-amber-700' : 'text-rose-700'}`}>
                            {isClean ? '3-Way Match — Clean' : `Exception: ${_reviewCode.replace(/_/g, ' ')}`}
                          </span>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-2xl">
                            {messageMap[_reviewCode] ?? selectedPayablesInvoice.summary ?? 'Review this invoice carefully.'}
                          </p>
                        </div>
                      </div>
                      {!isClean && (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border shrink-0 animate-pulse ${_isDuplicate ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                          {_isDuplicate ? 'PARKED — AWAITING CLARIFICATION' : _isPOMissing || _isGRNMissing ? 'BLOCKED — MISSING DOCUMENT' : 'SLA ALERT: RESOLUTION REQUIRED'}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* AI Resolution Assist Widget with dynamic interaction */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-gradient-to-tr from-[#404040] to-[#2d2d2d] rounded flex items-center justify-center font-bold text-[10px] text-white">AI</div>
                      <span className="text-xs font-bold text-slate-800 tracking-wide">AI RESOLUTION ASSIST & NOTIFICATIONS PARTNER</span>
                    </div>
                    <button 
                      onClick={() => {
                        // Dynamically draft customized message based on active mismatch variables
                        const isMismatch = selectedPayablesInvoice.matchDetails.status === 'MISMATCH';
                        if (isMismatch) {
                          setSuggestedDraftMsg(
                            `To: billing-ops@${selectedPayablesInvoice.vendorName.toLowerCase().replace(/ /g, '')}.com\n` + 
                            `Subject: Discrepancy Notice: ${selectedPayablesInvoice.invoiceNumber} for Purchase Order ${selectedPayablesInvoice.poReference}\n\n` +
                            `Hello,\n\nOur system detected that invoice ${selectedPayablesInvoice.invoiceNumber} billed for ${selectedPayablesInvoice.matchDetails.invoiceItems[0].qty} runs ($${selectedPayablesInvoice.amount.toLocaleString()}), but warehouse receipts logged only ${selectedPayablesInvoice.matchDetails.grItems[0].qty} runs. We request that you either provide validated proof-of-delivery for the shortfall, or release a credit offset memo for immediate processing.`
                          );
                        } else {
                          setSuggestedDraftMsg(`To: Sarah Jenkins (Authorized Signee)\nSubject: Clean Match Direct Pass Request\n\nAll rules are checked. AI confirms 100% extraction accuracy with zero item variance. Recommended action: Bypass wait cycle, directly release for next slot.`);
                        }
                      }}
                      className="bg-[#E87722] hover:bg-[#c05a00] text-white px-3.5 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs border-0"
                    >
                      Suggest Action & Email Draft
                    </button>
                  </div>

                  {suggestedDraftMsg ? (
                    <div className="bg-slate-50 border border-slate-205 rounded-lg p-3 space-y-3 animate-slideIn">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold font-sans">
                        <span>AUTO GENERATED REMEDIAL EMAIL TEMPLATE</span>
                        <span className="text-emerald-700 flex items-center gap-1 font-sans">
                          <Check size={12} /> DRAFT READY FOR SUBMISSION
                        </span>
                      </div>
                      <textarea 
                        className="w-full bg-white text-xs text-slate-705 p-2.5 rounded font-mono border border-slate-250 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722] h-32" 
                        value={suggestedDraftMsg}
                        onChange={(e) => setSuggestedDraftMsg(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setSuggestedDraftMsg(null)} className="text-slate-500 hover:text-slate-800 px-2 py-1 font-semibold cursor-pointer">Cancel</button>
                        <button 
                          onClick={() => {
                            alert("Discrepancy communication dispatched to supplier AP contact mailbox.");
                            handleResolveAction('credit');
                          }}
                          className="bg-[#E87722] text-white border-0 hover:bg-[#c05a00] px-3.5 py-1 rounded font-bold shadow-xs cursor-pointer"
                        >
                          Send Draft & Flag Credit Request
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Click the "Suggest" button to let the FinFlow engine pre-run compliance rules, compute offset claims, and automatically design a professional email resolution template for the supplier billing desk.
                    </p>
                  )}
                </div>

                {/* Resolution Action Keys (Bottom Bar) */}
                <div className="flex bg-white border border-slate-250 p-4 rounded-xl items-center justify-between shadow-xs">
                  <span className="text-xs text-slate-600 font-sans font-semibold">Select a system resolution handler to unlock routing:</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleResolveAction('credit')}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 rounded-lg text-xs font-bold px-4 py-2 cursor-pointer select-none transition-colors"
                    >
                      Request credit note
                    </button>
                    <button 
                      onClick={() => handleResolveAction('accept')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold px-4 py-2 cursor-pointer select-none transition-colors"
                    >
                      Accept short qty
                    </button>
                    <button 
                      onClick={() => handleResolveAction('escalate')}
                      className="bg-[#E87722] hover:bg-[#c05a00] text-white border-0 rounded-lg text-xs font-bold px-4 py-2 cursor-pointer select-none transition-colors shadow-xs"
                    >
                      Escalate to AP Manager
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}


        {/* ======================================= */}
        {/* TAB 2: APPROVAL ORCHESTRATOR WORKFLOW   */}
        {/* ======================================= */}
        {activeTab === 'approval' && (
          <div className="flex-1 flex overflow-hidden bg-transparent" id="tab-content-approval">
            
            {/* Left Hand Transaction Sidebar */}
            <aside className="w-80 border-r border-slate-205 bg-white flex flex-col shrink-0 min-h-0">
              <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider block uppercase">Delegated Invoices Queue</span>
                <div className="grid grid-cols-3 gap-1 mt-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-center">
                  <button 
                    onClick={() => setApprovalFilter('All')}
                    className={`text-[10px] py-1 font-bold rounded cursor-pointer ${approvalFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setApprovalFilter('Exceptions')}
                    className={`text-[10px] py-1 font-bold rounded cursor-pointer ${approvalFilter === 'Exceptions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Escalations
                  </button>
                  <button 
                    onClick={() => setApprovalFilter('Closed')}
                    className={`text-[10px] py-1 font-bold rounded cursor-pointer ${approvalFilter === 'Closed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Closed
                  </button>
                </div>
              </div>

              {/* Transactions list layout */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredApprovalList.map(tx => {
                  const isActive = tx.id === activeTxnId;
                  const hasDiscrepancy = tx.matchDetails.status === 'MISMATCH';
                  
                  return (
                    <button 
                      key={tx.id}
                      onClick={() => setActiveTxnId(tx.id)}
                      className={`w-full p-4 text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isActive ? 'bg-orange-50/60 border-l-4 border-[#E87722]' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E87722] font-mono">{tx.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                          tx.currentStage === 'CLOSED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-orange-50 text-[#E87722] border-orange-100'
                        }`}>
                          {tx.currentStage}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis block">{tx.vendorName}</span>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-600">${tx.amount.toLocaleString()}</span>
                        <span className={`flex items-center gap-1 font-semibold ${hasDiscrepancy ? 'text-rose-600' : 'text-slate-450'}`}>
                          {hasDiscrepancy ? '⚠️ DISCREPANCY' : '✓ MATCH CLEAN'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main Interactive Details space on Right */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
              
              {/* Main Content Header */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
                <span className="text-[10px] text-[#E87722] font-bold tracking-wider block">GOVERNANCE AUDIT IN PROGRESS FOR VOUCHER</span>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Transaction {activeTxn.id}
                      <span className="text-xs font-mono font-normal text-slate-500">&#8212; Invoice Ref: {activeTxn.invoiceNumber}</span>
                    </h1>
                    <p className="text-xs text-slate-550 font-sans mt-0.5">
                      Vendor name: <b className="text-slate-800 font-semibold">{activeTxn.vendorName}</b> &nbsp;|&nbsp; 
                      PO linked: <b className="text-slate-600 font-mono">{activeTxn.poReference}</b> &nbsp;|&nbsp;
                      GR reference: <b className="text-slate-600 font-mono">{activeTxn.grReference}</b>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-slate-900 block">${activeTxn.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold tracking-wider uppercase">AUTHORIZED LIMIT CATEGORY</span>
                  </div>
                </div>
              </div>

              {/* 5-Step Horizontal Progress Tracker */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex items-center justify-between">
                {[
                  { label: 'Matching', stage: 'MATCHING', step: 1 },
                  { label: 'Approval Queue', stage: 'PENDING APPROVAL', step: 2 },
                  { label: 'Approved & Authorised', stage: 'APPROVED', step: 3 },
                  { label: 'Bank Clearing', stage: 'RECONCILING', step: 4 },
                  { label: 'Closed / Locked', stage: 'CLOSED', step: 5 },
                ].map((step, idx) => {
                  let isCurrent = activeTxn.currentStage === step.stage || (activeTxn.currentStage === 'APPROVED' && step.step === 3);
                  let isDone = false;

                  // Simplify step computation
                  if (activeTxn.currentStage === 'CLOSED') isDone = true;
                  else if (activeTxn.currentStage === 'RECONCILING' && step.step < 4) isDone = true;
                  else if (activeTxn.currentStage === 'PENDING APPROVAL' && step.step < 2) isDone = true;
                  
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center gap-2 flex-1 relative z-10">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                          isDone 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : isCurrent 
                              ? 'bg-[#E87722] text-white border-[#E87722] shadow-xs' 
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {isDone ? '✓' : step.step}
                        </div>
                        <span className={`text-[10px] font-bold ${isCurrent ? 'text-[#E87722]' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < 4 && (
                        <div className={`h-[1.5px] flex-1 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Governance Authorization Card - Centered and prominent */}
              <div className="max-w-xl mx-auto w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-[#E87722] animate-pulse" />
                    GOVERNANCE AUTHORIZATION WORKFLOW (SOX)
                  </span>
                  <span className="text-[10px] bg-orange-50 text-[#E87722] px-2py-0.5 px-2.5 py-1 text-xs rounded border border-orange-200 font-semibold font-mono">
                    TIER 2 SIGN-OFF REQUIRED
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Authorized asignee details */}
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-150 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 tracking-wider font-semibold block uppercase">RULE LIMIT POLICY</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">Vouchers &gt; $10,000 threshold requirement</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 tracking-wider font-semibold block uppercase">AUTHORIZED ASSIGNEE</span>
                      <p className="text-xs font-bold text-slate-805 mt-0.5 flex items-center gap-1">
                        <User size={12} className="text-[#E87722]" />
                        Sarah Jenkins (SVP Finance)
                      </p>
                    </div>
                  </div>

                  {/* Decision tracking logs */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 tracking-wider font-semibold block uppercase">Audit Decision Log History</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {activeTxn.auditTrail.map((log, lIdx) => (
                        <div key={lIdx} className="bg-slate-50/70 p-2.5 rounded text-[10px] border border-slate-200/60 flex items-start justify-between">
                          <div>
                            <span className="text-[#E87722] font-bold font-mono">[{log.agent}]</span> &nbsp;
                            <span className="text-slate-800 font-medium">{log.action}</span>
                            <p className="text-slate-550 mt-0.5 font-mono">{log.result}</p>
                          </div>
                          <span className="text-slate-400 shrink-0 text-right text-[9px] font-mono">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note Section (Interactive Field) */}
                  {activeTxn.currentStage === 'PENDING APPROVAL' && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase flex justify-between">
                        <span>APPROVER SIGN-OFF REMEDIAL NOTES (OPTIONAL)</span>
                        <span className={isNoteFocused ? 'text-[#E87722]' : 'text-slate-500'}>
                          {isNoteFocused ? 'Editing...' : 'Read-write slot'}
                        </span>
                      </label>
                      <input 
                        type="text" 
                        value={approverNotes}
                        onChange={(e) => setApproverNotes(e.target.value)}
                        onFocus={() => setIsNoteFocused(true)}
                        onBlur={() => setIsNoteFocused(false)}
                        placeholder="e.g., Variance justified from delivery receipts. Authorized."
                        className="w-full bg-white text-xs text-slate-800 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722] transition-colors"
                      />
                    </div>
                  )}

                  {/* Controls Actions for Approve and Reject */}
                  {activeTxn.currentStage === 'PENDING APPROVAL' ? (
                    <div className="pt-3 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleApproveInvoice(true)}
                        className="bg-white hover:bg-slate-50 text-rose-600 border border-slate-200 rounded-lg text-xs font-bold py-2.5 transition-all text-center cursor-pointer select-none"
                      >
                        Reject & Dispute Invoice
                      </button>
                      <button 
                        onClick={() => handleApproveInvoice(false)}
                        className="bg-[#E87722] hover:bg-[#c05a00] text-white border-0 rounded-lg text-xs font-bold py-2.5 transition-all text-center cursor-pointer select-none shadow-xs"
                      >
                        Approve Invoice & Release
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        ✔ GOVERNANCE PROCESS CLEARED
                      </span>
                      <span className="text-slate-500 italic">No action needed at this step</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

         {/* ======================================= */}
        {/* TAB 3: RECONCILIATION AGENT WORKFLOW     */}
        {/* ======================================= */}
        {activeTab === 'reconciliation' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-transparent" id="tab-content-reconciliation">
            
            {/* Maintain exact layout designated without modifications */}
            <div id="reconciliation-agent-board" className="flex-1 flex flex-col gap-6 animate-fadeIn">
              
              {/* Status banner detailing active bank mapping feed */}
              <div className="bg-white border border-slate-205 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 rounded-lg text-[#E87722]">
                    <Database size={24} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase font-sans tracking-wider">CITIBANK NY OPERATING WIRE ACCOUNT FEED</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Monitoring continuous settlement postings against Citibank SWIFT MT940 statement arrays daily.</p>
                  </div>
                </div>
                <div className="flex bg-slate-50 px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono gap-4">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-semibold uppercase tracking-wider">TARGET ROUTING GL</span>
                    <span className="text-slate-900 text-xs font-bold font-mono">102100 - CITI EXP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-semibold uppercase tracking-wider">ACTIVE SWIFT REF</span>
                    <span className="text-emerald-700 font-bold font-mono">FT-910248231</span>
                  </div>
                </div>
              </div>

              {/* Main Side By Side Clearing Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Payment Details Sheet */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-705 font-sans uppercase tracking-wider">POSTED WIRE TRANSFERS & DISBURSEMENT ARRAYS</h3>
                  </div>
                  <div className="p-5 space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-450 text-[9px] block font-semibold uppercase tracking-wider">PAYMENT VALUE AMOUNT</span>
                        <span className="text-slate-900 font-bold text-base mt-1 block font-mono">${activeTxn.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 text-[9px] block font-semibold uppercase tracking-wider">MATCHING STATUS IN FEED</span>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full mt-1 inline-flex items-center gap-1 border ${
                          activeTxn.currentStage === 'CLOSED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250/60' 
                            : 'bg-amber-50 text-amber-800 border-amber-250/60 shadow-3xs animate-pulse'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${activeTxn.currentStage === 'CLOSED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {activeTxn.currentStage === 'CLOSED' ? 'POST MATCH CLEARED' : 'PENDING WIRE MATCH'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-4 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold font-sans">Citi SWIFT Post ID</span>
                        <span className="text-slate-700 font-bold">CITI-ACH-2026-FT91024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold font-sans">Payment Value Date</span>
                        <span className="text-slate-600">2026-06-05 UTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold font-sans">Target Recipient</span>
                        <span className="text-slate-900 font-bold font-sans">{activeTxn.vendorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. GL Posting Clearing Control Desk */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-705 font-sans uppercase tracking-wider">AUTONOMOUS MATCH RECONCILIATOR</h3>
                    <span className="text-[10px] text-emerald-700 font-bold">✔ 105% EXTRACTION MATCH</span>
                  </div>
                  <div className="p-5 space-y-4">
                    {activeTxn.currentStage === 'RECONCILING' ? (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-sans italic">
                          Wait-audit criteria passed: Citibank operating wires matched reference parameters (Voucher: {activeTxn.id}, Vendor: {activeTxn.vendorName}) exactly. Ready to post final settlement transactions.
                        </p>
                        
                        {/* Interactive Action Button to lock GL Ledger */}
                        <button 
                          onClick={handlePostToGL}
                          id="btn-post-to-gl"
                          className="w-full bg-[#E87722] hover:bg-[#c05a00] text-white font-bold py-3 px-4 rounded-lg text-xs tracking-wider border-0 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer select-none"
                        >
                          <Plus size={15} />
                          <span>POST AND RECONCILE TO GENERAL LEDGER</span>
                        </button>
                      </div>
                    ) : activeTxn.currentStage === 'CLOSED' ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg text-xs space-y-2.5">
                        <span className="text-emerald-700 font-bold block flex items-center gap-1.5 text-sm">
                          <CheckCircle2 size={16} /> LEDGER LOCKED & RECONCILED OK
                        </span>
                        <p className="text-slate-600 font-sans leading-relaxed">
                          Ledger database entries posted successfully. Transaction locked and closed for the active fiscal period under audit trail credentials.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg text-xs text-center text-slate-500 italic space-y-2">
                        <p className="font-medium text-slate-600">No active settlement queue items loaded for active selection id: {activeTxn.id}.</p>
                        <p className="text-[10px] font-sans text-slate-450 leading-relaxed">Ensure you click "Approve Invoice & Release" under Tab 2 to route items into the reconciliation posting step.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Ledger Summary Table (Always available at the bottom of Tab 3) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-4">
                <div className="p-4 border-b border-slate-202 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">GL Clearing Entries and History</span>
                  <span className="text-[10px] text-slate-500 font-semibold font-sans">Last 5 successful postings</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold tracking-wider font-sans">
                        <th className="p-4">Post Reference ID</th>
                        <th className="p-4">Fiscal Date</th>
                        <th className="p-4">Recipient Vendor</th>
                        <th className="p-4">General Ledger Account</th>
                        <th className="p-4 text-right">Value Amount</th>
                        <th className="p-4 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-sans">
                      {ledger.map((ld, index) => (
                        <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-bold text-[#E87722] font-mono">{ld.id}</td>
                          <td className="p-4 text-slate-500 font-mono">{ld.date}</td>
                          <td className="p-4 text-slate-900 font-bold font-sans">{ld.vendor}</td>
                          <td className="p-4 text-slate-655 font-mono">{ld.account}</td>
                          <td className="p-4 text-right text-emerald-700 font-bold font-mono">${ld.amount.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold text-[10px]">
                                {ld.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ======================================= */}
      {/* RIGHT DRAWER: CONVERSATIONAL ASSISTANT */}
      {/* ======================================= */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fadeIn">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsChatOpen(false)} />
          <div className="w-[420px] bg-white border-l border-slate-205 h-full flex flex-col relative z-50 shadow-2xl animate-slideLeft">
            
            {/* Header top drawer */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h3 className="text-xs font-bold text-slate-850 font-sans leading-none tracking-wide">FINFLOW CO-PILOT ASSIST</h3>
                  <span className="text-[9px] text-slate-500 block font-sans font-semibold mt-1">Active: {activeAgentBot}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer font-bold select-none border-0 bg-transparent text-sm"
              >
                ✕
              </button>
            </div>

            {/* Select bot context line */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 text-[10px] shrink-0 font-sans">
              <span className="text-slate-500 font-semibold flex items-center">Target Expert Team:</span>
              <button 
                onClick={() => setActiveAgentBot('Payables Agent')}
                className={`px-2 py-0.5 rounded cursor-pointer text-[10px] font-bold ${activeAgentBot === 'Payables Agent' ? 'bg-[#E87722] text-white border-0' : 'text-slate-550 hover:bg-slate-100'}`}
              >
                1. Payables
              </button>
              <button 
                onClick={() => setActiveAgentBot('Approval Orchestrator')}
                className={`px-2 py-0.5 rounded cursor-pointer text-[10px] font-bold ${activeAgentBot === 'Approval Orchestrator' ? 'bg-[#E87722] text-white border-0' : 'text-slate-550 hover:bg-slate-100'}`}
              >
                2. Approval
              </button>
              <button 
                onClick={() => setActiveAgentBot('Reconciliation Agent')}
                className={`px-2 py-0.5 rounded cursor-pointer text-[10px] font-bold ${activeAgentBot === 'Reconciliation Agent' ? 'bg-[#E87722] text-white border-0' : 'text-slate-550 hover:bg-slate-100'}`}
              >
                3. Reconcile
              </button>
            </div>

            {/* Messages box list scrolling and auto-filling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/30">
              {chatMessages[activeAgentBot]?.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 font-semibold mb-1 uppercase font-sans tracking-tight">{msg.sender} &middot; {msg.timestamp}</span>
                    <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] shadow-2xs border ${
                      isUser 
                        ? 'bg-[#E87722] text-white font-semibold rounded-tr-none border-[#E87722]' 
                        : 'bg-white text-slate-800 border-slate-200/80 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 py-2">
                  <div className="w-2 h-2 rounded-full bg-[#E87722] animate-bounce"></div>
                  <span>Agent analyzing general ledger guidelines...</span>
                </div>
              )}
            </div>

            {/* Bottom Form input dispatch to proxy */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder="Ask agent for extraction audit, dispute templates..."
                  className="w-full bg-slate-50 text-xs text-slate-800 p-2.5 rounded-lg border border-slate-250 focus:outline-none focus:ring-1 focus:ring-[#E87722] focus:border-[#E87722]"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-[#E87722] hover:bg-[#c05a00] text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-0 shadow-2xs"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* INGESTION SIMULATOR MULTIPLEX MODAL     */}
      {/* ======================================= */}
      {/* Real CSV upload drawer (replaces old simulated modal) */}
      <UploadDrawer open={showUploadModal} onClose={() => setShowUploadModal(false)} />

    </div>
  );
}
