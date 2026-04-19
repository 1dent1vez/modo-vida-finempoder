import { Router } from 'express';
import { recordLessonCompletion } from '../controllers/progress.controller.js';
import { authGuard } from '../middlewares/auth.js';

export const progressRouter = Router();

// Todas las rutas de progreso requieren usuario autenticado
progressRouter.use(authGuard);

progressRouter.post('/lesson-completed', recordLessonCompletion);
