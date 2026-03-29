/**
 * Hero.tsx — v12
 * Key changes:
 * - Headline: "I Build Systems That Think." — kept, tightened animation
 * - Subhead: More specific, credibility-first wording
 * - Photo: glowing border traces on entry (no chip clutter)
 * - Stats: cleaned spacing, counter animation
 * - Stronger section-to-section visual continuity with NeuralField
 * - Mouse parallax unified and smoother
 * - Reduced competing animations: one main motion path
 */

import { motion, useScroll, useTransform, useSpring, animate } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import profileImage from '../../assets/profile.png';
import { NeuralField } from './NeuralField';

const EXPO: [number,number,number,number] = [0.16,1,0.3,1];

function Counter({ to, suffix='' }: { to:number; suffix?:string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animate(0, to, { duration:1.4, ease:[0.16,1,0.3,1], onUpdate: v => setVal(Math.round(v)) });
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <div ref={ref}>{val}{suffix}</div>;
}

function Headline() {
  return (
    <h1 style={{
      fontFamily:'Syne,sans-serif', fontWeight:800,
      lineHeight:0.94, letterSpacing:'-0.036em',
      fontSize:'clamp(3.2rem,6.8vw,6.6rem)',
      color:'white', marginBottom:26,
    }}>
      {[
        { text:'I Build Systems', delay:0.04, gradient:false },
        { text:'That Think.',     delay:0.18, gradient:true  },
      ].map(({ text,delay,gradient }) => (
        <div key={text} style={{ overflow:'hidden', display:'block' }}>
          <motion.div
            initial={{ y:'106%', opacity:0 }}
            animate={{ y:'0%',   opacity:1 }}
            transition={{ delay, duration:0.70, ease:EXPO }}
            style={{
              display:'block',
              ...(gradient ? {
                backgroundImage:'linear-gradient(135deg, #818cf8 0%, #c084fc 48%, #67e8f9 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              } : {}),
            }}
          >{text}</motion.div>
        </div>
      ))}
    </h1>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target:sectionRef, offset:['start start','end start'] });

  const yText    = useTransform(scrollYProgress, [0,1], [0,70]);
  const opacText = useTransform(scrollYProgress, [0,0.55], [1,0]);
  const blurRaw  = useTransform(scrollYProgress, [0,0.48], [0,7]);
  const blurSpr  = useSpring(blurRaw, { stiffness:80, damping:20 });
  const scaleField = useTransform(scrollYProgress, [0,1], [1,0.86]);

  const mouseRef = useRef({x:0, y:0, cx:0, cy:0});
  const [mouseXY, setMouseXY] = useState({x:0, y:0});

  const onMouse = useCallback((e:MouseEvent) => {
    mouseRef.current.x = (e.clientX/window.innerWidth - .5)*14;
    mouseRef.current.y = (e.clientY/window.innerHeight - .5)*10;
    setMouseXY({ x:mouseRef.current.x, y:mouseRef.current.y });
  },[]);
  useEffect(() => {
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  },[onMouse]);

  const [scrollNum, setScrollNum] = useState(0);
  useEffect(() => scrollYProgress.on('change', setScrollNum),[scrollYProgress]);

  return (
    <section id="home" ref={sectionRef} style={{
      position:'relative', minHeight:'100vh', display:'flex',
      alignItems:'center', background:'#01010a', overflow:'hidden',
    }}>
      {/* Neural field — deliberately dim so text dominates */}
      <motion.div style={{ position:'absolute', inset:0, zIndex:0, scale:scaleField, opacity:0.48 }}>
        <NeuralField scrollProgress={scrollNum} isReady />
      </motion.div>

      {/* Radial vignette */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background:'radial-gradient(ellipse 90% 88% at 50% 50%, transparent 18%, rgba(1,1,10,0.82) 100%)',
        pointerEvents:'none',
      }} />

      {/* Subtle grid */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        backgroundImage:'linear-gradient(rgba(255,255,255,0.006) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.006) 1px,transparent 1px)',
        backgroundSize:'72px 72px', pointerEvents:'none',
      }} />

      {/* Content wrapper — parallax */}
      <motion.div style={{
        y:yText, opacity:opacText,
        filter:useTransform(blurSpr, v=>`blur(${v}px)`),
        x:mouseXY.x*0.24,
        position:'relative', zIndex:2, width:'100%',
      }}>
        <div style={{ maxWidth:1160,margin:'0 auto',padding:'clamp(88px,11vh,128px) clamp(24px,5vw,48px) 64px' }}>
          <div className="hero-grid" style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:'clamp(44px,6vw,92px)',alignItems:'center' }}>

            {/* LEFT */}
            <div>
              {/* Availability badge */}
              <motion.div
                initial={{ opacity:0, y:12 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.02, duration:0.48, ease:EXPO }}
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:100,border:'1px solid rgba(99,102,241,0.28)',background:'rgba(99,102,241,0.055)',marginBottom:26,backdropFilter:'blur(10px)' }}
              >
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px rgba(74,222,128,0.75)',animation:'pulse-green 2.2s ease-in-out infinite',flexShrink:0 }} />
                <span style={{ fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'rgba(255,255,255,0.40)',letterSpacing:'0.07em' }}>
                  OPEN TO OPPORTUNITIES · MUMBAI
                </span>
              </motion.div>

              <Headline />

              {/* Subhead — specificity first */}
              <motion.p
                initial={{ opacity:0, y:14 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.28, duration:0.58, ease:EXPO }}
                style={{ fontFamily:'DM Sans,sans-serif',fontSize:'clamp(14.5px,1.16vw,16.5px)',lineHeight:1.78,color:'rgba(255,255,255,0.36)',maxWidth:440,marginBottom:36,fontWeight:300 }}
              >
                98.4% production ML accuracy across 15+ shipped systems.{' '}
                <span style={{ color:'rgba(255,255,255,0.70)',fontWeight:500 }}>SY-AIML at Thakur College</span>
                {' '}— building infrastructure that makes decisions at scale, not just demos.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.42, duration:0.48 }}
                style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:10,marginBottom:50 }}
              >
                <motion.a
                  href="#work"
                  whileHover={{ scale:1.03, boxShadow:'0 0 56px rgba(99,102,241,0.62)' }}
                  whileTap={{ scale:0.97 }}
                  style={{
                    display:'inline-flex',alignItems:'center',gap:7,
                    padding:'15px 30px',borderRadius:10,
                    background:'linear-gradient(135deg,#5b5ef4,#8b5cf6)',
                    color:'white',textDecoration:'none',
                    fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:14.5,
                    boxShadow:'0 0 38px rgba(99,102,241,0.42)',
                    position:'relative',overflow:'hidden',letterSpacing:'0.01em',
                  }}
                >
                  <motion.div
                    initial={{ x:'-115%' }}
                    whileHover={{ x:'115%' }}
                    transition={{ duration:0.40 }}
                    style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)',pointerEvents:'none' }}
                  />
                  View My Work <ArrowUpRight size={14} />
                </motion.a>

                <motion.a
                  href="mailto:ayushjha5987@gmail.com"
                  whileHover={{ scale:1.02,borderColor:'rgba(255,255,255,0.20)',background:'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale:0.97 }}
                  style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'15px 28px',borderRadius:10,border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.022)',color:'rgba(255,255,255,0.65)',textDecoration:'none',fontFamily:'DM Sans,sans-serif',fontWeight:500,fontSize:14,backdropFilter:'blur(12px)' }}
                >
                  Let's Build Something
                </motion.a>

                <div style={{ display:'flex',gap:6,marginLeft:2 }}>
                  {[
                    { Icon:Github,   href:'https://github.com/jhaa78142-boop',               label:'GitHub'   },
                    { Icon:Linkedin, href:'https://www.linkedin.com/in/ayush-jha-291672327', label:'LinkedIn' },
                    { Icon:Mail,     href:'mailto:ayushjha5987@gmail.com',                   label:'Email'    },
                  ].map(({ Icon,href,label }) => (
                    <motion.a key={label} href={href} target="_blank" rel="noopener" title={label}
                      whileHover={{ scale:1.12,y:-2 }}
                      style={{ width:38,height:38,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.022)',color:'rgba(255,255,255,0.32)',textDecoration:'none' }}
                    >
                      <Icon size={14} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:0.62 }}
                style={{ display:'flex',gap:40,flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:22 }}
              >
                {[
                  { to:15, suffix:'+', label:'Projects'      },
                  { to:2,  suffix:'+', label:'Years Exp.'    },
                  { to:98, suffix:'%', label:'Best Accuracy' },
                ].map((s,i) => (
                  <motion.div key={s.label}
                    initial={{ opacity:0,y:8 }}
                    animate={{ opacity:1,y:0 }}
                    transition={{ delay:0.65+i*0.06 }}
                  >
                    <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:'white',letterSpacing:'-0.02em',lineHeight:1 }}>
                      <Counter to={s.to} suffix={s.suffix} />
                    </div>
                    <div style={{ fontFamily:'DM Sans,sans-serif',fontSize:10.5,color:'rgba(255,255,255,0.20)',marginTop:5,letterSpacing:'0.06em',textTransform:'uppercase' }}>
                      {s.label}
                    </div>
                  </motion.div>
                ))}
                {/* CGPA shown as static — it's a precise value */}
                <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.83 }}>
                  <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:'white',letterSpacing:'-0.02em',lineHeight:1 }}>9.2</div>
                  <div style={{ fontFamily:'DM Sans,sans-serif',fontSize:10.5,color:'rgba(255,255,255,0.20)',marginTop:5,letterSpacing:'0.06em',textTransform:'uppercase' }}>CGPA</div>
                </motion.div>
              </motion.div>
            </div>

            {/* RIGHT — PHOTO */}
            <motion.div
              initial={{ opacity:0, x:36, filter:'blur(18px)' }}
              animate={{ opacity:1, x:0,  filter:'blur(0px)'  }}
              transition={{ delay:0.20, duration:1.0, ease:EXPO }}
              className="hero-photo"
              style={{
                position:'relative',
                width:'clamp(210px,21vw,272px)',
                flexShrink:0,
                // Reverse parallax — photo moves less than text
                x:-mouseXY.x*0.14,
                y:-mouseXY.y*0.09,
              } as any}
            >
              {/* Glow aura */}
              <div style={{ position:'absolute',inset:-24,borderRadius:38,background:'radial-gradient(ellipse 80% 80% at 50% 50%,rgba(99,102,241,0.16),rgba(168,85,247,0.07) 50%,transparent 75%)',filter:'blur(22px)',animation:'breathe-glow 4.2s ease-in-out infinite' }} />

              {/* Card */}
              <div style={{ position:'relative',borderRadius:20,overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)',background:'rgba(8,8,20,0.6)',boxShadow:'0 24px 64px rgba(0,0,0,0.65),0 0 0 1px rgba(99,102,241,0.05)' }}>
                <img src={profileImage} alt="Ayush Jha" style={{ width:'100%',aspectRatio:'3/4',objectFit:'cover',display:'block',filter:'saturate(1.05) contrast(1.02)' }} />
                <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(1,1,10,0.94) 0%,transparent 48%)' }} />
                <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'18px 20px' }}>
                  <div style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:16,color:'white',marginBottom:3 }}>Ayush Jha</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'#a5b4fc',letterSpacing:'0.05em' }}>SY-AIML · Thakur College</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:0.26 }} transition={{ delay:1.6 }}
        style={{ position:'absolute',bottom:26,left:'50%',transform:'translateX(-50%)',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center' }}
      >
        <div style={{ width:1,height:40,background:'linear-gradient(to bottom,transparent,rgba(99,102,241,0.55))',position:'relative' }}>
          <motion.div
            animate={{ y:[0,36,0] }}
            transition={{ duration:2.2,repeat:Infinity,ease:'easeInOut' }}
            style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:'#6366f1',boxShadow:'0 0 8px rgba(99,102,241,0.75)' }}
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 6px rgba(74,222,128,0.42)} 50%{box-shadow:0 0 14px rgba(74,222,128,1)} }
        @keyframes breathe-glow { 0%,100%{opacity:0.75} 50%{opacity:1} }
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;gap:44px!important}
          .hero-photo{width:190px!important;margin:0 auto}
        }
      `}</style>
    </section>
  );
}
