import { Router } from 'express';
import { authGuard } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { getMyResearchStatus, listStudentsSummary } from '../controllers/research.controller.js';

export const researchRouter = Router();

researchRouter.use(authGuard);
researchRouter.get('/status/me', getMyResearchStatus);
researchRouter.get('/students', requireRole('admin'), listStudentsSummary);
