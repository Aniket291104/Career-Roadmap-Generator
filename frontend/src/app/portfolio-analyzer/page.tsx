'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FolderGit2, 
  Star, 
  GitFork,
  BookOpen
} from 'lucide-react';
import { Github } from '@/components/icons';
import ReactMarkdown from 'react-markdown';

interface LanguageInfo {
  name: string;
  percentage: number;
}

interface RepoBrief {
  name: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  hasReadme: boolean;
}

interface PortfolioAnalysis {
  _id: string;
  githubUrl: string;
  reposCount: number;
  languages: LanguageInfo[];
  repositories: RepoBrief[];
  portfolioScore: number;
  readmeQuality: string;
  commitActivity: string;
  suggestions: string;
  createdAt: string;
}

export default function PortfolioAnalyzerPage() {
  const [githubUrl, setGithubUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<PortfolioAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeAnalysis, setActiveAnalysis] = useState<PortfolioAnalysis | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/portfolios/history');
      setHistory(res.data.history);
      if (res.data.history.length > 0 && !activeAnalysis) {
        setActiveAnalysis(res.data.history[0]);
      }
    } catch (err) {
      toast.error('Failed to load portfolio history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !githubUrl.includes('github.com')) {
      toast.warning('Please input a valid GitHub profile URL.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.post('/portfolios/analyze', { githubUrl });
      toast.success('GitHub portfolio analysis complete!');
      setGithubUrl('');
      fetchHistory();
      setActiveAnalysis(res.data.analysis);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to scan GitHub profile.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: URL SUBMIT & HISTORY */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* URL Search Card */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Github className="w-5 h-5 text-primary" />
              <span>GitHub Analyzer</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">GitHub Profile URL</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg text-xs shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing repos...</span>
                  </>
                ) : (
                  <span>Review Codebase</span>
                )}
              </button>
            </form>
          </div>

          {/* History log */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-accent" />
              <span>Previous Scans</span>
            </h3>

            {loadingHistory ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {history.map((hist) => (
                  <button
                    key={hist._id}
                    onClick={() => setActiveAnalysis(hist)}
                    className={`
                      w-full p-3 rounded-lg border text-left text-xs font-semibold transition-all flex justify-between items-center
                      ${activeAnalysis?._id === hist._id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border/40 hover:bg-muted/30'}
                    `}
                  >
                    <span className="truncate pr-4">{hist.githubUrl.replace('https://github.com/', '')}</span>
                    <span className="px-2 py-0.5 bg-muted rounded font-bold">{hist.portfolioScore}%</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-muted-foreground">No scans found.</p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED REPORT VIEW */}
        <div className="lg:col-span-2">
          {activeAnalysis ? (
            <div className="p-6 md:p-8 rounded-2xl glass-card space-y-8 animate-fade-in">
              
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-border/40">
                <div>
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Github className="w-5 h-5 text-primary" />
                    <span>{activeAnalysis.githubUrl.replace('https://github.com/', '')}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Analyzed repositories count: {activeAnalysis.reposCount}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center p-4 border border-border/80 rounded-xl bg-muted/10 w-24 h-24">
                    <span className="text-2xl font-extrabold text-primary">{activeAnalysis.portfolioScore}%</span>
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider mt-0.5">Rating Score</span>
                  </div>
                </div>
              </div>

              {/* Languages Distribution progress */}
              <div>
                <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-3">Language Distribution</h4>
                <div className="space-y-3 font-semibold text-xs text-foreground/80 max-w-md">
                  {activeAnalysis.languages.map((lang, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-1 font-bold">
                        <span>{lang.name}</span>
                        <span>{lang.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${lang.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repos checklist review */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider pb-2 border-b border-border/30">Repository Checks</h4>
                
                <div className="space-y-2">
                  {activeAnalysis.repositories.map((repo, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border border-border/40 bg-card/25 text-xs font-semibold">
                      <div>
                        <span className="font-bold text-sm block">{repo.name}</span>
                        <span className="text-[10px] text-muted-foreground">Primary Language: {repo.primaryLanguage || 'Unknown'}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <GitFork className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{repo.forks}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${repo.hasReadme ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {repo.hasReadme ? 'Has README' : 'No README'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <span>AI Portfolio Suggestions</span>
                </h4>
                
                <div className="prose dark:prose-invert max-w-none text-xs font-semibold leading-relaxed text-foreground/80 space-y-3 bg-muted/10 p-5 rounded-xl border border-border/40">
                  <ReactMarkdown>{activeAnalysis.suggestions}</ReactMarkdown>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center bg-card/10 py-16 space-y-3">
              <Github className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-bold text-lg">No Active Portfolio Report</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Submit your GitHub profile URL to perform a full codebase and repository structure review.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
