'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  UserCheck, 
  Video, 
  Mic, 
  MicOff,
  VideoOff, 
  Loader2, 
  Send, 
  Award, 
  CheckCircle,
  HelpCircle,
  FileCheck,
  Play
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
}

interface InterviewSession {
  _id: string;
  type: string;
  roleGoal: string;
  messages: Message[];
  overallScore: number;
  grammarRating: number;
  technicalRating: number;
  behavioralRating: number;
  feedback: string;
  isCompleted: boolean;
}

export default function MockInterviewPage() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [type, setType] = useState<'technical' | 'hr' | 'behavioral' | 'coding'>('technical');
  const [roleGoal, setRoleGoal] = useState('');
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [answerText, setAnswerText] = useState('');

  // Audio mic active indicators
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);

  // Web Speech recognition API setup for dictating answers
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const resultText = event.results[event.results.length - 1][0].transcript;
          setAnswerText((prev) => (prev ? prev + ' ' + resultText : resultText));
        };

        rec.onerror = () => {
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.warning('Web Speech recognition is not supported in this browser. Please type your responses.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info('Microphone transcription paused.');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Microphone active. Speak now...');
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleGoal) {
      toast.warning('Please specify your target job role.');
      return;
    }

    setStarting(true);
    try {
      const res = await api.post('/interviews/start', { type, roleGoal });
      setSession(res.data.session);
      toast.success(`Mock ${type} interview initialized!`);
    } catch (err) {
      toast.error('Failed to initialize interview.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !session) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setSubmitting(true);
    const textToSend = answerText;
    setAnswerText('');

    try {
      const res = await api.post('/interviews/submit', {
        sessionId: session._id,
        answerText: textToSend,
      });
      setSession(res.data.session);
    } catch (err) {
      toast.error('Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAndEvaluate = async () => {
    if (!session) return;
    if (session.messages.length < 3) {
      toast.warning('Transcript too short. Please answer a couple of questions.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setFinishing(true);
    try {
      const res = await api.post('/interviews/evaluate', {
        sessionId: session._id,
      });
      setSession(res.data.session);
      toast.success('Interview evaluation complete!');
    } catch (err) {
      toast.error('Evaluation grading failed.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* SETUP SCREEN */}
        {!session && (
          <div className="p-8 md:p-12 rounded-2xl glass-card text-center space-y-6 max-w-xl mx-auto">
            <UserCheck className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold">Mock Interview Simulator</h2>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mx-auto">
              Choose your focus area and state your target role. Our AI interviewer will conduct a technical loop.
            </p>

            <form onSubmit={handleStartSession} className="space-y-4 text-xs font-semibold text-left">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Interview Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-3 border border-border bg-background rounded-lg text-muted-foreground"
                >
                  <option value="technical">Technical Coding & Systems</option>
                  <option value="hr">HR & Introduction</option>
                  <option value="behavioral">Behavioral (STAR Method)</option>
                  <option value="coding">Practical Algo Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. React Developer or ML Engineer"
                  value={roleGoal}
                  onChange={(e) => setRoleGoal(e.target.value)}
                  className="w-full px-3 py-3 border border-border bg-background rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={starting}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-lg text-sm shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Spinning up simulation...</span>
                  </>
                ) : (
                  <span>Enter Interview Room</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ACTIVE SIMULATION INTERFACE */}
        {session && !session.isCompleted && (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            
            {/* AVATAR/VIDEO PREVIEW PANEL */}
            <div className="md:col-span-1 space-y-4">
              
              {/* Virtual Video Box */}
              <div className="rounded-xl border border-border bg-black relative aspect-video flex flex-col items-center justify-center overflow-hidden shadow-lg">
                {cameraActive ? (
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center relative">
                    {/* Glowing active indicator */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/30 text-[9px] font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>LIVE</span>
                    </div>

                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 font-bold text-sm text-primary">
                      YOU
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground/50 space-y-2">
                    <VideoOff className="w-10 h-10 mx-auto" />
                    <span className="text-[10px] font-bold">Camera Blocked</span>
                  </div>
                )}

                {/* Video action toggle overlay bar */}
                <div className="absolute bottom-3 inset-x-3 flex justify-center gap-3">
                  <button 
                    onClick={() => setMicActive(!micActive)}
                    className={`p-2 rounded-lg ${micActive ? 'bg-zinc-800 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`p-2 rounded-lg ${cameraActive ? 'bg-zinc-800 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sound visualizer animation */}
              <div className="p-4 rounded-xl border border-border bg-card/25 text-center text-[10px] font-bold text-muted-foreground space-y-3">
                <span>Microphone Sound Level</span>
                <div className="flex gap-1 justify-center h-8 items-end">
                  <div className={`w-1 rounded bg-primary transition-all duration-150 ${micActive ? 'h-3 animate-bounce' : 'h-1'}`} />
                  <div className={`w-1 rounded bg-primary transition-all duration-150 ${micActive ? 'h-6 animate-bounce [animation-delay:0.1s]' : 'h-1'}`} />
                  <div className={`w-1 rounded bg-primary transition-all duration-150 ${micActive ? 'h-4 animate-bounce [animation-delay:0.2s]' : 'h-1'}`} />
                  <div className={`w-1 rounded bg-primary transition-all duration-150 ${micActive ? 'h-8 animate-bounce [animation-delay:0.15s]' : 'h-1'}`} />
                  <div className={`w-1 rounded bg-primary transition-all duration-150 ${micActive ? 'h-2 animate-bounce [animation-delay:0.05s]' : 'h-1'}`} />
                </div>
              </div>

              {/* Finish Actions */}
              <button
                onClick={handleFinishAndEvaluate}
                disabled={finishing || session.messages.length < 3}
                className="w-full py-3 bg-red-500 text-white font-bold rounded-lg text-xs shadow hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30"
              >
                {finishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading transcript...</span>
                  </>
                ) : (
                  <span>End and Submit Review</span>
                )}
              </button>

            </div>

            {/* CONVERSATION TRANSCRIPT WINDOW */}
            <div className="md:col-span-2 space-y-4">
              
              {/* Dialogue history scroll frame */}
              <div className="rounded-xl border border-border bg-card/15 p-6 h-[400px] overflow-y-auto space-y-4 text-xs font-semibold">
                {session.messages.map((msg, index) => {
                  const interviewer = msg.role === 'interviewer';
                  return (
                    <div 
                      key={index}
                      className={`flex gap-3 max-w-[85%] ${interviewer ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold text-[10px] ${interviewer ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                        {interviewer ? 'AI' : 'ME'}
                      </div>
                      
                      <div className={`p-4.5 rounded-2xl leading-relaxed font-medium ${interviewer ? 'bg-muted/40 rounded-tl-none text-foreground/90' : 'bg-primary text-white rounded-tr-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Text / Voice input bar */}
              <form onSubmit={handleSubmitResponse} className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-3 border rounded-lg transition-colors flex items-center justify-center ${isRecording ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'border-border bg-card/30 hover:bg-muted/40 text-muted-foreground'}`}
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? 'Listening to speech...' : 'Type your answer or speak response...'}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                />
                <button
                  type="submit"
                  disabled={submitting || !answerText.trim()}
                  className="p-3 bg-primary text-white rounded-lg shadow hover:bg-primary/95 transition-all flex items-center justify-center disabled:opacity-40"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* COMPLETED SCORECARD RESULTS REPORT */}
        {session && session.isCompleted && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="p-8 rounded-2xl glass-card text-center space-y-6 bg-gradient-to-b from-primary/5 to-transparent">
              <Award className="w-14 h-14 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold">Interview Review Card</h2>
              <p className="text-muted-foreground text-xs font-semibold">Evaluation details for standard {session.type} role prep: {session.roleGoal}</p>

              {/* Overall radial score */}
              <div className="my-6 inline-flex flex-col items-center justify-center p-6 border border-border rounded-full w-36 h-36 bg-background">
                <span className="text-4xl font-extrabold text-primary">{session.overallScore}%</span>
                <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider mt-1">Score</span>
              </div>

              {/* Multi metrics widgets */}
              <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-4 text-xs font-semibold">
                
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Technical Accuracy</span>
                  <h4 className="text-lg font-bold text-foreground">{session.technicalRating}%</h4>
                  <div className="w-full bg-muted rounded-full h-1 mt-2">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${session.technicalRating}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Communication Skills</span>
                  <h4 className="text-lg font-bold text-foreground">{session.grammarRating}%</h4>
                  <div className="w-full bg-muted rounded-full h-1 mt-2">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${session.grammarRating}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Behavioral STAR</span>
                  <h4 className="text-lg font-bold text-foreground">{session.behavioralRating}%</h4>
                  <div className="w-full bg-muted rounded-full h-1 mt-2">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${session.behavioralRating}%` }} />
                  </div>
                </div>

              </div>

              {/* Suggestions content */}
              {session.feedback && (
                <div className="text-left space-y-4 max-w-2xl mx-auto pt-6 border-t border-border/40">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4.5 h-4.5 text-primary" />
                    <span>AI Interview Feedback Report</span>
                  </h4>
                  <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-foreground/80 space-y-3 bg-muted/10 p-5 rounded-xl border border-border/40 font-semibold">
                    <ReactMarkdown>{session.feedback}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4 justify-center">
                <button 
                  onClick={() => setSession(null)} 
                  className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/95 transition-all"
                >
                  Start New Session
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
