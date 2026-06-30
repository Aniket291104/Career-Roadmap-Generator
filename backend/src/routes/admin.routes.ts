import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);
router.use(checkRole(['admin']) as any);

router.get('/stats', AdminController.getSystemStats as any);
router.get('/users', AdminController.getUsers as any);
router.put('/role', AdminController.updateUserRole as any);
router.delete('/user/:id', AdminController.deleteUser as any);

export default router;
