'use client';

import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Compass, Award, CheckSquare, Sparkles, BookOpen, AlertCircle, Briefcase, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useCelebration } from '@/components/dashboard-upgrades/celebration-provider';

interface SkillNode {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'ai' | 'cloud' | 'devops' | 'database' | 'security' | 'data';
  level: number;
  progress: number;
  projects: string[];
  xpRequired: number;
  prerequisites: string[];
  locked: boolean;
  x: number;
  y: number;
}

export default function SkillTreePage() {
  const { triggerBadgeUnlocked, triggerLevelUp } = useCelebration();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Skill Tree nodes coordinates and details
  const [nodes, setNodes] = useState<SkillNode[]>([
    // Core Roots
    { id: 'fe-core', name: 'Frontend Core', category: 'frontend', level: 2, progress: 100, projects: ['Responsive Portfolio'], xpRequired: 0, prerequisites: [], locked: false, x: 100, y: 150 },
    { id: 'be-core', name: 'Backend Core', category: 'backend', level: 1, progress: 80, projects: ['REST API Server'], xpRequired: 200, prerequisites: [], locked: false, x: 100, y: 300 },
    { id: 'ai-core', name: 'AI Core', category: 'ai', level: 0, progress: 20, projects: ['Simple Model Classifier'], xpRequired: 400, prerequisites: ['be-core'], locked: false, x: 100, y: 450 },

    // Frontend Level 1
    { id: 'react', name: 'React Framework', category: 'frontend', level: 1, progress: 65, projects: ['Task Board Widget', 'Habit Tracker'], xpRequired: 300, prerequisites: ['fe-core'], locked: false, x: 300, y: 80 },
    { id: 'nextjs', name: 'Next.js 15 Apps', category: 'frontend', level: 0, progress: 0, projects: ['E-Commerce SaaS'], xpRequired: 600, prerequisites: ['react'], locked: true, x: 500, y: 80 },

    // Backend Level 1
    { id: 'nodejs', name: 'Node.js Systems', category: 'backend', level: 1, progress: 50, projects: ['Chat server socket.io'], xpRequired: 300, prerequisites: ['be-core'], locked: false, x: 300, y: 260 },
    { id: 'databases', name: 'MongoDB / Redis', category: 'backend', level: 0, progress: 0, projects: ['Redis caching layer'], xpRequired: 500, prerequisites: ['nodejs'], locked: true, x: 500, y: 260 },

    // AI Level 1
    { id: 'pytorch', name: 'PyTorch models', category: 'ai', level: 0, progress: 0, projects: ['Image CNN classifier'], xpRequired: 500, prerequisites: ['ai-core'], locked: true, x: 300, y: 420 },
    { id: 'llms', name: 'LLM Agents & Gemini', category: 'ai', level: 0, progress: 0, projects: ['AI RAG Chatbot'], xpRequired: 700, prerequisites: ['pytorch'], locked: true, x: 500, y: 420 },
    
    // Cloud/Devops
    { id: 'cloud-core', name: 'AWS & Deployment', category: 'cloud', level: 0, progress: 0, projects: ['Vercel/EC2 build pipeline'], xpRequired: 600, prerequisites: ['be-core'], locked: true, x: 300, y: 560 },
  ]);

  // Connections definition
  const connections = [
    { from: 'fe-core', to: 'react' },
    { from: 'react', to: 'nextjs' },
    { from: 'be-core', to: 'nodejs' },
    { from: 'nodejs', to: 'databases' },
    { from: 'ai-core', to: 'pytorch' },
    { from: 'pytorch', to: 'llms' },
    { from: 'be-core', to: 'cloud-core' },
    { from: 'be-core', to: 'ai-core' },
  ];

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (type: 'in' | 'out') => {
    setZoom((prev) => {
      const next = type === 'in' ? prev + 0.15 : prev - 0.15;
      return Math.max(0.5, Math.min(next, 2));
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 50, y: 50 });
  };

  const unlockNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    // Trigger side-effects outside of state updates
    toast.success(`Unlocked Skill: ${targetNode.name}! Gained level 1.`);
    triggerLevelUp(2);
    triggerBadgeUnlocked('Skill Specialist', `Unlocked technical node ${targetNode.name} skill node`);

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return { ...node, locked: false, progress: 10, level: 1 };
        }
        return node;
      })
    );
    // Update selected item detail pane
    setSelectedNode((prev) => prev ? { ...prev, locked: false, progress: 10, level: 1 } : null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Banner */}
        <div className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-transparent">
          <div>
            <h3 className="text-lg font-bold">Interactive Learning Skill Tree</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Explore paths, complete projects, and unlock new tech nodes in Frontend, Backend, and AI.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Canvas Board */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main SVG Skill Map Area */}
          <div 
            className="lg:col-span-2 relative overflow-hidden h-[500px] border border-border/50 rounded-3xl bg-grid-mesh bg-card/5 select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Inner Pan/Zoom Viewport */}
            <div 
              className="absolute inset-0 transition-transform duration-75 origin-top-left"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {/* SVG connection lines */}
              <svg className="absolute inset-0 pointer-events-none w-[1000px] h-[800px]">
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find((n) => n.id === conn.from);
                  const toNode = nodes.find((n) => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <line
                      key={idx}
                      x1={fromNode.x + 80}
                      y1={fromNode.y + 25}
                      x2={toNode.x + 80}
                      y2={toNode.y + 25}
                      stroke={toNode.locked ? 'rgba(255,255,255,0.08)' : 'url(#line-grad)'}
                      strokeWidth={toNode.locked ? 1.5 : 2.5}
                      strokeDasharray={toNode.locked ? '5,5' : '0'}
                    />
                  );
                })}
              </svg>

              {/* Node cards */}
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    className={`
                      absolute w-40 p-3 rounded-2xl border transition-all cursor-pointer text-center select-none shadow-md backdrop-blur-md
                      ${node.locked 
                        ? 'border-border/30 bg-card/25 text-muted-foreground/50' 
                        : isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-primary/10'
                          : 'border-border bg-card/65 text-foreground hover:border-primary/50'}
                    `}
                    style={{ left: node.x, top: node.y }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full ${node.locked ? 'bg-muted text-muted-foreground/60' : 'bg-primary/20 text-primary'}`}>
                        {node.category}
                      </span>
                      {node.locked && <span className="text-[10px]">🔒</span>}
                    </div>
                    <h4 className="text-xs font-bold truncate">{node.name}</h4>
                    
                    {!node.locked && (
                      <div className="mt-2.5 space-y-1">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${node.progress}%` }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground font-extrabold">Level {node.level}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Instruction badge */}
            <div className="absolute bottom-4 left-4 p-2 bg-black/60 border border-border/40 rounded-xl text-[9px] font-extrabold text-muted-foreground flex items-center gap-1.5 select-none pointer-events-none">
              <span>Drag to Pan • Pinch or use buttons to Zoom</span>
            </div>
          </div>

          {/* Node details sidebar panel */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between min-h-[400px]">
            {selectedNode ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">{selectedNode.category} Node</span>
                  <h3 className="text-xl font-bold mt-1">{selectedNode.name}</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {selectedNode.locked 
                      ? 'This skill node is currently locked. Complete prerequisites and gain enough experience to unlock.' 
                      : `Currently active at Level ${selectedNode.level}. Complete associated project modules to reach 100%.`}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Prerequisites */}
                  {selectedNode.prerequisites.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Prerequisites</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.prerequisites.map((p) => {
                          const pNode = nodes.find((n) => n.id === p);
                          return (
                            <span key={p} className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold border border-border/20">
                              {pNode?.name || p}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedNode.projects.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Target Projects</span>
                      <div className="space-y-1.5">
                        {selectedNode.projects.map((proj, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-border/30 bg-muted/5 text-[10px] font-semibold">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span>{proj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* XP lock details */}
                  {selectedNode.locked && (
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 text-[10px] font-bold text-primary">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Requires: {selectedNode.xpRequired} XP & all prerequisites completed.</span>
                    </div>
                  )}
                </div>

                <div>
                  {selectedNode.locked ? (
                    <button
                      onClick={() => unlockNode(selectedNode.id)}
                      className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock Skill Node</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center text-xs text-green-400 font-bold flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-green-500/10" />
                      <span>Node is active & unlocked!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground gap-3 py-16">
                <Compass className="w-10 h-10 text-muted-foreground/30 animate-spin-slow" />
                <span>Select any node on the Skill Map to view progress, prerequisites, and projects.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
