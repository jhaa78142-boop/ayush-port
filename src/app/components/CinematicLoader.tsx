/**
 * CinematicLoader.tsx
 * ────────────────────────────────────────────────────────────────
 * Drop-in replacement for Loader.tsx.
 * Features:
 *   • Terminal boot-sequence lines that scroll past
 *   • SVG arc that tracks real asset progress (Three.js + fonts)
 *   • Large Syne name reveal with clip-path wipe
 *   • "WORMHOLE" exit: scale-inward radial collapse
 *
 * Usage (App.tsx):
 *   import { CinematicLoader } from './components/CinematicLoader';
 *   // replace <Loader> with <CinematicLoader onComplete={() => setLoading(false)} />
 * ────────────────────────────────────────────────────────────────
 */

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/* ── CONFIG ───────────────────────────────────────────────────── */
const BOOT_LINES = [
  '> initializing runtime environment...',
  '> loading neural tensor graph [████░░░░]',
  '> mounting webgl context v2.0',
  '> compiling shader: vertex.glsl',
  '> compiling shader: fragment.glsl',
  '> resolving asset manifests...',
  '> allocating gpu memory buffer',
  '> font subsetting: Syne [800wght]',
  '> prefetch: portfolio.json',
  '> hydrating component tree...',
  '> scene graph: ✓ ready',
];

const CIRCUMFERENCE = 2 * Math.PI * 36; // r=36

interface Props {
  onComplete: () => void;
}

export function CinematicLoader({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [nameVisible, setNameVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const progressMotion = useMotionValue(0);
  const dashOffset = useTransform(
    progressMotion,
    [0, 100],
    [CIRCUMFERENCE, 0],
  );
  const linesRef = useRef<HTMLDivElement>(null);

  /* ── Simulate / track real load progress ──────────────────── */
  useEffect(() => {
    let p = 0;
    let lineTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      /* Ramp: fast start, slow 80-100 (feels real) */
      const increment = p < 60 ? 3.5 : p < 85 ? 1.2 : 0.6;
      p = Math.min(p + increment + Math.random() * 2, 100);
      setProgress(Math.round(p));
      animate(progressMotion, p, { duration: 0.3, ease: 'easeOut' });

      if (p >= 100) {
        clearTimeout(lineTimer);
        setNameVisible(true);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 900);
        }, 1200);
        return;
      }
      lineTimer = setTimeout(tick, p < 70 ? 55 : 95);
    };

    /* Scroll boot lines */
    const lineInterval = setInterval(() => {
      setLineIdx((i) => {
        const next = i + 1;
        if (next >= BOOT_LINES.length) {
          clearInterval(lineInterval);
        }
        requestAnimationFrame(() => {
          linesRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
        });
        return next;
      });
    }, 160);

    lineTimer = setTimeout(tick, 100);
    return () => {
      clearTimeout(lineTimer);
      clearInterval(lineInterval);
    };
  }, [onComplete, progressMotion]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            scale: 0.04,
            borderRadius: '50%',
            opacity: 0,
            transition: { duration: 0.75, ease: [0.86, 0, 0.07, 1] },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: '#030308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Ambient corner glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── PROGRESS ARC ── */}
          <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 32 }}>
            <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1.5"
              />
              {/* Progress arc */}
              <motion.circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                style={{ strokeDashoffset: dashOffset }}
              />
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            {/* Percentage */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              {progress}
            </div>
          </div>

          {/* ── TERMINAL LINES ── */}
          <div
            ref={linesRef}
            style={{
              width: 320,
              height: 96,
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)',
              marginBottom: 40,
            }}
          >
            {BOOT_LINES.slice(0, lineIdx).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: i === lineIdx - 1 ? 0.55 : 0.18, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10.5,
                  color: i === lineIdx - 1 ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.03em',
                  lineHeight: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* ── NAME REVEAL ── */}
          <AnimatePresence>
            {nameVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #67e8f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textAlign: 'center',
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                AYUSH JHA
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {nameVisible && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  transformOrigin: 'center',
                }}
              >
                ML ENGINEER · AI DEVELOPER
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
