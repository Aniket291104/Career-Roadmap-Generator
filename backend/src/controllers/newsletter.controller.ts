import { Request, Response } from 'express';
import { Newsletter } from '../models/Newsletter';

export class NewsletterController {
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        res.status(400).json({ message: 'Email address is required.' });
        return;
      }

      // Check if already subscribed
      const existing = await Newsletter.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
        return;
      }

      // Create new subscriber record
      await Newsletter.create({ email });

      res.status(201).json({ message: 'Successfully subscribed! Thank you for staying in the loop.' });
    } catch (error) {
      console.error('Newsletter Subscribe Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
