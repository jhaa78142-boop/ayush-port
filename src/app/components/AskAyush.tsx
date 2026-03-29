/**
 * AskAyush.tsx — Groq-powered AI chat widget
 * ─────────────────────────────────────────────────────────────────────
 * A floating chat bubble that opens into a full chat interface.
 * Uses Groq API (llama-3.3-70b-versatile) with a rich system prompt
 * containing Ayush's complete portfolio knowledge.
 *
 * FEATURES:
 *  - Groq streaming responses (token-by-token, feels instant)
 *  - Conversation memory (full history sent each turn)
 *  - Suggested starter questions (chips)
 *  - Typing indicator with animated dots
 *  - Auto-scroll to latest message
 *  - Keyboard shortcut: press "/" to open
 *  - Matches portfolio design system exactly
 *  - Mobile-responsive (full-screen on small screens)
 *  - API key stored in .env (VITE_GROQ_API_KEY)
 *
 * SETUP:
 *  1. Add to your .env:  VITE_GROQ_API_KEY=your_groq_key_here
 *  2. Import in App.tsx and place below the main content
 *  3. That's it. No backend needed.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   SYSTEM PROMPT — the "brain" of Ask Ayush
   Written in first person so the AI speaks AS Ayush
───────────────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are Ayush Jha — a second-year AI/ML engineering student at Thakur College of Engineering and Technology, Mumbai, India. You're speaking directly through your portfolio's chat widget to visitors (potential employers, collaborators, or curious developers).

PERSONALITY:
- Confident but not arrogant. You know your work is strong.
- Conversational, direct, slightly witty. Not formal or stiff.
- Enthusiastic about ML, systems design, and clean code.
- Honest about being a student — but frame it as an advantage: you're hungry, fast-moving, and up to date.
- Keep answers concise (2-4 sentences usually). Don't ramble.
- Use "I" naturally. Speak as yourself.

YOUR DETAILS:

Education:
- SY-AIML (Second Year, Artificial Intelligence & Machine Learning)
- Thakur College of Engineering and Technology, Mumbai
- CGPA: 9.2/10
- Expected graduation: 2026

Skills:
- Languages: Python (primary), TypeScript, JavaScript, SQL, C++
- ML/AI: PyTorch, TensorFlow, scikit-learn, Hugging Face, LangChain, OpenCV
- Frameworks: FastAPI, React, Vite, Node.js, Next.js
- Data: Pandas, NumPy, Matplotlib, Seaborn, Plotly
- Databases: PostgreSQL, MongoDB, Redis, Pinecone (vector DB)
- Cloud/DevOps: AWS (EC2, S3, Lambda), Docker, GitHub Actions
- Specialty: RAG pipelines, computer vision, NLP, time series forecasting

Key Projects (top ones to highlight):
1. Medical Image Classification System
   - CNN model for detecting pneumonia from chest X-rays
   - 98.4% accuracy on test set (CheXpert dataset)
   - Deployed on AWS with FastAPI backend, React frontend
   - Used transfer learning (EfficientNet-B4 + custom head)

2. Real-Time Stock Prediction Engine
   - LSTM + Transformer hybrid for multi-step forecasting
   - Integrated live data from Yahoo Finance & Alpha Vantage
   - Sharpe ratio improvement of 23% over baseline strategy
   - Full-stack: Python backend, React dashboard, WebSocket streaming

3. RAG-Powered Document Intelligence
   - LangChain + Pinecone vector DB + GPT-4 (then migrated to Llama 3)
   - Processes PDFs, extracts structured data, answers questions
   - Built for legal document analysis use case
   - 15x faster than manual review, 91% answer accuracy

4. Face Recognition Attendance System
   - Built for college use — real deployment
   - FaceNet embeddings + cosine similarity
   - 99.1% recognition accuracy in real-world lighting
   - Processes 200+ students in under 30 seconds

5. Portfolio Website (this one)
   - React + Vite + Three.js + GSAP
   - Custom WebGL particle system, GSAP master timeline
   - Cinematic intro sequence (v11 "Convergence")

Total projects: 15+ across ML, full-stack, and data engineering

Experience / What you're looking for:
- Open to: ML Engineering internships, AI Developer roles, Full-Stack positions
- Especially interested in: applied ML, production AI systems, startups
- Location: Mumbai, India. Open to remote anywhere.
- Available: Immediately for part-time / from June 2025 for full-time
- NOT looking for: pure frontend roles (unless product is AI-adjacent)

Contact:
- Email: ayushjha5987@gmail.com
- LinkedIn: linkedin.com/in/ayush-jha-291672327
- GitHub: github.com/jhaa78142-boop

Fun facts:
- Built your first neural network at 17 during lockdown (digit recognizer)
- Favourite paper: "Attention Is All You Need" (read it 4 times)
- Currently reading: "The Elements of Statistical Learning"
- Side interest: generative art (hence the particle systems in this portfolio)

RULES FOR YOUR RESPONSES:
1. Always answer as Ayush in first person.
2. If asked about salary, say you're open to discussion and to reach out directly.
3. If asked something you genuinely don't know about yourself, say "I'd have to check on that — feel free to email me at ayushjha5987@gmail.com"
4. Never claim experience or projects you don't have listed above.
5. Keep it human. No bullet-point walls unless genuinely needed.
6. If someone seems like a recruiter, gently nudge them toward email or LinkedIn at the end.
7. If someone asks you to do something completely unrelated to you (like explain a random coding concept), you can help briefly but note "I'm really here to talk about my work — but here's a quick answer..."
8. Max response length: ~120 words unless the question genuinely needs more.`;

/* ─────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────── */
interface Message {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  ts:      number;
}

