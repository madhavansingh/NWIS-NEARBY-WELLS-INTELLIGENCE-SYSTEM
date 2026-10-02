import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, MicOff, Search, ThumbsUp, Filter, Tag, Star, Clock, User } from 'lucide-react';
import { mockLessons } from '../data/mockData';

const CATEGORIES = ['All', 'Mud Loss Prevention', 'Well Control', 'Stuck Pipe', 'Cementing', 'Best Practices'];

export default function InstitutionalMemory() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isRecording, setIsRecording] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', formation: '', content: '' });
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const filtered = mockLessons.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.content.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === 'All' || l.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleVote = (id: string) => {
    setVoted(v => {
      const n = new Set(v);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F7FA]">
            Institutional Knowledge Engine
          </h1>
          <p className="text-sm text-[#91A4B8] mt-1">
            Enterprise lessons learned archive & drilling engineering institutional best practices
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#19C3E6] text-[#07111F] text-xs font-semibold hover:bg-[#19C3E6]/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Engineering Lesson
        </button>
      </div>

      {/* Stats KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Validated Case Reports', value: '3,847' },
          { label: 'Contributing Engineers', value: '127' },
          { label: 'Cumulative NPT Hours Saved', value: '4,200+' },
          { label: 'Standard Operating Procedures', value: '892' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5"
          >
            <div className="text-xs font-medium text-[#60758A] mb-2">{stat.label}</div>
            <div className="text-2xl font-bold font-mono text-[#F3F7FA]">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Voice */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60758A]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons by keyword, formation name, LCM chemistry, or incident type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1728] border border-[#1B3047] text-[#F3F7FA] placeholder-[#60758A] text-sm focus:outline-none focus:border-[#19C3E6]/50 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            isRecording
              ? 'bg-[#FF5C6C]/10 border-[#FF5C6C]/30 text-[#FF5C6C]'
              : 'bg-[#0B1728] border-[#1B3047] text-[#91A4B8] hover:text-[#F3F7FA]'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isRecording ? 'Listening...' : 'Voice Search'}
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-[#60758A] flex-shrink-0 mr-1" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-[#19C3E6]/12 text-[#19C3E6] border-[#19C3E6]'
                : 'bg-[#0B1728] text-[#91A4B8] border-[#1B3047] hover:text-[#F3F7FA]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#60758A] uppercase tracking-wider">
              {filtered.length} Archived Case Entries
            </h3>
          </div>

          <AnimatePresence>
            {filtered.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5 md:p-6 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#101F33] border border-[#1B3047] text-[#19C3E6] font-medium">
                        {lesson.category}
                      </span>
                      <span className="text-xs text-[#60758A] font-mono">{lesson.formation}</span>
                    </div>
                    <h3 className="font-semibold text-[#F3F7FA] text-base leading-snug">{lesson.title}</h3>
                  </div>
                  <button
                    onClick={() => handleVote(lesson.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-colors flex-shrink-0 ${
                      voted.has(lesson.id)
                        ? 'bg-[#36D399]/10 border-[#36D399]/40 text-[#36D399]'
                        : 'bg-[#101F33] border-[#1B3047] text-[#91A4B8] hover:text-[#F3F7FA]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono font-bold">{lesson.votes + (voted.has(lesson.id) ? 1 : 0)}</span>
                  </button>
                </div>

                <p className="text-sm text-[#DCE7F2] leading-relaxed mb-4">{lesson.content}</p>

                {/* Tags + meta */}
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#1B3047]">
                  <Tag className="w-3.5 h-3.5 text-[#60758A]" />
                  {lesson.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[#101F33] border border-[#1B3047] text-[#91A4B8] cursor-pointer hover:text-[#19C3E6] transition-colors"
                      onClick={() => setSearch(tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-4 text-xs text-[#60758A]">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {lesson.author}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Top Voted Lessons */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F4B740]" />
              Top Peer-Validated Lessons
            </h3>
            <div className="space-y-3">
              {[...mockLessons].sort((a, b) => b.votes - a.votes).map((l, i) => (
                <div key={l.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#101F33] transition-colors">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#101F33] border border-[#1B3047] text-[#19C3E6] font-bold font-mono text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F3F7FA] leading-tight">{l.title}</div>
                    <div className="text-[11px] text-[#60758A] mt-1">{l.formation} · {l.votes} endorsement votes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Contributors */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-3.5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#19C3E6]" />
              Key Field Contributors
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Er. Rajesh Kumar', role: 'Senior Drilling Engineer', lessons: 12 },
                { name: 'Er. Priya Sharma', role: 'Well Control Specialist', lessons: 8 },
                { name: 'Er. Amit Singh', role: 'Mud Chemistry Engineer', lessons: 6 },
                { name: 'Er. Sunita Das', role: 'Reservoir Geomechanics', lessons: 4 },
              ].map(user => (
                <div key={user.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#101F33] border border-[#1B3047] flex items-center justify-center text-xs font-bold text-[#19C3E6] flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).slice(1, 3).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#F3F7FA] truncate">{user.name}</div>
                    <div className="text-[11px] text-[#60758A] truncate">{user.role}</div>
                  </div>
                  <div className="text-xs font-mono text-[#91A4B8] flex-shrink-0">{user.lessons} logs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Tags */}
          <div className="bg-[#0B1728] border border-[#1B3047] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#F3F7FA] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#19C3E6]" />
              Knowledge Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {['mud-loss', 'barail', 'kick', 'LCM', 'well-control', 'OBM', 'shale', 'cementing', 'stuck-pipe', 'girujan', 'gas-show', 'NPT'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="text-[10px] px-2 py-1 rounded bg-[#101F33] border border-[#1B3047] text-[#91A4B8] hover:text-[#19C3E6] hover:border-[#19C3E6]/30 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#07111F]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-[#0B1728] border border-[#1B3047] rounded-xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-base font-semibold text-[#F3F7FA] mb-4">Add Lesson Learned</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Lesson title"
                  value={newLesson.title}
                  onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-md bg-[#101F33] border border-[#1B3047] text-[#F3F7FA] placeholder-[#60758A] text-sm focus:outline-none focus:border-[#19C3E6]/50 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Formation (e.g., Barail Formation)"
                  value={newLesson.formation}
                  onChange={e => setNewLesson(l => ({ ...l, formation: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-md bg-[#101F33] border border-[#1B3047] text-[#F3F7FA] placeholder-[#60758A] text-sm focus:outline-none focus:border-[#19C3E6]/50 transition-colors"
                />
                <textarea
                  placeholder="Describe the lesson learned, mitigation applied, and outcome..."
                  value={newLesson.content}
                  onChange={e => setNewLesson(l => ({ ...l, content: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-md bg-[#101F33] border border-[#1B3047] text-[#F3F7FA] placeholder-[#60758A] text-sm focus:outline-none focus:border-[#19C3E6]/50 transition-colors resize-none"
                />
                <div className="flex items-center gap-3 pt-1">
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                      isRecording
                        ? 'bg-[#FF5C6C]/10 border-[#FF5C6C]/30 text-[#FF5C6C]'
                        : 'bg-transparent border-[#1B3047] text-[#91A4B8] hover:text-[#F3F7FA]'
                    }`}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    Voice Note
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-md text-sm text-[#91A4B8] hover:text-[#F3F7FA] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewLesson({ title: '', formation: '', content: '' }); }}
                    className="px-4 py-2 rounded-md bg-[#19C3E6] text-[#07111F] text-sm font-medium hover:bg-[#19C3E6]/90 transition-colors"
                  >
                    Save Lesson
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
