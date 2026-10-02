import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Layers, Sliders, Play, Pause, RotateCcw } from 'lucide-react';
import { heatmapData, mockFormations } from '../data/mockData';

const RISK_TYPES = [
  { id: 'mud_loss', label: 'Mud Loss', color: '#FF5C6C' },
  { id: 'kick', label: 'Kick', color: '#F4B740' },
  { id: 'overpressure', label: 'Overpressure', color: '#8B5CF6' },
  { id: 'stuck_pipe', label: 'Stuck Pipe', color: '#4DB6FF' },
];

function HeatmapCell({ intensity, riskType, depth }: { intensity: number; riskType: string; depth: string }) {
  const colors: Record<string, [string, string]> = {
    mud_loss: ['rgba(255,92,108,', ')'],
    kick: ['rgba(244,183,64,', ')'],
    overpressure: ['rgba(139,92,246,', ')'],
    stuck_pipe: ['rgba(77,182,255,', ')'],
  };
  const [start, end] = colors[riskType] || ['rgba(77,182,255,', ')'];
  const alpha = Math.max(0.05, intensity);

  return (
    <motion.div
      className="heatmap-cell aspect-square cursor-pointer relative group"
      style={{ background: `${start}${alpha}${end}` }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tooltip on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap bg-[#101F33] border border-[#1B3047] text-[#F3F7FA] z-50 pointer-events-none">
          {depth} · {Math.round(intensity * 100)}%
        </div>
      </div>
    </motion.div>
  );
}

export default function FormationHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeRiskType, setActiveRiskType] = useState('mud_loss');
  const [opacity, setOpacity] = useState(0.8);
  const [timeSlider, setTimeSlider] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<typeof mockFormations[0] | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeSlider(t => {
        if (t >= 100) { setIsPlaying(false); return 100; }
        return t + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#07111F';
    ctx.fillRect(0, 0, W, H);

    // Formation layers
    const formationH = H / mockFormations.length;
    mockFormations.forEach((f, i) => {
      const y = i * formationH;

      // Layer background
      ctx.fillStyle = f.color + '15';
      ctx.fillRect(0, y, W, formationH);

      // Layer stripe
      ctx.fillStyle = f.color + '30';
      ctx.fillRect(0, y, 4, formationH);

      // Formation name
      ctx.font = 'bold 10px Inter';
      ctx.fillStyle = f.color + 'CC';
      ctx.textAlign = 'left';
      ctx.fillText(f.name, 10, y + formationH / 2 + 4);

      ctx.font = '9px Inter';
      ctx.fillStyle = 'rgba(96,117,138,0.8)';
      ctx.fillText(`${f.topDepth}–${f.bottomDepth}m`, 10, y + formationH / 2 + 16);

      // Risk heatmap overlay
      const riskColors: Record<string, string> = {
        mud_loss: '255,92,108',
        kick: '244,183,64',
        overpressure: '139,92,246',
        stuck_pipe: '77,182,255',
      };
      const rgb = riskColors[activeRiskType] || '77,182,255';

      if (f.riskLevel !== 'low') {
        const riskIntensity = f.riskLevel === 'high' ? 0.25 : 0.12;
        const timeScaled = (timeSlider / 100) * riskIntensity;

        // Create horizontal wave heatmap
        const grad = ctx.createLinearGradient(60, y, W, y);
        grad.addColorStop(0, `rgba(${rgb}, 0)`);
        grad.addColorStop(0.3, `rgba(${rgb}, ${timeScaled * 0.5})`);
        grad.addColorStop(0.6, `rgba(${rgb}, ${timeScaled})`);
        grad.addColorStop(0.8, `rgba(${rgb}, ${timeScaled * 0.7})`);
        grad.addColorStop(1, `rgba(${rgb}, ${timeScaled * 0.3})`);
        ctx.fillStyle = grad;
        ctx.fillRect(60, y, W - 60, formationH);
      }

      // Depth line
      ctx.strokeStyle = 'rgba(27,48,71,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + formationH);
      ctx.lineTo(W, y + formationH);
      ctx.stroke();

      // Risk indicator dot
      const riskDot =
        f.riskLevel === 'high' ? '#FF5C6C' :
        f.riskLevel === 'medium' ? '#F4B740' :
        '#36D399';
      ctx.beginPath();
      ctx.arc(W - 15, y + formationH / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = riskDot;
      ctx.fill();
    });

    // Depth axis labels
    ctx.fillStyle = 'rgba(96,117,138,0.8)';
    ctx.font = '9px Inter';
    ctx.textAlign = 'right';
    mockFormations.forEach((f, i) => {
      ctx.fillText(f.topDepth + 'm', W - 25, i * formationH + 14);
    });

    // Current well depth marker
    const currentDepth = 3420;
    const totalDepthRange = 5000;
    const markerY = (currentDepth / totalDepthRange) * H;
    ctx.strokeStyle = 'rgba(25,195,230,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(0, markerY);
    ctx.lineTo(W, markerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#19C3E6';
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('▶ 3420m (BRAHMAPUTRA-14)', 70, markerY - 5);

  }, [activeRiskType, opacity, timeSlider]);

  return (
    <motion.div
      className="p-6 space-y-6"
      style={{ background: '#07111F', minHeight: '100vh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Flame className="w-6 h-6 text-[#FF5C6C]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">Formation Risk Heatmap</h1>
          </div>
          <p className="text-sm text-[#91A4B8]">
            GIS-integrated stratigraphy cross-section and dynamic time-lapse hazard modeling
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-4 md:p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
        {/* Risk type selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#60758A] font-semibold mr-1 uppercase tracking-wider">Hazard Mode</span>
          {RISK_TYPES.map(rt => (
            <button
              key={rt.id}
              onClick={() => setActiveRiskType(rt.id)}
              className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg font-medium transition-all"
              style={
                activeRiskType === rt.id
                  ? {
                      background: `${rt.color}18`,
                      border: `1px solid ${rt.color}`,
                      color: rt.color,
                    }
                  : {
                      background: '#101F33',
                      border: '1px solid #1B3047',
                      color: '#91A4B8',
                    }
              }
            >
              <div className="w-2 h-2 rounded-full" style={{ background: rt.color }} />
              {rt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Opacity slider */}
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#60758A]" />
            <span className="text-xs text-[#91A4B8] font-medium">Layer Density</span>
            <input
              type="range" min={10} max={100} value={Math.round(opacity * 100)}
              onChange={e => setOpacity(parseInt(e.target.value) / 100)}
              className="w-24"
              style={{ accentColor: '#19C3E6' }}
            />
            <span className="text-xs font-mono font-medium text-[#19C3E6] w-9">{Math.round(opacity * 100)}%</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { setTimeSlider(0); setIsPlaying(true); }}
              className="w-8 h-8 rounded-lg border border-[#1B3047] flex items-center justify-center text-[#91A4B8] hover:text-[#19C3E6] bg-[#101F33] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={
                isPlaying
                  ? { background: 'rgba(244,183,64,0.15)', border: '1px solid #F4B740', color: '#F4B740' }
                  : { background: '#101F33', border: '1px solid #1B3047', color: '#91A4B8' }
              }
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range" min={0} max={100} value={timeSlider}
              onChange={e => { setTimeSlider(parseInt(e.target.value)); setIsPlaying(false); }}
              className="w-32"
              style={{ accentColor: '#F4B740' }}
            />
            <span className="text-xs font-mono font-medium text-[#F4B740] w-9">{timeSlider}%</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas heatmap */}
        <div
          className="lg:col-span-3 bg-[#0B1728] border border-[#1B3047] rounded-xl overflow-hidden relative shadow-sm"
          style={{ height: 560 }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Formation list */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#19C3E6]" />
              Stratigraphic Sequences
            </h3>
            <div className="space-y-1.5">
              {mockFormations.map(f => (
                <div
                  key={f.name}
                  onClick={() => setSelectedFormation(f === selectedFormation ? null : f)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: selectedFormation?.name === f.name ? '#101F33' : 'transparent',
                    borderLeft: selectedFormation?.name === f.name ? `3px solid ${f.color}` : '3px solid transparent',
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#F3F7FA] truncate">{f.name}</div>
                    <div className="text-[11px] text-[#60758A] font-mono">{f.topDepth}–{f.bottomDepth}m</div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                    style={
                      f.riskLevel === 'high'
                        ? { background: 'rgba(255,92,108,0.12)', color: '#FF5C6C', border: '1px solid rgba(255,92,108,0.3)' }
                        : f.riskLevel === 'medium'
                        ? { background: 'rgba(244,183,64,0.12)', color: '#F4B740', border: '1px solid rgba(244,183,64,0.3)' }
                        : { background: 'rgba(54,211,153,0.12)', color: '#36D399', border: '1px solid rgba(54,211,153,0.3)' }
                    }
                  >
                    {f.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk density grid */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-3.5">Spatial Risk Density Matrix</h3>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(12, 1fr)` }}>
              {heatmapData.map((row, ri) =>
                row.map((cell, ci) => (
                  <HeatmapCell
                    key={`${ri}-${ci}`}
                    intensity={cell.intensity}
                    riskType={activeRiskType}
                    depth={`${3000 + ri * 150}m`}
                  />
                ))
              )}
            </div>
            <div className="flex items-center justify-between mt-3.5 text-[11px] font-mono text-[#91A4B8]">
              <span>Negligible</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                  <div
                    key={v}
                    className="w-4 h-2 rounded-sm"
                    style={{
                      background:
                        (RISK_TYPES.find(r => r.id === activeRiskType)?.color ?? '#4DB6FF') +
                        Math.round(v * 255).toString(16).padStart(2, '0'),
                    }}
                  />
                ))}
              </div>
              <span>Critical</span>
            </div>
          </div>

          {/* Selected formation detail */}
          {selectedFormation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#101F33] border rounded-xl p-5"
              style={{ borderColor: selectedFormation.color + '50' }}
            >
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedFormation.color }} />
                <span className="text-sm font-bold text-[#F3F7FA]">{selectedFormation.name}</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#60758A]">Depth Range</span>
                  <span className="text-[#F3F7FA] font-mono font-medium">
                    {selectedFormation.topDepth}–{selectedFormation.bottomDepth} m
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#60758A]">Dominant Lithology</span>
                  <span className="text-[#DCE7F2] font-medium">{selectedFormation.lithology}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#60758A]">Evaluated Severity</span>
                  <span
                    className="font-bold uppercase text-[11px]"
                    style={
                      selectedFormation.riskLevel === 'high'
                        ? { color: '#FF5C6C' }
                        : selectedFormation.riskLevel === 'medium'
                        ? { color: '#F4B740' }
                        : { color: '#36D399' }
                    }
                  >
                    {selectedFormation.riskLevel}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
