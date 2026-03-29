/**
 * About.tsx — v12
 * Changes:
 * - Headline: "The Builder Behind the Code" — more active, less generic
 * - Bio: more specific voice, removes vague padding phrases
 * - Timeline: stronger visual — year + line + dot + event
 * - Values grid: removed emoji, replaced with minimal accent line + icon area
 * - Photo caption removed duplicate "Ayush Jha" text (shown twice)
 * - Code snippet: cleaned up, removed redundant fields
 */
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import profileImage from '../../assets/profile.png';

const TIMELINE = [
  { year:'2023', event:'Enrolled B.Tech AI & ML at Thakur College. Started shipping before semester 2.', type:'edu' },
  { year:'2023', event:'Fine-tuned BERT for multi-label sentiment — 95% F1. First production deployment.', type:'project' },
  { year:'2024', event:'Data Science Intern at DataViz Labs. Built 5 executive dashboards, cut ETL time by 60%.', type:'work' },
  { year:'2024', event:'Google TensorFlow Developer & AWS Cloud Practitioner certified.', type:'cert' },
  { year:'2024', event:'Promoted to Lead IT Engineer at TechSolvers. Led 18-person team, shipped 3 AI products.', type:'work' },
  { year:'2025', event:'Neural Net Visualizer adopted as teaching tool at 3 universities.', type:'project' },
];

const TYPE_COLORS: Record<string,string> = {
  edu:'#6366f1', work:'#10b981', project:'#a855f7', cert:'#f59e0b',
};

