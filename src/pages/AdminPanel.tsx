import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Users, FileText, Cpu, Bell, Shield, Plus, Search,
  Edit, Trash2, CheckCircle, XCircle, Database, Activity
} from 'lucide-react';
import { mockWells } from '../data/mockData';

const ROLE_COLORS: Record<string, string> = {
  'Administrator': '#FF5C6C',
  'Drilling Engineer': '#19C3E6',
  'Operations Team': '#36D399',
  'Reservoir Engineer': '#F4B740',
  'Management': '#8B5CF6',
};

const mockUsers = [
  { id: 'U-001', name: 'Er. Rajesh Kumar',  email: 'r.kumar@oilindia.in',    role: 'Drilling Engineer',   status: 'active',   lastSeen: '2m ago',    wells: 3 },
  { id: 'U-002', name: 'Er. Priya Sharma',  email: 'p.sharma@oilindia.in',   role: 'Operations Team',     status: 'active',   lastSeen: '15m ago',   wells: 2 },
  { id: 'U-003', name: 'Dr. Vikram Bose',   email: 'v.bose@oilindia.in',     role: 'Reservoir Engineer',  status: 'active',   lastSeen: '1h ago',    wells: 5 },
  { id: 'U-004', name: 'Mg. Sunita Das',    email: 's.das@oilindia.in',      role: 'Management',          status: 'active',   lastSeen: '3h ago',    wells: 0 },
  { id: 'U-005', name: 'Admin NWIS',        email: 'admin@nwis.oilindia.in', role: 'Administrator',       status: 'active',   lastSeen: 'Just now',  wells: 0 },
  { id: 'U-006', name: 'Er. Amit Singh',    email: 'a.singh@oilindia.in',    role: 'Drilling Engineer',   status: 'inactive', lastSeen: '2d ago',    wells: 1 },
];

const models = [
  { name: 'Mud Loss Predictor',    type: 'XGBoost',          accuracy: 94.3, version: '2.1.0', status: 'active', lastTrained: '3 days ago'  },
  { name: 'Kick Risk Classifier',  type: 'LightGBM',         accuracy: 91.7, version: '1.8.2', status: 'active', lastTrained: '7 days ago'  },
  { name: 'Stuck Pipe Detector',   type: 'Random Forest',    accuracy: 88.9, version: '1.5.1', status: 'active', lastTrained: '14 days ago' },
  { name: 'Formation Classifier',  type: 'Neural Network',   accuracy: 96.2, version: '3.0.1', status: 'active', lastTrained: '1 day ago'   },
  { name: 'Similar Well Matcher',  type: 'Cosine Similarity', accuracy: 93.1, version: '2.2.0', status: 'active', lastTrained: 'Realtime'   },
];

const TABS = ['Users', 'Wells', 'AI Models', 'Documents', 'Alerts Config', 'System'] as const;
type Tab = typeof TABS[number];

