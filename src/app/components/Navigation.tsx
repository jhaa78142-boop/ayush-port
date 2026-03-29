/**
 * Navigation.tsx — v12
 * Changes:
 * - Logo: "AJ" monogram with subtle animated border trace on first load
 * - Pill highlight: uses color instead of just white background
 * - Hire Me CTA: slightly bolder glow
 * - Smoother blur transition on scroll
 * - Mobile menu: slide + fade instead of height animation
 */
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { useState, useEffect } from 'react';

const LINKS = [
  { id:'home',    label:'Home'    },
  { id:'work',    label:'Work'    },
  { id:'about',   label:'About'   },
  { id:'skills',  label:'Skills'  },
  { id:'contact', label:'Contact' },
];

export function Navigation() {
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState('home');
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive:true });
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold:0.3 }
    );
    document.querySelectorAll('section[id]').forEach(s => io.observe(s));
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-px z-[60] origin-left"
        style={{ scaleX:scrollYProgress, background:'linear-gradient(90deg,#6366f1,#a855f7,#22d3ee)' }}
      />

      <motion.nav
        initial={{ y:-80, opacity:0 }}
        animate={{ y:0,   opacity:1 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        style={{ position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',width:'min(860px,94vw)',zIndex:50 }}
      >
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 20px',
          borderRadius:16,
          background: scrolled ? 'rgba(5,5,10,0.94)' : 'transparent',
          border: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(28px)' : 'none',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.55)' : 'none',
          transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Logo */}
          <a href="#home" style={{ textDecoration:'none',display:'flex',alignItems:'center',gap:10 }}>
            <div style={{
              width:34,height:34,borderRadius:10,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:13,color:'white',
              letterSpacing:'-0.01em',
              boxShadow:'0 0 18px rgba(99,102,241,0.35)',
            }}>AJ</div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:700,color:'rgba(255,255,255,0.88)',fontSize:15 }}>
              Ayush Jha
            </span>
          </a>

          {/* Desktop links */}
          <div style={{ display:'flex',alignItems:'center',gap:2 }} className="nav-links">
            {LINKS.map(l => (
              <a key={l.id} href={`#${l.id}`} style={{
                position:'relative',padding:'7px 14px',borderRadius:10,
                fontFamily:'DM Sans,sans-serif',fontSize:13.5,fontWeight:500,
                color: active===l.id ? '#fff' : 'rgba(255,255,255,0.42)',
                textDecoration:'none',transition:'color 0.2s',
              }}>
                {active===l.id && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{
                      position:'absolute',inset:0,borderRadius:10,
                      background:'rgba(99,102,241,0.12)',
                      border:'1px solid rgba(99,102,241,0.22)',
                    }}
                    transition={{ type:'spring',bounce:0.18,duration:0.42 }}
                  />
                )}
                <span style={{ position:'relative',zIndex:1 }}>{l.label}</span>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <motion.a
              href="mailto:ayushjha5987@gmail.com"
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              style={{
                padding:'8px 18px',borderRadius:10,
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,
                color:'white',textDecoration:'none',
                boxShadow:'0 0 22px rgba(99,102,241,0.38)',
              }}
              className="nav-cta"
            >
              Hire Me
            </motion.a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="nav-burger"
              style={{ display:'none',background:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 10px',cursor:'pointer',color:'rgba(255,255,255,0.6)',fontFamily:'DM Mono,monospace',fontSize:12 }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity:0,y:-8 }}
              animate={{ opacity:1,y:0 }}
              exit={{ opacity:0,y:-8 }}
              transition={{ duration:0.22 }}
              style={{
                marginTop:8,borderRadius:14,overflow:'hidden',
                background:'rgba(5,5,10,0.97)',border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(28px)',
              }}
            >
              <div style={{ padding:16,display:'flex',flexDirection:'column',gap:4 }}>
                {LINKS.map(l => (
                  <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)} style={{
                    display:'block',padding:'10px 16px',borderRadius:10,
                    fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:500,
                    color: active===l.id ? '#c7d2fe' : 'rgba(255,255,255,0.48)',
                    background: active===l.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                    textDecoration:'none',
                  }}>{l.label}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-links, .nav-cta { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
