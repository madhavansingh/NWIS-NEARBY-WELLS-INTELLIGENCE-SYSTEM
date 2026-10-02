import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Clock, Filter, X, Eye } from 'lucide-react';
import { mockAlerts, type Alert } from '../data/mockData';

const FILTER_TYPES = ['all', 'high', 'medium', 'low'] as const;

function AlertCard({ alert, onAck }: { alert: Alert; onAck: (id: string) => void }) {
  const [dismissed, setDismissed] = useState(false);

  const colors = {
    high: { bg: '#0B1728', border: 'rgba(255,92,108,0.3)', text: '#FF5C6C', label: 'HIGH RISK' },
    medium: { bg: '#0B1728', border: 'rgba(244,183,64,0.3)', text: '#F4B740', label: 'MEDIUM RISK' },
    low: { bg: '#0B1728', border: 'rgba(54,211,153,0.3)', text: '#36D399', label: 'ADVISORY' },
  };
  const c = colors[alert.type];

  const timeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 min ago';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      layout
      className="rounded-xl p-5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start gap-4">
        {/* Severity indicator */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
          style={{ background: `${c.text}15`, border: `1px solid ${c.text}30` }}
        >
          {alert.acknowledged ? (
            <CheckCircle style={{ width: 17, height: 17, color: c.text }} />
          ) : (
            <AlertTriangle style={{ width: 17, height: 17, color: c.text }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span
              className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md"
              style={{
                background: `${c.text}15`,
                color: c.text,
                border: `1px solid ${c.text}35`,
              }}
            >
              {c.label}
            </span>
            <h3 className="text-base font-semibold text-[#F3F7FA]">{alert.title}</h3>
            {!alert.acknowledged && (
              <span className="w-2 h-2 rounded-full" style={{ background: c.text }} />
            )}
          </div>

          <p className="text-sm mb-3.5 leading-relaxed text-[#DCE7F2]">{alert.message}</p>

          {/* Metadata strip */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-[#91A4B8] font-mono pt-2.5 border-t border-[#1B3047]">
            <span>Correlated Depth: <strong className="text-[#F3F7FA] font-medium">{alert.depth} m</strong></span>
            <span>Algorithmic Confidence: <strong style={{ color: c.text }} className="font-medium">{alert.confidence}%</strong></span>
            <span className="flex items-center gap-1.5 text-[#60758A]">
              <Clock style={{ width: 12, height: 12 }} />
              {timeAgo(alert.time)}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: '#1B3047' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: c.text }}
              initial={{ width: 0 }}
              animate={{ width: `${alert.confidence}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!alert.acknowledged && (
            <button
              onClick={() => onAck(alert.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#101F33' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#36D399'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(54,211,153,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#91A4B8'; (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; }}
            >
              <Eye style={{ width: 12, height: 12 }} />
              Acknowledge
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: '1px solid #1B3047', color: '#60758A', background: '#101F33' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF5C6C'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,92,108,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#60758A'; (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertEngine() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<typeof FILTER_TYPES[number]>('all');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate new alert
  useEffect(() => {
    const t = setTimeout(() => {
      setAlerts(prev => [{
        id: `live-${Date.now()}`,
        type: 'high',
        title: 'Pit Volume Anomaly Detected',
        message: 'Pit volume gain of 1.8 bbl in 15 minutes. Possible formation fluid influx. Initiate flow check immediately.',
        depth: 3425,
        confidence: 88,
        time: new Date(),
        acknowledged: false,
      }, ...prev]);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const ackAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);
  const stats = {
    high: alerts.filter(a => a.type === 'high').length,
    medium: alerts.filter(a => a.type === 'medium').length,
    low: alerts.filter(a => a.type === 'low').length,
    unacked: alerts.filter(a => !a.acknowledged).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">Real-Time Alert Engine</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,92,108,0.12)', border: '1px solid rgba(255,92,108,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#FF5C6C' }} />
              <span className="text-[11px] font-semibold text-[#FF5C6C]">LIVE STREAM</span>
            </div>
          </div>
          <p className="text-sm text-[#91A4B8]">
            Automated threshold evaluation & anomalous pit gain/loss notifications · Clock: {liveTime.toLocaleTimeString('en-IN', { hour12: false })}
          </p>
        </div>
        <button
          onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#0B1728' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#36D399'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(54,211,153,0.35)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#91A4B8'; (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; }}
        >
          <CheckCircle style={{ width: 14, height: 14 }} />
          Acknowledge All Open Alerts
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Risk Alerts', value: stats.high, color: '#FF5C6C', icon: AlertTriangle },
          { label: 'Advisory Warnings', value: stats.medium, color: '#F4B740', icon: AlertTriangle },
          { label: 'Normal Confirmations', value: stats.low, color: '#36D399', icon: CheckCircle },
          { label: 'Pending Action', value: stats.unacked, color: '#19C3E6', icon: Bell },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-5"
            style={{ background: '#0B1728', border: '1px solid #1B3047' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#60758A]">{stat.label}</span>
              <stat.icon style={{ width: 16, height: 16, color: stat.color }} />
            </div>
            <div className="text-3xl font-bold font-mono text-[#F3F7FA]">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter style={{ width: 14, height: 14, color: '#60758A' }} />
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TYPES.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors"
              style={{
                background: filter === f ? 'rgba(25,195,230,0.12)' : '#0B1728',
                border: `1px solid ${filter === f ? '#19C3E6' : '#1B3047'}`,
                color: filter === f ? '#19C3E6' : '#91A4B8'
              }}
            >
              {f === 'all' ? `All Active (${alerts.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f as keyof typeof stats] || 0})`}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full live-dot" style={{ background: '#36D399' }} />
          <span className="text-xs text-[#91A4B8] font-mono">Monitoring 3 active telemetry streams</span>
        </div>
      </div>

      {/* Alert list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filtered.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAck={ackAlert} />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-xl p-14 text-center" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
              <CheckCircle style={{ width: 40, height: 40, color: '#36D399', margin: '0 auto 14px' }} />
              <h4 className="text-base font-semibold text-[#F3F7FA] mb-1">Clear Operating Status</h4>
              <p className="text-sm text-[#91A4B8]">No {filter !== 'all' ? filter + ' ' : ''}alerts requiring operator intervention</p>
            </div>
          )}
        </div>

        {/* Monitoring panel */}
        <div className="space-y-5">
          {/* Live wells */}
          <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#F3F7FA]">
              <div className="w-2 h-2 rounded-full live-dot" style={{ background: '#36D399' }} />
              Active Rig Watchlist
            </h3>
            <div className="space-y-3">
              {[
                { well: 'BRAHMAPUTRA-14', depth: 3420, status: 'DRILLING', risk: 82, color: '#FF5C6C' },
                { well: 'JORHAT-07', depth: 2180, status: 'ROTATING', risk: 45, color: '#19C3E6' },
                { well: 'DULIAJAN-23', depth: 4820, status: 'CIRCULATING', risk: 68, color: '#F4B740' },
              ].map(w => (
                <div key={w.well} className="p-3.5 rounded-xl" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: w.color }} />
                      <span className="text-xs font-semibold text-[#F3F7FA]">{w.well}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#91A4B8]">{w.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2 font-mono">
                    <span className="text-[#60758A]">{w.depth} m</span>
                    <span style={{ color: w.color }} className="font-semibold">{w.risk}% risk</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1B3047' }}>
                    <div className="h-full rounded-full" style={{ width: `${w.risk}%`, background: w.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Rules */}
          <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <h3 className="text-sm font-semibold mb-3.5 text-[#F3F7FA]">Engine Threshold Rules</h3>
            <div className="space-y-2.5">
              {[
                { rule: 'Risk > 80% triggers HIGH alert', active: true },
                { rule: 'Risk 50-80% triggers MEDIUM alert', active: true },
                { rule: 'Pit volume gain > 1.0 bbl / 15m', active: true },
                { rule: 'ECD > fracture gradient 90%', active: true },
                { rule: 'Torque spike > 20% baseline', active: false },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.active ? '#36D399' : '#60758A' }} />
                  <span style={{ color: r.active ? '#DCE7F2' : '#60758A' }}>{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
