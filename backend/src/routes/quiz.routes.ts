import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/generate', QuizController.generate as any);
router.post('/submit', QuizController.submit as any);
router.get('/history', QuizController.getHistory as any);

export default router;
