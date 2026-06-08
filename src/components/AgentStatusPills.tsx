import React from 'react';
import { Bot, User, CheckCircle2, Loader2, AlertCircle, Play } from 'lucide-react';
import { Transaction } from '../types';

interface AgentStatusPillsProps {
  activeTransaction: Transaction;
  onNewTransactionClick: () => void;
  userEmail: string;
}

export default function AgentStatusPills({
  activeTransaction,
  onNewTransactionClick,
  userEmail,
}: AgentStatusPillsProps) {
  const currentStage = activeTransaction.currentStage;
  const activeAgent = activeTransaction.activeAgent;

  // Map agents to state
  const getAgentStatus = (agent: 'Payables' | 'Orchestrator' | 'Reconciliation') => {
    switch (agent) {
      case 'Payables':
        if (currentStage === 'MATCHING') {
          return activeTransaction.matchDetails.status === 'MISMATCH' ? 'Waiting' : 'Active';
        }
        return 'Done';

      case 'Orchestrator':
        if (currentStage === 'MATCHING') return 'Idle';
        if (currentStage === 'PENDING APPROVAL') return 'Active';
        if (currentStage === 'APPROVED') return 'Waiting';
        return 'Done';

      case 'Reconciliation':
        if (currentStage === 'MATCHING' || currentStage === 'PENDING APPROVAL') return 'Idle';
        if (currentStage === 'APPROVED' || currentStage === 'RECONCILING') return 'Active';
        return 'Done';
    }
  };

  const getPillStyle = (agent: 'Payables' | 'Orchestrator' | 'Reconciliation') => {
    const status = getAgentStatus(agent);
    const isCurrentActive =
      (agent === 'Payables' && activeAgent === 'Payables Agent') ||
      (agent === 'Orchestrator' && activeAgent === 'Approval Orchestrator') ||
      (agent === 'Reconciliation' && activeAgent === 'Reconciliation Agent');

    if (isCurrentActive) {
      return {
        container: 'border-blue-500/40 bg-blue-950/40 text-blue-300 ring-2 ring-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.35)]',
        indicator: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        color: 'text-blue-400'
      };
    }

    switch (status) {
      case 'Active':
        return {
          container: 'border-indigo-500/20 bg-indigo-950/20 text-indigo-300',
          indicator: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]',
          color: 'text-indigo-400'
        };
      case 'Waiting':
        return {
          container: 'border-amber-500/20 bg-amber-950/10 text-amber-300',
          indicator: 'bg-amber-400 animate-pulse',
          color: 'text-amber-400'
        };
      case 'Done':
        return {
          container: 'border-neutral-800 bg-neutral-900/30 text-neutral-400',
          indicator: 'bg-neutral-500',
          color: 'text-neutral-500'
        };
      case 'Idle':
      default:
        return {
          container: 'border-neutral-900 bg-neutral-950/20 text-neutral-600',
          indicator: 'bg-neutral-800',
          color: 'text-neutral-700'
        };
    }
  };

  const payStyle = getPillStyle('Payables');
  const orchStyle = getPillStyle('Orchestrator');
  const reconStyle = getPillStyle('Reconciliation');

  const payStatus = getAgentStatus('Payables');
  const orchStatus = getAgentStatus('Orchestrator');
  const reconStatus = getAgentStatus('Reconciliation');

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-neutral-850 bg-[#0a0c10] px-6 select-none" id="finflow-header">
      {/* Brand area */}
      <div className="flex items-center space-x-3" id="brand-container">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/30" id="brand-logo-glow">
          <Bot className="h-5 w-5 text-emerald-400" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5" id="brand-active-pulse">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <div className="hidden flex-col sm:flex">
          <span className="font-display text-base font-semibold tracking-wider text-neutral-100">
            FinFlow
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
            Transaction Execution
          </span>
        </div>
      </div>

      {/* Center status pills */}
      <div className="flex items-center space-x-2 md:space-x-4" id="agent-pills-bar">
        {/* Pill 1: Payables Agent */}
        <div 
          className={`flex items-center space-x-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ${payStyle.container}`} 
          id="pill-payables"
          title={`Payables Agent is currently ${payStatus}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${payStyle.indicator}`} />
          <span className="hidden leading-none lg:inline">Payables Agent</span>
          <span className="lg:hidden">Payables</span>
          <span className="font-mono text-[9px] opacity-70">({payStatus})</span>
        </div>

        {/* Pill 2: Approval Orchestrator */}
        <div 
          className={`flex items-center space-x-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ${orchStyle.container}`} 
          id="pill-orchestrator"
          title={`Approval Orchestrator is currently ${orchStatus}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${orchStyle.indicator}`} />
          <span className="hidden leading-none lg:inline">Approval Orchestrator</span>
          <span className="lg:hidden">Approval</span>
          <span className="font-mono text-[9px] opacity-70">({orchStatus})</span>
        </div>

        {/* Pill 3: Reconciliation Agent */}
        <div 
          className={`flex items-center space-x-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ${reconStyle.container}`} 
          id="pill-reconciliation"
          title={`Reconciliation Agent is currently ${reconStatus}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${reconStyle.indicator}`} />
          <span className="hidden leading-none lg:inline">Reconciliation Agent</span>
          <span className="lg:hidden">Reconciliation</span>
          <span className="font-mono text-[9px] opacity-70">({reconStatus})</span>
        </div>
      </div>

      {/* Right control buttons */}
      <div className="flex items-center space-x-3" id="header-right-actions">
        <button
          onClick={onNewTransactionClick}
          className="flex items-center space-x-1.5 rounded bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-[#090b0e] transition-all hover:bg-emerald-400 active:translate-y-0.5 shadow-sm"
          id="btn-new-transaction"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>New Transaction</span>
        </button>

        {/* User profile */}
        <div className="flex items-center space-x-2 border-l border-neutral-800 pl-3" id="user-avatar-profile">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 text-xs font-bold font-mono uppercase" title={`User: ${userEmail}`}>
            {userEmail ? userEmail.charAt(0) : 'U'}
          </div>
          <span className="hidden font-mono text-[10px] text-neutral-400 md:inline" title={userEmail}>
            {userEmail ? (userEmail.split('@')[0]) : 'Operator'}
          </span>
        </div>
      </div>
    </header>
  );
}
