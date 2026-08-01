import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-bgLight dark:bg-bgDark gap-4">
    <motion.div
      animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow"
    >
      <BookOpen className="text-white" size={28} />
    </motion.div>
    <p className="text-stone-500 dark:text-stone-400 font-display tracking-wide">Opening your vault…</p>
  </div>
);

export default LoadingScreen;
