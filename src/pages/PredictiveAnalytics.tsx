import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Cpu } from 'lucide-react';
import {
  AreaChart, Area, Line, BarChart, Bar,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, ReferenceLine
} from 'recharts';
import { mockPredictions, riskTrend } from '../data/mockData';

const risks = [
  { id: 'mud_loss', label: 'Mud Loss Risk', value: 82, trend: '+5%', color: '#FF5C6C', severity: 'HIGH', depth: 3470 },
  { id: 'kick', label: 'Kick Risk', value: 67, trend: '+2%', color: '#F4B740', severity: 'MEDIUM', depth: 3680 },
  { id: 'stuck_pipe', label: 'Stuck Pipe', value: 45, trend: '-3%', color: '#19C3E6', severity: 'LOW', depth: 3200 },
  { id: 'overpressure', label: 'Overpressure', value: 58, trend: '+8%', color: '#8B5CF6', severity: 'MEDIUM', depth: 3750 },
  { id: 'cementing', label: 'Cementing', value: 35, trend: '0%', color: '#36D399', severity: 'LOW', depth: 2800 },
];

function RiskBar({
  label,
  value,
  color,
  severity,
  trend,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  severity: string;
  trend: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-xl cursor-pointer transition-all"
      style={{
        background: active ? '#101F33' : '#0B1728',
        border: `1px solid ${active ? color : '#1B3047'}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#91A4B8]">{label}</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase"
          style={{
            background:
              severity === 'HIGH'
                ? 'rgba(255,92,108,0.12)'
                : severity === 'MEDIUM'
                ? 'rgba(244,183,64,0.12)'
                : 'rgba(54,211,153,0.12)',
            color:
              severity === 'HIGH' ? '#FF5C6C' : severity === 'MEDIUM' ? '#F4B740' : '#36D399',
            border: `1px solid ${
              severity === 'HIGH'
                ? 'rgba(255,92,108,0.3)'
                : severity === 'MEDIUM'
                ? 'rgba(244,183,64,0.3)'
                : 'rgba(54,211,153,0.3)'
            }`,
          }}
        >
          {severity}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <span
          className="text-3xl font-bold font-mono tracking-tight"
          style={{ color }}
        >
          {value}%
        </span>
        <span
          className="text-xs font-mono font-medium"
          style={{
            color: trend.startsWith('+') ? '#FF5C6C' : trend.startsWith('-') ? '#36D399' : '#60758A',
          }}
        >
          {trend} vs prev log
        </span>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1B3047' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ExplainableCard({ prediction }: { prediction: typeof mockPredictions[0] }) {
  const [expanded, setExpanded] = useState(false);
  const colors: Record<string, string> = {
    mud_loss: '#FF5C6C',
    kick: '#F4B740',
    stuck_pipe: '#19C3E6',
    overpressure: '#8B5CF6',
    cementing: '#36D399',
  };
  const color = colors[prediction.type] || '#19C3E6';
  const severityColor =
    prediction.severity === 'high'
      ? '#FF5C6C'
      : prediction.severity === 'medium'
      ? '#F4B740'
      : '#36D399';

  return (
    <motion.div
      className="rounded-xl p-5"
      style={{ background: '#0B1728', border: '1px solid #1B3047' }}
      layout
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            <AlertTriangle style={{ width: 16, height: 16, color }} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-[#F3F7FA]">
              {prediction.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </h4>
            <div className="text-xs text-[#60758A] font-mono mt-0.5">
              Correlated Horizon @ {prediction.depth} m
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold font-mono"
            style={{ color }}
          >
            {prediction.confidence}%
          </div>
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
            style={{
              background: `${severityColor}15`,
              color: severityColor,
              border: `1px solid ${severityColor}35`,
            }}
          >
            {prediction.severity}
          </span>
        </div>
      </div>

      <div className="h-1.5 rounded-full mb-3.5 overflow-hidden" style={{ background: '#1B3047' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${prediction.confidence}%` }}
          transition={{ duration: 1.2 }}
        />
      </div>

      <p className="text-sm mb-4 leading-relaxed text-[#91A4B8]">
        {prediction.message}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors text-[#19C3E6] hover:text-[#7DE6FA]"
      >
        <Info style={{ width: 13, height: 13 }} />
        <span>View Model Reasoning & Offset Corroboration</span>
        {expanded ? (
          <ChevronUp style={{ width: 13, height: 13 }} />
        ) : (
          <ChevronDown style={{ width: 13, height: 13 }} />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-3"
        >
          <div
            className="rounded-xl p-3.5"
            style={{ background: '#101F33', border: '1px solid #1B3047' }}
          >
            <div
              className="text-[11px] font-semibold mb-2.5 uppercase tracking-wider text-[#60758A]"
            >
              Attributed Feature Inputs
            </div>
            <div className="space-y-2">
              {prediction.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 font-bold font-mono text-[10px] mt-0.5"
                    style={{
                      background: `${color}15`,
                      color,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-[#DCE7F2]">
                    {r}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-xl p-3.5"
            style={{ background: '#101F33', border: '1px solid #1B3047' }}
          >
            <div
              className="text-[11px] font-semibold mb-2.5 uppercase tracking-wider text-[#60758A]"
            >
              Corroborating Offset Logs
            </div>
            <div className="flex flex-wrap gap-1.5">
              {prediction.similarWells.map((w) => (
                <span
                  key={w}
                  className="text-xs px-2.5 py-1 rounded-md font-mono"
                  style={{
                    background: 'rgba(25,195,230,0.1)',
                    border: '1px solid rgba(25,195,230,0.25)',
                    color: '#19C3E6',
                    fontSize: '11px',
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p
          style={{
            color: '#91A4B8',
            marginBottom: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}
        >
          Depth: {label}m
        </p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: 12 }}>
            {p.name}: {p.value?.toFixed(0)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PredictiveAnalytics() {
  const [activeRisk, setActiveRisk] = useState(risks[0]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">Predictive Risk Analytics</h1>
          <p className="text-sm text-[#91A4B8] mt-1">
            Ensemble ML prediction models (XGBoost + LightGBM) calibrated on Assam-Arakan basin offset wells
          </p>
        </div>
        <div
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs"
          style={{ background: '#0B1728', border: '1px solid #1B3047' }}
        >
          <Cpu style={{ width: 14, height: 14, color: '#19C3E6' }} />
          <span className="text-[#60758A] font-medium">Model Active:</span>
          <span className="text-[#19C3E6] font-mono font-medium">
            XGBoost v2.1 · 94.3% validation F1
          </span>
        </div>
      </div>

      {/* Risk cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {risks.map((risk) => (
          <RiskBar
            key={risk.id}
            {...risk}
            active={activeRisk.id === risk.id}
            onClick={() => setActiveRisk(risk)}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk vs Depth */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#0B1728', border: '1px solid #1B3047' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[#F3F7FA]">
              Multi-Risk Depth Trajectory Profile
            </h3>
            <p className="text-xs text-[#91A4B8] mt-1">
              Hazard probability envelope mapped along planned well trajectory (0–4,200m)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={riskTrend} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id="gradMud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5C6C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF5C6C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradKick" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4B740" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F4B740" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,48,71,0.6)" />
              <XAxis
                dataKey="depth"
                stroke="#1B3047"
                tick={{ fontSize: 11, fill: '#60758A', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                label={{
                  value: 'Measured Depth (m)',
                  position: 'insideBottom',
                  offset: -4,
                  fill: '#60758A',
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="#1B3047"
                tick={{ fontSize: 11, fill: '#60758A' }}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={3420}
                stroke="#19C3E6"
                strokeDasharray="4 4"
                label={{
                  value: 'Current Bit: 3,420m',
                  fill: '#19C3E6',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  position: 'top',
                }}
              />
              <Area
                type="monotone"
                dataKey="mudLoss"
                name="Mud Loss"
                stroke="#FF5C6C"
                fill="url(#gradMud)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="kick"
                name="Kick"
                stroke="#F4B740"
                fill="url(#gradKick)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="stuckPipe"
                name="Stuck Pipe"
                stroke="#19C3E6"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="overpressure"
                name="Overpressure"
                stroke="#8B5CF6"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#0B1728', border: '1px solid #1B3047' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[#F3F7FA]">
              Feature Attribution & Sensitivity Analysis
            </h3>
            <p className="text-xs text-[#91A4B8] mt-1">
              Top predictive parameter weights for <span className="text-[#19C3E6] font-medium">{activeRisk.label}</span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={[
                { name: 'Formation Type', value: 92 },
                { name: 'Mud Weight', value: 87 },
                { name: 'ECD Profile', value: 81 },
                { name: 'Current Depth', value: 76 },
                { name: 'ROP Speed', value: 71 },
                { name: 'Weight on Bit', value: 65 },
                { name: 'Torque Fluctuations', value: 58 },
              ]}
              margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(27,48,71,0.6)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#1B3047"
                tick={{ fontSize: 11, fill: '#60758A' }}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#1B3047"
                tick={{ fontSize: 11, fill: '#91A4B8' }}
                tickLine={false}
                width={125}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="custom-tooltip">
                      <p style={{ color: activeRisk.color, fontSize: 12 }}>
                        {payload[0].name}: {payload[0].value}% Relative Weight
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="value"
                name="Importance"
                fill={activeRisk.color}
                radius={[0, 6, 6, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable AI */}
      <div>
        <h2
          className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: '#F3F7FA' }}
        >
          <Info style={{ width: 16, height: 16, color: '#19C3E6' }} />
          Explainable AI — Why These Predictions?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockPredictions.map((pred) => (
            <ExplainableCard key={pred.type} prediction={pred} />
          ))}
        </div>
      </div>
    </div>
  );
}
