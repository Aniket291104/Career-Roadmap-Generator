import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/start', InterviewController.startSession as any);
router.post('/submit', InterviewController.submitAnswer as any);
router.post('/evaluate', InterviewController.evaluateSession as any);
router.get('/history', InterviewController.getHistory as any);

export default router;
