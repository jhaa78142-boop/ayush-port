import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Work } from './components/Work';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Contact } from './components/Contact';
import { CinematicIntro } from './components/CinematicIntro';
import { AskAyush } from './components/AskAyush';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <CinematicIntro key="intro" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {!loading && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16,1,0.3,1], delay: 0.06 }}
          >
            <Navigation />
            <main>
              <Hero />
              <Work />
              <About />
              <Skills />
              <Contact />
            </main>
          </motion.div>

          <AskAyush />
        </>
      )}
    </>
  );
}
