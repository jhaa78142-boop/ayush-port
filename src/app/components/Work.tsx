import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowUpRight, Github, X } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    number: '01',
    title: 'Rentals Pro',
    category: 'Full Stack Platform',
    year: '2024',
    accent: '#6366f1',
    emoji: '🏠',
    status: 'Live',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind'],
    shortDesc: 'Full-stack rental management platform with real-time booking engine, admin dashboard, and availability tracking.',
    fullDesc: 'A production-grade rental management system built with React and Node.js. Features a real-time availability engine, admin dashboard with analytics, multi-tenant support, and a responsive booking flow. MongoDB handles complex relational data with 99.9% uptime.',
    metrics: [
      { val: '99.9%', label: 'Uptime' },
      { val: '< 200ms', label: 'Avg Response' },
      { val: '23 ⭐', label: 'GitHub Stars' },
    ],
    github: 'https://github.com/jhaa78142-boop/rentals-pro',
    featured: true,
  },
  {
    id: 2,
    number: '02',
    title: 'Neural Image Classifier',
    category: 'ML / Production AI',
    year: '2024',
    accent: '#a855f7',
    emoji: '🤖',
    status: 'Production',
    tags: ['Python', 'TensorFlow', 'AWS Lambda', 'Docker', 'FastAPI'],
    shortDesc: 'CNN pipeline serving 10k+ daily inferences at 98.4% accuracy. Deployed on AWS Lambda with auto-scaling.',
    fullDesc: 'End-to-end convolutional neural network pipeline built with TensorFlow, containerized with Docker, and deployed on AWS Lambda with auto-scaling. Processes 10,000+ daily image classification requests with a REST API wrapper built in FastAPI. Achieved 98.4% accuracy through transfer learning and data augmentation.',
    metrics: [
      { val: '98.4%', label: 'Accuracy' },
      { val: '10k+', label: 'Daily Inferences' },
      { val: '142 ⭐', label: 'GitHub Stars' },
    ],
    github: 'https://github.com/jhaa78142-boop',
    featured: true,
  },
  {
    id: 3,
    number: '03',
    title: 'Real-time Analytics Engine',
    category: 'Data Engineering',
    year: '2023',
    accent: '#06b6d4',
    emoji: '📊',
    status: 'Production',
    tags: ['Python', 'Apache Kafka', 'Flink', 'Plotly Dash', 'Redis'],
    shortDesc: 'Stream processing pipeline handling 1M events/sec with live ML inference and executive dashboards.',
    fullDesc: 'High-throughput stream processing system using Apache Kafka and Apache Flink capable of processing 1 million events per second. Integrated real-time ML inference pipeline with Redis caching and an interactive Plotly Dash dashboard for executive reporting.',
    metrics: [
      { val: '1M/sec', label: 'Event Throughput' },
      { val: '< 50ms', label: 'P99 Latency' },
      { val: '89 ⭐', label: 'GitHub Stars' },
    ],
    github: 'https://github.com/jhaa78142-boop',
    featured: false,
  },
  {
    id: 4,
    number: '04',
    title: 'NLP Sentiment Engine',
    category: 'ML / NLP',
    year: '2023',
    accent: '#10b981',
    emoji: '💬',
    status: 'Open Source',
    tags: ['Python', 'HuggingFace', 'BERT', 'React', 'FastAPI'],
    shortDesc: 'Fine-tuned BERT for multi-label sentiment analysis. 95% F1-score with React dashboard and REST API.',
    fullDesc: 'Fine-tuned BERT transformer model for multi-label sentiment classification across 8 emotion categories. Trained on 500k+ samples with custom attention mechanisms. Deployed as a FastAPI REST service with a React dashboard for real-time sentiment visualization.',
    metrics: [
      { val: '95%', label: 'F1-Score' },
      { val: '8', label: 'Emotion Labels' },
      { val: '67 ⭐', label: 'GitHub Stars' },
    ],
    github: 'https://github.com/jhaa78142-boop',
    featured: false,
  },
  {
    id: 5,
    number: '05',
    title: 'Smart Portfolio Optimizer',
    category: 'Reinforcement Learning',
    year: '2023',
    accent: '#f59e0b',
    emoji: '📈',
    status: 'Research',
    tags: ['Python', 'PyTorch', 'PPO', 'NumPy', 'Pandas'],
    shortDesc: 'RL agent using PPO for stock portfolio optimization. Backtested 5 years of data with Sharpe ratio 1.8.',
    fullDesc: 'Proximal Policy Optimization (PPO) reinforcement learning agent for dynamic stock portfolio management. Trained on 5 years of historical market data with a custom reward function incorporating risk-adjusted returns. Achieved Sharpe ratio of 1.8, outperforming market benchmarks.',
    metrics: [
      { val: '1.8', label: 'Sharpe Ratio' },
      { val: '5 yrs', label: 'Backtested' },
      { val: '+24%', label: 'vs Benchmark' },
    ],
    github: 'https://github.com/jhaa78142-boop',
    featured: false,
  },
  {
    id: 6,
    number: '06',
    title: 'Neural Net Visualizer',
    category: 'Developer Tools',
    year: '2023',
    accent: '#ef4444',
    emoji: '🧠',
    status: 'Open Source',
    tags: ['JavaScript', 'WebGL', 'D3.js', 'Python', 'WebSocket'],
    shortDesc: 'Interactive WebGL tool for real-time 3D visualization of neural network training. Used in 3 universities.',
    fullDesc: 'Open-source WebGL application for real-time visualization of neural network training dynamics. Renders weight matrices, activation maps, and gradient flows in interactive 3D. Adopted by 3 universities as a teaching tool with 178 GitHub stars.',
    metrics: [
      { val: '178 ⭐', label: 'GitHub Stars' },
      { val: '3', label: 'Universities' },
      { val: '52', label: 'Forks' },
    ],
    github: 'https://github.com/jhaa78142-boop',
    featured: false,
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Production: { bg: 'rgba(16,185,129,0.12)', text: '#6ee7b7' },
  Live: { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' },
  'Open Source': { bg: 'rgba(168,85,247,0.12)', text: '#d8b4fe' },
  Research: { bg: 'rgba(245,158,11,0.12)', text: '#fcd34d' },
};

function ProjectModal({ project, onClose }: { project: typeof PROJECTS[0]; onClose: () => void }) {
  const sc = STATUS_COLORS[project.status] || { bg: 'rgba(255,255,255,0.05)', text: '#fff' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 680,
          background: '#0c0c18',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${project.accent}, transparent)` }} />

        <div style={{ padding: '32px 36px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: sc.bg, color: sc.text,
                  fontFamily: 'DM Mono,monospace', fontSize: 11, letterSpacing: '0.06em',
                }}>{project.status}</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {project.category} · {project.year}
                </span>
              </div>
              <h3 style={{
                fontFamily: 'Syne,sans-serif', fontWeight: 800,
                fontSize: 26, color: 'white', letterSpacing: '-0.02em',
              }}>{project.emoji} {project.title}</h3>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)',
            }}>
              <X size={15} />
            </button>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: 'DM Sans,sans-serif', fontSize: 15, lineHeight: 1.8,
            color: 'rgba(255,255,255,0.55)', marginBottom: 28, fontWeight: 300,
          }}>{project.fullDesc}</p>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {project.metrics.map(m => (
              <div key={m.label} style={{
                padding: '16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20,
                  color: project.accent, letterSpacing: '-0.01em', marginBottom: 4,
                }}>{m.val}</div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tags + Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {project.tags.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)',
                }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.a href={project.github} target="_blank" whileHover={{ scale: 1.04 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                  fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500,
                }}>
                <Github size={14} /> View Code
              </motion.a>
              <motion.a href={project.github} target="_blank" whileHover={{ scale: 1.04 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10,
                  background: `linear-gradient(135deg, ${project.accent}, ${project.accent}cc)`,
                  color: 'white', textDecoration: 'none',
                  fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600,
                }}>
                Live Demo <ArrowUpRight size={14} />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Work() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

  const filters = ['All', 'ML / AI', 'Data Engineering', 'Full Stack', 'Research'];
  const filtered = filter === 'All' ? PROJECTS : PROJECTS.filter(p =>
    p.category.toLowerCase().includes(filter.toLowerCase().replace(' / ', '')) ||
    filter === 'ML / AI' && (p.category.includes('ML') || p.category.includes('NLP')) ||
    filter === 'Research' && p.status === 'Research'
  );

  return (
    <>
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      <section id="work" ref={ref} style={{
        padding: '120px 0', background: '#070710',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle radial */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 52 }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 24, height: 1, background: '#6366f1' }} />
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: '#818cf8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Selected Work
                </span>
              </div>
              <h2 style={{
                fontFamily: 'Syne,sans-serif', fontWeight: 800,
                fontSize: 'clamp(2.2rem,5vw,4rem)',
                color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05,
              }}>
                Things I've<br />
                <span style={{
                  backgroundImage: 'linear-gradient(135deg,#818cf8,#c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Actually Shipped</span>
              </h2>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filters.map(f => (
                <motion.button key={f} onClick={() => setFilter(f)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '7px 16px', borderRadius: 9, cursor: 'pointer',
                    fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500,
                    transition: 'all 0.2s',
                    background: filter === f ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: filter === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    color: filter === f ? '#c7d2fe' : 'rgba(255,255,255,0.4)',
                  }}
                >{f}</motion.button>
              ))}
            </div>
          </motion.div>

          {/* Featured row (2-col) */}
          {filter === 'All' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
                 className="work-featured">
              {PROJECTS.filter(p => p.featured).map((p, i) => {
                const sc = STATUS_COLORS[p.status] || { bg: 'rgba(255,255,255,0.05)', text: '#fff' };
                return (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedProject(p)}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                      transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                    }}
                    whileHover={{ y: -4, boxShadow: `0 20px 60px ${p.accent}18`, borderColor: `${p.accent}35` }}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
                    <div style={{ padding: '28px 28px 26px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 28 }}>{p.emoji}</span>
                            <div>
                              <span style={{
                                display: 'inline-block', padding: '3px 9px', borderRadius: 6, marginBottom: 3,
                                background: sc.bg, color: sc.text,
                                fontFamily: 'DM Mono,monospace', fontSize: 10.5, letterSpacing: '0.05em',
                              }}>{p.status}</span>
                              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10.5, color: 'rgba(255,255,255,0.25)' }}>
                                {p.category}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <a href={p.github} target="_blank" onClick={e => e.stopPropagation()}
                            style={{
                              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                              color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                            }}><Github size={13} /></a>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                            color: 'rgba(255,255,255,0.4)',
                          }}><ArrowUpRight size={13} /></div>
                        </div>
                      </div>

                      <h3 style={{
                        fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20,
                        color: 'white', letterSpacing: '-0.02em', marginBottom: 10,
                      }}>{p.title}</h3>
                      <p style={{
                        fontFamily: 'DM Sans,sans-serif', fontSize: 13.5, lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontWeight: 300,
                      }}>{p.shortDesc}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {p.tags.slice(0, 4).map(t => (
                            <span key={t} style={{
                              padding: '3px 9px', borderRadius: 5,
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                              fontFamily: 'DM Mono,monospace', fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
                            }}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {p.metrics.slice(0, 2).map(m => (
                            <div key={m.label} style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: p.accent }}>{m.val}</div>
                              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}
               className="work-grid">
            {(filter === 'All' ? PROJECTS.filter(p => !p.featured) : filtered).map((p, i) => {
              const sc = STATUS_COLORS[p.status] || { bg: 'rgba(255,255,255,0.05)', text: '#fff' };
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setSelectedProject(p)}
                  whileHover={{ y: -3, boxShadow: `0 16px 50px ${p.accent}15`, borderColor: `${p.accent}28` }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div style={{ height: 2, background: `linear-gradient(90deg,${p.accent},transparent)` }} />
                  <div style={{ padding: '22px 22px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ fontSize: 24 }}>{p.emoji}</div>
                      <span style={{
                        padding: '3px 8px', borderRadius: 5,
                        background: sc.bg, color: sc.text,
                        fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: '0.04em',
                      }}>{p.status}</span>
                    </div>
                    <h3 style={{
                      fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16,
                      color: 'white', letterSpacing: '-0.01em', marginBottom: 8,
                    }}>{p.title}</h3>
                    <p style={{
                      fontFamily: 'DM Sans,sans-serif', fontSize: 12.5, lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.38)', marginBottom: 16, fontWeight: 300,
                    }}>{p.shortDesc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.tags.slice(0, 3).map(t => (
                        <span key={t} style={{
                          padding: '2px 8px', borderRadius: 4,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                          fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'rgba(255,255,255,0.38)',
                        }}>{t}</span>
                      ))}
                      {p.tags.length > 3 && <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>+{p.tags.length - 3}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* GitHub CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            style={{ textAlign: 'center', marginTop: 48 }}
          >
            <motion.a
              href="https://github.com/jhaa78142-boop"
              target="_blank"
              whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.18)' }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                fontFamily: 'DM Sans,sans-serif', fontSize: 13.5, fontWeight: 500,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Github size={15} />
              View all projects on GitHub
              <ArrowUpRight size={14} />
            </motion.a>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .work-featured { grid-template-columns: 1fr !important; }
            .work-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 600px) {
            .work-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
