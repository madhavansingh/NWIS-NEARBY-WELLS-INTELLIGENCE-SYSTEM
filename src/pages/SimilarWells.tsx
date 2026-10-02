import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Star, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

const similarWells = [
  {
    id: 'SW-001', name: 'OIL-DULIAJAN-07', similarity: 94,
    formation: 'Barail Formation', depth: 3480, year: 2022,
    formationMatch: 96, mudProgramMatch: 89, depthMatch: 92, lithologyMatch: 91,
    challenges: ['Severe Mud Loss (35 bbl/hr)', 'Gas Kick at 3680m', 'Tight Annular Pressure'],
    mitigations: ['2× LCM Squeeze (walnut shells)', 'Reduced RPM to 80', 'Mud Weight 11.6 ppg', 'Casing at 3200m'],
    outcome: 'success', npt: '18 hrs', finalDepth: 4100, lessons: 3,
    color: '#36D399',
  },
  {
    id: 'SW-002', name: 'OIL-NAHARKATIA-03', similarity: 88,
    formation: 'Barail Formation', depth: 3350, year: 2023,
    formationMatch: 93, mudProgramMatch: 82, depthMatch: 87, lithologyMatch: 89,
    challenges: ['Partial Mud Loss (8 bbl/hr)', 'Stuck Pipe (12 hrs)', 'Tight Hole Condition'],
    mitigations: ['LCM Pill (mica + diatomite)', 'Jar Down 50K lbs', 'OBM Switch'],
    outcome: 'partial', npt: '31 hrs', finalDepth: 3850, lessons: 2,
    color: '#F4B740',
  },
  {
    id: 'SW-003', name: 'OIL-MORAN-12', similarity: 81,
    formation: 'Barail Formation', depth: 3200, year: 2021,
    formationMatch: 88, mudProgramMatch: 79, depthMatch: 84, lithologyMatch: 85,
    challenges: ['Differential Sticking', 'Pressure Anomaly at 3100m'],
    mitigations: ['Spotting OBM pill', 'Reduced mud weight 10.8 ppg'],
    outcome: 'success', npt: '24 hrs', finalDepth: 3900, lessons: 4,
    color: '#36D399',
  },
  {
    id: 'SW-004', name: 'OIL-SIBSAGAR-08', similarity: 76,
    formation: 'Bokabil Formation', depth: 2900, year: 2023,
    formationMatch: 72, mudProgramMatch: 85, depthMatch: 79, lithologyMatch: 74,
    challenges: ['Gas Show at 2850m', 'Drilling Break into Reservoir'],
    mitigations: ['Increase MW from 10.2 to 10.8 ppg', 'Shut in Well', 'Bullhead Kill'],
    outcome: 'success', npt: '8 hrs', finalDepth: 3100, lessons: 1,
    color: '#19C3E6',
  },
];

function SimilarityBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-32 flex-shrink-0" style={{ color: '#91A4B8' }}>{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ background: '#1B3047' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color, fontFamily: 'var(--font-mono)' }}>{value}%</span>
    </div>
  );
}

