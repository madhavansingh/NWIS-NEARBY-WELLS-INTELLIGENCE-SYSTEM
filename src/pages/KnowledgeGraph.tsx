import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Info, Filter } from 'lucide-react';

type NodeType = 'well' | 'formation' | 'reservoir' | 'incident' | 'mitigation' | 'outcome';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  description: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

const nodeColors: Record<NodeType, string> = {
  well: '#19C3E6',
  formation: '#F4B740',
  reservoir: '#36D399',
  incident: '#FF5C6C',
  mitigation: '#8B5CF6',
  outcome: '#4DB6FF',
};

const nodeIcons: Record<NodeType, string> = {
  well: '⬟',
  formation: '▲',
  reservoir: '◉',
  incident: '⚠',
  mitigation: '✦',
  outcome: '✓',
};

const graphNodes: GraphNode[] = [
  { id: 'w1', label: 'BRAHMAPUTRA-14', type: 'well', x: 400, y: 250, description: 'Active well, 3420m depth, High risk zone' },
  { id: 'w2', label: 'JORHAT-07', type: 'well', x: 180, y: 160, description: 'Active well, 2180m depth, Medium risk' },
  { id: 'w3', label: 'DULIAJAN-23', type: 'well', x: 620, y: 150, description: 'Active well, 4820m depth, High risk' },
  { id: 'f1', label: 'Barail Formation', type: 'formation', x: 400, y: 100, description: 'Fractured sandstone, 3400-4200m, High mud loss zone' },
  { id: 'f2', label: 'Kopili Formation', type: 'formation', x: 180, y: 380, description: 'Shale formation, 1800-2500m, Reactive shale' },
  { id: 'f3', label: 'Tipam Formation', type: 'formation', x: 620, y: 380, description: 'Tight sandstone, 1480-2200m' },
  { id: 'r1', label: 'Barail Reservoir', type: 'reservoir', x: 550, y: 70, description: 'Primary oil reservoir, High permeability fractures' },
  { id: 'i1', label: 'Mud Loss (3420m)', type: 'incident', x: 280, y: 310, description: 'Severe mud loss: 35 bbl/hr at 3420m, Jul 2024' },
  { id: 'i2', label: 'Kick Event', type: 'incident', x: 520, y: 300, description: 'Gas kick at Barail sand contact, Aug 2024' },
  { id: 'i3', label: 'Stuck Pipe', type: 'incident', x: 130, y: 280, description: 'Differential sticking in Kopili shale, May 2024' },
  { id: 'm1', label: 'LCM Treatment', type: 'mitigation', x: 250, y: 430, description: 'Walnut shell + mica LCM pill, 50 ppb, 2 squeezes' },
  { id: 'm2', label: 'Mud Weight Increase', type: 'mitigation', x: 560, y: 430, description: 'Increased from 11.2 to 11.6 ppg before kick zone' },
  { id: 'm3', label: 'OBM Conversion', type: 'mitigation', x: 100, y: 430, description: 'Converted to OBM for reactive shale section' },
  { id: 'o1', label: 'Loss Controlled', type: 'outcome', x: 280, y: 530, description: 'Mud losses reduced to <2 bbl/hr after LCM treatment' },
  { id: 'o2', label: 'Well Killed', type: 'outcome', x: 560, y: 530, description: 'Driller method kill, 8hr operation, successful' },
  { id: 'o3', label: 'TD Reached', type: 'outcome', x: 100, y: 530, description: 'Target depth achieved after OBM conversion' },
];

const graphEdges: GraphEdge[] = [
  { source: 'w1', target: 'f1', label: 'drills through' },
  { source: 'w2', target: 'f2', label: 'drills through' },
  { source: 'w3', target: 'f3', label: 'drills through' },
  { source: 'f1', target: 'r1', label: 'overlies' },
  { source: 'w1', target: 'i1', label: 'encountered' },
  { source: 'w1', target: 'i2', label: 'encountered' },
  { source: 'w2', target: 'i3', label: 'encountered' },
  { source: 'f1', target: 'i1', label: 'caused' },
  { source: 'f1', target: 'i2', label: 'caused' },
  { source: 'f2', target: 'i3', label: 'caused' },
  { source: 'i1', target: 'm1', label: 'mitigated by' },
  { source: 'i2', target: 'm2', label: 'mitigated by' },
  { source: 'i3', target: 'm3', label: 'mitigated by' },
  { source: 'm1', target: 'o1', label: 'resulted in' },
  { source: 'm2', target: 'o2', label: 'resulted in' },
  { source: 'm3', target: 'o3', label: 'resulted in' },
  { source: 'w3', target: 'f1', label: 'drills through' },
  { source: 'w2', target: 'w1', label: 'nearby (8km)' },
];

