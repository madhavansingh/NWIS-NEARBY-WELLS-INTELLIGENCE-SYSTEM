import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle,
  Gauge, Cpu, Target, ChevronRight, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { mockWells, mockAlerts, mockPredictions, drillingTrend, riskTrend } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ color: '#91A4B8', marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: 12 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function RiskBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium w-32 flex-shrink-0" style={{ color: '#91A4B8' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#16263A' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-semibold w-12 text-right" style={{ color, fontFamily: 'var(--font-mono)' }}>{value}%</span>
    </div>
  );
}

function WellRow({ well }: { well: typeof mockWells[0] }) {
  const [depth, setDepth] = useState(well.depth);

  useEffect(() => {
    if (well.status !== 'active') return;
    const interval = setInterval(() => {
      setDepth(d => d + (Math.random() * 0.3));
    }, 2000);
    return () => clearInterval(interval);
  }, [well.status]);

  const statusColor = well.status === 'active' ? '#36D399' : well.status === 'suspended' ? '#F4B740' : '#60758A';
  const riskColor = well.riskScore > 70 ? '#FF5C6C' : well.riskScore > 40 ? '#F4B740' : '#36D399';

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors cursor-default"
      style={{ background: '#101F33', border: '1px solid #1B3047' }}
    >
      <div className="flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: '#F3F7FA' }}>{well.name}</div>
        <div className="text-xs mt-0.5" style={{ color: '#91A4B8' }}>{well.formation}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold" style={{ color: '#19C3E6', fontFamily: 'var(--font-mono)' }}>
          {Math.round(depth)}m
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#60758A' }}>
          {well.targetDepth}m target
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs font-semibold px-2.5 py-1 rounded" style={{
          background: `${riskColor}15`,
          color: riskColor,
          border: `1px solid ${riskColor}35`
        }}>
          {well.riskScore > 0 ? `${well.riskScore}% risk` : 'Nominal'}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [liveDepth, setLiveDepth] = useState(3420);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDepth(d => d + Math.random() * 0.2);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeWells = mockWells.filter(w => w.status === 'active');
  const highAlerts = mockAlerts.filter(a => a.type === 'high' && !a.acknowledged);
  const avgDepth = Math.round(activeWells.reduce((a, b) => a + b.depth, 0) / activeWells.length);
  const avgRisk = Math.round(activeWells.reduce((a, b) => a + b.riskScore, 0) / activeWells.length);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-screen-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#1B3047]/60">
        <div>
          <h1 className="text-[28px] font-bold text-[#F3F7FA] tracking-tight">Mission Control</h1>
          <p className="text-sm text-[#91A4B8] mt-1.5">Real-time drilling intelligence dashboard and offset well risk monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1728] border border-[#1B3047]">
            <div className="w-2 h-2 rounded-full live-dot" style={{ background: '#36D399' }} />
            <span className="text-xs font-medium text-[#91A4B8]">3 wells actively drilling</span>
          </div>
          {highAlerts.length > 0 && (
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'rgba(255,92,108,0.1)', border: '1px solid rgba(255,92,108,0.3)', color: '#FF5C6C' }}
            >
              <AlertTriangle style={{ width: 14, height: 14 }} />
              {highAlerts.length} High Alerts
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {highAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 md:p-6"
          style={{ background: 'rgba(255,92,108,0.04)', border: '1px solid rgba(255,92,108,0.25)' }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(255,92,108,0.12)', border: '1px solid rgba(255,92,108,0.2)' }}
              >
                <AlertTriangle style={{ width: 20, height: 20, color: '#FF5C6C' }} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="badge-high">HIGH RISK</span>
                  <span className="text-base font-semibold text-[#F3F7FA]">Mud Loss Hazard · OIL-BRAHMAPUTRA-14</span>
                </div>
                <p className="text-sm text-[#F3F7FA] font-medium pt-0.5">Approaching historical severe mud-loss zone in Barail Formation.</p>
                <div className="flex items-center gap-4 text-xs text-[#91A4B8] pt-1 flex-wrap">
                  <span>Current Depth: <strong className="text-[#F3F7FA] font-mono">{Math.round(liveDepth)}m</strong></span>
                  <span>•</span>
                  <span>Predicted Risk: <strong className="text-[#FF5C6C] font-mono">82%</strong></span>
                  <span>•</span>
                  <span>Model Confidence: <strong className="text-[#F3F7FA] font-mono">91%</strong></span>
                  <span>•</span>
                  <span>Evidence: <strong className="text-[#19C3E6]">3 offset wells matched</strong></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0 md:self-start">
              <button
                onClick={() => navigate('/similar-wells')}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ border: '1px solid #1B3047', background: '#0B1728', color: '#91A4B8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#19C3E6'; (e.currentTarget as HTMLElement).style.color = '#F3F7FA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.color = '#91A4B8'; }}
              >
                Compare Similar Wells
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#19C3E6', color: '#07111F' }}
              >
                View Evidence
              </button>
            </div>
          </div>
          {/* AI Recommendations */}
          <div className="mt-5 pt-4 border-t border-[#FF5C6C]/15">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#91A4B8] mb-3">Recommended Mitigation Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Prepare LCM pill', desc: 'Walnut shells (50 ppb) + coarse mica blended on site' },
                { title: 'Adjust mud weight', desc: 'Raise active system from 11.2 to 11.6 ppg gradually' },
                { title: 'Monitor pit volume', desc: 'Alert mud logger on delta > 1.0 bbl gain or loss' },
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B1728]/70 border border-[#1B3047]">
                  <CheckCircle style={{ width: 15, height: 15, color: '#36D399', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div className="text-xs font-semibold text-[#F3F7FA]">{action.title}</div>
                    <div className="text-xs text-[#91A4B8] mt-0.5">{action.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[
          { label: 'Active Wells', value: String(activeWells.length), sub: 'Currently drilling in basin', icon: Activity, color: '#19C3E6' },
          { label: 'Average Depth', value: `${avgDepth.toLocaleString()}m`, sub: 'Across active operations', icon: Target, color: '#F4B740' },
          { label: 'Portfolio Risk', value: `${avgRisk}%`, sub: 'Composite hazard index', icon: Gauge, color: '#FF5C6C' },
          { label: 'Open Alerts', value: String(mockAlerts.filter(a => !a.acknowledged).length), sub: `${highAlerts.length} high priority unacknowledged`, icon: Cpu, color: '#36D399' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-5 md:p-6"
            style={{ background: '#0B1728', border: '1px solid #1B3047' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}>
              <kpi.icon style={{ width: 18, height: 18, color: kpi.color }} />
            </div>
            <div className="text-3xl font-bold leading-tight tracking-tight text-[#F3F7FA] font-mono">{kpi.value}</div>
            <div className="text-sm font-semibold text-[#91A4B8] mt-2">{kpi.label}</div>
            <div className="text-xs text-[#60758A] mt-1">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Chart + Risk Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drilling Trend */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-semibold text-[#F3F7FA]">Live Drilling Parameters</h3>
              <p className="text-xs text-[#91A4B8] mt-1">ROP, ECD & Mud Weight — 24h rolling trend · OIL-BRAHMAPUTRA-14</p>
            </div>
            <div className="flex gap-4 text-xs font-medium" style={{ color: '#91A4B8' }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#19C3E6]" /> ROP (m/hr)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F4B740]" /> Mud Wt (ppg)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#36D399]" /> ECD (ppg)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={drillingTrend} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
              <defs>
                <linearGradient id="ropGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#19C3E6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#19C3E6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#16263A" />
              <XAxis dataKey="time" stroke="#1B3047" tick={{ fontSize: 11, fill: '#60758A', fontFamily: 'var(--font-mono)' }} tickLine={false} />
              <YAxis stroke="#1B3047" tick={{ fontSize: 11, fill: '#60758A' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rop" name="ROP" stroke="#19C3E6" fill="url(#ropGrad)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mudWeight" name="Mud Wt" stroke="#F4B740" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="ecd" name="ECD" stroke="#36D399" strokeWidth={1.8} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="rounded-xl p-6 flex flex-col justify-between" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div>
            <h3 className="text-base font-semibold text-[#F3F7FA] mb-1">Risk Distribution</h3>
            <p className="text-xs text-[#91A4B8] mb-6">Multi-hazard analysis · OIL-BRAHMAPUTRA-14</p>
            <div className="space-y-4">
              <RiskBar label="Mud Loss" value={82} color="#FF5C6C" />
              <RiskBar label="Kick Risk" value={67} color="#F4B740" />
              <RiskBar label="Stuck Pipe" value={45} color="#19C3E6" />
              <RiskBar label="Overpressure" value={58} color="#8B5CF6" />
              <RiskBar label="Cementing" value={35} color="#36D399" />
            </div>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="mt-6 w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{ border: '1px solid #1B3047', background: '#101F33', color: '#F3F7FA' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#19C3E6'; (e.currentTarget as HTMLElement).style.color = '#19C3E6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.color = '#F3F7FA'; }}
          >
            Open Full Risk Analytics <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Wells + Risk vs Depth + AI Recs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Wells */}
        <div className="rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-[#F3F7FA]">Active Wells</h3>
              <p className="text-xs text-[#91A4B8] mt-0.5">Real-time status & risk indicators</p>
            </div>
            <button
              onClick={() => navigate('/gis')}
              className="text-xs font-semibold flex items-center gap-1 transition-colors text-[#19C3E6] hover:text-[#19C3E6]/80"
            >
              GIS Spatial View <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div className="space-y-3">
            {mockWells.filter(w => w.status === 'active').map(well => (
              <WellRow key={well.id} well={well} />
            ))}
          </div>
        </div>

        {/* Risk vs Depth */}
        <div className="rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-[#F3F7FA]">Risk vs Depth</h3>
              <p className="text-xs text-[#91A4B8] mt-0.5">Offset profile · Barail Formation</p>
            </div>
            <span className="text-xs font-medium font-mono px-2 py-0.5 rounded bg-[#101F33] border border-[#1B3047] text-[#19C3E6]">
              BRAHMAPUTRA-14
            </span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={riskTrend.slice(-15)} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16263A" />
              <XAxis dataKey="depth" stroke="#1B3047" tick={{ fontSize: 11, fill: '#60758A', fontFamily: 'var(--font-mono)' }} tickLine={false} />
              <YAxis stroke="#1B3047" tick={{ fontSize: 11, fill: '#60758A' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="mudLoss" name="Mud Loss" stroke="#FF5C6C" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="kick" name="Kick" stroke="#F4B740" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="overpressure" name="Overpressure" stroke="#8B5CF6" strokeWidth={1.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-xl p-6 flex flex-col justify-between" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-[#F3F7FA]">AI Hazard Advisory</h3>
                <p className="text-xs text-[#91A4B8] mt-0.5">Derived from 50,000+ well logs</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#19C3E6]/10 border border-[#19C3E6]/25">
                <TrendingUp style={{ width: 13, height: 13, color: '#19C3E6' }} />
                <span className="text-xs font-semibold text-[#19C3E6]">NWIS Core</span>
              </div>
            </div>
            <div className="space-y-3">
              {mockPredictions.map((pred, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3.5 rounded-lg border"
                  style={{
                    background: pred.severity === 'high' ? 'rgba(255,92,108,0.04)' :
                      pred.severity === 'medium' ? 'rgba(244,183,64,0.04)' : 'rgba(54,211,153,0.04)',
                    borderColor: pred.severity === 'high' ? 'rgba(255,92,108,0.2)' :
                      pred.severity === 'medium' ? 'rgba(244,183,64,0.2)' : 'rgba(54,211,153,0.2)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: pred.severity === 'high' ? '#FF5C6C' :
                          pred.severity === 'medium' ? '#F4B740' : '#36D399'
                      }}
                    >
                      {pred.severity} · {pred.type.replace('_', ' ')}
                    </span>
                    <span
                      className="text-xs font-bold font-mono"
                      style={{
                        color: pred.severity === 'high' ? '#FF5C6C' :
                          pred.severity === 'medium' ? '#F4B740' : '#36D399'
                      }}
                    >
                      {pred.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#91A4B8]">{pred.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="mt-5 w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            style={{ background: '#19C3E6', color: '#07111F' }}
          >
            Inspect Predictive Models <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
