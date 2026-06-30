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
      
      // Simple text extraction from buffer (supporting plain text, and basic ASCII strip for PDF buffers)
      let parsedText = '';
      if (req.file.mimetype === 'text/plain') {
        parsedText = req.file.buffer.toString('utf-8');
      } else {
        // Strip readable ASCII characters from PDF buffer as a basic fallback parser
        const rawBufferStr = req.file.buffer.toString('ascii');
        parsedText = rawBufferStr
          .replace(/[^\x20-\x7E\s]/g, '') // remove non-printable characters
          .slice(0, 5000); // limit to first 5k characters to keep prompts clean
      }

      if (parsedText.length < 50) {
        parsedText = `Developer profile resume named ${originalName}. Core targets include Full Stack Software Engineering.`;
      }

      // Analyze using AIService
      const feedback = await AIService.analyzeResume(parsedText);

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
