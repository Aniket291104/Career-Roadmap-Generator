'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl border border-border bg-card/40 shrink-0" />
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-border bg-card/40 hover:bg-muted/40 transition-colors relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shrink-0"
      aria-label="Toggle Theme"
      id="theme-switcher-btn"
    >
      <motion.div
        initial={false}
        animate={{ rotate: currentTheme === 'dark' ? 0 : 180, scale: currentTheme === 'dark' ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-amber-500"
      >
        <Sun className="w-5 h-5 fill-amber-500/20" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ rotate: currentTheme === 'dark' ? -180 : 0, scale: currentTheme === 'dark' ? 0 : 1.1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="absolute inset-0 m-auto flex items-center justify-center text-primary"
      >
        <Moon className="w-5 h-5 fill-primary/20" />
      </motion.div>
    </button>
  );
}
