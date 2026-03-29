import { motion } from 'motion/react';

export function Loader() {
  return (
    <motion.div
      key="loader"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 28,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, letterSpacing: '0.25em', color: '#555', textTransform: 'uppercase' }}
      >
        Ayush Jha
      </motion.div>
      <div style={{ width: 180, height: 1, background: '#111', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 1 }}
        />
      </div>
    </motion.div>
  );
}
