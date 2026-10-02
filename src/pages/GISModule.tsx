import { useState, useEffect, useRef } from 'react';
import { Eye, AlertTriangle } from 'lucide-react';
import { mockWells } from '../data/mockData';

const CANVAS_W = 800;
const CANVAS_H = 520;

// Simulated geological features
const faultLines = [
  { x1: 100, y1: 50, x2: 200, y2: 350 },
  { x1: 600, y1: 80, x2: 700, y2: 400 },
  { x1: 300, y1: 30, x2: 500, y2: 200 },
];

const reservoirBoundaries = [
  { cx: 400, cy: 260, rx: 180, ry: 100, name: 'Barail Reservoir', color: '#36D399' },
  { cx: 180, cy: 350, rx: 100, ry: 60, name: 'Kopili Reservoir', color: '#19C3E6' },
  { cx: 620, cy: 200, rx: 120, ry: 70, name: 'Tipam Reservoir', color: '#8B5CF6' },
];

const riskZones = [
  { cx: 400, cy: 250, rx: 80, ry: 50, type: 'mud_loss', risk: 0.85, label: 'Mud Loss Zone' },
  { cx: 200, cy: 180, rx: 60, ry: 40, type: 'kick', risk: 0.6, label: 'Kick Zone' },
  { cx: 620, cy: 160, rx: 70, ry: 45, type: 'overpressure', risk: 0.72, label: 'Overpressure' },
];

const wellPositions = [
  { ...mockWells[0], mx: 390, my: 250 },
  { ...mockWells[1], mx: 200, my: 190 },
  { ...mockWells[2], mx: 620, my: 165 },
  { ...mockWells[3], mx: 140, my: 330 },
  { ...mockWells[4], mx: 580, my: 370 },
  { ...mockWells[5], mx: 380, my: 350 },
];

const RADIUS_OPTIONS = [5, 10, 20, 50];