const VALUES = [
  { accent:'#6366f1', title:'Performance-First', desc:'Every system optimised for speed, scale, and production reality.' },
  { accent:'#a855f7', title:'Research-Backed',   desc:'ML papers translated to working code — not just prototypes.' },
  { accent:'#10b981', title:'Results-Driven',    desc:'I measure impact by accuracy, efficiency, and business value.' },
  { accent:'#06b6d4', title:'Collaborative',     desc:'Thrives in teams. Software is a team sport — I write for others to read.' },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once:true, amount:0.08 });

  return (
    <section id="about" ref={ref} style={{ padding:'120px 0', background:'#050508', position:'relative', overflow:'hidden' }}>
      {/* Faint radial accent */}
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse 50% 40% at 20% 60%, rgba(99,102,241,0.04) 0%, transparent 70%)' }} />

      <div style={{ maxWidth:1160,margin:'0 auto',padding:'0 40px',position:'relative',zIndex:1 }}>

        {/* Section label */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={isInView?{opacity:1,y:0}:{}}
          style={{ marginBottom:64 }}
        >
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
            <div style={{ width:24,height:1,background:'#6366f1' }} />
            <span style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'#818cf8',letterSpacing:'0.12em',textTransform:'uppercase' }}>About Me</span>
          </div>
          <h2 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2.2rem,5vw,4rem)',color:'white',letterSpacing:'-0.03em',lineHeight:1.05 }}>
            The builder<br />
            <span style={{ backgroundImage:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
              behind the code
            </span>
          </h2>
        </motion.div>

        <div style={{ display:'grid',gridTemplateColumns:'360px 1fr',gap:60,alignItems:'start' }} className="about-grid">

          {/* LEFT */}
          <motion.div
            initial={{ opacity:0,x:-28 }} animate={isInView?{opacity:1,x:0}:{}}
            transition={{ delay:0.1,ease:[0.16,1,0.3,1] }}
          >
            <div style={{ borderRadius:22,overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)',marginBottom:22,position:'relative' }}>
              <img src={profileImage} alt="Ayush Jha" style={{ width:'100%',aspectRatio:'4/5',objectFit:'cover',display:'block' }} />
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,5,10,0.82) 0%,transparent 50%)' }} />
              <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'20px' }}>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:17,color:'white',marginBottom:3 }}>Ayush Jha</div>
                <div style={{ fontFamily:'DM Mono,monospace',fontSize:10.5,color:'#a5b4fc' }}>ML Engineer · Mumbai, India</div>
              </div>
            </div>

            {/* Config card */}
            <div style={{ padding:'20px',borderRadius:18,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',fontFamily:'DM Mono,monospace',fontSize:12.5 }}>
              <div style={{ color:'rgba(255,255,255,0.22)',marginBottom:14,fontSize:10,letterSpacing:'0.1em' }}>// ayush.config.ts</div>
              {[
                ['college', '"Thakur College"'],
                ['year',    '"SY-AIML"'],
                ['cgpa',    '9.2'],
                ['openTo',  '"internships, research"'],
                ['location','"Mumbai 🇮🇳"'],
              ].map(([k,v]) => (
                <div key={k} style={{ marginBottom:6 }}>
                  <span style={{ color:'#818cf8' }}>{k}</span>
                  <span style={{ color:'rgba(255,255,255,0.22)' }}>: </span>
                  <span style={{ color: v.startsWith('"') ? '#a5b4fc' : '#f59e0b' }}>{v}</span>
                  <span style={{ color:'rgba(255,255,255,0.18)' }}>,</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity:0,x:28 }} animate={isInView?{opacity:1,x:0}:{}}
            transition={{ delay:0.15,ease:[0.16,1,0.3,1] }}
          >
            <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:17,lineHeight:1.85,color:'rgba(255,255,255,0.48)',marginBottom:18,fontWeight:300 }}>
              I'm an{' '}<span style={{ color:'rgba(255,255,255,0.84)',fontWeight:500 }}>ML Engineer and Data Scientist</span>{' '}
              who turns messy real-world data into intelligent, production-grade systems.
              Currently SY-AIML at Thakur College — but shipping production systems since semester one.
            </p>
            <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:17,lineHeight:1.85,color:'rgba(255,255,255,0.48)',marginBottom:48,fontWeight:300 }}>
              I care about{' '}<span style={{ color:'rgba(255,255,255,0.84)',fontWeight:500 }}>code quality, system design, and things that actually work at scale.</span>{' '}
              Outside ML: reading research papers, contributing to open-source, and helping others get into tech.
            </p>

            {/* Values */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:52 }}>
              {VALUES.map((v,i) => (
                <motion.div key={v.title}
                  initial={{ opacity:0,y:14 }} animate={isInView?{opacity:1,y:0}:{}}
                  transition={{ delay:0.28+i*0.07 }}
                  style={{ padding:'18px 18px 18px 20px',borderRadius:16,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderLeft:`2px solid ${v.accent}40`,position:'relative',overflow:'hidden' }}
                >
                  <div style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13.5,color:'white',marginBottom:6 }}>{v.title}</div>
                  <div style={{ fontFamily:'DM Sans,sans-serif',fontSize:12.5,color:'rgba(255,255,255,0.36)',lineHeight:1.62,fontWeight:300 }}>{v.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20 }}>
              Journey
            </div>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute',left:44,top:0,bottom:0,width:1,background:'rgba(255,255,255,0.06)' }} />
              {TIMELINE.map((t,i) => (
                <motion.div key={i}
                  initial={{ opacity:0,x:18 }} animate={isInView?{opacity:1,x:0}:{}}
                  transition={{ delay:0.44+i*0.06 }}
                  style={{ display:'flex',gap:16,marginBottom:18,alignItems:'flex-start' }}
                >
                  <span style={{ fontFamily:'DM Mono,monospace',fontSize:10.5,color:'rgba(255,255,255,0.22)',width:38,flexShrink:0,paddingTop:3 }}>{t.year}</span>
                  <div style={{ width:9,height:9,borderRadius:'50%',background:TYPE_COLORS[t.type],flexShrink:0,marginTop:4,boxShadow:`0 0 7px ${TYPE_COLORS[t.type]}55` }} />
                  <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:13.5,lineHeight:1.62,color:'rgba(255,255,255,0.48)',fontWeight:300 }}>{t.event}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.about-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
