import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, MicOff, RotateCcw, BookOpen, BarChart3, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { mockChatHistory, type ChatMessage } from '../data/mockData';

const SUGGESTIONS = [
  'What risks exist at 3500m depth in Barail Formation?',
  'Show mud loss incidents in BRAHMAPUTRA-14',
  'What mitigation worked best for kick control?',
  'Compare Barail and Kopili formation drilling hazards',
  'Best practices for cementing in fractured zones?',
  'Historical NPT events in Duliajan field?',
];

const AI_RESPONSES: Record<string, string> = {
  default: `Based on analysis of offset well records for Oil India Limited:

**Risk Assessment at OIL-BRAHMAPUTRA-14 (Depth: 3,420m)**

1. **Mud Loss Risk: 82% (HIGH)** — Barail fractured sandstone at this depth has documented losses in 7 offset wells. Expected loss rate: 10–35 bbl/hr based on fracture density models.

2. **Kick Risk: 67% (MEDIUM)** — Approaching Barail reservoir contact. ECD margin is tight (current 11.6 ppg vs. estimated pore pressure 11.0 ppg).

**Recommended Actions:**
• Prepare LCM pill: walnut shells (50–150 mesh) + mica flakes at 50 ppb
• Monitor return flow vs. pump strokes every 15 minutes
• Have kill mud weighted to 12.0 ppg ready on surface

**Evidence:** 7 similar incidents across 12 years of records, 3 nearest offset wells analyzed.`,
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#91A4B8' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage & { isStreaming?: boolean } }) {
  const isUser = msg.role === 'user';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''} chat-message max-w-4xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold mt-1"
        style={{
          background: isUser ? '#101F33' : 'rgba(25,195,230,0.1)',
          border: `1px solid ${isUser ? '#1B3047' : 'rgba(25,195,230,0.25)'}`,
          color: isUser ? '#19C3E6' : '#19C3E6'
        }}
      >
        {isUser ? 'RK' : <Bot style={{ width: 17, height: 17 }} />}
      </div>

      <div className={`flex-1 flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
        {!isUser && (
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="text-sm font-semibold" style={{ color: '#F3F7FA' }}>NWIS Engineering Copilot</span>
            {msg.confidence && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono font-medium"
                style={{ background: 'rgba(54,211,153,0.1)', border: '1px solid rgba(54,211,153,0.25)', color: '#36D399', fontSize: '11px' }}
              >
                {msg.confidence}% confidence
              </span>
            )}
          </div>
        )}

        <div
          className="rounded-xl px-5 py-4 w-full"
          style={{
            background: isUser ? '#101F33' : '#0B1728',
            border: '1px solid #1B3047',
          }}
        >
          {msg.isStreaming ? (
            <TypingDots />
          ) : (
            <div className="text-[14px] leading-relaxed whitespace-pre-line text-[#DCE7F2]">
              {msg.content.split('**').map((part, i) =>
                i % 2 === 1
                  ? <strong key={i} className="text-[#F3F7FA] font-semibold">{part}</strong>
                  : part
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
          <div className="mt-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors text-[#91A4B8] hover:text-[#F3F7FA]"
            >
              <BookOpen style={{ width: 13, height: 13, color: '#19C3E6' }} />
              <span>{msg.sources.length} Verified Citations & Offset Wells</span>
              {expanded ? <ChevronDown style={{ width: 12, height: 12 }} /> : <ChevronRight style={{ width: 12, height: 12 }} />}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-wrap gap-1.5"
                >
                  {msg.sources.map(s => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ background: '#101F33', border: '1px solid #1B3047', color: '#91A4B8', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                    >
                      Ref: {s}
                    </span>
                  ))}
                  {msg.similarWells?.map(w => (
                    <span
                      key={w}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ background: 'rgba(25,195,230,0.08)', border: '1px solid rgba(25,195,230,0.2)', color: '#19C3E6', fontSize: '11px' }}
                    >
                      Offset Well: {w}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <span className="text-xs text-[#60758A] font-mono text-[11px]">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
      </div>
    </div>
  );
}

export default function AICopilot() {
  const [messages, setMessages] = useState<(ChatMessage & { isStreaming?: boolean })[]>(mockChatHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage & { isStreaming?: boolean } = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    const streamingMsg: ChatMessage & { isStreaming?: boolean } = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(m => [...m, streamingMsg]);

    await new Promise(r => setTimeout(r, 1500));

    const responseText = AI_RESPONSES[content.toLowerCase()] || AI_RESPONSES.default;

    setMessages(m => m.map(msg =>
      msg.id === streamingMsg.id
        ? {
            ...msg,
            content: responseText,
            isStreaming: false,
            confidence: Math.floor(Math.random() * 15 + 80),
            sources: ['WCR-B14-2024', 'DDR-D07-2022', 'MudLog-N06-2021'],
            similarWells: ['OIL-DULIAJAN-07', 'OIL-BRAHMAPUTRA-14'],
          }
        : msg
    ));
    setIsTyping(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
        style={{ background: '#0B1728', borderBottom: '1px solid #1B3047' }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(25,195,230,0.1)', border: '1px solid rgba(25,195,230,0.25)' }}
          >
            <Bot style={{ width: 20, height: 20, color: '#19C3E6' }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-[#F3F7FA]">NWIS Drilling Copilot</h1>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(54,211,153,0.12)', border: '1px solid rgba(54,211,153,0.3)', color: '#36D399' }}
              >
                ONLINE
              </span>
            </div>
            <p className="text-xs text-[#91A4B8] mt-0.5">RAG-augmented drilling intelligence & offset well evidence · 50,000+ indexed logs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5 text-xs text-[#91A4B8]">
            <span className="flex items-center gap-1.5">
              <Zap style={{ width: 13, height: 13, color: '#19C3E6' }} /> Llama 3 Fine-Tuned
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 style={{ width: 13, height: 13, color: '#F4B740' }} /> Hybrid Search
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen style={{ width: 13, height: 13, color: '#36D399' }} /> Vector Store (Qdrant)
            </span>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#101F33' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F3F7FA'; (e.currentTarget as HTMLElement).style.borderColor = '#223F5E'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#91A4B8'; (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; }}
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            Clear Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ background: '#07111F' }}>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-7 text-center max-w-3xl mx-auto py-12"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(25,195,230,0.08)', border: '1px solid rgba(25,195,230,0.2)' }}
            >
              <Bot style={{ width: 30, height: 30, color: '#19C3E6' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F3F7FA] mb-2">Ask NWIS Drilling Intelligence</h2>
              <p className="text-sm text-[#91A4B8] max-w-lg leading-relaxed mx-auto">
                Evidence-based drilling decision support. Query historical offset incidents, formation geomechanics, and proven mitigation programs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left p-4 rounded-xl text-sm transition-all"
                  style={{ background: '#0B1728', border: '1px solid #1B3047', color: '#DCE7F2' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(25,195,230,0.4)'; (e.currentTarget as HTMLElement).style.background = '#101F33'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.background = '#0B1728'; }}
                >
                  <div className="flex items-start gap-2.5">
                    <ChevronRight style={{ width: 15, height: 15, color: '#19C3E6', marginTop: 2, flexShrink: 0 }} />
                    <span className="leading-snug">{s}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{ background: '#0B1728', borderTop: '1px solid #1B3047' }}
      >
        {/* Quick suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-2.5 mb-2.5" style={{ scrollbarWidth: 'none' }}>
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium"
              style={{ border: '1px solid #1B3047', color: '#91A4B8', background: '#101F33' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(25,195,230,0.4)'; (e.currentTarget as HTMLElement).style.color = '#19C3E6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3047'; (e.currentTarget as HTMLElement).style.color = '#91A4B8'; }}
            >
              {s.slice(0, 48)}{s.length > 48 ? '...' : ''}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsListening(!isListening)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            style={{
              background: isListening ? 'rgba(255,92,108,0.12)' : '#101F33',
              border: `1px solid ${isListening ? 'rgba(255,92,108,0.35)' : '#1B3047'}`,
              color: isListening ? '#FF5C6C' : '#91A4B8'
            }}
          >
            {isListening ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about risks, formations, historical incidents, or mitigation guidelines..."
              className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm focus:outline-none"
              style={{
                background: '#101F33',
                border: '1px solid #1B3047',
                color: '#F3F7FA',
                caretColor: '#19C3E6'
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(25,195,230,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1B3047')}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: input.trim() && !isTyping ? '#19C3E6' : 'transparent',
                color: input.trim() && !isTyping ? '#07111F' : '#60758A',
                cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer'
              }}
            >
              <Send style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center mt-2.5 text-[#60758A] font-mono">
          NWIS Copilot v2.4 · Engineering verification required before downhole intervention
        </p>
      </div>
    </div>
  );
}
