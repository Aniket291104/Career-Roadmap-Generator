import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', TaskController.getTasks as any);
router.post('/', TaskController.createTask as any);
router.put('/:id', TaskController.updateTask as any);
router.delete('/:id', TaskController.deleteTask as any);

export default router;
