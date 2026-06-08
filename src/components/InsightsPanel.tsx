import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { MatchResult, ExceptionCode } from '../types';

interface InsightsPanelProps {
  matchResults: MatchResult[];
}

// ── Color map per exception ───────────────────────────────────────

const EXCEPTION_COLORS: Record<ExceptionCode, string> = {
  CLEAN:               '#10b981',
  PRICE_VARIANCE:      '#f59e0b',
  QTY_VARIANCE:        '#f97316',
  GRN_MISSING:         '#ef4444',
  PO_MISSING:          '#dc2626',
  DUPLICATE:           '#8b5cf6',
  TAX_ERROR:           '#6366f1',
  CONTRACT_VIOLATION:  '#d946ef',
};

const EXCEPTION_LABELS: Record<ExceptionCode, string> = {
  CLEAN:               'Clean',
  PRICE_VARIANCE:      'Price Variance',
  QTY_VARIANCE:        'Qty Mismatch',
  GRN_MISSING:         'GRN Missing',
  PO_MISSING:          'PO Missing',
  DUPLICATE:           'Duplicate',
  TAX_ERROR:           'Tax Error',
  CONTRACT_VIOLATION:  'Contract Violation',
};

// ── Status-mix groups ─────────────────────────────────────────────

const BLOCKED_CODES: ExceptionCode[] = ['PRICE_VARIANCE', 'QTY_VARIANCE', 'GRN_MISSING', 'PO_MISSING', 'TAX_ERROR', 'CONTRACT_VIOLATION'];
const PARKED_CODES:  ExceptionCode[] = ['DUPLICATE'];

function buildStatusMixData(results: MatchResult[]) {
  let clean = 0, blocked = 0, parked = 0;
  for (const r of results) {
    if (r.exceptionCode === 'CLEAN')              clean++;
    else if (PARKED_CODES.includes(r.exceptionCode))  parked++;
    else if (BLOCKED_CODES.includes(r.exceptionCode)) blocked++;
  }
  return [
    { name: 'Blocked',  value: blocked, color: '#ef4444' },
    { name: 'Parked',   value: parked,  color: '#8b5cf6' },
    { name: 'Clean',    value: clean,   color: '#10b981' },
  ].filter(d => d.value > 0);
}

function buildExceptionData(results: MatchResult[]) {
  const counts: Partial<Record<ExceptionCode, number>> = {};
  for (const r of results) {
    counts[r.exceptionCode] = (counts[r.exceptionCode] ?? 0) + 1;
  }
  return (Object.keys(counts) as ExceptionCode[])
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .map(code => ({
      code,
      label: EXCEPTION_LABELS[code],
      count: counts[code] ?? 0,
      color: EXCEPTION_COLORS[code],
    }));
}

// ── Custom tooltip ────────────────────────────────────────────────

const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { label: string; count: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
      <p className="font-semibold text-slate-700">{d.label}</p>
      <p className="text-slate-500">{d.count} invoice{d.count !== 1 ? 's' : ''}</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
      <p className="font-semibold text-slate-700">{d.name}</p>
      <p className="text-slate-500">{d.value} invoice{d.value !== 1 ? 's' : ''}</p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────

const InsightsPanel: React.FC<InsightsPanelProps> = ({ matchResults }) => {
  const [open, setOpen] = useState(false);

  const exceptionData = buildExceptionData(matchResults);
  const statusMixData = buildStatusMixData(matchResults);
  const total         = matchResults.length;
  const exceptions    = matchResults.filter(r => r.exceptionCode !== 'CLEAN').length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Live Insights</span>
          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
            {total} invoices · {exceptions} exception{exceptions !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-slate-100">
          {/* Chart 1 — Exception Breakdown */}
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
              Exception Breakdown
            </p>
            {exceptionData.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={exceptionData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {exceptionData.map(d => (
                      <Cell key={d.code} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart 2 — Invoice Status Mix */}
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
              Invoice Status Mix
            </p>
            {statusMixData.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusMixData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusMixData.map(d => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
