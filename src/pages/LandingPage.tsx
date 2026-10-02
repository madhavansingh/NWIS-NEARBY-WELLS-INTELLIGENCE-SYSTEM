import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, Zap, Globe, Shield, BarChart2, ChevronRight,
  Cpu, Database, Map, FileSearch, Network, Bot, ArrowRight
} from 'lucide-react';

// Animated canvas for the oilfield visualization
function OilfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const wells = [
      { x: 0.3, y: 0.4, name: 'BRAHMAPUTRA-14', risk: 0.82, active: true },
      { x: 0.5, y: 0.35, name: 'JORHAT-07', risk: 0.45, active: true },
      { x: 0.7, y: 0.55, name: 'DULIAJAN-23', risk: 0.68, active: true },
      { x: 0.2, y: 0.65, name: 'SIBSAGAR-11', risk: 0.25, active: false },
      { x: 0.65, y: 0.75, name: 'NAHARKATIA-06', risk: 0.15, active: false },
      { x: 0.45, y: 0.7, name: 'MORAN-18', risk: 0.55, active: true },
      { x: 0.8, y: 0.35, name: 'DIGBOI-03', risk: 0.72, active: true },
    ];

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);
      t += 0.005;

      // Dark base gradient
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
      grad.addColorStop(0, 'rgba(25, 195, 230, 0.03)');
      grad.addColorStop(0.5, 'rgba(11, 23, 40, 0.6)');
      grad.addColorStop(1, 'rgba(7, 17, 31, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid — uses border color at low opacity
      ctx.strokeStyle = 'rgba(27, 48, 71, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Geological layers (very subtle)
      const layerColors = [
        'rgba(244, 183, 64, 0.03)',
        'rgba(77, 182, 255, 0.025)',
        'rgba(25, 195, 230, 0.02)',
        'rgba(255, 92, 108, 0.04)',
      ];
      const layerYPositions = [0.45, 0.55, 0.7, 0.85];
      layerYPositions.forEach((yPos, i) => {
        ctx.beginPath();
        ctx.moveTo(0, yPos * H);
        for (let x = 0; x <= W; x += 20) {
          const noise = Math.sin(x * 0.01 + t * (i + 1) * 0.3) * 15 + Math.cos(x * 0.007 + t * 0.2) * 8;
          ctx.lineTo(x, yPos * H + noise);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = layerColors[i];
        ctx.fill();
      });

      // Pipeline connections (animated)
      for (let i = 0; i < wells.length; i++) {
        for (let j = i + 1; j < wells.length; j++) {
          const w1 = wells[i], w2 = wells[j];
          const dist = Math.hypot((w2.x - w1.x) * W, (w2.y - w1.y) * H);
          if (dist > W * 0.3) continue;

          const flowT = ((t * 0.5) % 1);
          const px = w1.x * W + (w2.x - w1.x) * W * flowT;
          const py = w1.y * H + (w2.y - w1.y) * H * flowT;

          // Static line
          ctx.beginPath();
          ctx.moveTo(w1.x * W, w1.y * H);
          ctx.lineTo(w2.x * W, w2.y * H);
          ctx.strokeStyle = 'rgba(27, 48, 71, 0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Animated data packet
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(25, 195, 230, 0.55)';
          ctx.fill();
        }
      }

      // Risk zone circles
      wells.filter(w => w.active && w.risk > 0.5).forEach(w => {
        const radius = 50 + Math.sin(t * 2) * 10;
        const grad2 = ctx.createRadialGradient(w.x * W, w.y * H, 0, w.x * W, w.y * H, radius);
        const riskColor = w.risk > 0.7 ? '255, 92, 108' : '244, 183, 64';
        grad2.addColorStop(0, `rgba(${riskColor}, 0.07)`);
        grad2.addColorStop(1, `rgba(${riskColor}, 0)`);
        ctx.beginPath();
        ctx.arc(w.x * W, w.y * H, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad2;
        ctx.fill();

        // Pulsing ring
        const ringRadius = 28 + Math.sin(t * 3) * 12;
        ctx.beginPath();
        ctx.arc(w.x * W, w.y * H, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${riskColor}, ${0.25 - Math.sin(t * 3) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Wells
      wells.forEach(w => {
        const wx = w.x * W, wy = w.y * H;

        // Risk color — using new risk palette
        const riskColor = w.risk > 0.7 ? '#FF5C6C' : w.risk > 0.4 ? '#F4B740' : '#36D399';
        const glowColor = w.risk > 0.7 ? '255,92,108' : w.risk > 0.4 ? '244,183,64' : '54,211,153';

        // Soft glow behind dot (subtle)
        const wellGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 16);
        wellGrad.addColorStop(0, `rgba(${glowColor}, 0.25)`);
        wellGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
        ctx.beginPath();
        ctx.arc(wx, wy, 16, 0, Math.PI * 2);
        ctx.fillStyle = wellGrad;
        ctx.fill();

        // Well dot
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.fillStyle = riskColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#F3F7FA';
        ctx.fill();

        // Derrick symbol (active wells only)
        if (w.active) {
          ctx.strokeStyle = riskColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wx, wy - 16);
          ctx.lineTo(wx - 6, wy - 6);
          ctx.lineTo(wx + 6, wy - 6);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(wx, wy - 16);
          ctx.lineTo(wx, wy - 6);
          ctx.stroke();
        }

        // Label
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(145, 164, 184, 0.8)';
        ctx.fillText(w.name.split('-').slice(-1)[0], wx + 10, wy + 4);
      });

      animFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

const stats = [
  { label: 'Mud Loss Risk Score', value: '82%', color: '#FF5C6C', icon: Shield },
  { label: 'Active Wells Monitored', value: '145', color: '#19C3E6', icon: Activity },
  { label: 'Historical Reports', value: '50K+', color: '#F4B740', icon: Database },
  { label: 'Predictions Generated', value: '1.2M+', color: '#36D399', icon: Zap },
];

const features = [
  { icon: FileSearch, title: 'Document Intelligence', desc: 'OCR + NLP extracts drilling insights from WCRs, DDRs, and Mud Logs automatically' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Interactive Neo4j-style graph connecting wells, formations, incidents, and mitigations' },
  { icon: Map, title: 'GIS Intelligence', desc: 'Full-screen interactive map with nearby well search, risk zones, and geological layers' },
  { icon: Bot, title: 'AI Copilot', desc: 'RAG-powered assistant trained on 50,000+ historical drilling documents' },
  { icon: BarChart2, title: 'Risk Analytics', desc: 'ML-powered prediction of mud loss, kick, stuck pipe with explainable AI' },
  { icon: Cpu, title: 'Digital Twin', desc: '3D real-time virtual representation of active well with live telemetry' },
];

const techStack = [
  'React', 'TypeScript', 'FastAPI', 'LangChain', 'Llama 3',
  'PostgreSQL', 'PostGIS', 'Neo4j', 'Qdrant', 'XGBoost', 'Docker', 'Kubernetes'
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(f => (f + 1) % features.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: '#07111F', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(7, 15, 28, 0.95)', borderBottom: '1px solid #1B3047', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(25, 195, 230, 0.12)', border: '1px solid rgba(25, 195, 230, 0.25)' }}
            >
              <Activity className="w-4 h-4" style={{ color: '#19C3E6' }} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xl font-semibold"
                style={{ color: '#F3F7FA', letterSpacing: '-0.01em' }}
              >
                NWIS
              </span>
              <span className="hidden sm:inline text-xs" style={{ color: '#60758A' }}>
                Nearby Wells Intelligence System
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#36D399' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#36D399' }} />
              System Online
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: '#19C3E6',
                color: '#07111F',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Launch Platform
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <OilfieldCanvas />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(7,17,31,0.75) 0%, rgba(7,17,31,0.2) 50%, rgba(7,17,31,0.85) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(7,17,31,0.55) 0%, transparent 50%, rgba(7,17,31,0.55) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

          {/* Platform badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-medium"
            style={{
              background: 'rgba(25, 195, 230, 0.08)',
              border: '1px solid rgba(25, 195, 230, 0.2)',
              color: '#19C3E6',
            }}
          >
            <Globe className="w-3 h-3" />
            OIL INDIA LIMITED — ENTERPRISE AI PLATFORM
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#36D399' }}
            />
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1
              className="font-semibold mb-4"
              style={{
                fontSize: 'clamp(40px, 6vw, 56px)',
                lineHeight: 1.1,
                color: '#F3F7FA',
                letterSpacing: '-0.02em',
              }}
            >
              AI-Powered Drilling Intelligence
            </h1>
            <p
              className="mb-3"
              style={{
                fontSize: '18px',
                color: '#91A4B8',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              Nearby Wells Intelligence System
            </p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ fontSize: '16px', color: '#91A4B8', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}
          >
            Real-time risk prediction and decision support for{' '}
            <span style={{ color: '#19C3E6' }}>mud loss</span>,{' '}
            <span style={{ color: '#F4B740' }}>kick events</span>, and stuck pipe — powered by ML and 50K+ historical reports.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-3 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200"
              style={{ background: '#19C3E6', color: '#07111F' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Launch Mission Control
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/copilot')}
              className="flex items-center gap-3 px-8 py-3.5 rounded-lg font-medium text-base transition-all duration-200"
              style={{
                border: '1px solid #1B3047',
                color: '#91A4B8',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(25,195,230,0.35)';
                e.currentTarget.style.color = '#F3F7FA';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1B3047';
                e.currentTarget.style.color = '#91A4B8';
              }}
            >
              <Bot className="w-5 h-5" />
              Try AI Copilot
            </button>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.9 + i * 0.1 }}
                className="p-5 text-center rounded-xl"
                style={{
                  background: 'rgba(11, 23, 40, 0.9)',
                  border: '1px solid #1B3047',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-[#60758A]" />
                <div
                  className="text-3xl font-bold font-mono mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-[#60758A]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase font-mono text-[#60758A]">
            Explore Architecture
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(25,195,230,0.4), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{
              background: 'rgba(25, 195, 230, 0.08)',
              border: '1px solid rgba(25, 195, 230, 0.25)',
              color: '#19C3E6',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            ENTERPRISE CAPABILITIES
          </div>
          <h2
            className="font-bold mb-3 tracking-tight text-3xl text-[#F3F7FA]"
          >
            6 Operational Intelligence Engines
          </h2>
          <p className="text-sm text-[#91A4B8] max-w-xl mx-auto leading-relaxed">
            Unified drilling intelligence system delivering predictive geomechanical safety, automatic offset correlation, and sub-surface analytics.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="p-6 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: activeFeature === i ? 'rgba(25, 195, 230, 0.04)' : '#0B1728',
                border: activeFeature === i ? '1px solid rgba(25, 195, 230, 0.35)' : '1px solid #1B3047',
              }}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-200"
                style={{
                  background: activeFeature === i ? 'rgba(25, 195, 230, 0.15)' : '#101F33',
                  color: activeFeature === i ? '#19C3E6' : '#60758A',
                }}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3
                className="font-semibold mb-2 text-base text-[#F3F7FA]"
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5 text-[#91A4B8]">
                {f.desc}
              </p>
              <div
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
                style={{ color: activeFeature === i ? '#19C3E6' : '#60758A' }}
              >
                View Module <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid #1B3047' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: '#60758A' }}>
              POWERED BY
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map(tech => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-default"
                style={{ background: '#0B1728', border: '1px solid #1B3047', color: '#91A4B8' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(25,195,230,0.3)';
                  e.currentTarget.style.color = '#F3F7FA';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1B3047';
                  e.currentTarget.style.color = '#91A4B8';
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-xl"
            style={{
              background: 'rgba(11, 23, 40, 0.8)',
              border: '1px solid #1B3047',
            }}
          >
            <h2
              className="font-semibold mb-2"
              style={{ fontSize: '30px', color: '#F3F7FA', letterSpacing: '-0.01em' }}
            >
              Ready to transform your operations?
            </h2>
            <p className="mb-8 leading-relaxed text-[15px]" style={{ color: '#91A4B8' }}>
              Bring enterprise-grade AI intelligence to Oil India Limited's drilling operations —
              from risk prediction to real-time decision support.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200"
              style={{ background: '#19C3E6', color: '#07111F' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Enter Mission Control
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid #1B3047' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: '#19C3E6' }} />
            <span className="font-semibold text-sm" style={{ color: '#F3F7FA' }}>NWIS</span>
            <span className="text-sm" style={{ color: '#60758A' }}>— Oil India Limited</span>
          </div>
          <div className="text-xs" style={{ color: '#60758A' }}>
            SIH 2025 Grand Finals · Team NWIS · Build v2.4.1-PROD
          </div>
        </div>
      </footer>
    </div>
  );
}
