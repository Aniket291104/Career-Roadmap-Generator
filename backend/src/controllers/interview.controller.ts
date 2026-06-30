import { Response } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { User } from '../models/User';
import { AIService } from '../services/ai.service';
import { IAuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const startSessionSchema = z.object({
  type: z.string().min(2, 'Please state target interview type'),
  company: z.string().min(1, 'Please select a company'),
  difficulty: z.string().min(1, 'Please select difficulty level'),
  duration: z.number().min(10, 'Please select duration'),
  mode: z.enum(['practice', 'strict']),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  answerText: z.string().min(1, 'Answer content is required'),
  submittedCode: z.string().optional(),
  liveMetrics: z.object({
    eyeContact: z.number().optional(),
    speakingSpeed: z.number().optional(),
    fillerWords: z.number().optional(),
    stressLevel: z.number().optional(),
  }).optional(),
});

export class InterviewController {
  
  static async startSession(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const parsed = startSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }

      const { type, company, difficulty, duration, mode } = parsed.data;

      // Start initial AI interviewer query
      const welcomeMessageText = await AIService.handleMockInterview(
        [],
        type,
        company,
        difficulty,
        mode
      );

      const session = await InterviewSession.create({
        user: req.user.userId,
        type,
        company,
        difficulty,
        duration,
        mode,
        currentRound: 'coding', // coding starts first in general tech interview
        messages: [
          {
            role: 'interviewer',
            content: welcomeMessageText,
            timestamp: new Date(),
          },
        ],
        overallScore: 0,
        subScores: {
          coding: 0,
          communication: 0,
          confidence: 0,
          technical: 0,
          behavior: 0,
        },
        liveMetrics: {
          eyeContact: 90,
          speakingSpeed: 130,
          fillerWords: 0,
          stressLevel: 20,
        },
        isCompleted: false,
      });

      res.status(201).json({
        message: 'Mock interview session initialized',
        session,
      });
    } catch (error) {
      console.error('Start Interview Session Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async submitAnswer(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const parsed = submitAnswerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }

      const { sessionId, answerText, submittedCode, liveMetrics } = parsed.data;

      const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.userId });
      if (!session) {
        res.status(404).json({ message: 'Interview session not found' });
        return;
      }

      if (session.isCompleted) {
        res.status(400).json({ message: 'This interview session has already ended' });
        return;
      }

      // Update code if shared in coding round
      if (submittedCode) {
        session.submittedCode = submittedCode;
      }

      // Update live metrics if tracked
      if (liveMetrics) {
        session.liveMetrics = {
          eyeContact: liveMetrics.eyeContact !== undefined ? Math.floor((session.liveMetrics.eyeContact + liveMetrics.eyeContact) / 2) : session.liveMetrics.eyeContact,
          speakingSpeed: liveMetrics.speakingSpeed !== undefined ? Math.floor((session.liveMetrics.speakingSpeed + liveMetrics.speakingSpeed) / 2) : session.liveMetrics.speakingSpeed,
          fillerWords: liveMetrics.fillerWords !== undefined ? session.liveMetrics.fillerWords + liveMetrics.fillerWords : session.liveMetrics.fillerWords,
          stressLevel: liveMetrics.stressLevel !== undefined ? Math.floor((session.liveMetrics.stressLevel + liveMetrics.stressLevel) / 2) : session.liveMetrics.stressLevel,
        };
      }

      // Appending candidate answer
      session.messages.push({
        role: 'candidate',
        content: answerText,
        timestamp: new Date(),
      });

      // transition rounds periodically: if messages grow, switch round types to cover coding -> behavioral -> design
      const exchangeCount = session.messages.filter(m => m.role === 'candidate').length;
      if (exchangeCount >= 5) {
        session.currentRound = 'feedback';
      } else if (exchangeCount >= 3) {
        session.currentRound = 'behavioral';
      } else if (exchangeCount >= 1) {
        session.currentRound = 'design';
      }

      // Map document messages to prompt format
      const historyPrompt = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Generate next interviewer question
      const nextQuestion = await AIService.handleMockInterview(
        historyPrompt,
        session.type,
        session.company,
        session.difficulty,
        session.mode
      );

      // Appending interviewer question
      session.messages.push({
        role: 'interviewer',
        content: nextQuestion,
        timestamp: new Date(),
      });

      await session.save();

      res.status(200).json({
        message: 'Answer accepted',
        nextQuestion,
        session,
      });
    } catch (error) {
      console.error('Submit Interview Answer Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async evaluateSession(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { sessionId } = req.body;
      if (!sessionId) {
        res.status(400).json({ message: 'Session ID is required' });
        return;
      }

      const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.userId });
      if (!session) {
        res.status(404).json({ message: 'Interview session not found' });
        return;
      }

      if (session.messages.length < 3) {
        res.status(400).json({ message: 'Interview transcript is too short to evaluate. Please answer at least 1-2 questions.' });
        return;
      }

      // Format conversation for grading
      const historyPrompt = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Grade via AI
      const scoreData = await AIService.evaluateMockInterview(
        historyPrompt,
        session.type,
        session.company,
        session.difficulty
      );

      session.isCompleted = true;
      session.overallScore = scoreData.overallScore || 70;
      session.subScores = {
        coding: scoreData.subScores?.coding || 70,
        communication: scoreData.subScores?.communication || 70,
        confidence: scoreData.subScores?.confidence || 75,
        technical: scoreData.subScores?.technical || 70,
        behavior: scoreData.subScores?.behavior || 70,
      };
      session.feedback = scoreData.feedback || 'Good attempt. Maintain a structured response format.';

      await session.save();

      // Award XP
      const user = await User.findById(req.user.userId);
      if (user) {
        user.xpPoints += 150; // 150 XP reward for completing mock interview
        await user.save();
      }

      res.status(200).json({
        message: 'Evaluation completed successfully',
        session,
      });
    } catch (error) {
      console.error('Evaluate Interview Session Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getHistory(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const sessions = await InterviewSession.find({ user: req.user.userId }).sort({ createdAt: -1 });
      res.status(200).json({ sessions });
    } catch (error) {
      console.error('Get Interview History Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
