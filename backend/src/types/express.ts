// backend/src/types/express.ts

/** Payload inyectado por authGuard en req.user */
export interface AuthPayload {
  sub: string;
  email: string;
}

/**
 * Augment Express Request globally so all controllers
 * can access req.user with proper types after authGuard.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
