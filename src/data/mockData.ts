// Core types for NWIS platform

export interface Well {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'suspended' | 'planned';
  depth: number;
  targetDepth: number;
  lat: number;
  lng: number;
  formation: string;
  riskScore: number;
  mudWeight: number;
  rop: number;
  wob: number;
  rpm: number;
  flowRate: number;
  ecd: number;
}

export interface RiskPrediction {
  type: 'mud_loss' | 'kick' | 'stuck_pipe' | 'overpressure' | 'cementing';
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  depth: number;
  message: string;
  reasons: string[];
  similarWells: string[];
}

export interface Alert {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  depth: number;
  confidence: number;
  time: Date;
  acknowledged: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: 'WCR' | 'DDR' | 'MudLog' | 'GeologicalReport' | 'ReservoirReport' | 'PDF';
  wellId: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  extractedEntities: ExtractedEntity[];
}

export interface ExtractedEntity {
  type: string;
  value: string;
  depth?: number;
  confidence: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'well' | 'formation' | 'reservoir' | 'incident' | 'mitigation' | 'outcome';
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  similarWells?: string[];
}

export interface FormationLayer {
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  riskLevel: 'high' | 'medium' | 'low';
  color: string;
}

export interface Lesson {
  id: string;
  title: string;
  formation: string;
  wellId: string;
  category: string;
  content: string;
  tags: string[];
  author: string;
  date: Date;
  votes: number;
}

// Mock data generators
export const mockWells: Well[] = [
  {
    id: 'W-001', name: 'OIL-BRAHMAPUTRA-14', status: 'active', depth: 3420, targetDepth: 4200,
    lat: 27.4728, lng: 94.9120, formation: 'Barail Formation', riskScore: 82,
    mudWeight: 11.2, rop: 15.4, wob: 18.5, rpm: 120, flowRate: 820, ecd: 11.6
  },
  {
    id: 'W-002', name: 'OIL-JORHAT-07', status: 'active', depth: 2180, targetDepth: 3500,
    lat: 26.7509, lng: 94.2037, formation: 'Kopili Formation', riskScore: 45,
    mudWeight: 10.4, rop: 22.1, wob: 15.0, rpm: 140, flowRate: 750, ecd: 10.8
  },
  {
    id: 'W-003', name: 'OIL-DULIAJAN-23', status: 'active', depth: 4820, targetDepth: 5000,
    lat: 27.3693, lng: 95.3207, formation: 'Tipam Formation', riskScore: 68,
    mudWeight: 12.1, rop: 8.3, wob: 22.0, rpm: 95, flowRate: 900, ecd: 12.6
  },
  {
    id: 'W-004', name: 'OIL-SIBSAGAR-11', status: 'suspended', depth: 1950, targetDepth: 3000,
    lat: 26.9888, lng: 94.6377, formation: 'Sylhet Formation', riskScore: 25,
    mudWeight: 9.8, rop: 0, wob: 0, rpm: 0, flowRate: 0, ecd: 0
  },
  {
    id: 'W-005', name: 'OIL-NAHARKATIA-06', status: 'completed', depth: 3850, targetDepth: 3850,
    lat: 27.2901, lng: 95.3477, formation: 'Barail Formation', riskScore: 0,
    mudWeight: 11.8, rop: 0, wob: 0, rpm: 0, flowRate: 0, ecd: 0
  },
  {
    id: 'W-006', name: 'OIL-MORAN-18', status: 'active', depth: 2650, targetDepth: 4100,
    lat: 26.6769, lng: 94.8420, formation: 'Kopili Formation', riskScore: 55,
    mudWeight: 10.9, rop: 18.7, wob: 17.2, rpm: 130, flowRate: 800, ecd: 11.3
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'A-001', type: 'high', title: 'Mud Loss Risk Detected',
    message: 'Approaching historical mud loss zone in Barail Formation. Recommend LCM pill preparation.',
    depth: 3420, confidence: 91, time: new Date(Date.now() - 5 * 60000), acknowledged: false
  },
  {
    id: 'A-002', type: 'medium', title: 'Elevated ECD Warning',
    message: 'ECD approaching fracture gradient. Monitor pit volume trends carefully.',
    depth: 4820, confidence: 78, time: new Date(Date.now() - 12 * 60000), acknowledged: false
  },
  {
    id: 'A-003', type: 'low', title: 'Torque Fluctuation Observed',
    message: 'Minor torque spikes detected. Possible formation change at current depth.',
    depth: 2180, confidence: 65, time: new Date(Date.now() - 28 * 60000), acknowledged: true
  },
  {
    id: 'A-004', type: 'high', title: 'Kick Risk Alert',
    message: 'Unexpected pressure gradient detected. Verify mud weight and flowback volumes.',
    depth: 4820, confidence: 87, time: new Date(Date.now() - 2 * 60000), acknowledged: false
  },
];