export default function GISModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedWell, setSelectedWell] = useState<typeof wellPositions[0] | null>(wellPositions[0]);
  const [radius, setRadius] = useState(10);
  const [layers, setLayers] = useState({
    reservoirs: true,
    faults: true,
    riskZones: true,
    formations: false,
    heatmap: true,
  });
  const [hoveredWell, setHoveredWell] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = CANVAS_W * dpr;
      canvas.height = CANVAS_H * dpr;
      canvas.style.width = CANVAS_W + 'px';
      canvas.style.height = CANVAS_H + 'px';
      ctx.scale(dpr, dpr);

      t += 0.015;

      // --- Background ---
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, '#07111F');
      bgGrad.addColorStop(1, '#0B1728');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid
      ctx.strokeStyle = 'rgba(27,48,71,0.6)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
      }

      // --- Risk heatmap ---
      if (layers.heatmap) {
        riskZones.forEach(zone => {
          const colors: Record<string, string> = {
            mud_loss: '255, 92, 108',
            kick: '244, 183, 64',
            overpressure: '139, 92, 246',
          };
          const c = colors[zone.type] || '25, 195, 230';
          const grad = ctx.createRadialGradient(zone.cx, zone.cy, 0, zone.cx, zone.cy, Math.max(zone.rx, zone.ry) * 1.5);
          grad.addColorStop(0, `rgba(${c}, ${zone.risk * 0.35})`);
          grad.addColorStop(1, `rgba(${c}, 0)`);
          ctx.beginPath();
          ctx.ellipse(zone.cx, zone.cy, zone.rx * 1.5, zone.ry * 1.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // --- Reservoir boundaries ---
      if (layers.reservoirs) {
        reservoirBoundaries.forEach(res => {
          ctx.beginPath();
          ctx.ellipse(res.cx, res.cy, res.rx, res.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = res.color + '50';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = res.color + '08';
          ctx.fill();

          // Label
          ctx.font = '10px Inter';
          ctx.fillStyle = res.color + '90';
          ctx.textAlign = 'center';
          ctx.fillText(res.name, res.cx, res.cy + res.ry + 14);
        });
      }

      // --- Fault lines ---
      if (layers.faults) {
        faultLines.forEach(f => {
          ctx.beginPath();
          ctx.moveTo(f.x1, f.y1);
          ctx.lineTo(f.x2, f.y2);
          ctx.strokeStyle = 'rgba(255, 92, 108, 0.3)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // --- Radius circle around selected well ---
      if (selectedWell) {
        const kmToPixels = 5;
        const radiusPx = radius * kmToPixels;

        // Animated outer pulse
        const pulseR = radiusPx + Math.sin(t * 2) * 6;
        ctx.beginPath();
        ctx.arc(selectedWell.mx, selectedWell.my, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(25, 195, 230, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Solid radius
        ctx.beginPath();
        ctx.arc(selectedWell.mx, selectedWell.my, radiusPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(25, 195, 230, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(25, 195, 230, 0.04)';
        ctx.fill();

        // Radius label
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(25, 195, 230, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(`${radius} km`, selectedWell.mx, selectedWell.my - radiusPx - 8);

        // Lines to nearby wells
        wellPositions.filter(w => w.id !== selectedWell.id).forEach(nw => {
          const dx = nw.mx - selectedWell.mx;
          const dy = nw.my - selectedWell.my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radiusPx) {
            ctx.beginPath();
            ctx.moveTo(selectedWell.mx, selectedWell.my);
            ctx.lineTo(nw.mx, nw.my);
            ctx.strokeStyle = 'rgba(25, 195, 230, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = '9px "JetBrains Mono"';
            ctx.fillStyle = 'rgba(25, 195, 230, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(dist / kmToPixels * 10) / 10}km`, selectedWell.mx + dx * 0.5, selectedWell.my + dy * 0.5);
          }
        });
      }

      // --- Wells ---
      wellPositions.forEach(well => {
        const isSelected = selectedWell?.id === well.id;
        const isHovered = hoveredWell === well.id;

        const riskColor = well.riskScore > 70 ? '#FF5C6C' :
          well.riskScore > 40 ? '#F4B740' : '#36D399';

        // Glow
        if (isSelected || isHovered) {
          const gl = ctx.createRadialGradient(well.mx, well.my, 0, well.mx, well.my, 30);
          gl.addColorStop(0, riskColor + '40');
          gl.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(well.mx, well.my, 30, 0, Math.PI * 2);
          ctx.fillStyle = gl;
          ctx.fill();
        }

        // Active pulse
        if (well.status === 'active') {
          const pr = 14 + Math.sin(t * 3 + well.mx * 0.1) * 5;
          ctx.beginPath();
          ctx.arc(well.mx, well.my, pr, 0, Math.PI * 2);
          ctx.strokeStyle = riskColor + '40';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Well marker
        const sz = isSelected ? 10 : isHovered ? 9 : 7;
        ctx.beginPath();
        ctx.arc(well.mx, well.my, sz, 0, Math.PI * 2);
        ctx.fillStyle = riskColor + '30';
        ctx.fill();
        ctx.strokeStyle = riskColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(well.mx, well.my, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Label
        if (isSelected || isHovered) {
          ctx.font = 'bold 11px Inter';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(well.name.split('-').pop() || '', well.mx, well.my + sz + 14);
          if (well.riskScore > 0) {
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillStyle = riskColor;
            ctx.fillText(`Risk: ${well.riskScore}%`, well.mx, well.my + sz + 26);
          }
        }
      });

      // --- Compass ---
      ctx.save();
      ctx.translate(CANVAS_W - 50, 50);
      ctx.strokeStyle = 'rgba(25, 195, 230, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.font = '10px Inter';
      ctx.fillStyle = 'rgba(25, 195, 230, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('N', 0, -26);
      ctx.fillStyle = 'rgba(25, 195, 230, 0.4)';
      ctx.fillText('S', 0, 30);
      ctx.fillText('W', -26, 4);
      ctx.fillText('E', 26, 4);
      ctx.restore();

      // Scale bar
      ctx.fillStyle = 'rgba(25, 195, 230, 0.5)';
      ctx.font = '9px "JetBrains Mono"';
      ctx.textAlign = 'left';
      ctx.fillText('0', 20, CANVAS_H - 20);
      ctx.fillText('50km', 120, CANVAS_H - 20);
      ctx.strokeStyle = 'rgba(25, 195, 230, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(30, CANVAS_H - 26); ctx.lineTo(110, CANVAS_H - 26); ctx.stroke();

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [selectedWell, radius, layers, hoveredWell]);

  const getWellAtPos = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (x - rect.left) * scaleX;
    const cy = (y - rect.top) * scaleY;
    return wellPositions.find(w => Math.hypot(w.mx - cx, w.my - cy) < 18) || null;
  };

  const nearbyWells = selectedWell
    ? wellPositions.filter(w => {
        if (w.id === selectedWell.id) return false;
        const dx = w.mx - selectedWell.mx;
        const dy = w.my - selectedWell.my;
        return Math.sqrt(dx * dx + dy * dy) <= radius * 5;
      })
    : [];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">GIS Spatial Intelligence</h1>
          <p className="text-sm text-[#91A4B8] mt-1">Spatial correlation of offset trajectories, geological faults, and reservoir boundaries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#60758A] font-medium">Proximity Radius:</span>
          {RADIUS_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: radius === r ? 'rgba(25,195,230,0.12)' : '#0B1728',
                border: `1px solid ${radius === r ? '#19C3E6' : '#1B3047'}`,
                color: radius === r ? '#19C3E6' : '#91A4B8'
              }}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5" style={{ height: 'calc(100vh - 210px)', minHeight: 560 }}>
        {/* Map canvas */}
        <div
          className="flex-1 rounded-xl overflow-hidden relative shadow-sm"
          style={{ background: '#07111F', border: '1px solid #1B3047' }}
        >
          {/* Layer controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#0B1728]/90 border border-[#1B3047] backdrop-blur-sm">
            {Object.entries(layers).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setLayers(l => ({ ...l, [key]: !val }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: val ? 'rgba(25,195,230,0.15)' : 'transparent',
                  border: `1px solid ${val ? 'rgba(25,195,230,0.35)' : 'transparent'}`,
                  color: val ? '#19C3E6' : '#91A4B8'
                }}
              >
                <Eye style={{ width: 12, height: 12 }} />
                {key === 'riskZones' ? 'Risk Zones' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ display: 'block' }}
            onClick={e => {
              const w = getWellAtPos(e.clientX, e.clientY);
              if (w) setSelectedWell(w);
            }}
            onMouseMove={e => {
              const w = getWellAtPos(e.clientX, e.clientY);
              setHoveredWell(w?.id || null);
            }}
            onMouseLeave={() => setHoveredWell(null)}
          />

          {/* Legend */}
          <div
            className="absolute bottom-4 right-4 p-3.5 rounded-xl text-xs space-y-2 backdrop-blur-md"
            style={{ background: 'rgba(11,23,40,0.92)', border: '1px solid #1B3047' }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#91A4B8] mb-1">GIS Map Legend</div>
            {[['#36D399', 'Active Rig'], ['#F4B740', 'Suspended'], ['#19C3E6', 'Completed']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-[#DCE7F2]">{l}</span>
              </div>
            ))}
            <div style={{ height: 1, background: '#1B3047', margin: '4px 0' }} />
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t border-dashed border-[#FF5C6C]" />
              <span className="text-[#DCE7F2]">Fault Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t border-dashed border-[#36D399]" />
              <span className="text-[#DCE7F2]">Reservoir Bound</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4 overflow-y-auto flex-shrink-0">
          {/* Selected well */}
          {selectedWell && (
            <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#60758A]">Selected Well</span>
                <span
                  className="text-[11px] font-medium uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: selectedWell.status === 'active' ? 'rgba(54,211,153,0.12)' : 'rgba(244,183,64,0.12)',
                    color: selectedWell.status === 'active' ? '#36D399' : '#F4B740',
                    border: `1px solid ${selectedWell.status === 'active' ? 'rgba(54,211,153,0.3)' : 'rgba(244,183,64,0.3)'}`
                  }}
                >
                  {selectedWell.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F3F7FA]">{selectedWell.name}</h3>
              <p className="text-xs text-[#91A4B8] mb-4">{selectedWell.formation}</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Current Depth', value: `${selectedWell.depth}m`, color: '#19C3E6' },
                  { label: 'Mud Loss Risk', value: `${selectedWell.riskScore}%`, color: selectedWell.riskScore > 70 ? '#FF5C6C' : '#F4B740' },
                  { label: 'Mud Weight', value: `${selectedWell.mudWeight} ppg`, color: '#DCE7F2' },
                  { label: 'Operator', value: 'OIL India', color: '#91A4B8' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                    <div className="text-[11px] text-[#60758A] mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold font-mono" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby wells */}
          <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-semibold text-[#F3F7FA]">Offset Wells in Zone</h3>
              <span className="text-xs text-[#19C3E6] font-mono">{nearbyWells.length} within {radius}km</span>
            </div>
            {nearbyWells.length === 0 ? (
              <p className="text-xs text-center py-4 text-[#60758A]">No offset wells within {radius}km radius</p>
            ) : (
              <div className="space-y-2">
                {nearbyWells.map(w => (
                  <div
                    key={w.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                    style={{ background: '#101F33', border: '1px solid #1B3047' }}
                    onClick={() => setSelectedWell(w)}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: w.riskScore > 70 ? '#FF5C6C' : w.riskScore > 40 ? '#F4B740' : '#36D399' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#F3F7FA] truncate">{w.name}</div>
                      <div className="text-[11px] text-[#60758A]">{w.formation}</div>
                    </div>
                    <div className="text-xs font-mono font-medium" style={{ color: w.riskScore > 70 ? '#FF5C6C' : '#91A4B8' }}>
                      {w.riskScore > 0 ? `${w.riskScore}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Zones */}
          <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <h3 className="text-sm font-semibold mb-3.5 flex items-center gap-2 text-[#F3F7FA]">
              <AlertTriangle style={{ width: 14, height: 14, color: '#FF5C6C' }} />
              Active Geological Risk Polygons
            </h3>
            <div className="space-y-2">
              {riskZones.map(zone => (
                <div key={zone.type} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                  <div
                    className="w-2.5 h-2.5 rounded flex-shrink-0"
                    style={{ background: zone.type === 'mud_loss' ? '#FF5C6C' : zone.type === 'kick' ? '#F4B740' : '#8B5CF6' }}
                  />
                  <span className="text-xs font-medium text-[#DCE7F2] flex-1">{zone.label}</span>
                  <span
                    className="text-xs font-bold font-mono"
                    style={{
                      color: zone.risk > 0.7 ? '#FF5C6C' : zone.risk > 0.5 ? '#F4B740' : '#36D399',
                    }}
                  >
                    {Math.round(zone.risk * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
