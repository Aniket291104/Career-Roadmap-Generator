'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/logo';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTheme as useNextTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Map, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  Layout, 
  Flame, 
  LineChart, 
  ArrowRight, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Mail, 
  BookOpen, 
  Terminal, 
  ChevronDown,
  Loader2 
} from 'lucide-react';

export default function LandingPage() {
  const { theme, setTheme } = useNextTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribingNewsletter, setSubscribingNewsletter] = useState(false);

  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submittingContact, setSubmittingContact] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribingNewsletter(true);
    try {
      const res = await api.post('/newsletter/subscribe', { email: newsletterEmail });
      toast.success(res.data.message);
      setNewsletterEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to subscribe to newsletter.');
    } finally {
      setSubscribingNewsletter(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warning('Please fill in all fields.');
      return;
    }
    setSubmittingContact(true);
    try {
      const res = await api.post('/contact/message', contactForm);
      toast.success(res.data.message);
      setContactForm({ name: '', email: '', message: '' });
      setContactModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const categories = [
    { title: 'AI & Machine Learning', icon: Cpu, desc: 'Generative AI, Deep Learning architectures, model optimization, PyTorch, HuggingFace.' },
    { title: 'Full Stack Development', icon: Layout, desc: 'Next.js, React 19, TypeScript, Express, Mongoose, PostgreSQL, state machines.' },
    { title: 'Cloud & DevOps Engineering', icon: CloudIcon, desc: 'AWS scaling, Docker containers, Kubernetes, GitHub Actions, Terraform configurations.' },
    { title: 'Cyber Security', icon: ShieldCheck, desc: 'Penetration testing, encryption systems, network forensics, API token security.' },
    { title: 'Blockchain & Web3', icon: Terminal, desc: 'Solidity contracts, decentralized apps, Ethereum, Ethers.js, consensus algorithms.' },
    { title: 'UI/UX & Product Design', icon: Compass, desc: 'Apple design system guidelines, glassmorphic interfaces, Figma flows, interactions.' },
  ];

  const features = [
    { title: 'AI Roadmap Generator', desc: 'Generate multi-month structures with weekly milestones, daily subtasks, coding practices, and curated YouTube/documentation materials.', icon: Map },
    { title: 'Interactive Assessments', desc: 'Evaluate your technical skills using dynamic programming MCQs and logical quizzes to isolate weaker areas.', icon: Sparkles },
    { title: 'ATS Resume Review', desc: 'Scan and review resume keywords against specific job targets, returning ATS scores and format improvements.', icon: UserCheck },
    { title: 'Mock Technical Interviews', desc: 'Simulate technical or behavioral interview loops with structured question trees and performance ratings.', icon: UserCheck },
  ];

  const faqList = [
    { q: 'How does the AI Roadmap Generator create recommendations?', a: 'Our system analyzes your starting tech stack, career targets, learning style, and daily hours. It uses the Gemini 2.5 engine to synthesize a logical, step-by-step learning progression, complete with curated references and coding assignments.' },
    { q: 'Can I track my progress and maintain streaks?', a: 'Yes! Every time you mark a daily roadmap task completed, you gain 15 XP points, update your activity calendar heatmap, and increment your active learning streak count.' },
    { q: 'Is there a limit to how many roadmaps I can generate?', a: 'Free accounts can generate up to 2 active roadmaps. Premium subscribers get unlimited roadmap generations, custom resume analyses, and access to all mock interview sessions.' },
    { q: 'Can I export my data or get a certificate?', a: 'Upon completing 100% of a generated roadmap, you unlock a verification certificate featuring a unique credential ID suitable for LinkedIn and CV sharing.' }
  ];

  return (
    <div className="min-h-screen font-sans bg-background text-foreground transition-colors duration-300 relative bg-grid-mesh">
      
      {/* Aurora light backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/75">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#categories" className="hover:text-primary transition-colors">Paths</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQs</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-muted/80 text-foreground/80 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/95 rounded-lg shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-foreground/80">
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-full hover:bg-muted text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 p-6 glass-panel border-b border-border/80 md:hidden flex flex-col gap-4 text-center font-medium"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-foreground/85">Features</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="py-2 text-foreground/85">Paths</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 text-foreground/85">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 text-foreground/85">FAQs</a>
            <hr className="border-border/50" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-foreground/85">Sign In</Link>
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-3 bg-primary text-white rounded-lg font-semibold"
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Next Generation AI Roadmap Tool v2.0</span>
          </div>

          <h1 className="max-w-4xl font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight md:leading-none tracking-tight">
            Navigate Your Tech Career <br />
            With <span className="bg-gradient-to-r from-primary via-accent to-indigo-400 bg-clip-text text-transparent">AI Intelligence</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Generate custom learning roadmaps, weekly milestones, daily coding tasks, ATS resume diagnostics, and technical mock interviews tailored to your experience.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <Link 
              href="/register" 
              className="flex-1 px-6 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Build Your Free Roadmap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="flex-1 px-6 py-3.5 text-base font-semibold border border-border/80 hover:bg-muted/40 rounded-xl transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* HERO FLOAT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 md:mt-24 max-w-5xl mx-auto rounded-2xl overflow-hidden glass-card p-2 p-md-4 shadow-2xl relative"
        >
          {/* Windows title bar mockup */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground/60 font-mono">dashboard_preview.exe</span>
            <div className="w-10" />
          </div>

          <div className="bg-background/90 p-4 md:p-8 grid md:grid-cols-3 gap-6 text-left">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <span>AI Engineering Study Roadmap</span>
                <span className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">In Progress</span>
              </h3>
              
              <div className="p-4 rounded-xl border border-border/50 bg-card/45 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Month 1: Neural Networks foundations</span>
                  <span>45% Complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/10">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="text-sm font-semibold">Active Streak</h4>
                    <p className="text-xs text-muted-foreground">You completed your daily programming task! Streak: 12 days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground border-b border-border/50 pb-2">Skills Evaluation</h4>
              
              <div className="space-y-3 font-medium text-sm">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Python Basics</span>
                    <span className="text-green-500">90%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Linear Algebra</span>
                    <span className="text-yellow-500">55%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Deep Learning</span>
                    <span className="text-purple-500">30%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 border-t border-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Supercharge Learning with AI
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Everything you need to successfully switch careers or master new technical capabilities in one dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl glass-card flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* PATHS SECTION */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-6 border-t border-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Explore Curated Careers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Generate structures and roadmaps across the most demanded fields in industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl border border-border/30 bg-card/20 hover:bg-card/45 hover:border-border/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-accent mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-6 border-t border-border/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Transparent Pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose the plan that matches your current speed of growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Standard</span>
              <h3 className="text-3xl font-extrabold mt-2">Free Plan</h3>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                Perfect for hobbyists and students looking to structure simple learning goals.
              </p>
              <div className="my-8 text-4xl font-extrabold">
                $0 <span className="text-sm font-medium text-muted-foreground">/ forever</span>
              </div>
              <ul className="space-y-3.5 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-green-500" />
                  <span>2 Active Roadmaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-green-500" />
                  <span>Standard AI assessments</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/50">
                  <X className="w-4 h-4" />
                  <span>ATS Resume evaluations</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/50">
                  <X className="w-4 h-4" />
                  <span>Mock technical interviews</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="mt-8 py-3 text-center text-sm font-semibold border border-border/80 hover:bg-muted/40 rounded-xl transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between border-primary/50 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
            {/* Pop highlight */}
            <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] uppercase tracking-wider font-extrabold rounded-bl-lg">
              Popular
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-bold">Accelerate</span>
              <h3 className="text-3xl font-extrabold mt-2">Premium Pro</h3>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                Designed for professionals looking to prepare for FAANG-level job interviews.
              </p>
              <div className="my-8 text-4xl font-extrabold">
                $19 <span className="text-sm font-medium text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-3.5 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Unlimited Roadmaps & AI updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Detailed programming MCQ assess</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Unlimited ATS resume reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Live mock coding & HR interviews</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/register?plan=premium" 
              className="mt-8 py-3 text-center text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-md shadow-primary/25 transition-all"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6 border-t border-border/20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqList.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-border/30 rounded-xl overflow-hidden bg-card/10"
            >
              <button
                onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                className="w-full flex justify-between items-center px-6 py-4.5 text-left font-semibold text-foreground/90 hover:bg-muted/20 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeFAQ === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFAQ === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-20 max-w-3xl mx-auto px-6 border-t border-border/20 text-center">
        <div className="p-8 md:p-12 rounded-2xl glass-panel relative">
          <Mail className="w-10 h-10 text-primary mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">
            Stay in the loop
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            Subscribe to our newsletter to receive the latest updates, templates, and tutorial listings.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-grow px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            />
            <button 
              type="submit" 
              disabled={subscribingNewsletter}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg text-sm shadow hover:bg-primary/95 transition-all disabled:opacity-50"
            >
              {subscribingNewsletter ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-12 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <BrandLogo />
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Roadmap.AI Inc. Built with Next.js 15, Tailwind v4 and Framer Motion.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit">Privacy</button>
            <button onClick={() => setTermsModalOpen(true)} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit">Terms</button>
            <button onClick={() => setContactModalOpen(true)} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit">Contact</button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AnimatePresence>
        {/* Privacy Modal */}
        {privacyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-card max-w-xl w-full p-6 md:p-8 space-y-4 max-h-[80vh] overflow-y-auto relative border border-border/40 shadow-2xl"
            >
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Privacy Policy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Last updated: June 2026
              </p>
              <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                <p>
                  At <strong>Roadmap.AI</strong>, we are committed to safeguarding your private data. This document outlines how we collect, store, and process your profile credentials.
                </p>
                <h4 className="font-semibold text-foreground">1. Data Collection</h4>
                <p>
                  We store credentials such as your email address, career goals, technical skills, resume texts, and activity heatmap logs to generate customized timelines.
                </p>
                <h4 className="font-semibold text-foreground">2. Security & Encryption</h4>
                <p>
                  All active passwords are hashed using bcrypt. Access tokens are transmitted over TLS/SSL and stored securely inside httpOnly client cookies to prevent cross-site scripting (XSS) leaks.
                </p>
                <h4 className="font-semibold text-foreground">3. Analytics & Stripe Integration</h4>
                <p>
                  Subscription transactions are handled end-to-end by Stripe. We do not store or process raw credit card credentials on our servers.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Terms Modal */}
        {termsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-card max-w-xl w-full p-6 md:p-8 space-y-4 max-h-[80vh] overflow-y-auto relative border border-border/40 shadow-2xl"
            >
              <button
                onClick={() => setTermsModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Terms of Service</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Last updated: June 2026
              </p>
              <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                <p>
                  By accessing <strong>Roadmap.AI</strong>, you agree to comply with our acceptable terms.
                </p>
                <h4 className="font-semibold text-foreground">1. Account Provisioning</h4>
                <p>
                  You must provide valid credentials during registration. Sharing account tokens or subverting subscription gates is strictly prohibited.
                </p>
                <h4 className="font-semibold text-foreground">2. Acceptable Platform Use</h4>
                <p>
                  Our timeline resources, assessment builders, and interview agents are designed for personal professional coaching. Systematic scraping or copying is a violation of our terms.
                </p>
                <h4 className="font-semibold text-foreground">3. Service Modifications</h4>
                <p>
                  We reserve the rights to refine, rate-limit, or adjust the limits of free roadmap generations as needed to optimize GPU/LLM request capacities.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Contact Modal */}
        {contactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-card max-w-md w-full p-6 md:p-8 space-y-5 relative border border-border/40 shadow-2xl"
            >
              <button
                onClick={() => setContactModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Contact Support</h3>
                <p className="text-sm text-muted-foreground">
                  Send us a message and our support team will reply via email.
                </p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe how we can help you..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg text-sm shadow hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingContact && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple fallback CloudIcon since Lucide renamed it or in case it misses in local builds
function CloudIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.74-3.5-3.5-4.5A4.95 4.95 0 0 0 6 11.5c-2.24.41-4 2.39-4 4.5A3.5 3.5 0 0 0 5.5 19H17.5z" />
    </svg>
  );
}
