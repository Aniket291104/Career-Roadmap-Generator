'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Trophy, 
  Loader2, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  topic: string;
  correctAnswerIndex?: number;
  explanation?: string;
  userAnswerIndex?: number;
}

export default function AssessmentPage() {
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [results, setResults] = useState<{
    scorePercent: number;
    strongAreas: string[];
    weakAreas: string[];
    questions: Question[];
  } | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setQuizFinished(false);
    setResults(null);
    setCurrentIndex(0);
    setAnswers([]);
    
    try {
      const res = await api.post('/quizzes/generate');
      setQuizId(res.data.quizId);
      setQuestions(res.data.questions);
      toast.success('AI MCQ Quiz generated matching your career target!');
    } catch (err) {
      toast.error('Failed to generate assessment questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = optionIndex;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (answers.length < questions.length) {
      toast.warning('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/quizzes/submit', {
        quizId,
        answers,
      });
      setResults(res.data);
      setQuizFinished(true);
      toast.success(`Assessment graded: ${res.data.scorePercent}% Score!`);
    } catch (err) {
      toast.error('Grading submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* INTRO HERO OR LOADING STATE */}
        {!quizId && !quizFinished && (
          <div className="p-8 md:p-12 rounded-2xl glass-card text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-extrabold">Evaluate Your Technical Skills</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Our AI engine generates 5 technical multiple choice questions (MCQs) mapped directly to your current goals and skills profile.
            </p>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="px-6 py-3.5 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing MCQs...</span>
                </>
              ) : (
                <>
                  <span>Begin MCQ Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ACTIVE QUIZ WIZARD */}
        {quizId && !quizFinished && questions.length > 0 && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-foreground/80">{questions[currentIndex].topic}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="p-6 md:p-8 rounded-2xl glass-card space-y-6">
              <h3 className="text-lg md:text-xl font-bold leading-relaxed">
                {questions[currentIndex].questionText}
              </h3>

              <div className="space-y-3.5">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`
                        w-full p-4 text-left rounded-xl border text-sm font-semibold transition-all flex items-center justify-between
                        ${isSelected 
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                          : 'border-border hover:bg-muted/30 hover:border-border/80'}
                      `}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${isSelected ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                        {isSelected && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wizard actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-border bg-card/45 rounded-lg text-sm font-semibold disabled:opacity-30"
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={answers[currentIndex] === undefined}
                  className="px-5 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-lg hover:bg-secondary/85 disabled:opacity-35"
                >
                  Next Question
                </button>
              )}
            </div>

          </div>
        )}

        {/* RESULTS CARD */}
        {quizFinished && results && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-8 rounded-2xl glass-card text-center space-y-6 bg-gradient-to-b from-primary/5 to-transparent">
              <Award className="w-14 h-14 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold">Assessment Complete</h2>
              
              <div className="my-6 inline-flex flex-col items-center justify-center p-6 border border-border rounded-full w-36 h-36 bg-background">
                <span className="text-4xl font-extrabold text-primary">{results.scorePercent}%</span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mt-1">Accuracy</span>
              </div>

              {/* Strong vs Weak List */}
              <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto pt-4">
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 space-y-2">
                  <h4 className="text-sm font-bold text-green-500 flex items-center gap-1.5">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>Strong Areas (100% Correct)</span>
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-5">
                    {results.strongAreas.length > 0 ? (
                      results.strongAreas.map((topic, i) => <li key={i}>{topic}</li>)
                    ) : (
                      <li>No distinct topics marked master.</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                  <h4 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                    <XCircle className="w-4.5 h-4.5" />
                    <span>Focus Areas (Study Needed)</span>
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-5">
                    {results.weakAreas.length > 0 ? (
                      results.weakAreas.map((topic, i) => <li key={i}>{topic}</li>)
                    ) : (
                      <li>Perfect score! No weak subtopics.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={startQuiz} className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/95 transition-all">
                  Take New Assessment
                </button>
              </div>
            </div>

            {/* Questions detail lists */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Question Explanations</span>
              </h3>

              {results.questions.map((q, i) => {
                const correct = q.userAnswerIndex === q.correctAnswerIndex;
                return (
                  <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/25 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold leading-relaxed">{i + 1}. {q.questionText}</h4>
                      <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider ${correct ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="space-y-2 pl-4">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswerIndex === oIdx;
                        const isChosen = q.userAnswerIndex === oIdx;
                        
                        let textClass = 'text-muted-foreground';
                        if (isCorrect) textClass = 'text-green-500 font-semibold';
                        else if (isChosen && !isCorrect) textClass = 'text-red-500 font-semibold';

                        return (
                          <div key={oIdx} className={`text-xs flex items-center gap-2 ${textClass}`}>
                            <span>{isCorrect ? '●' : '○'}</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-3 bg-muted/20 border-l-2 border-primary text-[11px] text-muted-foreground font-semibold">
                        <span className="font-bold text-foreground">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
