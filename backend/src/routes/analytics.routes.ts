import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/dashboard', AnalyticsController.getDashboardStats as any);
router.get('/leaderboard', AnalyticsController.getLeaderboard as any);

export default router;