export default function SimilarWells() {
  const [selected, setSelected] = useState<typeof similarWells[0] | null>(similarWells[0]);
  const [sortBy, setSortBy] = useState<'similarity' | 'year' | 'npt'>('similarity');

  const sorted = [...similarWells].sort((a, b) => {
    if (sortBy === 'similarity') return b.similarity - a.similarity;
    if (sortBy === 'year') return b.year - a.year;
    return parseInt(a.npt) - parseInt(b.npt);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">Similar Well Intelligence</h1>
          <p className="text-sm text-[#91A4B8] mt-1">
            Historical offset wells matched by formation, depth, mud program, and lithology · Target: OIL-BRAHMAPUTRA-14
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#60758A] font-medium">Sort by:</span>
          {['similarity', 'year', 'npt'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s as typeof sortBy)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{
                background: sortBy === s ? 'rgba(25,195,230,0.12)' : '#0B1728',
                border: `1px solid ${sortBy === s ? '#19C3E6' : '#1B3047'}`,
                color: sortBy === s ? '#19C3E6' : '#91A4B8'
              }}
            >
              {s === 'similarity' ? 'Similarity' : s === 'year' ? 'Drilled Year' : 'NPT (Low to High)'}
            </button>
          ))}
        </div>
      </div>

      {/* Target well reference strip */}
      <div className="rounded-xl p-5" style={{ background: '#0B1728', border: '1px solid #1B3047' }}>
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <div>
            <div className="text-xs text-[#60758A] mb-1 font-medium">Active Subject Well</div>
            <div className="text-sm font-semibold text-[#F3F7FA]">OIL-BRAHMAPUTRA-14</div>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 32, background: '#1B3047' }} />
          <div>
            <div className="text-xs text-[#60758A] mb-1 font-medium">Target Formation</div>
            <div className="text-sm font-medium text-[#F3F7FA]">Barail Formation</div>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 32, background: '#1B3047' }} />
          <div>
            <div className="text-xs text-[#60758A] mb-1 font-medium">Current Bit Depth</div>
            <div className="text-sm font-semibold font-mono text-[#19C3E6]">3,420 m</div>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 32, background: '#1B3047' }} />
          <div>
            <div className="text-xs text-[#60758A] mb-1 font-medium">Predicted Risk Level</div>
            <div className="text-sm font-bold font-mono text-[#FF5C6C]">82% (High Mud Loss)</div>
          </div>
          <div className="ml-auto text-xs text-[#91A4B8] font-mono">
            {sorted.length} comparable offset logs identified
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Well list */}
        <div className="lg:col-span-2 space-y-3.5">
          {sorted.map((well, i) => {
            const isSel = selected?.id === well.id;
            return (
              <motion.div
                key={well.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(well)}
                className="rounded-xl p-5 cursor-pointer transition-all"
                style={{
                  background: isSel ? '#101F33' : '#0B1728',
                  border: `1px solid ${isSel ? '#19C3E6' : '#1B3047'}`,
                }}
              >
                {/* Header row: Name + Similarity */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#F3F7FA]">{well.name}</h3>
                    <div className="text-xs text-[#60758A] mt-0.5">
                      Drilled {well.year} · Final {well.finalDepth}m
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-flex items-center gap-1 text-sm font-bold font-mono px-2.5 py-1 rounded-md"
                      style={{
                        background: well.similarity >= 90 ? 'rgba(54,211,153,0.12)' : well.similarity >= 80 ? 'rgba(244,183,64,0.12)' : 'rgba(25,195,230,0.12)',
                        color: well.similarity >= 90 ? '#36D399' : well.similarity >= 80 ? '#F4B740' : '#19C3E6',
                        border: `1px solid ${well.similarity >= 90 ? 'rgba(54,211,153,0.3)' : well.similarity >= 80 ? 'rgba(244,183,64,0.3)' : 'rgba(25,195,230,0.3)'}`
                      }}
                    >
                      {well.similarity}% Match
                    </span>
                  </div>
                </div>

                {/* Structured attributes: Formation & Depth */}
                <div className="grid grid-cols-2 gap-3 py-2.5 my-2 border-t border-b border-[#1B3047]">
                  <div>
                    <span className="text-[11px] text-[#60758A] block uppercase tracking-wide">Formation</span>
                    <span className="text-xs font-medium text-[#DCE7F2]">{well.formation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#60758A] block uppercase tracking-wide">Correlated Depth</span>
                    <span className="text-xs font-mono font-medium text-[#19C3E6]">{well.depth} m</span>
                  </div>
                </div>

                {/* Historical Challenges */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-[#60758A] block mb-1.5 uppercase tracking-wide">Historical Challenges</span>
                  <div className="flex flex-wrap gap-1.5">
                    {well.challenges.map((c, ci) => (
                      <span
                        key={ci}
                        className="text-[11px] px-2 py-0.5 rounded text-[#F4B740] bg-[#F4B740]/10 border border-[#F4B740]/25"
                      >
                        {c.split('(')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Successful Mitigation */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-[#60758A] block mb-1 uppercase tracking-wide">Successful Mitigation</span>
                  <div className="text-xs text-[#36D399] flex items-center gap-1.5">
                    <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                    <span className="truncate">{well.mitigations[0]}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 h-1.5 rounded-full overflow-hidden" style={{ background: '#1B3047' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: well.similarity >= 90 ? '#36D399' : well.similarity >= 80 ? '#F4B740' : '#19C3E6',
                      width: `${well.similarity}%`
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-3 rounded-xl p-6 flex flex-col justify-between"
            style={{ background: '#0B1728', border: '1px solid #1B3047' }}
          >
            <div>
              {/* Well header */}
              <div className="flex items-start justify-between mb-6 pb-5 border-b border-[#1B3047]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Star style={{ width: 15, height: 15, color: '#F4B740' }} />
                    <span className="text-xs font-bold font-mono text-[#F4B740]">
                      {selected.similarity}% Geomechanical & Lithology Match
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F3F7FA]">{selected.name}</h2>
                  <p className="text-sm text-[#91A4B8] mt-1">{selected.formation} · Drilled {selected.year} · Total Depth {selected.finalDepth}m</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#60758A] mb-1 font-medium">Drilling Outcome</div>
                  <span
                    className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md"
                    style={{
                      background: selected.outcome === 'success' ? 'rgba(54,211,153,0.12)' : 'rgba(244,183,64,0.12)',
                      color: selected.outcome === 'success' ? '#36D399' : '#F4B740',
                      border: `1px solid ${selected.outcome === 'success' ? 'rgba(54,211,153,0.3)' : 'rgba(244,183,64,0.3)'}`
                    }}
                  >
                    {selected.outcome === 'success' ? 'Completed Target' : 'Partial Recovery'}
                  </span>
                </div>
              </div>

              {/* Engineering Metrics Strip */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-4" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                  <div className="text-xs text-[#60758A] mb-1 font-medium">Final Depth Reached</div>
                  <div className="text-xl font-bold font-mono text-[#F3F7FA]">{selected.finalDepth} m</div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                  <div className="text-xs text-[#60758A] mb-1 font-medium">Non-Productive Time</div>
                  <div className="text-xl font-bold font-mono text-[#FF5C6C]">{selected.npt}</div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#101F33', border: '1px solid #1B3047' }}>
                  <div className="text-xs text-[#60758A] mb-1 font-medium">Documented Lessons</div>
                  <div className="text-xl font-bold font-mono text-[#19C3E6]">{selected.lessons} Reports</div>
                </div>
              </div>

              {/* Similarity Breakdown */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-[#91A4B8]">
                  Similarity Attribution Breakdown
                </h4>
                <div className="space-y-3 rounded-xl p-4 bg-[#101F33]/40 border border-[#1B3047]">
                  <SimilarityBar label="Formation Match" value={selected.formationMatch} color="#19C3E6" />
                  <SimilarityBar label="Depth Profile Correlation" value={selected.depthMatch} color="#19C3E6" />
                  <SimilarityBar label="Mud Program & Chemistry" value={selected.mudProgramMatch} color="#19C3E6" />
                  <SimilarityBar label="Lithology Sequence" value={selected.lithologyMatch} color="#19C3E6" />
                </div>
              </div>

              {/* Two columns for Challenges & Mitigations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="rounded-xl p-4 bg-[#101F33]/40 border border-[#1B3047]">
                  <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-[#F4B740] flex items-center gap-1.5">
                    <AlertTriangle style={{ width: 14, height: 14 }} />
                    Historical Incidents & Challenges
                  </h4>
                  <div className="space-y-2">
                    {selected.challenges.map((c, i) => (
                      <div key={i} className="text-xs text-[#DCE7F2] flex items-start gap-2 bg-[#0B1728] p-2.5 rounded-lg border border-[#1B3047]">
                        <span className="text-[#F4B740] font-bold">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#101F33]/40 border border-[#1B3047]">
                  <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-[#36D399] flex items-center gap-1.5">
                    <CheckCircle style={{ width: 14, height: 14 }} />
                    Field-Proven Mitigation Actions
                  </h4>
                  <div className="space-y-2">
                    {selected.mitigations.map((m, i) => (
                      <div key={i} className="text-xs text-[#DCE7F2] flex items-start gap-2 bg-[#0B1728] p-2.5 rounded-lg border border-[#1B3047]">
                        <span className="text-[#36D399] font-bold">✓</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#1B3047]">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#19C3E6', color: '#07111F' }}
              >
                <BarChart3 style={{ width: 15, height: 15 }} />
                Side-by-Side Log Comparison
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#101F33' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#19C3E6'; (e.currentTarget as HTMLElement).style.color = '#F3F7FA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.color = '#91A4B8'; }}
              >
                <TrendingUp style={{ width: 15, height: 15 }} />
                View Geological Evidence
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#101F33' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#19C3E6'; (e.currentTarget as HTMLElement).style.color = '#F3F7FA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.color = '#91A4B8'; }}
              >
                <Layers style={{ width: 15, height: 15 }} />
                {selected.lessons} Archival Case Files
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