export default function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<NodeType | 'all'>('all');
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const filteredNodes = filter === 'all' ? graphNodes : graphNodes.filter(n => n.type === filter);
  const filteredIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graphEdges.filter(e => filteredIds.has(e.source) && filteredIds.has(e.target));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const draw = () => {
      const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(1, 1);
      ctx.clearRect(0, 0, W, H);

      const scale = window.devicePixelRatio;
      ctx.save();
      ctx.scale(scale * zoom, scale * zoom);
      ctx.translate(pan.x / zoom, pan.y / zoom);

      t += 0.01;

      // Draw edges
      filteredEdges.forEach(edge => {
        const s = graphNodes.find(n => n.id === edge.source);
        const t2 = graphNodes.find(n => n.id === edge.target);
        if (!s || !t2) return;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated packet along edge
        const progress = ((t * 0.3) % 1);
        const px = s.x + (t2.x - s.x) * progress;
        const py = s.y + (t2.y - s.y) * progress;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
        ctx.fill();

        // Edge label (midpoint)
        const mx = (s.x + t2.x) / 2;
        const my = (s.y + t2.y) / 2;
        ctx.font = '8px Inter';
        ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, mx, my - 4);
      });

      // Draw nodes
      filteredNodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode === node.id;
        const color = nodeColors[node.type];
        const radius = isSelected ? 22 : isHovered ? 20 : 16;

        // Glow
        if (isSelected || isHovered) {
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2.5);
          glow.addColorStop(0, `${color}40`);
          glow.addColorStop(1, `${color}00`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Pulse ring for active nodes
        if (node.type === 'well' || node.type === 'incident') {
          const pulseRadius = radius + 8 + Math.sin(t * 3) * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}${Math.round((0.3 - Math.sin(t * 3) * 0.1) * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${color}20`;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Icon
        ctx.font = `${radius * 0.8}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nodeIcons[node.type], node.x, node.y);

        // Label
        ctx.font = `${isSelected ? 'bold ' : ''}10px Inter`;
        ctx.fillStyle = isSelected || isHovered ? '#fff' : 'rgba(226, 232, 240, 0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + radius + 5);
      });

      ctx.restore();
      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [filteredNodes, filteredEdges, selectedNode, hoveredNode, zoom, pan]);

  const getNodeAtPos = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cx = (x - rect.left) / zoom - pan.x / zoom;
    const cy = (y - rect.top) / zoom - pan.y / zoom;

    return filteredNodes.find(node => {
      const dx = node.x - cx;
      const dy = node.y - cy;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    }) || null;
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">Ontology & Knowledge Graph</h1>
          <p className="text-sm text-[#91A4B8] mt-1">
            Entity-relationship mapping across offset wells, formation geomechanics, historical hazards, and field mitigations
          </p>
        </div>
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
            className="w-9 h-9 bg-[#0B1728] border border-[#1B3047] rounded-xl flex items-center justify-center text-[#91A4B8] hover:text-[#F3F7FA] hover:border-[#19C3E6]/40 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
            className="w-9 h-9 bg-[#0B1728] border border-[#1B3047] rounded-xl flex items-center justify-center text-[#91A4B8] hover:text-[#F3F7FA] hover:border-[#19C3E6]/40 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-9 h-9 bg-[#0B1728] border border-[#1B3047] rounded-xl flex items-center justify-center text-[#91A4B8] hover:text-[#F3F7FA] hover:border-[#19C3E6]/40 transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[#60758A] mr-1" />
        {(['all', 'well', 'formation', 'reservoir', 'incident', 'mitigation', 'outcome'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition-colors font-medium ${
              filter === type
                ? 'bg-[#19C3E6]/12 border-[#19C3E6] text-[#19C3E6]'
                : 'bg-[#0B1728] border-[#1B3047] text-[#91A4B8] hover:text-[#F3F7FA]'
            }`}
          >
            {type === 'all' ? 'All Entities' : (
              <span className="flex items-center gap-1.5">
                <span style={{ color: nodeColors[type] }}>{nodeIcons[type]}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#60758A] font-mono">
          {filteredNodes.length} nodes · {filteredEdges.length} semantic relations
        </span>
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-5" style={{ height: 'calc(100vh - 240px)', minHeight: 520 }}>
        {/* Graph canvas */}
        <div className="flex-1 bg-[#07111F] border border-[#1B3047] rounded-xl overflow-hidden relative shadow-sm">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ width: '100%', height: '100%' }}
            onClick={e => {
              const node = getNodeAtPos(e.clientX, e.clientY);
              setSelectedNode(node);
            }}
            onMouseMove={e => {
              const node = getNodeAtPos(e.clientX, e.clientY);
              setHoveredNode(node?.id || null);
              if (isDragging.current) {
                setPan(p => ({
                  x: p.x + (e.clientX - lastMouse.current.x),
                  y: p.y + (e.clientY - lastMouse.current.y),
                }));
                lastMouse.current = { x: e.clientX, y: e.clientY };
              }
            }}
            onMouseDown={e => {
              isDragging.current = true;
              lastMouse.current = { x: e.clientX, y: e.clientY };
            }}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; setHoveredNode(null); }}
            onWheel={e => {
              setZoom(z => Math.max(0.3, Math.min(4, z - e.deltaY * 0.001)));
            }}
          />
          <div className="absolute bottom-4 left-4 text-xs text-[#91A4B8] font-mono pointer-events-none bg-[#0B1728]/80 px-3 py-1.5 rounded-lg border border-[#1B3047]">
            Click node to inspect attributes · Drag canvas to pan · Wheel to zoom
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Legend / Graph statistics */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#60758A] uppercase tracking-wider mb-3.5">
              Knowledge Schema Summary
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(nodeColors).map(([type, color]) => {
                const count = graphNodes.filter(n => n.type === type).length;
                return (
                  <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-[#101F33] border border-[#1B3047]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-[#DCE7F2] flex-1 capitalize">{type}</span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node detail panel */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5 flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-[#60758A] uppercase tracking-wider mb-3.5 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Entity Attribute Inspector
            </h3>

            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Node identity */}
                <div className="flex items-center gap-3 mb-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `${nodeColors[selectedNode.type]}15`,
                      border: `1px solid ${nodeColors[selectedNode.type]}40`,
                      color: nodeColors[selectedNode.type],
                    }}
                  >
                    {nodeIcons[selectedNode.type]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#F3F7FA] truncate">{selectedNode.label}</div>
                    <div className="text-xs capitalize font-medium" style={{ color: nodeColors[selectedNode.type] }}>
                      {selectedNode.type} Entity
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#DCE7F2] leading-relaxed mb-4 bg-[#101F33] p-3 rounded-lg border border-[#1B3047]">{selectedNode.description}</p>

                {/* Connections */}
                <div className="text-[11px] font-semibold text-[#60758A] uppercase tracking-wider mb-2.5">Related Knowledge Links</div>
                <div className="space-y-2">
                  {graphEdges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .slice(0, 6)
                    .map((edge, i) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const other = graphNodes.find(n => n.id === otherId);
                      return other ? (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#101F33] border border-[#1B3047] cursor-pointer hover:border-[#19C3E6]/40 transition-colors"
                          onClick={() => setSelectedNode(other)}
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
                            style={{ color: nodeColors[other.type] }}
                          >
                            {nodeIcons[other.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#F3F7FA] truncate">{other.label}</div>
                            <div className="text-[10px] text-[#60758A]">{edge.label}</div>
                          </div>
                        </div>
                      ) : null;
                    })}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#101F33] border border-[#1B3047] flex items-center justify-center mb-3">
                  <Info className="w-5 h-5 text-[#60758A]" />
                </div>
                <p className="text-xs text-[#91A4B8]">Click any entity node to inspect its properties and connected nodes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
