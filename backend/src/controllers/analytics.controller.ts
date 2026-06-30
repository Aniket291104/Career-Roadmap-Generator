import { Response } from 'express';
import { User } from '../models/User';
import { Progress } from '../models/Progress';
import { Roadmap } from '../models/Roadmap';
import { Task } from '../models/Task';
import { Achievement } from '../models/Achievement';
import { Notification } from '../models/Notification';
import { IAuthRequest } from '../middlewares/auth.middleware';
import axios from 'axios';

export class AnalyticsController {
  
  static async getDashboardStats(req: IAuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Fetch progress heatmap and radar metrics
      let progress = await Progress.findOne({ user: req.user.userId });
      if (!progress) {
        progress = await Progress.create({ user: req.user.userId });
      }

      // Fetch user roadmaps
      const roadmaps = await Roadmap.find({ user: req.user.userId });
      const activeRoadmap = roadmaps[0] || null;

      // Fetch recent notifications
      const notifications = await Notification.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(10);

            // Fetch task stats
      const totalTasks = await Task.countDocuments({ user: req.user.userId });
      const completedTasks = await Task.countDocuments({ user: req.user.userId, status: 'done' });

      // LeetCode Integration
      let codingStats: any = null;
      if ((user as any).leetcodeUsername) {
        try {
          const lcRes = await axios.get(`https://leetcode-api-faisal.vercel.app/api/${(user as any).leetcodeUsername}`);
          if (lcRes.data) {
            codingStats = {
              platform: 'leetcode',
              username: (user as any).leetcodeUsername,
              totalSolved: lcRes.data.totalSolved || 0,
              easySolved: lcRes.data.easySolved || 0,
              mediumSolved: lcRes.data.mediumSolved || 0,
              hardSolved: lcRes.data.hardSolved || 0,
              ranking: lcRes.data.ranking || 'N/A',
            };
          }
        } catch (lcErr) {
          console.warn('Failed to fetch LeetCode profile stats, using offline fallback.');
        }
      }

      // Gather achievements (Badges unlocked based on metrics)
      const achievements: any[] = [];
      
      // Auto-unlock achievements if they fit criteria (simple gamification check)
      if (user.currentStreak >= 7) {
        let badge = await Achievement.findOne({ badgeCode: 'streak_7' });
        if (!badge) {
          badge = await Achievement.create({
            name: 'Week on Fire',
            description: 'Maintain a 7-day learning streak',
            badgeCode: 'streak_7',
            icon: 'Flame',
            category: 'streak',
            xpReward: 100,
          });
        }
        achievements.push(badge);
      }
      
      if (roadmaps.length > 0) {
        let badge = await Achievement.findOne({ badgeCode: 'roadmap_1' });
        if (!badge) {
          badge = await Achievement.create({
            name: 'Architect Mind',
            description: 'Generate your first learning roadmap',
            badgeCode: 'roadmap_1',
            icon: 'Compass',
            category: 'roadmap',
            xpReward: 50,
          });
        }
        achievements.push(badge);
      }

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          xpPoints: user.xpPoints,
          careerGoal: user.careerGoal,
          skills: user.skills,
        },
        progress: {
          dailyActivity: progress.dailyActivity,
          radarMetrics: progress.radarMetrics,
          consistencyScore: progress.consistencyScore,
          xpHistory: progress.xpHistory,
        },
        activeRoadmap,
        roadmapsCount: roadmaps.length,
        tasksInfo: {
          total: totalTasks,
          completed: completedTasks,
          percent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        notifications,
        achievements,
        codingStats,
      });
    } catch (error) {
      console.error('Get Dashboard Stats Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getLeaderboard(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const leaders = await User.find({ isVerified: true })
        .select('name email xpPoints currentStreak role profilePicture')
        .sort({ xpPoints: -1 })
        .limit(10);

      res.status(200).json({
        leaderboard: leaders,
      });
    } catch (error) {
      console.error('Get Leaderboard Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
