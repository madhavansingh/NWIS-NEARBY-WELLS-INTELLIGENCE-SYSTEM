import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Cpu, Network, Zap, CheckCircle, Clock, Tag, Eye, Database } from 'lucide-react';

const pipelineSteps = [
  { icon: Upload, label: 'Upload', desc: 'Document received', color: '#19C3E6', status: 'done' },
  { icon: Eye, label: 'OCR', desc: 'Text extraction', color: '#8B5CF6', status: 'done' },
  { icon: Cpu, label: 'NLP', desc: 'Entity recognition', color: '#F4B740', status: 'processing' },
  { icon: Network, label: 'Knowledge Graph', desc: 'Relationship mapping', color: '#36D399', status: 'pending' },
  { icon: Zap, label: 'AI Insights', desc: 'Pattern analysis', color: '#4DB6FF', status: 'pending' },
];

const mockDocuments = [
  {
    id: 'D-001', name: 'WCR_BRAHMAPUTRA_14_2024.pdf', type: 'WCR', well: 'OIL-BRAHMAPUTRA-14',
    date: '2024-03-15', status: 'completed', pages: 142,
    entities: [
      { type: 'Mud Loss', depth: '3420m', confidence: 0.96, severity: 'high' },
      { type: 'Kick Event', depth: '3680m', confidence: 0.89, severity: 'medium' },
      { type: 'LCM Treatment', depth: '3420m', confidence: 0.93, severity: null },
      { type: 'Formation', value: 'Barail Sandstone', confidence: 0.98, severity: null },
    ]
  },
  {
    id: 'D-002', name: 'DDR_JORHAT_07_OCT_2024.pdf', type: 'DDR', well: 'OIL-JORHAT-07',
    date: '2024-10-12', status: 'processing', pages: 28,
    entities: []
  },
  {
    id: 'D-003', name: 'MudLog_DULIAJAN_23_2024.las', type: 'MudLog', well: 'OIL-DULIAJAN-23',
    date: '2024-09-22', status: 'completed', pages: 1,
    entities: [
      { type: 'Gas Show', depth: '4820m', confidence: 0.91, severity: 'medium' },
      { type: 'Overpressure', depth: '4750m', confidence: 0.84, severity: 'high' },
    ]
  },
  {
    id: 'D-004', name: 'GeoReport_BARAIL_FORMATION_2023.pdf', type: 'GeologicalReport', well: 'Multiple',
    date: '2023-11-30', status: 'completed', pages: 87,
    entities: [
      { type: 'Fracture Zone', depth: '3400-3600m', confidence: 0.97, severity: 'high' },
      { type: 'Reservoir Quality', value: 'Good', confidence: 0.88, severity: null },
    ]
  },
];

const typeColors: Record<string, string> = {
  WCR: '#19C3E6',
  DDR: '#8B5CF6',
  MudLog: '#F4B740',
  GeologicalReport: '#36D399',
  ReservoirReport: '#4DB6FF',
};

const entityTypeColors: Record<string, string> = {
  'Mud Loss': '#FF5C6C',
  'Kick Event': '#FF5C6C',
  'Gas Show': '#F4B740',
  'Overpressure': '#FF5C6C',
  'LCM Treatment': '#36D399',
  'Formation': '#19C3E6',
  'Fracture Zone': '#F4B740',
  'Reservoir Quality': '#4DB6FF',
};