export const mockPredictions: RiskPrediction[] = [
  {
    type: 'mud_loss', confidence: 82, severity: 'high', depth: 3470,
    message: 'High probability of mud loss at 3470m in Barail Formation fracture zone',
    reasons: ['Similar to Well-14 incident', 'Same formation lithology', 'Matching mud weight 11.2 ppg', '7 historical incidents documented'],
    similarWells: ['OIL-BRAHMAPUTRA-14', 'OIL-DULIAJAN-07', 'OIL-NAHARKATIA-03']
  },
  {
    type: 'kick', confidence: 67, severity: 'medium', depth: 3680,
    message: 'Moderate kick risk approaching Barail sandstone reservoir contact',
    reasons: ['Reservoir proximity < 200m', 'Underbalanced ECD margin', 'Historical gas shows in offset wells'],
    similarWells: ['OIL-JORHAT-04', 'OIL-SIBSAGAR-09']
  },
  {
    type: 'stuck_pipe', confidence: 45, severity: 'low', depth: 3200,
    message: 'Low risk of differential sticking in shale section',
    reasons: ['High overbalance pressure', 'Reactive shale formation', 'Extended exposure time > 48hr'],
    similarWells: ['OIL-MORAN-12']
  },
];

export const mockFormations: FormationLayer[] = [
  { name: 'Alluvium', topDepth: 0, bottomDepth: 180, lithology: 'Sand, Gravel', riskLevel: 'low', color: '#F59E0B' },
  { name: 'Duplex Formation', topDepth: 180, bottomDepth: 620, lithology: 'Sandstone, Shale', riskLevel: 'low', color: '#8B5CF6' },
  { name: 'Girujan Formation', topDepth: 620, bottomDepth: 1480, lithology: 'Shale, Limestone', riskLevel: 'medium', color: '#06B6D4' },
  { name: 'Tipam Formation', topDepth: 1480, bottomDepth: 2200, lithology: 'Sandstone', riskLevel: 'low', color: '#10B981' },
  { name: 'Bokabil Formation', topDepth: 2200, bottomDepth: 2800, lithology: 'Shale, Sandstone', riskLevel: 'medium', color: '#3B82F6' },
  { name: 'Bhuban Formation', topDepth: 2800, bottomDepth: 3400, lithology: 'Tight Sandstone', riskLevel: 'medium', color: '#EC4899' },
  { name: 'Barail Formation', topDepth: 3400, bottomDepth: 4200, lithology: 'Fractured Sandstone', riskLevel: 'high', color: '#EF4444' },
  { name: 'Sylhet Formation', topDepth: 4200, bottomDepth: 5000, lithology: 'Limestone, Shale', riskLevel: 'high', color: '#DC2626' },
];

