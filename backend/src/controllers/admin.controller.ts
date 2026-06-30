import { Response } from 'express';
import { User } from '../models/User';
import { Roadmap } from '../models/Roadmap';
import { InterviewSession } from '../models/InterviewSession';
import { Quiz } from '../models/Quiz';
import { IAuthRequest } from '../middlewares/auth.middleware';

export class AdminController {
  
  static async getSystemStats(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const totalUsers = await User.countDocuments();
      const totalRoadmaps = await Roadmap.countDocuments();
      const totalInterviews = await InterviewSession.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();

      // Simple active user checking
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const mentors = await User.countDocuments({ role: 'mentor' });
      const admins = await User.countDocuments({ role: 'admin' });

      res.status(200).json({
        totalUsers,
        verifiedUsers,
        mentors,
        admins,
        totalRoadmaps,
        totalInterviews,
        totalQuizzes,
        aiTokenMockCost: totalRoadmaps * 0.002 + totalInterviews * 0.005 + totalQuizzes * 0.001, // Mock token billing indicator
      });
    } catch (error) {
      console.error('Get Admin Stats Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getUsers(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.status(200).json({ users });
    } catch (error) {
      console.error('Admin Get Users Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateUserRole(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { userId, role } = req.body;
      if (!userId || !['student', 'mentor', 'admin'].includes(role)) {
        res.status(400).json({ message: 'Valid userId and role are required' });
        return;
      }

      const user = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
      console.error('Admin Update User Role Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteUser(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Clean up user's data
      await Roadmap.deleteMany({ user: id });
      await InterviewSession.deleteMany({ user: id });
      await Quiz.deleteMany({ user: id });

      res.status(200).json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
      console.error('Admin Delete User Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
