'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  FileText, 
  UploadCloud, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResumeAnalysis {
  _id: string;
  fileName: string;
  atsScore: number;
  missingSkills: string[];
  missingKeywords: string[];
  suggestions: string;
  createdAt: string;
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/resumes/history');
      setHistory(res.data.history);
      if (res.data.history.length > 0 && !activeAnalysis) {
        setActiveAnalysis(res.data.history[0]);
      }
    } catch (err) {
      toast.error('Failed to load analysis history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file to scan.');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('ATS Resume evaluation completed!');
      setFile(null);
      fetchHistory();
      setActiveAnalysis(res.data.analysis);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Resume scan failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: UPLOAD PANEL & SCAN HISTORY */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Uploader Card */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              <span>ATS scanner</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center hover:border-primary/45 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-xs font-semibold text-foreground/80">
                  {file ? file.name : 'Click to upload PDF or TXT'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Maximum file size: 5MB</p>
              </div>

              <button
                type="submit"
                disabled={analyzing || !file}
                className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg text-xs shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing content...</span>
                  </>
                ) : (
                  <span>Submit for Scan</span>
                )}
              </button>
            </form>
          </div>

          {/* History Lists */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent" />
              <span>Previous Reviews</span>
            </h3>

            {loadingHistory ? (
              <div className="py-8 flex justify-center">
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
                    <span className="truncate pr-4">{hist.fileName}</span>
                    <span className="px-2 py-0.5 bg-muted rounded font-bold">{hist.atsScore}%</span>
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
                  <h3 className="text-lg md:text-xl font-bold">{activeAnalysis.fileName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Scanned on: {new Date(activeAnalysis.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center p-4 border border-border/80 rounded-xl bg-muted/10 w-24 h-24">
                    <span className="text-2xl font-extrabold text-primary">{activeAnalysis.atsScore}%</span>
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider mt-0.5">ATS Score</span>
                  </div>
                </div>
              </div>

              {/* Lists checklist for missing components */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-2 text-xs font-semibold">
                  <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span>Missing Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeAnalysis.missingSkills.length > 0 ? (
                      activeAnalysis.missingSkills.map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[10px]">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">All required skills detected!</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-2 text-xs font-semibold">
                  <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span>Missing Keywords</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeAnalysis.missingKeywords.length > 0 ? (
                      activeAnalysis.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[10px]">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">All required keywords detected!</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Suggestions report in Markdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>AI Structural Suggestions</span>
                </h4>
                
                <div className="prose dark:prose-invert max-w-none text-xs font-semibold leading-relaxed text-foreground/80 space-y-3 bg-muted/10 p-5 rounded-xl border border-border/40">
                  <ReactMarkdown>{activeAnalysis.suggestions}</ReactMarkdown>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center bg-card/10 py-16 space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-bold text-lg">No Active Scanning Report</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Upload your resume in PDF/TXT format to get a complete ATS score review.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
