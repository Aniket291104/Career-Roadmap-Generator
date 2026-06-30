import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/', ChatController.chat as any);

export default router;