export const mockLessons: Lesson[] = [
  {
    id: 'L-001', title: 'Barail Formation Mud Loss Management',
    formation: 'Barail Formation', wellId: 'W-001', category: 'Mud Loss Prevention',
    content: 'High mud losses encountered at 3400-3600m in Barail fractured sandstone. Maintain mud weight > 11.5 ppg. Pre-mix LCM pills (walnut shells 50-150 mesh) before entering zone. Run intermediate casing early at 3200m.',
    tags: ['mud-loss', 'barail', 'LCM', 'casing'], author: 'Er. Rajesh Kumar', date: new Date('2024-03-15'), votes: 47
  },
  {
    id: 'L-002', title: 'Kick Control in Bokabil Gas Reservoirs',
    formation: 'Bokabil Formation', wellId: 'W-003', category: 'Well Control',
    content: 'Gas kicks observed at Bokabil reservoir contacts. Maintain 200 psi ECD overbalance. Monitor pit volume every 30 minutes. Driller method effective for kill operations. Flowback should not exceed 10 bbl before SIDPP stabilizes.',
    tags: ['kick', 'gas', 'bokabil', 'well-control'], author: 'Er. Priya Sharma', date: new Date('2024-06-22'), votes: 35
  },
  {
    id: 'L-003', title: 'Differential Sticking in Girujan Shale',
    formation: 'Girujan Formation', wellId: 'W-002', category: 'Stuck Pipe',
    content: 'Differential sticking observed in Girujan reactive shale. Do not stop circulation in shale sections. Minimum circulation rate 6 bbl/min. Use OBM or high-inhibition KCl system. Reduce bit time in hole < 48 hours before wiper trip.',
    tags: ['stuck-pipe', 'girujan', 'shale', 'OBM'], author: 'Er. Amit Singh', date: new Date('2024-09-10'), votes: 28
  },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'C-001', role: 'user', content: 'What are the key risks at 3500m depth in the current well?',
    timestamp: new Date(Date.now() - 5 * 60000)
  },
  {
    id: 'C-002', role: 'assistant',
    content: 'Based on analysis of 47 offset wells and 12 years of drilling data, at **3500m depth** in the Barail Formation you face:\n\n**1. Mud Loss Risk: HIGH (82% confidence)**\nBarail fractured sandstone has a documented history of severe mud losses. The fracture network at this depth has caused losses ranging from 5-50 bbl/hr in 7 offset wells.\n\n**2. Differential Sticking Risk: MEDIUM (67% confidence)**\nHigh overbalance detected (ECD 11.6 ppg vs. pore pressure 10.8 ppg estimate). Extended exposure in Barail shale intercalations increases sticking probability.\n\n**Recommended Actions:**\n• Pre-mix LCM pill (walnut shells + mica flakes, 30 ppb)\n• Set tight ECD window between 11.2-11.6 ppg\n• Plan wiper trips every 300m\n• Monitor return flow vs. pump strokes continuously\n\n**Similar Well Evidence:** OIL-DULIAJAN-07 encountered 35 bbl/hr loss at 3480m, controlled with 2 × LCM squeeze jobs.',
    timestamp: new Date(Date.now() - 4 * 60000),
    confidence: 89, sources: ['WCR-D07-2022', 'DDR-B14-2023', 'MudLog-N06-2021'], similarWells: ['OIL-DULIAJAN-07', 'OIL-BRAHMAPUTRA-14']
  }
];

export const drillingTrend = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  rop: 8 + Math.random() * 20,
  mudWeight: 10.8 + Math.random() * 1.5,
  ecd: 11.2 + Math.random() * 0.8,
  torque: 8000 + Math.random() * 4000,
  wob: 15 + Math.random() * 8,
}));

export const riskTrend = Array.from({ length: 30 }, (_, i) => ({
  depth: 3000 + i * 15,
  mudLoss: 20 + (i > 20 ? (i - 20) * 3.5 : 0) + Math.random() * 10,
  kick: 15 + Math.random() * 20,
  stuckPipe: 10 + Math.random() * 15,
  overpressure: 25 + Math.random() * 25,
}));

export const heatmapData = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 12 }, (_, col) => ({
    row, col,
    intensity: Math.random(),
    label: `${3000 + row * 150}m`,
  }))
);
