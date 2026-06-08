import React, { useState } from 'react';
import {
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  FileCheck2,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  Check,
  X,
  FileText,
  Download,
  Calendar,
  Send,
  UserCheck,
  Percent,
  CheckCircle2,
  Users
} from 'lucide-react';

interface CoreFinanceTriadProps {
  onBack: () => void;
  systemTime: string;
}

export default function CoreFinanceTriad({ onBack, systemTime }: CoreFinanceTriadProps) {
  // Main Tab within the Triad view
  const [triadTab, setTriadTab] = useState<'treasury' | 'reporting' | 'audit'>('treasury');

  // Flash Banner Alert Diminishing/Closing
  const [showSystemFlash, setShowSystemFlash] = useState(true);

  // Active Interactive Details (Exploratory details)
  const [selectedEntityCash, setSelectedEntityCash] = useState<string | null>(null);
  const [selectedAuditTxn, setSelectedAuditTxn] = useState<string | null>(null);
  const [selectedOutlierWeek, setSelectedOutlierWeek] = useState<{ category: string, week: string } | null>(null);

  // Simulation states
  // 1. Treasury
  const [europeCash, setEuropeCash] = useState<number>(920000);
  const [usdEurExposure, setUsdEurExposure] = useState<number>(1800000);
  const [apacSgCash, setApacSgCash] = useState<number>(5100000);
  const [actionTerminalLogs, setActionTerminalLogs] = useState<string[]>([
    "System Ready. Liquidity limits automatically calibrated against risk mandates."
  ]);

  // 2. Reporting
  const [overlayPriorYear, setOverlayPriorYear] = useState<boolean>(false);
  const [isGeneratingMIs, setIsGeneratingMIs] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState<boolean>(false);
  const [activeCommentaryTab, setActiveCommentaryTab] = useState<'opex' | 'margin' | 'ebitda'>('opex');

  // 3. Audit Controls
  const [inspectedCase, setInspectedCase] = useState<any | null>(null);
  const [auditSweepRunning, setAuditSweepRunning] = useState<boolean>(false);
  const [complianceScore, setComplianceScore] = useState<number>(80);
  const [triggeredControlsList, setTriggeredControlsList] = useState<any[]>([
    {
      id: 'TXN-1038',
      risk: 'HIGH',
      rule: 'Segregation of Duties Violation',
      details: 'Pinnacle Contractors — User A initiated payment, User A approved release bypass.',
      date: '2026-05-28',
      value: 31500,
      verificationStatus: 'Pending Review',
      actionTaken: null
    },
    {
      id: 'TXN-1049',
      risk: 'MEDIUM',
      rule: 'Approval Limit Safeguard Exception',
      details: 'Vanguard Tech Group — Transaction value exceeded branch manager auto-clearance threshold ($40k).',
      date: '2026-06-01',
      value: 49500,
      verificationStatus: 'Awaiting Action',
      actionTaken: null
    },
    {
      id: 'TXN-1025',
      risk: 'LOW',
      rule: 'Anomalous Payment Schedule Pattern',
      details: 'Apex Logistics LLC — Secondary shipment charge filed outside the typical net billing period.',
      date: '2026-05-20',
      value: 14200,
      verificationStatus: 'Checked Autonomously',
      actionTaken: null
    }
  ]);

  // Scheduler Form State
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('weekly');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [schedulerStatus, setSchedulerStatus] = useState<string | null>(null);

  // Helper additions for terminal logger
  const logAction = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setActionTerminalLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  // Interactive functions
  const handleExecuteHedge = () => {
    if (usdEurExposure <= 1000000) {
      alert("Hedge coverage is already optimised under the threshold policy guidelines.");
      return;
    }
    const hedgedAmt = 500000;
    setUsdEurExposure(prev => prev - hedgedAmt);
    logAction(`Hedged USD/EUR position: Executed 30-day forward contract for $${hedgedAmt.toLocaleString()}. Redefined total exposure.`);
    alert(`Success: Forward contract registered with JPMorgan Treasury Operations Desk. FX exposure lowered relative to $1.00M tolerance policy limits.`);
  };

  const handleInitiateTransfer = () => {
    if (europeCash >= 970000) {
      alert("Inter-entity transfer was already successfully cleared and settled.");
      return;
    }
    setEuropeCash(prev => prev + 50000);
    logAction("Initiated transfer of €50,000 from consolidated HQ Cash Registry into Europe operating accounts.");
    alert("Success: Instant ACH funding initiated via Citibank global cash pool routing. Europe operating account capital replenished by €50k.");
  };

  const handleDeployApacSurplus = () => {
    if (apacSgCash <= 4800000) {
      alert("APAC entity cache already optimized.");
      return;
    }
    setApacSgCash(prev => prev - 300000);
    logAction("Reallocated S$300,000 idle funds to Singapore Overseas Banking Corp interest optimizer deposit (Tier-1 Yield rate: 4.8%).");
    alert("Success: S$300,000 swept to 7-day notice interest deposit to harvest active yields safely.");
  };

  const runMIsGeneration = () => {
    setIsGeneratingMIs(true);
    setGenerationProgress(10);
    const interval = setInterval(() => {
      setGenerationProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsGeneratingMIs(false);
          logAction("Financial MIS & Management Analytics report generated successfully.");
          alert("Success: Live Management Information System Scorecard re-calculated and validated. Scorecard synchronized with standard budget projections.");
          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  const handleAuditSweep = () => {
    setAuditSweepRunning(true);
    setTimeout(() => {
      setAuditSweepRunning(false);
      setComplianceScore(95);
      logAction("Compliance scan finished. Recertified segregation matches. Index updated safely.");
      alert("Success: Deep audit sweep completed across past 41.2k rows. Clean status index verified for 95% of controls.");
    }, 1200);
  };

  const executeControlRemediation = (caseId: string, resolution: 'remit' | 'flag' | 'recheck') => {
    setTriggeredControlsList(prev => prev.map(item => {
      if (item.id === caseId) {
        let text = "";
        if (resolution === 'remit') text = "REMEDIATED — Approved with secondary override signatures.";
        if (resolution === 'flag') text = "ESCALATED — Marked as audit risk case block.";
        if (resolution === 'recheck') text = "RE-SCAN QUEUED — Reconfigured matching boundaries.";
        return {
          ...item,
          verificationStatus: 'Completed',
          actionTaken: text
        };
      }
      return item;
    }));
    setInspectedCase(null);
    logAction(`Remediated item ${caseId}: Option [${resolution.toUpperCase()}] committed.`);
    alert(`Audit registry updated for ${caseId}. Remit log stored in ledger archive.`);
  };

  const handleInstallScheduler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      alert("Please provide a representative analyst email.");
      return;
    }
    setSchedulerStatus(`ACTIVE — Distribution set to ${scheduleTime.toUpperCase()} for recipient ${recipientEmail}`);
    setSchedulerOpen(false);
    logAction(`Configured distribution automation scheduler triggers: frequency set to ${scheduleTime}.`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 relative animate-fadeIn select-none px-6 py-6 font-sans">
      
      {/* Back button and banner bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-all cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs"
        >
          <ChevronRight size={14} className="rotate-180" />
          <span>Back to Hub Console</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">WORKSPACE: CORE INTEGRATION</span>
          <span className="h-2 w-2 rounded-full bg-[#E87722]"></span>
        </div>
      </div>

      {/* Hero Banner header */}
      <div className="bg-white border border-slate-250 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-[#E87722] rounded-xl border border-orange-100 shrink-0">
            <SlidersHorizontal size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">Core Finance Triad</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Consolidated real-time operational dashboard orchestrating critical liquidity, financial indicators, and compliance metrics.
            </p>
          </div>
        </div>

        {/* Triple Tab controller at top header - formatted perfectly */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 self-start md:self-center shrink-0">
          <button
            onClick={() => setTriadTab('treasury')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              triadTab === 'treasury'
                ? 'bg-white text-[#E87722] shadow-2xs border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-955'
            }`}
          >
            <TrendingUp size={13} />
            <span>Treasury</span>
          </button>

          <button
            onClick={() => setTriadTab('reporting')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              triadTab === 'reporting'
                ? 'bg-white text-[#E87722] shadow-2xs border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-955'
            }`}
          >
            <FileText size={13} />
            <span>Reporting Scorecard</span>
          </button>

          <button
            onClick={() => setTriadTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              triadTab === 'audit'
                ? 'bg-white text-[#E87722] shadow-2xs border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-955'
            }`}
          >
            <ShieldAlert size={13} />
            <span>Audit &amp; Compliance</span>
          </button>
        </div>
      </div>

      {/* System Warning Flash Banner - interactive! */}
      {showSystemFlash && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3 rounded-xl flex items-center justify-between text-xs gap-3 mb-6 shadow-2xs">
          <div className="flex items-center gap-2.5 font-medium">
            <span id="triad-flash-badge" className="bg-[#E87722] text-white text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wide font-mono">
              SYSTEM FLASH
            </span>
            <span className="text-slate-700">
              ⚡ <b>1 Cash Position Below Threshold</b> &middot; <b>1 SoD Breach Under Audit</b> &middot; Tactical variance reports calculated.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setTriadTab('treasury'); setSelectedEntityCash('Europe'); }}
              className="text-xs font-bold text-[#E87722] hover:underline cursor-pointer"
            >
              Inspect Cash &rarr;
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => { setTriadTab('audit'); setSelectedAuditTxn('TXN-1038'); }}
              className="text-xs font-bold text-[#E87722] hover:underline cursor-pointer"
            >
              Review Breaches &rarr;
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setShowSystemFlash(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-semibold cursor-pointer pl-1"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* MAIN DYNAMIC CONTENT SWITCHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* ======================================================== */}
        {/* TAB 1: TREASURY VIEW                                     */}
        {/* ======================================================== */}
        {triadTab === 'treasury' && (
          <>
            {/* Left Column: Entity Liquidity Matrix */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                
                {/* Header block */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">ENTITY MATRIX &middot; LIQUIDITY</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Direct global bank accounts status</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-bold border border-emerald-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Bank Feeds
                  </span>
                </div>

                {/* Table details */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-150">
                        <th className="px-5 py-3">Entity</th>
                        <th className="px-5 py-3 text-right">USD Balance</th>
                        <th className="px-5 py-3 text-right">EUR Balance</th>
                        <th className="px-5 py-3 text-right">SGD Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      
                      {/* HQ (USD) */}
                      <tr 
                        onClick={() => setSelectedEntityCash('HQ')}
                        className={`hover:bg-slate-50/70 transition-all cursor-pointer ${selectedEntityCash === 'HQ' ? 'bg-orange-50/40' : ''}`}
                      >
                        <td className="px-5 py-4 font-extrabold text-slate-900 font-mono">HQ (USD)</td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold font-mono text-[#E87722] hover:underline">$15.80M</span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                      </tr>

                      {/* Europe EUR */}
                      <tr 
                        onClick={() => setSelectedEntityCash('Europe')}
                        className={`hover:bg-slate-50/70 transition-all cursor-pointer ${selectedEntityCash === 'Europe' ? 'bg-orange-50/40' : ''}`}
                      >
                        <td className="px-5 py-4 font-extrabold text-slate-900 font-mono">Europe (EUR)</td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-bold font-mono px-2 py-1 rounded ${europeCash < 950000 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-orange-50 text-[#E87722]'}`}>
                            €{europeCash.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                      </tr>

                      {/* Asia-Pac SGD */}
                      <tr 
                        onClick={() => setSelectedEntityCash('APAC')}
                        className={`hover:bg-slate-50/70 transition-all cursor-pointer ${selectedEntityCash === 'APAC' ? 'bg-orange-50/40' : ''}`}
                      >
                        <td className="px-5 py-4 font-extrabold text-slate-900 font-mono">Asia-Pac (SGD)</td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                        <td className="px-5 py-4 text-right text-slate-400 font-medium">—</td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold font-mono text-[#E87722] hover:underline">S${(apacSgCash / 1000000).toFixed(2)}M</span>
                        </td>
                      </tr>

                      {/* Group total */}
                      <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                        <td className="px-5 py-4 text-slate-700">Group Total</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">$15.80M</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">€{(europeCash / 1000).toFixed(0)}k</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">S${(apacSgCash / 1000000).toFixed(2)}M</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 leading-normal">
                  💡 <i>Click Europe, HQ, or APAC row to reveal active bank details and corresponding asset safeguards safeguards.</i>
                </div>
              </div>

              {/* Dynamic Entity Cash Safeguards Overlay inside dashboard */}
              {selectedEntityCash && (
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs relative transition-all duration-150 animate-fadeIn">
                  <button 
                    onClick={() => setSelectedEntityCash(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold py-1 px-2 border-0 bg-transparent text-sm"
                  >
                    &times;
                  </button>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">SAFEGUARDS &middot; {selectedEntityCash}</h4>
                  
                  {selectedEntityCash === 'Europe' ? (
                    <div className="mt-3 text-xs space-y-2 text-slate-600">
                      <p className="font-semibold text-slate-805">Active Safeguard Limit: <b className="text-rose-700 font-mono">Min €200k Liquidity Shield</b></p>
                      <p className="leading-relaxed text-slate-500">
                        Currently verified Europe pools: <b>Deutsche Bank EUR Operations Acc</b> — Balance €{europeCash.toLocaleString()}. 
                        {europeCash < 950000 ? (
                          <span className="text-amber-700 block mt-1 font-bold">⚠️ Warning: Current levels are low. Transfer action highly recommended.</span>
                        ) : (
                          <span className="text-emerald-700 block mt-1 font-bold">✓ Safeguard level recovered to baseline safety net.</span>
                        )}
                      </p>
                    </div>
                  ) : selectedEntityCash === 'HQ' ? (
                    <div className="mt-3 text-xs space-y-2 text-slate-600">
                      <p className="font-semibold text-slate-805">Active Safeguard Limit: <b className="text-emerald-700 font-mono">No Cap — Main Operations Base</b></p>
                      <p className="leading-relaxed text-slate-500">
                        Consolidated HQ Pools verified: <b>Citibank Core Sweep Acc</b> — Balance $15.80M. Liquid assets cleared for direct global wires.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs space-y-2 text-slate-600">
                      <p className="font-semibold text-slate-805">Active Safeguard Limit: <b className="text-[#E87722] font-mono">S$4.5M Operating Cap</b></p>
                      <p className="leading-relaxed text-slate-500">
                        Current APAC pools: <b>OCBC Operating SGD Acc</b> — Balance S${(apacSgCash / 1000000).toFixed(2)}M. Excess yields eligible for yield farming sweep.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FX Exposure Limits progress meters */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">FX EXPOSURE &middot; USD BASIS</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">System threshold: limits triggers alerts at $1.0M</p>
                  </div>
                  {usdEurExposure > 1000000 ? (
                    <span className="text-[10px] bg-rose-550 bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-0.5 rounded font-bold font-mono tracking-wider">
                      ● LIMIT BREACH DETECTED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-50 border-emerald-100 border text-emerald-700 px-2.5 py-0.5 rounded font-bold font-mono tracking-wider">
                      ✓ EXPOSURE COMFORTABLE
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* USD/EUR */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-700 font-mono">USD/EUR</span>
                      <div className="space-x-1">
                        <span className={`font-mono ${usdEurExposure > 1000000 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          ${(usdEurExposure / 1000).toFixed(0)}k
                        </span>
                        <span className="text-slate-400">&middot; Limit: $1.00M</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${usdEurExposure > 1000000 ? 'bg-rose-500' : 'bg-[#E87722]'}`} 
                        style={{ width: `${Math.min((usdEurExposure / 1500000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* USD/GBP */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-700 font-mono font-medium">USD/GBP</span>
                      <div>
                        <span className="font-mono text-slate-600">$750k</span>
                        <span className="text-slate-400 font-normal">&middot; Limit: $1.00M</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  {/* SGD/USD */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-700 font-mono font-medium">SGD/USD</span>
                      <div>
                        <span className="font-mono text-slate-600">$950k</span>
                        <span className="text-slate-400 font-normal">&middot; Limit: $1.00M</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>

                  {/* EUR/GBP */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                      <span className="text-slate-700 font-mono font-medium">EUR/GBP</span>
                      <div>
                        <span className="font-mono text-slate-600">$350k</span>
                        <span className="text-slate-400 font-normal">&middot; Limit: $1.00M</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recommendations & Projections */}
            <div className="space-y-6">
              
              {/* Cash Projection Sparks */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono mb-4">CASH PROJECTION MODEL</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Item 1 */}
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">7-Day Run</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-lg font-bold text-slate-900 font-mono">+2.8%</span>
                      <span className="text-[9.5px] font-bold text-emerald-600 tracking-wider">SECURE</span>
                    </div>
                    {/* Tiny visual line */}
                    <div className="h-7 w-full flex items-end gap-1 mt-2">
                      <span className="w-full bg-emerald-100 hover:bg-emerald-200 h-2 rounded-xs" />
                      <span className="w-full bg-emerald-100 hover:bg-emerald-200 h-3 rounded-xs" />
                      <span className="w-full bg-emerald-200 hover:bg-emerald-300 h-2.5 rounded-xs" />
                      <span className="w-full bg-emerald-300 hover:bg-emerald-400 h-4 rounded-xs" />
                      <span className="w-full bg-[#E87722] h-[3px] rounded-xs mb-1 bg-clip-border" /> {/* Guideline boundary floor */}
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-none">Min Policy Boundary Floor</span>
                  </div>

                  {/* Item 2 */}
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">30-Day Run</span>
                    <div className="flex justify-between items-baseline mt-1 font-mono">
                      <span className="text-lg font-bold text-rose-600">-16.5%</span>
                      <span className="text-[9.5px] font-bold text-rose-600 tracking-wider">CROSSING</span>
                    </div>
                    {/* Tiny visual line reversing */}
                    <div className="h-7 w-full flex items-end gap-1 mt-2">
                      <span className="w-full bg-rose-300 h-4 rounded-xs" />
                      <span className="w-full bg-rose-200 h-3.5 rounded-xs" />
                      <span className="w-full bg-rose-200 h-2 rounded-xs" />
                      <span className="w-full bg-rose-100 h-1 rounded-xs" />
                      <span className="w-full bg-[#E87722] h-[3px] rounded-xs mb-1.5" />
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-none font-medium">Projected Crossing (18d)</span>
                  </div>
                </div>
              </div>

              {/* Recommendations Call to Actions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">RECOMMENDATIONS</h3>

                {/* Hedging */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Hedge USD/EUR Exposure</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1">
                      Current open position is ${(usdEurExposure / 1000000).toFixed(2)}M, which exceeds the limit of $1.0M. Recommend executing forward hedge contracts for active protection.
                    </p>
                  </div>
                  <button
                    onClick={handleExecuteHedge}
                    className="w-full bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg cursor-pointer transition-colors"
                  >
                    Execute Forward Contract
                  </button>
                </div>

                {/* Inter-Entity */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Inter-Entity Capital Transfer</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1">
                      Europe EUR balance (€{europeCash.toLocaleString()}) remains below baseline safeguards shield limit (€200k). Sweep funds from HQ master pool.
                    </p>
                  </div>
                  <button
                    onClick={handleInitiateTransfer}
                    className="w-full bg-[#E87722] hover:bg-orange-600 text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg cursor-pointer transition-colors border-0"
                  >
                    Initiate Transfer
                  </button>
                </div>

                {/* Yield Optimizer */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Yield Optimization sweep</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1">
                      APAC accounts hold S${(apacSgCash/1000000).toFixed(2)}M SGD, clear S$300k surplus for high-yielding interest notice placements.
                    </p>
                  </div>
                  <button
                    onClick={handleDeployApacSurplus}
                    className="w-full bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg cursor-pointer transition-colors"
                  >
                    Deploy APAC Surplus
                  </button>
                </div>

              </div>

              {/* Action logs terminal block */}
              <div className="bg-[#404040] text-slate-200 p-4 rounded-2xl shadow-2xs font-mono text-[10px] leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">TERMINAL LOGS: CONSOLE WORKSPACE</span>
                <div className="h-28 overflow-y-auto space-y-1">
                  {actionTerminalLogs.map((log, index) => (
                    <div key={index} className="text-emerald-400">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MIS REPORTING SCORECARD VIEW                       */}
        {/* ======================================================== */}
        {triadTab === 'reporting' && (
          <>
            {/* Left Column: Scorecard Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                
                {/* Header controls block */}
                <div className="flex items-center justify-between mb-5 select-none">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">FINANCIAL SCORECARD</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Key metrics compared with initial operating budget</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Overlay prior metrics */}
                    <button
                      onClick={() => setOverlayPriorYear(!overlayPriorYear)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                        overlayPriorYear 
                          ? 'bg-[#404040] text-white border-slate-400' 
                          : 'bg-white text-slate-600 border-slate-250 hover:bg-slate-50'
                      }`}
                    >
                      Overlay Prior Budget: {overlayPriorYear ? 'ON' : 'OFF'}
                    </button>

                    {/* Recalculate */}
                    <button
                      onClick={runMIsGeneration}
                      disabled={isGeneratingMIs}
                      className="bg-[#E87722] hover:bg-orange-650 disabled:bg-orange-250 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 border-0 transition-colors"
                    >
                      <RefreshCw size={11} className={isGeneratingMIs ? 'animate-spin' : ''} />
                      Generate App Release
                    </button>
                  </div>
                </div>

                {isGeneratingMIs && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-[#E87722] transition-all duration-150" style={{ width: `${generationProgress}%` }} />
                  </div>
                )}

                {/* Scorecards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Revenue */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">REVENUE</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">$36.80M</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-emerald-600 font-bold font-mono">+5%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: $35.05M</span>}
                  </div>

                  {/* Gross Margin */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">GROSS MARGIN %</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">40.1%</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-rose-600 font-bold font-mono">-18%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: 48.9%</span>}
                  </div>

                  {/* Opex */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">OPEX</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">$14.90M</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-rose-600 font-bold font-mono">+5%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: $13.20M</span>}
                  </div>

                  {/* EBITDA */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">EBITDA</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">$5.72M</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-emerald-600 font-bold font-mono">+4%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: $5.50M</span>}
                  </div>

                  {/* DSO */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">DSO</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">47 Days</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-rose-650 font-bold font-mono text-amber-600">+12%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: 42 Days</span>}
                  </div>

                  {/* DPO */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">DPO</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">38 Days</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-slate-500 font-bold font-mono">-5%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: 40 Days</span>}
                  </div>

                  {/* Cash Conversion */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">CASH CONVERSION</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">64 Days</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-amber-600 font-bold font-mono">+7%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: 60 Days</span>}
                  </div>

                  {/* Headcount Cost */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-55/20 hover:border-[#E87722]/50 transition-all">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono block">HEADCOUNT COST</span>
                    <span className="text-xl font-extrabold font-mono text-slate-905 block mt-1.5">$7.40M</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10.5px] text-slate-500 font-bold font-mono">+1%</span>
                      <span className="text-[10px] text-slate-400">vs Budget</span>
                    </div>
                    {overlayPriorYear && <span className="text-[9.5px] text-[#E87722] font-mono font-bold block mt-1.5 border-t border-slate-100 pt-1">Prior: $7.33M</span>}
                  </div>

                </div>
              </div>

              {/* Comprehensive Variance Commentary Section */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">VARIANCE COMMENTARY</h3>
                  <span className="text-[10.5px] bg-[#E87722]/10 text-[#E87722] font-bold px-2 py-0.5 rounded border border-[#E87722]/20">
                    MATERIAL LIMIT ALERTS
                  </span>
                </div>

                <div className="flex border-b border-slate-100 mb-4 gap-1">
                  <button
                    onClick={() => setActiveCommentaryTab('opex')}
                    className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeCommentaryTab === 'opex' 
                        ? 'border-[#E87722] text-[#E87722]' 
                        : 'border-transparent text-slate-450 hover:text-slate-800'
                    }`}
                  >
                    OpEx Overrun (+12.5%)
                  </button>
                  <button
                    onClick={() => setActiveCommentaryTab('margin')}
                    className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeCommentaryTab === 'margin' 
                        ? 'border-[#E87722] text-[#E87722]' 
                        : 'border-transparent text-slate-450 hover:text-slate-800'
                    }`}
                  >
                    Gross Margin Decline (-4% pts)
                  </button>
                  <button
                    onClick={() => setActiveCommentaryTab('ebitda')}
                    className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeCommentaryTab === 'ebitda' 
                        ? 'border-[#E87722] text-[#E87722]' 
                        : 'border-transparent text-slate-450 hover:text-slate-800'
                    }`}
                  >
                    EBITDA Variance (-3.57%)
                  </button>
                </div>

                {activeCommentaryTab === 'opex' && (
                  <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase tracking-wider font-mono text-[10px]">
                        OPERATING EXPENSES &mdash; +12.5% VS BUDGET &middot; +13% PRIOR
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[9px] border border-emerald-100">
                        HIGH CONF
                      </span>
                    </div>
                    <p className="text-slate-550">
                      &quot;OpEx overruns driven by unbudgeted SaaS implementation fees of $120K and expedited cloud data migration consulting across European regional instances. Partially offset by deferred legal expenditures.&quot;
                    </p>
                  </div>
                )}

                {activeCommentaryTab === 'margin' && (
                  <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase tracking-wider font-mono text-[10px]">
                        GROSS MARGIN % &mdash; -4.0PTS VS BUDGET &middot; -10% PRIOR
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[9px] border border-emerald-100">
                        HIGH CONF
                      </span>
                    </div>
                    <p className="text-slate-550">
                      &quot;Gross margin decline generated by 14% higher-than-budgeted raw material input costs in the Southeast Asia shipping channels, combined with delayed pricing model adjustments on local APAC premium tiers.&quot;
                    </p>
                    <button 
                      onClick={() => { alert("Verifying core raw supplier logistics... Item reference verified."); }}
                      className="text-[10px] font-bold text-[#E87722] underline cursor-pointer"
                    >
                      VERIFY INSIGHT &rarr;
                    </button>
                  </div>
                )}

                {activeCommentaryTab === 'ebitda' && (
                  <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase tracking-wider font-mono text-[10px]">
                        EBITDA &mdash; -3.57% VS BUDGET &middot; -4% PRIOR
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono text-[9px] border border-amber-100">
                        MEDIUM CONF
                      </span>
                    </div>
                    <p className="text-slate-550">
                      &quot;EBITDA variance matches direct opex compression, though tempered slightly by favorable high-margin recurring software license wins processed in US sales streams towards the closing days of the period.&quot;
                    </p>
                    <button 
                      onClick={() => { alert("Core accounting reconciliations match software records. Baseline accurate."); }}
                      className="text-[10px] font-bold text-[#E87722] underline cursor-pointer"
                    >
                      VERIFY INSIGHT &rarr;
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Analytics Deliverables */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">ANALYTICS DELIVERABLES</h3>
                
                <div className="grid grid-cols-1 gap-3 text-xs">
                  {/* Item 1 */}
                  <button
                    onClick={() => setShowAnalyticsDetails(!showAnalyticsDetails)}
                    className="flex items-center justify-between p-3.5 border border-slate-205 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-705 text-left bg-transparent"
                  >
                    <div className="space-y-0.5">
                      <span className="block text-slate-900">View MIS Pack</span>
                      <span className="text-[10px] text-slate-450 font-normal">Active monthly reporting layout components</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>

                  {/* Active Pack breakdown overlay */}
                  {showAnalyticsDetails && (
                    <div className="bg-slate-50/50 border border-slate-200/80 p-3.5 rounded-xl space-y-2 text-[11px] text-slate-605 animate-fadeIn">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 uppercase font-mono tracking-wider text-[9px]">MIS PACK SECTIONS</div>
                      <div className="flex justify-between">
                        <span>Sheet 1: Consolidated Balance</span>
                        <span className="text-emerald-700 font-bold">✓ Audit Clearance</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sheet 2: Segment Operational Costs</span>
                        <span className="text-amber-700 font-semibold">⚠️ Variance Check Needed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sheet 3: High Limit Approvals Logs</span>
                        <span className="text-emerald-700 font-bold">✓ Complete</span>
                      </div>
                    </div>
                  )}

                  {/* PDF download simulated trigger */}
                  <button
                    onClick={() => {
                      logAction("Dispatched Management PDF reporting pack compilation request.");
                      alert("Downloading compilation pack FinView_Scorecard_Q2.pdf... Simulation completed.");
                    }}
                    className="flex items-center justify-between p-3.5 border border-slate-205 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-705 text-left bg-transparent"
                  >
                    <div className="space-y-0.5">
                      <span className="block text-slate-900">Download PDF Report Pack</span>
                      <span className="text-[10px] text-slate-450 font-normal">Executive grade formatted overview</span>
                    </div>
                    <Download size={16} className="text-[#E87722]" />
                  </button>

                  {/* Distribution Scheduler */}
                  <button
                    onClick={() => setSchedulerOpen(true)}
                    className="flex items-center justify-between p-3.5 border border-slate-250/90 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E87722] transition-colors font-bold text-left"
                  >
                    <div className="space-y-0.5">
                      <span className="block">Manage Distribution Scheduler</span>
                      <span className="text-[10px] opacity-80 font-normal">Schedule automatic reports releases</span>
                    </div>
                    <Calendar size={16} />
                  </button>

                  {schedulerStatus && (
                    <div className="p-3 bg-slate-100 border border-slate-250/50 rounded-xl text-[10.5px] font-mono text-slate-600 font-semibold leading-normal">
                      ⏰ {schedulerStatus}
                      <button 
                        onClick={() => { setSchedulerStatus(null); setRecipientEmail(''); }}
                        className="text-slate-400 hover:text-slate-700 block mt-1 underline cursor-pointer text-[10px]"
                      >
                        Cancel Scheduler
                      </button>
                    </div>
                  )}
                </div>

                {/* Scheduler Modal/Interface overlay inline and beautiful */}
                {schedulerOpen && (
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 relative animate-fadeIn space-y-3">
                    <button 
                      onClick={() => setSchedulerOpen(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-sm font-bold bg-transparent border-0"
                    >
                      &times;
                    </button>
                    <span className="text-[9.5px] font-extrabold text-[#E87722] uppercase tracking-widest font-mono block">CONFIGURE DISTRIBUTION</span>
                    
                    <form onSubmit={handleInstallScheduler} className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Target Frequency</label>
                        <select 
                          value={scheduleTime} 
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-slate-300"
                        >
                          <option value="daily">Daily Run (08:00 AM)</option>
                          <option value="weekly">Weekly Operational Sweep (Monday)</option>
                          <option value="monthly">Monthly Consolidated MIS (End of Month)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Analyst Recipient Email</label>
                        <input 
                          type="email" 
                          required
                          value={recipientEmail} 
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="e.g. analyst@coreenterprises.com" 
                          className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs focus:outline-slate-300 text-slate-800 font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#E87722] hover:bg-orange-600 text-white font-bold py-2 rounded text-[10px] tracking-wider uppercase border-0 cursor-pointer"
                      >
                        Activate Scheduler Wires
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Action terminal logs */}
              <div className="bg-[#404040] text-slate-200 p-4 rounded-2xl shadow-2xs font-mono text-[10px] leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">TERMINAL LOGS: CONSOLE WORKSPACE</span>
                <div className="h-28 overflow-y-auto space-y-1">
                  {actionTerminalLogs.map((log, index) => (
                    <div key={index} className="text-emerald-400">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AUDIT & COMPLIANCE VIEW                             */}
        {/* ======================================================== */}
        {triadTab === 'audit' && (
          <>
            {/* Left Column: List of Risks and circles gauge */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">TRIGGERED CONTROLS</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Rule exceptions flagged for verification reviews</p>
                  </div>

                  <span className="bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 rounded font-mono text-[10.5px] font-bold">
                    Filter: All Risks
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-150">
                        <th className="px-4 py-2.5">Risk</th>
                        <th className="px-4 py-2.5">TXN ID</th>
                        <th className="px-4 py-2.5">Vulnerability / Rule</th>
                        <th className="px-4 py-2.5 text-right">Value</th>
                        <th className="px-4 py-2.5 text-center">Remediation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {triggeredControlsList.map((item) => (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/70 transition-all ${selectedAuditTxn === item.id ? 'bg-orange-50/20' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded ${
                              item.risk === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              item.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-750 text-amber-700 border border-amber-100' :
                              'bg-sky-50 text-sky-700 border-sky-100 border'
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-[#E87722]">{item.id}</td>
                          <td className="px-4 py-3 text-slate-705 font-medium">
                            <div className="font-semibold block">{item.rule}</div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{item.details}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">${item.value.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            {item.verificationStatus === 'Completed' ? (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold font-mono">
                                REMEDIATED
                              </span>
                            ) : (
                              <button
                                onClick={() => { setInspectedCase(item); setSelectedAuditTxn(item.id); }}
                                className="bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-[10px] px-3 py-1 rounded cursor-pointer transition-colors"
                              >
                                {selectedAuditTxn === item.id ? 'Inspecting' : 'Inspect'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {inspectedCase && (
                  <div className="mt-5 border border-slate-200 p-5 rounded-xl bg-slate-50 relative animate-fadeIn space-y-4">
                    <button 
                      onClick={() => setInspectedCase(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold py-1 px-2 border-0 bg-transparent text-sm"
                    >
                      &times;
                    </button>
                    
                    <div>
                      <span id="case-risk-tag" className="bg-rose-550 bg-rose-50 text-rose-700 border-rose-100 border text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                        RISK VIOLATION AUDIT &middot; {inspectedCase.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{inspectedCase.rule}</h4>
                    </div>

                    <div className="text-xs space-y-3 leading-relaxed text-slate-600">
                      <p><b>Impact Value:</b> <span className="font-mono text-slate-800 font-bold">${inspectedCase.value.toLocaleString()}</span></p>
                      <p><b>Detailed Breach Trace:</b> <span className="text-slate-500 italic">{inspectedCase.details} Dated {inspectedCase.date}.</span></p>
                      
                      <div className="bg-white border rounded-lg p-3">
                        <span className="text-[10px] text-slate-400 block font-bold font-mono">CONFORMANCE CHECKLIST</span>
                        <div className="mt-2 space-y-1.5 text-[11px]">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-705">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 accent-[#E87722]" />
                            <span>Audit trigger matched transaction metadata successfully</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-705">
                            <input type="checkbox" className="rounded border-slate-300 accent-[#E87722]" />
                            <span>Remediated limits checked with respective CFO or Controller</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          onClick={() => executeControlRemediation(inspectedCase.id, 'remit')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg border-0 cursor-pointer text-center"
                        >
                          Confirm &amp; Override
                        </button>
                        <button
                          onClick={() => executeControlRemediation(inspectedCase.id, 'flag')}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg border-0 cursor-pointer text-center"
                        >
                          Flag Escalation
                        </button>
                        <button
                          onClick={() => executeControlRemediation(inspectedCase.id, 'recheck')}
                          className="flex-1 bg-[#404040] hover:bg-[#2d2d2d] text-white font-bold text-[10px] uppercase py-2 tracking-wider rounded-lg border-0 cursor-pointer text-center"
                        >
                          Recheck Rules
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Index radial and outliers ledger */}
            <div className="space-y-6">
              
              {/* Compliance Index Circular Gauge */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs text-center flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full mb-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">COMPLIANCE INDEX</h3>
                  <button
                    onClick={handleAuditSweep}
                    disabled={auditSweepRunning}
                    className="bg-[#404040] hover:bg-[#2d2d2d] disabled:bg-slate-300 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg border-0 cursor-pointer"
                  >
                    {auditSweepRunning ? 'Running Sweep...' : 'Audit Sweep'}
                  </button>
                </div>

                {/* SVG Gauge circle */}
                <div className="relative h-32 w-32 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      stroke="#E87722"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - complianceScore / 100)}`}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{complianceScore}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">INDEX</span>
                  </div>
                </div>

                {/* Summary stats listed horizontal */}
                <div className="grid grid-cols-3 gap-2 w-full border-t border-slate-100 pt-4 mt-2">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">SoD Audit</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono block mt-0.5">-1/1 OK</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Outliers</span>
                    <span className="text-xs font-bold text-rose-600 font-mono block mt-0.5">2 Red</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Pending</span>
                    <span className="text-xs font-bold text-slate-600 font-mono block mt-0.5">2 Jobs</span>
                  </div>
                </div>
              </div>

              {/* Heatmap matrix block */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#404040] uppercase tracking-widest font-mono">OUTLIERS TRACKER</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Incident levels mapped vs weeks (1–5)</p>
                  </div>
                  <button 
                    onClick={() => { alert("Heatmap timeline initialized. Filtering outlier records."); }}
                    className="text-[10px] font-bold text-[#E87722] hover:underline cursor-pointer"
                  >
                    Timeline &rarr;
                  </button>
                </div>

                <div className="space-y-2.5 text-[11px]">
                  {/* Grid of categories */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500 font-semibold truncate leading-none">Facilities</span>
                    <div className="flex gap-1 flex-1">
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => (
                        <button 
                          key={w}
                          onClick={() => setSelectedOutlierWeek({ category: 'Facilities', week: w })}
                          className={`flex-1 h-6 rounded font-mono font-bold text-[9px] border cursor-pointer transition-all ${
                            w === 'W3' 
                              ? 'bg-rose-500 text-white border-rose-600 shadow-2xs' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200/50 text-slate-500'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500 font-semibold truncate leading-none">Software SaaS</span>
                    <div className="flex gap-1 flex-1">
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => (
                        <button 
                          key={w}
                          onClick={() => setSelectedOutlierWeek({ category: 'Software SaaS', week: w })}
                          className={`flex-1 h-6 rounded font-mono font-bold text-[9px] border cursor-pointer transition-all ${
                            w === 'W2' 
                              ? 'bg-orange-450 bg-[#E87722] border-orange-550 text-white shadow-2xs' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200/50 text-slate-500'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500 font-semibold truncate leading-none">Travel &amp; Ent</span>
                    <div className="flex gap-1 flex-1">
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => (
                        <button 
                          key={w}
                          onClick={() => setSelectedOutlierWeek({ category: 'Travel & Ent', week: w })}
                          className="flex-1 h-6 rounded font-mono font-bold text-[9px] border bg-slate-100 hover:bg-slate-200 border-slate-200/50 text-slate-500 cursor-pointer transition-all"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500 font-semibold truncate leading-none">Consulting</span>
                    <div className="flex gap-1 flex-1">
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => (
                        <button 
                          key={w}
                          onClick={() => setSelectedOutlierWeek({ category: 'Consulting', week: w })}
                          className={`flex-1 h-6 rounded font-mono font-bold text-[9px] border cursor-pointer transition-all ${
                            w === 'W4' 
                              ? 'bg-[#E87722]/80 border-orange-450 text-white shadow-2xs' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200/50 text-slate-500'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500 font-semibold truncate leading-none font-sans">Office Supplies</span>
                    <div className="flex gap-1 flex-1">
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => (
                        <button 
                          key={w}
                          onClick={() => setSelectedOutlierWeek({ category: 'Office Supplies', week: w })}
                          className="flex-1 h-6 rounded font-mono font-bold text-[9px] border bg-slate-100 hover:bg-slate-200 border-slate-200/50 text-slate-500 cursor-pointer transition-all"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-[10.5px] text-slate-500 leading-normal border border-slate-200/50">
                  ⚡ <i>Hover or click week blocks relative to outliers to examine specific ledger occurrences.</i>
                </div>

                {/* Selected Outlier pop details */}
                {selectedOutlierWeek && (
                  <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-lg text-[11px] leading-relaxed relative animate-fadeIn">
                    <button 
                      onClick={() => setSelectedOutlierWeek(null)}
                      className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-700 border-0 bg-transparent"
                    >
                      &times;
                    </button>
                    <strong>{selectedOutlierWeek.category} &middot; {selectedOutlierWeek.week}:</strong>
                    
                    {selectedOutlierWeek.category === 'Facilities' && selectedOutlierWeek.week === 'W3' ? (
                      <p className="mt-1 text-slate-600">3x normal weekly spending ($74,500) isolated in Week 3, triggered by building HVAC emergency repairs.</p>
                    ) : selectedOutlierWeek.category === 'Consulting' && selectedOutlierWeek.week === 'W4' ? (
                      <p className="mt-1 text-slate-600">Outlier transaction of $85,000 detected in Week 4 with vendor &apos;Helix Advisory&apos; representing expedited ERP setup.</p>
                    ) : selectedOutlierWeek.category === 'Software SaaS' && selectedOutlierWeek.week === 'W2' ? (
                      <p className="mt-1 text-slate-600">2x increase in software transactions in Week 2, triggered by annual recurring ERP renewal batches.</p>
                    ) : (
                      <p className="mt-1 text-slate-500">Normal operating variance registered. Baseline validated.</p>
                    )}
                  </div>
                )}

                {/* Consolidated list below matching images bottom */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">CONSOLIDATED OUTLIERS REPORT</span>
                  
                  <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                    <div className="border-l-2 border-rose-500 pl-2.5 py-0.5">
                      <i>Facilities category: 3x normal weekly spending ($74,500) isolated in Week 3, caused by building HVAC emergency repairs.</i>
                    </div>
                    <div className="border-l-2 border-[#E87722] pl-2.5 py-0.5">
                      <i>Consulting category: Outlier transaction of $85,000 detected in Week 4 with vendor &apos;Helix Advisory&apos; representing expedited ERP setup.</i>
                    </div>
                    <div className="border-l-2 border-[#F37021] pl-2.5 py-0.5">
                      <i>Software SaaS: 2x increase in software transactions in Week 2, triggered by annual recurring ERP renewal batches.</i>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action logs terminal block */}
              <div className="bg-[#404040] text-slate-200 p-4 rounded-2xl shadow-2xs font-mono text-[10px] leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">TERMINAL LOGS: CONSOLE WORKSPACE</span>
                <div className="h-28 overflow-y-auto space-y-1">
                  {actionTerminalLogs.map((log, index) => (
                    <div key={index} className="text-emerald-400">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}
