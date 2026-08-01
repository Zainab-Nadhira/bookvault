import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const startVal = 0;
    let frame;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + eased * (value - startVal)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
};

const StatCard = ({ icon: Icon, label, value, suffix = '', accent = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`glass-card flex items-center gap-4 ${accent ? 'bg-primary/90 text-white' : ''}`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-white/20' : 'bg-accent/60 dark:bg-white/10 text-primary dark:text-accent'
      }`}
    >
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className={`text-2xl font-bold font-display ${accent ? 'text-white' : 'text-stone-800 dark:text-stone-100'}`}>
        <AnimatedNumber value={value} />
        {suffix}
      </p>
      <p className={`text-sm ${accent ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>{label}</p>
    </div>
  </motion.div>
);

export default StatCard;
