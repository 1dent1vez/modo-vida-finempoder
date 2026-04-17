import { Router } from 'express';
import { authGuard } from '../middlewares/auth.js';
import { getMyGamification } from '../controllers/gamification.controller.js';

export const gamificationRouter = Router();

gamificationRouter.use(authGuard);
gamificationRouter.get('/me', getMyGamification);
