import { Response } from 'express';
import { Resume } from '../models/Resume';
import { AIService } from '../services/ai.service';
import { IAuthRequest } from '../middlewares/auth.middleware';

export class ResumeController {
  
  static async analyze(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: 'Please upload a resume file (PDF or TXT)' });
        return;
      }

      const originalName = req.file.originalname;

      // Analyze using AIService directly passing the buffer and mimetype
      const feedback = await AIService.analyzeResume(req.file.buffer, req.file.mimetype);

      // Create record
      const resumeAnalysis = await Resume.create({
        user: req.user.userId,
        fileName: originalName,
        fileUrl: `/uploads/mock_${Date.now()}_${originalName}`, // Mock file storage path
        atsScore: feedback.atsScore || 70,
        missingSkills: feedback.missingSkills || [],
        missingKeywords: feedback.missingKeywords || [],
        suggestions: feedback.suggestions || 'Optimize formatting and align keywords.',
      });

      res.status(200).json({
        message: 'Resume analyzed successfully',
        analysis: resumeAnalysis,
      });
    } catch (error) {
      console.error('Resume Analysis Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getHistory(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const history = await Resume.find({ user: req.user.userId }).sort({ createdAt: -1 });
      res.status(200).json({ history });
    } catch (error) {
      console.error('Get Resume History Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