export default function DocumentIntelligence() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof mockDocuments[0] | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) { clearInterval(interval); setIsUploading(false); return 100; }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#1B3047]/60">
        <div>
          <h1 className="text-[28px] font-bold text-[#F3F7FA] tracking-tight">Document Intelligence</h1>
          <p className="text-sm text-[#91A4B8] mt-1.5">Automated parsing of drilling reports, daily drilling records, and geological logs</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: '#19C3E6', color: '#07111F' }}
        >
          <Upload style={{ width: 15, height: 15 }} />
          Upload Documents
        </button>
        <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.las,.csv" onChange={simulateUpload} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[
          { label: 'Archived Documents', value: '50,234', color: '#19C3E6', icon: Database, sub: 'Historical OIL records' },
          { label: 'Entities Extracted', value: '1,248,590', color: '#8B5CF6', icon: Tag, sub: 'Hazards, depths & formations' },
          { label: 'Processed Today', value: '247', color: '#F4B740', icon: Clock, sub: 'Automated ingest pipeline' },
          { label: 'Pending Verification', value: '18', color: '#FF5C6C', icon: CheckCircle, sub: 'Low confidence flags' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-5 md:p-6"
            style={{ background: '#0B1728', border: '1px solid #1B3047' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
              <stat.icon style={{ width: 18, height: 18, color: stat.color }} />
            </div>
            <div className="text-3xl font-bold text-[#F3F7FA] font-mono leading-tight">{stat.value}</div>
            <div className="text-sm font-semibold text-[#91A4B8] mt-2">{stat.label}</div>
            <div className="text-xs text-[#60758A] mt-1">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload + Pipeline */}
        <div className="space-y-6">
          {/* Drop zone with more breathing room */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
            onClick={() => fileRef.current?.click()}
            className="p-8 md:p-10 text-center cursor-pointer rounded-xl transition-all"
            style={{
              background: dragOver ? 'rgba(25,195,230,0.06)' : '#0B1728',
              border: `1.5px dashed ${dragOver ? 'rgba(25,195,230,0.6)' : '#1B3047'}`,
            }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors"
              style={{ background: dragOver ? 'rgba(25,195,230,0.15)' : '#101F33', border: '1px solid #1B3047' }}
            >
              <Upload style={{ width: 22, height: 22, color: dragOver ? '#19C3E6' : '#91A4B8' }} />
            </div>
            <p className="text-base font-semibold text-[#F3F7FA]">Drop Drilling Records Here</p>
            <p className="text-xs text-[#91A4B8] mt-1.5 max-w-xs mx-auto leading-relaxed">
              Drag & drop well completion reports (WCR), daily drilling reports (DDR), or mud logs to ingest
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['PDF', 'LAS 2.0', 'CSV', 'DOCX'].map(ext => (
                <span
                  key={ext}
                  className="text-xs px-2.5 py-1 rounded-md font-mono"
                  style={{ background: '#101F33', border: '1px solid #1B3047', color: '#91A4B8', fontSize: '11px' }}
                >
                  .{ext}
                </span>
              ))}
            </div>
          </div>

          {/* Upload progress */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl p-5"
                style={{ background: '#0B1728', border: '1px solid #1B3047' }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(25,195,230,0.12)' }}>
                    <FileText style={{ width: 16, height: 16, color: '#19C3E6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#F3F7FA] block truncate">Ingesting drilling log...</span>
                    <span className="text-xs text-[#60758A]">Extracting lithology & incident tables</span>
                  </div>
                  <span className="text-xs font-bold text-[#19C3E6] font-mono">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#16263A' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${uploadProgress}%`, background: '#19C3E6' }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing Pipeline with distinct vertical steps & subtle hierarchy */}
          <div className="rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#1B3047]">
              <h3 className="text-base font-semibold text-[#F3F7FA] flex items-center gap-2.5">
                <Cpu style={{ width: 16, height: 16, color: '#19C3E6' }} />
                Processing Pipeline
              </h3>
              <span className="text-xs font-mono text-[#60758A]">5 stages</span>
            </div>
            <div className="space-y-4">
              {pipelineSteps.map((step, idx) => {
                const isDone = step.status === 'done';
                const isProcessing = step.status === 'processing';
                const statusColor = isDone ? '#36D399' : isProcessing ? '#19C3E6' : '#60758A';
                const badgeBg = isDone ? 'rgba(54,211,153,0.1)' : isProcessing ? 'rgba(25,195,230,0.1)' : 'rgba(27,48,71,0.5)';
                const badgeBorder = isDone ? 'rgba(54,211,153,0.25)' : isProcessing ? 'rgba(25,195,230,0.3)' : '#1B3047';

                return (
                  <div key={step.label} className="relative">
                    {idx < pipelineSteps.length - 1 && (
                      <div
                        className="absolute left-[17px] top-[34px] w-0.5 h-[22px]"
                        style={{ background: isDone ? 'rgba(54,211,153,0.3)' : '#1B3047' }}
                      />
                    )}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}
                      >
                        {isDone ? (
                          <CheckCircle style={{ width: 16, height: 16, color: statusColor }} />
                        ) : isProcessing ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                            <Cpu style={{ width: 16, height: 16, color: statusColor }} />
                          </motion.div>
                        ) : (
                          <Clock style={{ width: 15, height: 15, color: '#60758A' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold" style={{ color: step.status === 'pending' ? '#60758A' : '#F3F7FA' }}>
                            {step.label}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded font-mono font-medium"
                            style={{
                              background: badgeBg,
                              border: `1px solid ${badgeBorder}`,
                              color: statusColor,
                              fontSize: '11px',
                            }}
                          >
                            {isDone ? 'Complete' : isProcessing ? 'Processing' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-[#91A4B8] mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Document list */}
        <div className="rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#1B3047]">
            <div>
              <h3 className="text-base font-semibold text-[#F3F7FA]">Indexed Documents</h3>
              <p className="text-xs text-[#91A4B8] mt-0.5">Select a record to view parsed entities</p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-[#101F33] border border-[#1B3047] text-[#19C3E6]">
              {mockDocuments.length} files
            </span>
          </div>
          <div className="space-y-3">
            {mockDocuments.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isSelected ? '#101F33' : 'transparent',
                    border: `1px solid ${isSelected ? '#19C3E6' : '#1B3047'}`,
                  }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${typeColors[doc.type] || '#19C3E6'}15`, border: `1px solid ${typeColors[doc.type] || '#19C3E6'}30` }}
                    >
                      <FileText style={{ width: 16, height: 16, color: typeColors[doc.type] || '#19C3E6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-[#F3F7FA]">{doc.name}</p>
                      <p className="text-xs text-[#91A4B8] mt-1">{doc.well} · {doc.pages} pages · {doc.date}</p>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-mono font-medium"
                          style={{ background: `${typeColors[doc.type] || '#19C3E6'}15`, color: typeColors[doc.type] || '#19C3E6', border: `1px solid ${typeColors[doc.type] || '#19C3E6'}30`, fontSize: '10px' }}
                        >
                          {doc.type}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            background: doc.status === 'completed' ? 'rgba(54,211,153,0.1)' : 'rgba(244,183,64,0.1)',
                            color: doc.status === 'completed' ? '#36D399' : '#F4B740',
                            border: `1px solid ${doc.status === 'completed' ? 'rgba(54,211,153,0.25)' : 'rgba(244,183,64,0.25)'}`,
                            fontSize: '10px'
                          }}
                        >
                          {doc.status}
                        </span>
                        {doc.entities.length > 0 && (
                          <span className="text-xs text-[#60758A] font-mono text-[11px] ml-auto">
                            {doc.entities.length} entities identified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entity extraction panel */}
        <div className="rounded-xl p-6" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#1B3047]">
            <h3 className="text-base font-semibold text-[#F3F7FA] flex items-center gap-2">
              <Tag style={{ width: 16, height: 16, color: '#19C3E6' }} />
              Extracted Intelligence
            </h3>
            {selectedDoc && (
              <span className="text-xs text-[#60758A] font-mono">
                {selectedDoc.entities.length} records
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div
                key={selectedDoc.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="space-y-4"
              >
                <div className="rounded-xl p-4 bg-[#101F33] border border-[#1B3047]">
                  <div className="flex items-center gap-2.5 mb-1">
                    <FileText style={{ width: 14, height: 14, color: '#19C3E6' }} />
                    <span className="text-sm font-semibold truncate text-[#F3F7FA]">{selectedDoc.name}</span>
                  </div>
                  <div className="text-xs text-[#91A4B8] flex items-center gap-2 mt-1">
                    <span>Well: <strong className="text-[#F3F7FA] font-medium">{selectedDoc.well}</strong></span>
                    <span>•</span>
                    <span>Date: {selectedDoc.date}</span>
                  </div>
                </div>

                {selectedDoc.entities.length === 0 ? (
                  <div className="text-center py-12 rounded-xl bg-[#101F33]/50 border border-[#1B3047]">
                    <Cpu style={{ width: 32, height: 32, color: '#60758A', margin: '0 auto 10px', display: 'block' }} />
                    <p className="text-sm font-medium text-[#F3F7FA]">Extraction in progress</p>
                    <p className="text-xs text-[#60758A] mt-1">NLP pipeline currently analyzing OCR token stream</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDoc.entities.map((entity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-[#101F33] border border-[#1B3047]"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded"
                            style={{
                              background: `${entityTypeColors[entity.type] || '#19C3E6'}15`,
                              color: entityTypeColors[entity.type] || '#19C3E6',
                              border: `1px solid ${entityTypeColors[entity.type] || '#19C3E6'}30`,
                              fontSize: '11px'
                            }}
                          >
                            {entity.type}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#F3F7FA]">
                            {Math.round(entity.confidence * 100)}% match
                          </span>
                        </div>
                        <div className="text-sm text-[#F3F7FA] font-medium mt-1">
                          {'depth' in entity && entity.depth && (
                            <span style={{ color: '#19C3E6', fontFamily: 'var(--font-mono)', marginRight: 8 }}>
                              Depth: {entity.depth}
                            </span>
                          )}
                          {'value' in entity && entity.value && <span>{entity.value}</span>}
                          {entity.severity && (
                            <span
                              className="ml-2 px-2 py-0.5 rounded font-semibold text-[10px] uppercase"
                              style={{
                                background: entity.severity === 'high' ? 'rgba(255,92,108,0.12)' : 'rgba(244,183,64,0.12)',
                                color: entity.severity === 'high' ? '#FF5C6C' : '#F4B740',
                                border: `1px solid ${entity.severity === 'high' ? 'rgba(255,92,108,0.3)' : 'rgba(244,183,64,0.3)'}`,
                              }}
                            >
                              {entity.severity} severity
                            </span>
                          )}
                        </div>
                        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#16263A' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${entity.confidence * 100}%`, background: entityTypeColors[entity.type] || '#19C3E6' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 rounded-xl border border-dashed border-[#1B3047]"
              >
                <FileText style={{ width: 40, height: 40, color: '#1B3047', margin: '0 auto 12px', display: 'block' }} />
                <p className="text-sm font-medium text-[#F3F7FA]">No Document Selected</p>
                <p className="text-xs text-[#60758A] mt-1 max-w-xs mx-auto">
                  Click on any document from the list to inspect geological entities and risk correlations
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
