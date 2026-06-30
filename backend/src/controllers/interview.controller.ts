import { Response } from 'express';
import { InterviewSession } from '../models/InterviewSession';
import { User } from '../models/User';
import { AIService } from '../services/ai.service';
import { IAuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const startSessionSchema = z.object({
  type: z.enum(['technical', 'hr', 'behavioral', 'coding']),
  roleGoal: z.string().min(2, 'Please state your target job role'),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  answerText: z.string().min(1, 'Answer content is required'),
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

      const { type, roleGoal } = parsed.data;

      // Start initial AI interviewer query
      const welcomeMessageText = await AIService.handleMockInterview([], type, roleGoal);

      const session = await InterviewSession.create({
        user: req.user.userId,
        type,
        roleGoal,
        messages: [
          {
            role: 'interviewer',
            content: welcomeMessageText,
            timestamp: new Date(),
          },
        ],
        overallScore: 0,
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

      const { sessionId, answerText } = parsed.data;

      const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.userId });
      if (!session) {
        res.status(404).json({ message: 'Interview session not found' });
        return;
      }

      if (session.isCompleted) {
        res.status(400).json({ message: 'This interview session has already ended' });
        return;
      }

      // Appending candidate answer
      session.messages.push({
        role: 'candidate',
        content: answerText,
        timestamp: new Date(),
      });

      // Map document messages to prompt format
      const historyPrompt = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Generate next interviewer question
      const nextQuestion = await AIService.handleMockInterview(historyPrompt, session.type, session.roleGoal);

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
      const scoreData = await AIService.evaluateMockInterview(historyPrompt, session.type, session.roleGoal);

      session.isCompleted = true;
      session.overallScore = scoreData.overallScore || 70;
      session.grammarRating = scoreData.grammarRating || 70;
      session.technicalRating = scoreData.technicalRating || 70;
      session.behavioralRating = scoreData.behavioralRating || 70;
      session.feedback = scoreData.feedback || 'Good attempt. Maintain a structured response format.';

      await session.save();

      // Award XP
      const user = await User.findById(req.user.userId);
      if (user) {
        user.xpPoints += 100; // 100 XP reward for completing mock interview
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
