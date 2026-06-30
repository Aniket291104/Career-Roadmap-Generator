import { Response } from 'express';
import { Task } from '../models/Task';
import { IAuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['learning', 'coding', 'project', 'interview', 'other']).default('learning'),
  dueDate: z.string().optional(),
});

export class TaskController {
  
  static async getTasks(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
      res.status(200).json({ tasks });
    } catch (error) {
      console.error('Get Tasks Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async createTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const parsed = createTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }

      const task = await Task.create({
        user: req.user.userId,
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      });

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      console.error('Create Task Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user.userId },
        { $set: req.body },
        { new: true }
      );

      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
      console.error('Update Task Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete Task Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
