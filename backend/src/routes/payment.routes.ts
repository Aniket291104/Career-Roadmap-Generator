import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/checkout', authenticateJWT as any, PaymentController.createCheckoutSession as any);
router.post('/webhook', PaymentController.handleWebhook as any);

export default router;