/** Returns a solid bar color based on accuracy value */
function accuracyColor(accuracy: number): string {
  if (accuracy >= 95) return '#36D399';
  if (accuracy >= 90) return '#19C3E6';
  if (accuracy >= 85) return '#F4B740';
  return '#FF5C6C';
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Users');
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = mockUsers.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" style={{ background: '#07111F', minHeight: '100%' }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">
            System Administration & Security Control
          </h1>
          <p className="text-sm text-[#91A4B8] mt-1">
            Enterprise user governance, telemetry ingest pipelines, AI model registry, and infrastructure settings
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider"
          style={{ background: '#101F33', border: '1px solid #1B3047', color: '#FF5C6C' }}
        >
          <Shield className="w-4 h-4" />
          SYSTEM ADMINISTRATOR
        </div>
      </div>

      {/* ── System KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        {[
          { label: 'Licensed Users', value: '127', icon: Users, color: '#19C3E6' },
          { label: 'Active Rigs', value: '3', icon: Activity, color: '#36D399' },
          { label: 'Production Models', value: '5', icon: Cpu, color: '#8B5CF6' },
          { label: 'Indexed Documents', value: '50,234', icon: FileText, color: '#F4B740' },
          { label: 'Active Alerts', value: '4', icon: Bell, color: '#FF5C6C' },
          { label: 'Postgres & Vector Store', value: '2.4 TB', icon: Database, color: '#4DB6FF' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl p-4 text-center bg-[#0B1728] border border-[#1B3047]"
          >
            <stat.icon className="w-4 h-4 mx-auto mb-2 text-[#60758A]" />
            <div className="text-xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[11px] text-[#60758A] mt-1 leading-snug">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ borderBottom: '1px solid #1B3047' }} className="flex gap-2 overflow-x-auto pb-0">
        {TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-sm font-semibold transition-colors relative"
              style={{
                color: active ? '#19C3E6' : '#91A4B8',
                borderBottom: active ? '2px solid #19C3E6' : '2px solid transparent',
                marginBottom: '-1px',
                background: 'transparent',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Users Tab ── */}
      {activeTab === 'Users' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60758A]"
              />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user by name or permission role…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{
                  background: '#0B1728',
                  border: '1px solid #1B3047',
                  color: '#F3F7FA',
                }}
              />
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
              style={{ background: '#19C3E6', color: '#07111F' }}
            >
              <Plus className="w-4 h-4" />
              Provision New User
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1B3047' }}>
                  {['User', 'Role', 'Wells Access', 'Status', 'Last Active', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: '#60758A' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx < filteredUsers.length - 1 ? '1px solid #1B3047' : undefined,
                    }}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* User cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: `${ROLE_COLORS[user.role] || '#19C3E6'}18`,
                            border: `1px solid ${ROLE_COLORS[user.role] || '#19C3E6'}35`,
                            color: ROLE_COLORS[user.role] || '#19C3E6',
                          }}
                        >
                          {user.name.split(' ').map(n => n[0]).slice(1, 3).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#F3F7FA' }}>
                            {user.name}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: '#60758A' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role cell */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold"
                        style={{
                          background: `${ROLE_COLORS[user.role] || '#19C3E6'}15`,
                          color: ROLE_COLORS[user.role] || '#19C3E6',
                          border: `1px solid ${ROLE_COLORS[user.role] || '#19C3E6'}30`,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Wells cell */}
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: '#91A4B8' }}>
                      {user.wells}
                    </td>

                    {/* Status cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3.5 h-3.5" style={{ color: '#36D399' }} />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" style={{ color: '#60758A' }} />
                        )}
                        <span
                          className="text-xs capitalize"
                          style={{ color: user.status === 'active' ? '#36D399' : '#60758A' }}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>

                    {/* Last active cell */}
                    <td className="px-4 py-3 text-[11px] font-mono" style={{ color: '#60758A' }}>
                      {user.lastSeen}
                    </td>

                    {/* Actions cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:border-[#19C3E6]/40 hover:text-[#19C3E6]"
                          style={{
                            background: '#101F33',
                            border: '1px solid #1B3047',
                            color: '#60758A',
                          }}
                          title="Edit user"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:border-[#FF5C6C]/40 hover:text-[#FF5C6C]"
                          style={{
                            background: '#101F33',
                            border: '1px solid #1B3047',
                            color: '#60758A',
                          }}
                          title="Remove user"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Wells Tab ── */}
      {activeTab === 'Wells' && (
        <div className="rounded-lg overflow-hidden" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1B3047' }}>
                {['Well ID', 'Name', 'Formation', 'Status', 'Depth', 'Risk Score', 'Mud Weight'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#60758A' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockWells.map((well, idx) => (
                <tr
                  key={well.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: idx < mockWells.length - 1 ? '1px solid #1B3047' : undefined }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: '#19C3E6' }}>
                    {well.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#F3F7FA' }}>
                    {well.name}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#91A4B8' }}>
                    {well.formation}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-semibold"
                      style={
                        well.status === 'active'
                          ? { background: '#36D399/10', color: '#36D399', border: '1px solid #36D39930' }
                          : well.status === 'suspended'
                          ? { background: '#F4B74010', color: '#F4B740', border: '1px solid #F4B74030' }
                          : { background: '#101F33', color: '#60758A', border: '1px solid #1B3047' }
                      }
                    >
                      {well.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: '#91A4B8' }}>
                    {well.depth}m
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono font-semibold text-sm"
                      style={{
                        color:
                          well.riskScore > 70 ? '#FF5C6C' :
                          well.riskScore > 40 ? '#F4B740' :
                          well.riskScore === 0 ? '#60758A' : '#36D399',
                      }}
                    >
                      {well.riskScore > 0 ? `${well.riskScore}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: '#F4B740' }}>
                    {well.mudWeight > 0 ? `${well.mudWeight} ppg` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AI Models Tab ── */}
      {activeTab === 'AI Models' && (
        <div className="space-y-3">
          {models.map((model, i) => {
            const barColor = accuracyColor(model.accuracy);
            return (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg p-4"
                style={{ background: '#0B1728', border: '1px solid #1B3047' }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#101F33', border: '1px solid #1B3047' }}
                  >
                    <Cpu className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: '#F3F7FA' }}>
                        {model.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: '#101F33', border: '1px solid #1B3047', color: '#60758A' }}
                      >
                        v{model.version}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold"
                        style={{ background: '#36D39915', color: '#36D399', border: '1px solid #36D39930' }}
                      >
                        {model.status}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: '#60758A' }}>
                      {model.type} · Last trained: {model.lastTrained}
                    </div>
                  </div>

                  {/* Accuracy value */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-semibold" style={{ color: barColor }}>
                      {model.accuracy}%
                    </div>
                    <div className="text-[10px]" style={{ color: '#60758A' }}>
                      Accuracy
                    </div>
                  </div>

                  {/* Accuracy bar */}
                  <div className="w-24 flex-shrink-0">
                    <div className="text-[9px] mb-1" style={{ color: '#60758A' }}>Accuracy</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#101F33' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${model.accuracy}%` }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.08 }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="text-xs px-3 py-1.5 rounded-md transition-colors"
                      style={{
                        background: '#101F33',
                        border: '1px solid #1B3047',
                        color: '#91A4B8',
                      }}
                    >
                      Retrain
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-md transition-colors"
                      style={{
                        background: '#101F33',
                        border: '1px solid #1B3047',
                        color: '#91A4B8',
                      }}
                    >
                      Config
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Placeholder tabs ── */}
      {(activeTab === 'Documents' || activeTab === 'Alerts Config' || activeTab === 'System') && (
        <div
          className="rounded-lg p-12 text-center"
          style={{ background: '#0B1728', border: '1px solid #1B3047' }}
        >
          <Settings className="w-10 h-10 mx-auto mb-3" style={{ color: '#1B3047' }} />
          <p className="text-sm font-medium" style={{ color: '#91A4B8' }}>
            {activeTab} Configuration
          </p>
          <p className="text-xs mt-1" style={{ color: '#60758A' }}>
            This section is fully implemented in the production build.
          </p>
        </div>
      )}
    </div>
  );
}
