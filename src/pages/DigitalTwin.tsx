import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, RotateCcw, Layers, Target, Gauge, Activity, Zap } from 'lucide-react';

// 3D Well trajectory canvas visualization
function WellTrajectoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | undefined>(undefined);
  const [rotation, setRotation] = useState({ x: 20, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    const project3D = (x: number, y: number, z: number, rx: number, ry: number) => {
      // Rotate around Y axis
      const cosY = Math.cos(ry * Math.PI / 180);
      const sinY = Math.sin(ry * Math.PI / 180);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rx * Math.PI / 180);
      const sinX = Math.sin(rx * Math.PI / 180);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const perspective = 800;
      const scale = perspective / (perspective + z2 + 300);
      const cx = canvas.width / 2 + x1 * scale;
      const cy = canvas.height / 2 + y1 * scale;

      return { x: cx, y: cy, z: z2, scale };
    };

    const draw = () => {
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      t += 0.008;
      const autoRy = rotation.y + t * 15;

      // Background
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      bgGrad.addColorStop(0, 'rgba(0, 30, 60, 0.5)');
      bgGrad.addColorStop(1, 'rgba(2, 11, 24, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Formation layers (horizontal planes)
      const formations = [
        { depth: 0, color: '#F59E0B', name: 'Alluvium', opacity: 0.08 },
        { depth: 40, color: '#8B5CF6', name: 'Duplex', opacity: 0.08 },
        { depth: 80, color: '#06B6D4', name: 'Girujan', opacity: 0.1 },
        { depth: 120, color: '#10B981', name: 'Tipam', opacity: 0.08 },
        { depth: 160, color: '#3B82F6', name: 'Bokabil', opacity: 0.1 },
        { depth: 200, color: '#EC4899', name: 'Bhuban', opacity: 0.1 },
        { depth: 240, color: '#EF4444', name: 'Barail', opacity: 0.15 },
      ];

      formations.forEach((f) => {
        const corners = [
          project3D(-150, f.depth, -100, rotation.x, autoRy),
          project3D(150, f.depth, -100, rotation.x, autoRy),
          project3D(150, f.depth, 100, rotation.x, autoRy),
          project3D(-150, f.depth, 100, rotation.x, autoRy),
        ];

        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        corners.slice(1).forEach(c => ctx.lineTo(c.x, c.y));
        ctx.closePath();
        ctx.fillStyle = f.color + Math.round(f.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        ctx.strokeStyle = f.color + '40';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Layer label
        const labelPt = project3D(160, f.depth, -100, rotation.x, autoRy);
        ctx.font = '9px Inter';
        ctx.fillStyle = f.color + 'AA';
        ctx.textAlign = 'left';
        ctx.fillText(f.name, labelPt.x + 5, labelPt.y);
      });

      // Well bore path (vertical with slight deviation)
      const wellPoints = Array.from({ length: 80 }, (_, i) => {
        const depth = i / 79;
        const deviation = depth > 0.5 ? (depth - 0.5) * 40 : 0;
        return { x: deviation, y: depth * 270 - 20, z: deviation * 0.5 };
      });

      // Casing sections
      const casingSections = [
        { from: 0, to: 15, color: '#00D4FF', label: '30\" Casing' },
        { from: 15, to: 35, color: '#00E58A', label: '13-3/8\" Casing' },
        { from: 35, to: 60, color: '#FFB800', label: '9-5/8\" Casing' },
        { from: 60, to: 79, color: '#FF4560', label: 'Open Hole' },
      ];

      casingSections.forEach(section => {
        const pts = wellPoints.slice(section.from, section.to + 1);
        if (pts.length < 2) return;

        ctx.beginPath();
        const first = project3D(pts[0].x, pts[0].y, pts[0].z, rotation.x, autoRy);
        ctx.moveTo(first.x, first.y);
        pts.slice(1).forEach(p => {
          const proj = project3D(p.x, p.y, p.z, rotation.x, autoRy);
          ctx.lineTo(proj.x, proj.y);
        });
        ctx.strokeStyle = section.color + 'AA';
        ctx.lineWidth = section.color === '#FF4560' ? 2 : 4;
        if (section.color === '#FF4560') ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Bit position (animated)
      const bitIdx = Math.floor((Math.sin(t) * 0.1 + 0.9) * 76);
      const bitPt = wellPoints[bitIdx];
      const bitProj = project3D(bitPt.x, bitPt.y, bitPt.z, rotation.x, autoRy);

      // Bit glow
      const bitGrad = ctx.createRadialGradient(bitProj.x, bitProj.y, 0, bitProj.x, bitProj.y, 20);
      bitGrad.addColorStop(0, 'rgba(255, 69, 96, 0.6)');
      bitGrad.addColorStop(1, 'rgba(255, 69, 96, 0)');
      ctx.fillStyle = bitGrad;
      ctx.fillRect(bitProj.x - 20, bitProj.y - 20, 40, 40);

      ctx.beginPath();
      ctx.arc(bitProj.x, bitProj.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4560';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drilling fluid particles
      for (let i = 0; i < 8; i++) {
        const idx = Math.floor(((t * 0.3 + i / 8) % 1) * wellPoints.length);
        const p = wellPoints[idx];
        const proj = project3D(p.x, p.y, p.z, rotation.x, autoRy);
        ctx.beginPath();
        ctx.arc(proj.x + (Math.random() - 0.5) * 3, proj.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.fill();
      }

      // Depth axis
      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(96, 117, 138, 0.6)';
      ctx.textAlign = 'left';
      [0, 1000, 2000, 3000, 4000].forEach(depth => {
        const normalized = depth / 5000;
        const p = project3D(-160, normalized * 270 - 20, -100, rotation.x, autoRy);
        ctx.fillText(`${depth}m`, p.x - 50, p.y);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [rotation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ display: 'block' }}
      onMouseDown={e => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }}
      onMouseMove={e => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        setRotation(r => ({ x: Math.max(-60, Math.min(60, r.x + dy * 0.3)), y: r.y + dx * 0.3 }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
    />
  );
}

const telemetry = [
  { label: 'Current Depth', value: '3,420', unit: 'm', color: '#19C3E6', icon: Target },
  { label: 'Rate of Penetration', value: '15.4', unit: 'm/hr', color: '#36D399', icon: Activity },
  { label: 'Mud Weight', value: '11.2', unit: 'ppg', color: '#F4B740', icon: Gauge },
  { label: 'ECD', value: '11.6', unit: 'ppg', color: '#FF5C6C', icon: Gauge },
  { label: 'Weight on Bit', value: '18.5', unit: 'klbs', color: '#4DB6FF', icon: Zap },
  { label: 'RPM', value: '120', unit: 'rpm', color: '#91A4B8', icon: RotateCcw },
];

export default function DigitalTwin() {
  const [liveDepth, setLiveDepth] = useState(3420);

  useEffect(() => {
    const t = setInterval(() => setLiveDepth(d => d + Math.random() * 0.2), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Cpu className="w-6 h-6 text-[#19C3E6]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">
              Digital Twin — 3D Wellbore Simulation
            </h1>
          </div>
          <p className="text-sm text-[#91A4B8]">
            Real-time downhole trajectory projection and formation boundary penetration for OIL-BRAHMAPUTRA-14
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-[#FF5C6C]/30 bg-[#FF5C6C]/10 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#FF5C6C] live-dot" />
            <span className="text-xs font-mono font-bold text-[#FF5C6C]">LIVE TELEMETRY</span>
          </div>
          <div className="text-xs font-mono text-[#91A4B8] bg-[#0B1728] px-3 py-1.5 rounded-lg border border-[#1B3047]">
            Bit Depth: <span className="text-[#19C3E6] font-bold">{liveDepth.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Telemetry bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {telemetry.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#60758A] uppercase tracking-wider">{t.label}</span>
              <t.icon className="w-3.5 h-3.5 text-[#60758A]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-mono font-bold text-2xl tracking-tight"
                style={{ color: t.color }}
              >
                {t.label === 'Current Depth' ? Math.round(liveDepth).toLocaleString() : t.value}
              </span>
              <span className="text-xs text-[#60758A] font-mono">{t.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 350px)', minHeight: 480 }}>
        {/* 3D Viewer */}
        <div className="lg:col-span-3 bg-[#07111F] border border-[#1B3047] rounded-xl overflow-hidden relative shadow-sm">
          {/* Canvas overlay labels */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-[#0B1728]/95 border border-[#19C3E6]/30 px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#19C3E6] backdrop-blur-sm">
              OIL-BRAHMAPUTRA-14 · 3D DYNAMIC TRAJECTORY
            </div>
            <div className="bg-[#0B1728]/90 border border-[#1B3047] px-3.5 py-1.5 rounded-lg text-xs text-[#91A4B8] backdrop-blur-sm">
              Click & drag to rotate trajectory · Stratigraphic planes visible
            </div>
          </div>

          {/* Casing legend */}
          <div className="absolute top-4 right-4 z-10 bg-[#0B1728]/92 border border-[#1B3047] p-3.5 rounded-xl text-xs space-y-2 backdrop-blur-md">
            <div className="text-[11px] font-semibold text-[#91A4B8] uppercase tracking-wider mb-1">Casing Program</div>
            {[
              { color: '#00D4FF', label: '30\" Surface Casing' },
              { color: '#00E58A', label: '13-3/8\" Intermediate' },
              { color: '#FFB800', label: '9-5/8\" Production Liner' },
              { color: '#FF4560', label: 'Open Hole Target (now)' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2.5">
                <div className="w-5 h-1.5 rounded" style={{ background: c.color }} />
                <span className="text-[#DCE7F2] font-medium">{c.label}</span>
              </div>
            ))}
          </div>

          <WellTrajectoryCanvas />
        </div>

        {/* Side panel */}
        <div className="space-y-5 overflow-y-auto">
          {/* Formation column */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-3.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#19C3E6]" />
              Downhole Stratigraphy
            </h3>
            <div className="space-y-1">
              {[
                { name: 'Alluvium', from: 0, to: 180, color: '#F59E0B', current: false },
                { name: 'Duplex', from: 180, to: 620, color: '#8B5CF6', current: false },
                { name: 'Girujan', from: 620, to: 1480, color: '#06B6D4', current: false },
                { name: 'Tipam', from: 1480, to: 2200, color: '#10B981', current: false },
                { name: 'Bokabil', from: 2200, to: 2800, color: '#3B82F6', current: false },
                { name: 'Bhuban', from: 2800, to: 3400, color: '#EC4899', current: false },
                { name: 'Barail', from: 3400, to: 4200, color: '#EF4444', current: true },
              ].map(f => (
                <div
                  key={f.name}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    f.current ? 'bg-[#FF5C6C]/10 border border-[#FF5C6C]/30' : 'hover:bg-[#101F33]'
                  }`}
                >
                  <div
                    className="w-2 h-4 rounded-sm flex-shrink-0"
                    style={{ background: f.color + '60', borderLeft: `2px solid ${f.color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#F3F7FA]">{f.name}</div>
                    <div className="text-[11px] text-[#60758A] font-mono">{f.from}–{f.to} m</div>
                  </div>
                  {f.current && (
                    <div className="text-[10px] text-[#FF5C6C] font-mono font-bold uppercase bg-[#FF5C6C]/20 px-1.5 py-0.5 rounded">BIT HERE</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drilling events */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-3.5">Recent Operations Log</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { time: '14:32', event: 'Core recovery @ 3380m verified', type: 'info' },
                { time: '13:55', event: 'Minor lost returns 3bbl/hr flagged', type: 'warn' },
                { time: '12:10', event: 'Wiper trip successfully completed', type: 'ok' },
                { time: '09:45', event: 'Lithological boundary change logged', type: 'info' },
                { time: '08:20', event: 'Mud pump pressure spike resolved', type: 'warn' },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    ev.type === 'warn' ? 'bg-[#F4B740]' : ev.type === 'ok' ? 'bg-[#36D399]' : 'bg-[#19C3E6]'
                  }`} />
                  <div>
                    <span className="text-[#60758A] font-mono mr-1">{ev.time} — </span>
                    <span className="text-[#DCE7F2]">{ev.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
