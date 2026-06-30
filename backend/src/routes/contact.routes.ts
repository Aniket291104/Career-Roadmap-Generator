import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();

router.post('/message', ContactController.submit);

export default router;
