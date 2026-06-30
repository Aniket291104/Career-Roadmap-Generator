import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { IAuthRequest } from '../middlewares/auth.middleware';

export class ChatController {
  
  static async chat(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { message, history } = req.body; // history: array of { role: 'user'|'model', parts: [{ text: string }] }
      if (!message) {
        res.status(400).json({ message: 'Message content is required.' });
        return;
      }

      const chatHistory = Array.isArray(history) ? history : [];
      
      const reply = await AIService.handleChatGuidance(message, chatHistory);

      res.status(200).json({
        reply,
      });
    } catch (error) {
      console.error('Chat Assistant Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
