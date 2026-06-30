import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/analyze', PortfolioController.analyze as any);
router.get('/history', PortfolioController.getHistory as any);

export default router;
