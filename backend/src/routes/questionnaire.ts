import { Router } from 'express';
import { authGuard } from '../middlewares/auth.js';
import { submitQuestionnaire } from '../controllers/questionnaire.controller.js';

export const questionnaireRouter = Router();

questionnaireRouter.use(authGuard);
questionnaireRouter.post('/:type', submitQuestionnaire);
