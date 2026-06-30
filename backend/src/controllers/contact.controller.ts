import { Request, Response } from 'express';
import { Contact } from '../models/Contact';

export class ContactController {
  static async submit(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        res.status(400).json({ message: 'Name, email, and message fields are all required.' });
        return;
      }

      await Contact.create({ name, email, message });

      res.status(201).json({ message: 'Your message has been sent successfully! We will get back to you shortly.' });
    } catch (error) {
      console.error('Contact Submit Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
