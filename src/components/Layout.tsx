import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Network, Map, Layers, Bot,
  BarChart3, Bell, Flame, BookOpen, Cpu, Settings,
  Sun, Moon, Menu, ChevronRight, Activity,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { mockAlerts } from '../data/mockData';

interface LayoutProps {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'OPERATIONS',
    items: [
      { path: '/gis', icon: Map, label: 'GIS Intelligence' },
      { path: '/alerts', icon: Bell, label: 'Alert Center', badge: '3' },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { path: '/documents', icon: FileText, label: 'Doc Intelligence' },
      { path: '/similar-wells', icon: Layers, label: 'Similar Wells' },
      { path: '/copilot', icon: Bot, label: 'AI Copilot' },
      { path: '/knowledge-graph', icon: Network, label: 'Knowledge Graph' },
      { path: '/analytics', icon: BarChart3, label: 'Risk Analytics' },
      { path: '/heatmap', icon: Flame, label: 'Formation Heatmap' },
    ]
  },
  {
    label: 'KNOWLEDGE',
    items: [
      { path: '/memory', icon: BookOpen, label: 'Inst. Memory' },
    ]
  },
  {
    label: 'ADVANCED',
    items: [
      { path: '/digital-twin', icon: Cpu, label: 'Digital Twin' },
      { path: '/admin', icon: Settings, label: 'Admin Panel' },
    ]
  },
];

export default function Layout({ theme, setTheme }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unackAlerts = mockAlerts.filter(a => !a.acknowledged);
  const highAlerts = unackAlerts.filter(a => a.type === 'high');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#07111F' }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 64 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 h-full flex flex-col z-40 overflow-hidden"
        style={{ background: '#070F1C', borderRight: '1px solid #1B3047' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 min-h-[64px]" style={{ borderBottom: '1px solid #1B3047' }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(25,195,230,0.1)', border: '1px solid rgba(25,195,230,0.2)' }}>
            <Activity className="w-4 h-4" style={{ color: '#19C3E6' }} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <div className="font-semibold text-base leading-tight" style={{ color: '#F3F7FA', letterSpacing: '-0.01em' }}>NWIS</div>
                <div className="text-xs truncate" style={{ color: '#91A4B8', fontSize: '11px', marginTop: '2px' }}>Oil India Limited · Drilling Intel</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navSections.map((section) => (
            <div key={section.label} className="mb-3">
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#60758A' }}
                  >
                    {section.label}
                  </motion.div>
                )}
              </AnimatePresence>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center gap-3 px-3 py-2 text-[14px] font-medium leading-5 transition-all duration-150 ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className="flex-shrink-0"
                        style={{
                          width: 16,
                          height: 16,
                          color: isActive ? '#19C3E6' : '#60758A'
                        }}
                      />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-between min-w-0"
                          >
                            <span
                              className="truncate text-[13.5px]"
                              style={{ color: isActive ? '#19C3E6' : '#91A4B8', fontWeight: isActive ? 600 : 400 }}
                            >
                              {item.label}
                            </span>
                            {'badge' in item && item.badge && (
                              <span
                                className="px-1.5 py-0.5 rounded font-semibold text-[11px]"
                                style={{ background: 'rgba(255,92,108,0.15)', color: '#FF5C6C' }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom status */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3.5"
              style={{ borderTop: '1px solid #1B3047' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full live-dot" style={{ background: '#36D399' }} />
                <span className="text-xs font-medium" style={{ color: '#36D399' }}>OIL Network Connected</span>
              </div>
              <div className="text-xs" style={{ color: '#60758A' }}>OIL-NWIS v2.4.1 (Production)</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 h-14 flex items-center px-6 gap-4 z-30"
          style={{ background: '#070F1C', borderBottom: '1px solid #1B3047' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors"
            style={{ color: '#60758A' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F3F7FA')}
            onMouseLeave={e => (e.currentTarget.style.color = '#60758A')}
          >
            <Menu style={{ width: 15, height: 15 }} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#60758A' }}>
            <span style={{ color: '#19C3E6', fontSize: '12px', fontWeight: 500 }}>NWIS</span>
            <ChevronRight style={{ width: 12, height: 12 }} />
            <span style={{ color: '#91A4B8', fontSize: '13px' }}>Platform</span>
          </div>

          <div className="flex-1" />

          {/* System indicators */}
          <div className="hidden md:flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#36D399' }} />
              <span style={{ color: '#91A4B8' }}>3 Active Wells</span>
            </div>
            {highAlerts.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5C6C' }} />
                <span style={{ color: '#FF5C6C' }}>{highAlerts.length} High Alerts</span>
              </div>
            )}
            <span style={{ color: '#60758A', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded flex items-center justify-center relative transition-colors"
              style={{ color: '#60758A' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F3F7FA')}
              onMouseLeave={e => (e.currentTarget.style.color = '#60758A')}
            >
              <Bell style={{ width: 15, height: 15 }} />
              {unackAlerts.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-white"
                  style={{ background: '#FF5C6C' }}
                >
                  {unackAlerts.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-80 rounded-lg shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#0B1728', border: '1px solid #1B3047' }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1B3047' }}>
                    <span className="text-sm font-semibold" style={{ color: '#F3F7FA' }}>Alerts</span>
                    <span className="text-xs" style={{ color: '#FF5C6C' }}>{unackAlerts.length} unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockAlerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        className="px-4 py-3 cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid #1B3047', background: !alert.acknowledged ? 'rgba(255,92,108,0.03)' : 'transparent' }}
                        onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = !alert.acknowledged ? 'rgba(255,92,108,0.03)' : 'transparent')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {alert.type === 'high' ? (
                            <AlertTriangle style={{ width: 12, height: 12, color: '#FF5C6C', flexShrink: 0 }} />
                          ) : alert.type === 'medium' ? (
                            <AlertTriangle style={{ width: 12, height: 12, color: '#F4B740', flexShrink: 0 }} />
                          ) : (
                            <CheckCircle style={{ width: 12, height: 12, color: '#36D399', flexShrink: 0 }} />
                          )}
                          <span className="text-xs font-semibold truncate" style={{ color: '#F3F7FA' }}>{alert.title}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#60758A' }}>{alert.message.slice(0, 70)}...</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid #1B3047' }}>
                    <button
                      onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#19C3E6' }}
                    >
                      View all alerts →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded flex items-center justify-center transition-colors"
            style={{ color: '#60758A' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F3F7FA')}
            onMouseLeave={e => (e.currentTarget.style.color = '#60758A')}
          >
            {theme === 'dark' ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
          </button>

          {/* User avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-xs font-semibold"
            style={{ background: 'rgba(25,195,230,0.12)', border: '1px solid rgba(25,195,230,0.2)', color: '#19C3E6' }}
          >
            RK
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#07111F' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
