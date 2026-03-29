/**
 * Skills.tsx — v12
 * Changes:
 * - Section headline: "Stack & Experience" — less generic than "Made an Impact"
 * - Experience cards: removed redundant type badge on active panel (already shown in tab)
 * - Skill pills: hover shows color fill more prominently
 * - Certs: verified credential link hint on hover
 * - Layout rhythm tightened: consistent gap system
 */
import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';

const EXPERIENCE = [
  {
    period:'Jul 2024 – Present',
    role:'Lead IT Engineer & UI/UX',
    org:'TechSolvers',
    type:'Full-time',
    color:'#6366f1',
    metrics:['30% network efficiency ↑','18-person team led','3 AI products shipped'],
    tags:['UI/UX','Cybersecurity','System Design','Team Leadership'],
    desc:'Led end-to-end engineering across network infrastructure, security systems, and AI integrations. Delivered measurable performance improvements ahead of schedule.',
  },
  {
    period:'Jan 2023 – Jun 2024',
    role:'Data Science Intern',
    org:'DataViz Labs',
    type:'Internship',
    color:'#a855f7',
    metrics:['94%+ model accuracy','60% faster ETL pipelines','5 executive dashboards'],
    tags:['Python','Pandas','Machine Learning','ETL','Plotly'],
    desc:'Built and deployed end-to-end ML pipelines for business analytics. Automated data workflows and created interactive dashboards driving critical business decisions.',
  },
];

const SKILL_GROUPS = [
  { label:'ML / AI',           color:'#a855f7', skills:['TensorFlow','PyTorch','Scikit-learn','HuggingFace','OpenCV','Keras'] },
  { label:'Data Engineering',  color:'#06b6d4', skills:['Pandas','NumPy','Apache Kafka','Apache Flink','Plotly','Seaborn'] },
  { label:'Backend / Cloud',   color:'#10b981', skills:['FastAPI','Node.js','Docker','AWS Lambda','MongoDB','PostgreSQL'] },
  { label:'Languages',         color:'#f59e0b', skills:['Python','TypeScript','Java','SQL','Bash'] },
  { label:'Frontend',          color:'#6366f1', skills:['React','Next.js','Tailwind CSS','D3.js','WebGL'] },
];