/* ─────────────────────────────────────────────────────────────────────
   STARTER QUESTIONS — shown when chat is empty
───────────────────────────────────────────────────────────────────── */
const STARTERS = [
  "What's your strongest project?",
  "Are you open to internships?",
  "What ML frameworks do you use?",
  "Tell me about your 98.4% model",
  "How do I hire you?",
  "What sets you apart?",
];

/* ─────────────────────────────────────────────────────────────────────
   GROQ STREAMING CALL
───────────────────────────────────────────────────────────────────── */
async function streamGroq(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal: AbortSignal
) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    onError("VITE_GROQ_API_KEY is not set. Add it to your .env file.");
    return;
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens:  300,
        temperature: 0.72,
        stream:      true,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      onError((errData as any)?.error?.message || `Groq API error: ${res.status}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') { onDone(); return; }
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content || '';
          if (text) onChunk(text);
        } catch { /* skip malformed chunks */ }
      }
    }
    onDone();
  } catch (e: any) {
    if (e?.name === 'AbortError') return;
    onError('Connection error. Check your API key and try again.');
  }
}

/* ─────────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 2px' }}>
      {[0,1,2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'white',
          marginRight: 8, marginTop: 2,
          fontFamily: 'Syne, sans-serif',
          boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        }}>
          A
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: isUser ? '10px 14px' : '11px 15px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        background: isUser
          ? 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))'
          : 'rgba(255,255,255,0.04)',
        border: isUser
          ? 'none'
          : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: isUser ? 'none' : 'blur(12px)',
        color: 'rgba(255,255,255,0.92)',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
        lineHeight: 1.65,
        letterSpacing: '0.01em',
        boxShadow: isUser
          ? '0 4px 20px rgba(99,102,241,0.3)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MAIN WIDGET
───────────────────────────────────────────────────────────────────── */
export function AskAyush() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [pulse,    setPulse]    = useState(false); // bubble pulse to attract attention

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Keyboard shortcut: "/" to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !open && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Pulse animation after 4s to attract attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError('');
    setInput('');

    const userMsg: Message = {
      id:      crypto.randomUUID(),
      role:    'user',
      content: trimmed,
      ts:      Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    // Streaming assistant message
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id:      assistantId,
      role:    'assistant',
      content: '',
      ts:      Date.now(),
    }]);

    abortRef.current = new AbortController();

    await streamGroq(
      newMessages.map(m => ({ role: m.role, content: m.content })),
      (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content + chunk }
            : m
        ));
      },
      () => setLoading(false),
      (err) => {
        setError(err);
        setLoading(false);
        // Remove empty assistant message on error
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      },
      abortRef.current.signal,
    );
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError('');
    setLoading(false);
    setInput('');
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}
            style={{
              position: 'fixed',
              bottom: 96,
              right: 24,
              width: 'clamp(320px, 90vw, 420px)',
              height: 'clamp(420px, 70vh, 580px)',
              zIndex: 9000,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 20,
              overflow: 'hidden',
              background: 'rgba(6,6,18,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.12), 0 0 60px rgba(99,102,241,0.06)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: 'rgba(99,102,241,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: 'white',
                  fontFamily: 'Syne, sans-serif',
                  boxShadow: '0 0 16px rgba(99,102,241,0.5)',
                  flexShrink: 0,
                }}>
                  A
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: 15, color: 'white', lineHeight: 1.2,
                  }}>
                    Ask Ayush
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                    color: 'rgba(74,222,128,0.8)', letterSpacing: '0.12em',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px rgba(74,222,128,0.8)',
                      display: 'inline-block',
                    }} />
                    ONLINE · GROQ LLAMA 3.3
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    title="Clear conversation"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(99,102,241,0.3) transparent',
            }}>

              {/* Empty state — greeting + starters */}
              {isEmpty && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ textAlign: 'center', paddingTop: 16 }}
                >
                  {/* Greeting */}
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: 17, color: 'white', marginBottom: 6,
                  }}>
                    Hey, I'm Ayush 👋
                  </div>
                  <div style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    color: 'rgba(255,255,255,0.38)', lineHeight: 1.6,
                    maxWidth: 280, margin: '0 auto 20px',
                  }}>
                    Ask me anything about my work, skills, or how we can build something together.
                  </div>

                  {/* Starter chips */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 7,
                    justifyContent: 'center',
                  }}>
                    {STARTERS.map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        style={{
                          padding: '7px 13px',
                          borderRadius: 100,
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.22)',
                          color: 'rgba(165,180,252,0.9)',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 12.5,
                          cursor: 'pointer',
                          transition: 'background 0.18s, border-color 0.18s',
                          letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.45)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.22)';
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                msg.content ? (
                  <Bubble key={msg.id} msg={msg} />
                ) : (
                  msg.role === 'assistant' && loading && (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white',
                        fontFamily: 'Syne, sans-serif',
                      }}>
                        A
                      </div>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '4px 18px 18px 18px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <TypingDots />
                      </div>
                    </motion.div>
                  )
                )
              ))}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    margin: '8px 0',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'rgba(252,165,165,0.9)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11.5,
                    lineHeight: 1.5,
                  }}
                >
                  ⚠ {error}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '12px 14px 14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              background: 'rgba(99,102,241,0.02)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '10px 12px 10px 14px',
                transition: 'border-color 0.2s',
              }}
                onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)'}
                onBlurCapture={e  => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything about Ayush..."
                  rows={1}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'rgba(255,255,255,0.88)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.5,
                    resize: 'none',
                    maxHeight: 100,
                    overflowY: 'auto',
                    opacity: loading ? 0.5 : 1,
                    scrollbarWidth: 'none',
                  }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: input.trim() && !loading ? 'white' : 'rgba(255,255,255,0.25)',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                    boxShadow: input.trim() && !loading ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  <Send size={13} />
                </button>
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em',
                textAlign: 'center', marginTop: 8,
              }}>
                ENTER TO SEND · SHIFT+ENTER FOR NEW LINE · ESC TO CLOSE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING BUTTON ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        title="Ask Ayush (press /)"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 2px rgba(99,102,241,0.4), 0 8px 30px rgba(99,102,241,0.5)'
            : '0 0 0 1px rgba(99,102,241,0.3), 0 8px 28px rgba(99,102,241,0.4)',
          color: 'white',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate:   0, opacity: 1 }}
              exit={{   rotate:  90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ChevronDown size={22} />
            </motion.div>
          ) : (
            <motion.div key="open"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.0, opacity: 1 }}
              exit={{   scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sparkles size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring to attract first-time attention */}
      <AnimatePresence>
        {pulse && !open && (
          <motion.div
            key="pulse"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', repeat: 2, repeatType: 'loop' }}
            onAnimationComplete={() => setPulse(false)}
            style={{
              position: 'fixed',
              bottom: 28, right: 28,
              width: 58, height: 58,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.35)',
              zIndex: 9000,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
