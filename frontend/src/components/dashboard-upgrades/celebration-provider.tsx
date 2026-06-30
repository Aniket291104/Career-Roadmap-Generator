'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';

interface CelebrationContextType {
  triggerConfetti: () => void;
  triggerFireworks: () => void;
  triggerCoins: () => void;
  triggerTaskCompleted: () => void;
  triggerLevelUp: (level: number) => void;
  triggerBadgeUnlocked: (badgeName: string, description: string) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const useCelebration = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
};

// Canvas Particle Classes
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  shape: 'circle' | 'square' | 'triangle' | 'coin';

  constructor(x: number, y: number, type: 'confetti' | 'firework' | 'coin') {
    this.x = x;
    this.y = y;
    this.size = Math.random() * (type === 'coin' ? 8 : 6) + 4;
    this.alpha = 1;
    this.gravity = type === 'coin' ? 0.35 : type === 'confetti' ? 0.15 : 0.08;

    if (type === 'confetti') {
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = Math.random() * -10 - 4;
      this.decay = Math.random() * 0.015 + 0.005;
      const colors = ['#8b5cf6', '#a78bfa', '#ec4899', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    } else if (type === 'firework') {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.decay = Math.random() * 0.02 + 0.015;
      const colors = ['#a78bfa', '#f472b6', '#38bdf8', '#34d399', '#fbbf24', '#f87171'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = 'circle';
    } else {
      // Coin
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = Math.random() * -12 - 8;
      this.decay = Math.random() * 0.01 + 0.005;
      this.color = '#fbbf24'; // Golden
      this.shape = 'coin';
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else if (this.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y + this.size);
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'coin') {
      // Draw a gold coin with inner circle detail
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export const CelebrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  // UI Dialog States
  const [levelUpData, setLevelUpData] = useState<number | null>(null);
  const [badgeData, setBadgeData] = useState<{ name: string; desc: string } | null>(null);
  const [taskData, setTaskData] = useState<boolean>(false);

  // Sound Synthesizer via Web Audio API
  const playSound = (type: 'success' | 'levelup' | 'coin') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'success') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(523.25, ctx.currentTime, 0.12); // C5
        playTone(659.25, ctx.currentTime + 0.08, 0.12); // E5
        playTone(783.99, ctx.currentTime + 0.16, 0.18); // G5
        playTone(1046.50, ctx.currentTime + 0.24, 0.3); // C6
      } else if (type === 'levelup') {
        const playSweep = (startFreq: number, endFreq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(startFreq, start);
          osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.start(start);
          osc.stop(start + duration);
        };
        playSweep(260, 520, ctx.currentTime, 0.2);
        playSweep(520, 1040, ctx.currentTime + 0.15, 0.35);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Audio Context failed to trigger sound:', e);
    }
  };

  // Particles Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const triggerConfetti = () => {
    playSound('success');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const particles = particlesRef.current;
    // Left side launcher
    for (let i = 0; i < 70; i++) {
      particles.push(new Particle(0, height - 50, 'confetti'));
    }
    // Right side launcher
    for (let i = 0; i < 70; i++) {
      const p = new Particle(width, height - 50, 'confetti');
      p.vx *= -1; // Launch leftward
      particles.push(p);
    }
  };

  const triggerFireworks = () => {
    playSound('levelup');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const particles = particlesRef.current;
    // Explode from multiple points
    const spawnExplosion = (x: number, y: number) => {
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, 'firework'));
      }
    };
    spawnExplosion(width * 0.25, height * 0.4);
    setTimeout(() => spawnExplosion(width * 0.75, height * 0.3), 200);
    setTimeout(() => spawnExplosion(width * 0.5, height * 0.25), 450);
  };

  const triggerCoins = () => {
    playSound('coin');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const particles = particlesRef.current;
    // Coins burst from center-bottom upward
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(width / 2, height - 10, 'coin'));
    }
  };

  const triggerTaskCompleted = () => {
    triggerCoins();
    setTaskData(true);
    setTimeout(() => setTaskData(false), 2500);
  };

  const triggerLevelUp = (level: number) => {
    triggerFireworks();
    setLevelUpData(level);
  };

  const triggerBadgeUnlocked = (badgeName: string, description: string) => {
    triggerConfetti();
    setBadgeData({ name: badgeName, desc: description });
  };

  return (
    <CelebrationContext.Provider
      value={{
        triggerConfetti,
        triggerFireworks,
        triggerCoins,
        triggerTaskCompleted,
        triggerLevelUp,
        triggerBadgeUnlocked,
      }}
    >
      {children}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />

      {/* Level Up Dialog Overlay */}
      <AnimatePresence>
        {levelUpData !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-full max-w-sm p-8 rounded-3xl glass-panel text-center relative overflow-hidden shadow-2xl border border-primary/45"
            >
              {/* Glowing Background Radial */}
              <div className="absolute inset-0 bg-radial-gradient from-primary/20 via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent mx-auto flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Trophy className="w-12 h-12 text-white animate-bounce" />
                </motion.div>

                <div className="space-y-2">
                  <span className="text-xs text-primary font-bold uppercase tracking-widest block">Level Up!</span>
                  <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-white">
                    LEVEL {levelUpData}
                  </h2>
                  <p className="text-sm text-muted-foreground px-4">
                    Congratulations! You reached a new milestone in your career learning roadmap.
                  </p>
                </div>

                {/* Animated XP Ring Details */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="url(#primary-gradient-levelup)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                    />
                    <defs>
                      <linearGradient id="primary-gradient-levelup" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <Award className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-pulse" />
                    <span className="text-xs font-bold block text-muted-foreground">+500 XP</span>
                  </div>
                </div>

                <button
                  onClick={() => setLevelUpData(null)}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Claim Rewards
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Unlocked Popup Overlay */}
      <AnimatePresence>
        {badgeData !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-sm p-6 rounded-2xl glass-panel text-center relative overflow-hidden border border-yellow-500/35"
            >
              <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-20 h-20 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 mx-auto flex items-center justify-center font-bold text-4xl shadow-inner shadow-yellow-500/10"
                >
                  ✨
                </motion.div>

                <div className="space-y-1">
                  <span className="text-xs text-yellow-500 font-extrabold uppercase tracking-widest block">BADGE UNLOCKED</span>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">{badgeData.name}</h3>
                  <p className="text-xs text-muted-foreground px-2 mt-1">{badgeData.desc}</p>
                </div>

                <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Premium Achievement Earned</span>
                </div>

                <button
                  onClick={() => setBadgeData(null)}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold rounded-xl shadow-lg shadow-yellow-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Completed Quick Toast */}
      <AnimatePresence>
        {taskData && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999]">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 px-6 py-3.5 rounded-full glass-panel border border-primary/30 shadow-lg shadow-primary/10 max-w-sm whitespace-nowrap"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">Task Completed! +15 XP Gained</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
};
