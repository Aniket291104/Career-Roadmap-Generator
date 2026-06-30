import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/analyze', upload.single('resume'), ResumeController.analyze as any);
router.get('/history', ResumeController.getHistory as any);

export default router;
