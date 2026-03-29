import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Mail, Github, Linkedin, MapPin, ArrowUpRight, Copy, Check } from 'lucide-react';

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const copyEmail = () => {
    navigator.clipboard.writeText('ayushjha5987@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  const SOCIALS = [
    { Icon: Github, label: 'GitHub', sub: 'jhaa78142-boop', href: 'https://github.com/jhaa78142-boop', color: '#6b7280' },
    { Icon: Linkedin, label: 'LinkedIn', sub: 'ayush-jha-291672327', href: 'https://www.linkedin.com/in/ayush-jha-291672327', color: '#0ea5e9' },
    { Icon: Mail, label: 'Email', sub: 'ayushjha5987@gmail.com', href: 'mailto:ayushjha5987@gmail.com', color: '#6366f1' },
    { Icon: MapPin, label: 'Location', sub: 'Mumbai, India 🇮🇳', href: '#', color: '#a855f7' },
  ];

  return (
    <section id="contact" ref={ref} style={{
      padding: '120px 0 80px', background: '#050508',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Bottom glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>

        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 24, height: 1, background: '#6366f1' }} />
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: '#818cf8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Get In Touch
            </span>
            <div style={{ width: 24, height: 1, background: '#6366f1' }} />
          </div>
          <h2 style={{
            fontFamily: 'Syne,sans-serif', fontWeight: 800,
            fontSize: 'clamp(2.2rem,5vw,4rem)',
            color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05,
            marginBottom: 16,
          }}>
            Let's build something<br />
            <span style={{
              backgroundImage: 'linear-gradient(135deg,#818cf8,#c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>extraordinary</span>
          </h2>
          <p style={{
            fontFamily: 'DM Sans,sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.4)',
            maxWidth: 420, margin: '0 auto', lineHeight: 1.7, fontWeight: 300,
          }}>
            Open to internships, collaborations, and interesting problems. Let's talk.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 40, alignItems: 'start' }}
             className="contact-grid">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            {/* Email box */}
            <div style={{
              padding: '22px', borderRadius: 18, marginBottom: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 12, letterSpacing: '0.06em' }}>
                DIRECT EMAIL
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>
                  ayushjha5987@gmail.com
                </span>
                <motion.button onClick={copyEmail} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 9, cursor: 'pointer',
                    background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                    border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.25)',
                    color: copied ? '#6ee7b7' : '#a5b4fc',
                    fontFamily: 'DM Sans,sans-serif', fontSize: 12.5, fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* Availability */}
            <div style={{
              padding: '20px', borderRadius: 18, marginBottom: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: '50%', background: '#4ade80',
                  boxShadow: '0 0 10px rgba(74,222,128,0.6)',
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 14, color: 'white' }}>
                  Available for opportunities
                </span>
              </div>
              {['Internships (6-month+)', 'Open Source Collaboration', 'Freelance ML Projects', 'Research Partnerships'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13.5, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Social grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SOCIALS.map(({ Icon, label, sub, href, color }) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener"
                  whileHover={{ y: -2, borderColor: `${color}35` }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}15`, border: `1px solid ${color}25`,
                  }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: 'white', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 }}
          >
            <div style={{
              padding: '32px', borderRadius: 22,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <h3 style={{
                fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: 'white', marginBottom: 24,
              }}>Send a message</h3>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Mono,monospace', fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Name</label>
                  <input
                    type="text" placeholder="Your name" required
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, outline: 'none',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: 'white',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Mono,monospace', fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
                  <input
                    type="email" placeholder="your@email.com" required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, outline: 'none',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: 'white',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Mono,monospace', fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Message</label>
                  <textarea
                    rows={5} placeholder="Tell me about your project or opportunity..." required
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, outline: 'none',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: 'white',
                      resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <motion.button type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: sent ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    border: 'none', color: 'white',
                    fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 600,
                    transition: 'background 0.3s',
                    boxShadow: '0 0 24px rgba(99,102,241,0.25)',
                  }}
                >
                  {sent ? '✓ Message Sent!' : <><span>Send Message</span><ArrowUpRight size={15} /></>}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: 80, paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}
        >
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Ayush Jha · Built with React, Three.js & GSAP
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              All systems operational
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.18) !important; }
      `}</style>
    </section>
  );
}