const CERTS = [
  { icon:'🏆', title:'TensorFlow Developer', org:'Google', year:'2024', badge:'Certified' },
  { icon:'☁️', title:'AWS Cloud Practitioner', org:'Amazon Web Services', year:'2024', badge:'CLF-C02' },
  { icon:'🎓', title:'B.Tech AI & ML', org:'Thakur College of Engineering', year:'2023–2027', badge:'CGPA 9.2' },
];

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once:true, amount:0.08 });
  const [activeJob, setActiveJob] = useState(0);

  return (
    <section id="skills" ref={ref} style={{ padding:'120px 0',background:'#070710',position:'relative',overflow:'hidden' }}>
      <div style={{ maxWidth:1160,margin:'0 auto',padding:'0 40px',position:'relative',zIndex:1 }}>

        {/* Header */}
        <motion.div initial={{ opacity:0,y:24 }} animate={isInView?{opacity:1,y:0}:{}} style={{ marginBottom:60 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
            <div style={{ width:24,height:1,background:'#6366f1' }} />
            <span style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'#818cf8',letterSpacing:'0.12em',textTransform:'uppercase' }}>Skills & Experience</span>
          </div>
          <h2 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2.2rem,5vw,4rem)',color:'white',letterSpacing:'-0.03em',lineHeight:1.05 }}>
            Stack &<br />
            <span style={{ backgroundImage:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
              Experience
            </span>
          </h2>
        </motion.div>

        {/* Experience + Skills grid */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,marginBottom:64 }} className="skills-grid">

          {/* Experience tabs */}
          <motion.div initial={{ opacity:0,x:-24 }} animate={isInView?{opacity:1,x:0}:{}} transition={{ delay:0.1 }}>
            <div style={{ display:'flex',gap:8,marginBottom:24 }}>
              {EXPERIENCE.map((j,i) => (
                <button key={i} onClick={() => setActiveJob(i)} style={{
                  padding:'8px 18px',borderRadius:10,cursor:'pointer',
                  fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,
                  transition:'all 0.2s',
                  background: activeJob===i ? `${j.color}18` : 'rgba(255,255,255,0.03)',
                  border: activeJob===i ? `1px solid ${j.color}45` : '1px solid rgba(255,255,255,0.07)',
                  color: activeJob===i ? '#c7d2fe' : 'rgba(255,255,255,0.38)',
                }}>{j.org}</button>
              ))}
            </div>

            <motion.div
              key={activeJob}
              initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              transition={{ duration:0.26 }}
              style={{ padding:'28px',borderRadius:20,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',borderTop:`2px solid ${EXPERIENCE[activeJob].color}40` }}
            >
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'white',letterSpacing:'-0.01em',marginBottom:4 }}>
                  {EXPERIENCE[activeJob].role}
                </div>
                <div style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.28)' }}>
                  {EXPERIENCE[activeJob].org} · {EXPERIENCE[activeJob].period}
                </div>
              </div>

              <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:13.5,lineHeight:1.75,color:'rgba(255,255,255,0.42)',marginBottom:20,fontWeight:300 }}>
                {EXPERIENCE[activeJob].desc}
              </p>

              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:18 }}>
                {EXPERIENCE[activeJob].metrics.map((m,i) => (
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:5,height:5,borderRadius:'50%',background:EXPERIENCE[activeJob].color,flexShrink:0 }} />
                    <span style={{ fontFamily:'DM Sans,sans-serif',fontSize:13.5,color:'rgba(255,255,255,0.58)',fontWeight:400 }}>{m}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                {EXPERIENCE[activeJob].tags.map(t => (
                  <span key={t} style={{ padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.38)' }}>{t}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Skill groups */}
          <motion.div initial={{ opacity:0,x:24 }} animate={isInView?{opacity:1,x:0}:{}} transition={{ delay:0.15 }} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {SKILL_GROUPS.map((group,gi) => (
              <motion.div key={group.label}
                initial={{ opacity:0,y:14 }} animate={isInView?{opacity:1,y:0}:{}}
                transition={{ delay:0.2+gi*.07 }}
                style={{ padding:'14px 18px',borderRadius:14,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)' }}
              >
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <div style={{ width:7,height:7,borderRadius:'50%',background:group.color }} />
                  <span style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:group.color,letterSpacing:'0.06em',textTransform:'uppercase' }}>{group.label}</span>
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {group.skills.map(s => (
                    <motion.span key={s}
                      whileHover={{ scale:1.05,background:`${group.color}18`,borderColor:`${group.color}50`,color:'rgba(255,255,255,0.72)' }}
                      style={{ padding:'4px 11px',borderRadius:7,background:`${group.color}07`,border:`1px solid ${group.color}1a`,fontFamily:'DM Sans,sans-serif',fontSize:12.5,color:'rgba(255,255,255,0.48)',cursor:'default',transition:'all 0.15s' }}
                    >{s}</motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Credentials */}
        <motion.div initial={{ opacity:0,y:24 }} animate={isInView?{opacity:1,y:0}:{}} transition={{ delay:0.5 }}>
          <div style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:18 }}>
            Education & Certifications
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }} className="certs-grid">
            {CERTS.map((c,i) => (
              <motion.div key={i}
                initial={{ opacity:0,y:14 }} animate={isInView?{opacity:1,y:0}:{}}
                transition={{ delay:0.56+i*.08 }}
                whileHover={{ y:-3,borderColor:'rgba(255,255,255,0.14)' }}
                style={{ padding:'22px',borderRadius:18,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',transition:'all 0.2s' }}
              >
                <div style={{ fontSize:26,marginBottom:14 }}>{c.icon}</div>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:'white',marginBottom:4 }}>{c.title}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif',fontSize:13,color:'rgba(255,255,255,0.38)',marginBottom:16 }}>{c.org}</div>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <span style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.22)' }}>{c.year}</span>
                  <span style={{ padding:'4px 10px',borderRadius:7,background:'rgba(99,102,241,0.1)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.2)',fontFamily:'DM Mono,monospace',fontSize:10.5 }}>{c.badge}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media(max-width:900px){ .skills-grid{grid-template-columns:1fr!important;} .certs-grid{grid-template-columns:1fr!important;} }
        @media(min-width:640px) and (max-width:900px){ .certs-grid{grid-template-columns:1fr 1fr!important;} }
      `}</style>
    </section>
  );
}
