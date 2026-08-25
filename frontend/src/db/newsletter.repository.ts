// src/db/newsletter.repository.ts — captura local de email (F3-CRECIMIENTO).
// Sin envío a ningún servicio: queda en Dexie (synced:false) listo para
// conectar un backend de newsletter en el futuro.

import { db, type NewsletterSubscription } from './finempoderDb';

export const newsletterRepository = {
  /** Guarda la suscripción local. Devuelve el id generado. */
  async subscribe(email: string): Promise<number> {
    const record: NewsletterSubscription = {
      email,
      source: 'app',
      createdAt: new Date().toISOString(),
      synced: false,
    };
    return db.newsletterSubscriptions.add(record);
  },

  /** Todas las suscripciones (para un futuro sync al backend). */
  async getAll(): Promise<NewsletterSubscription[]> {
    return db.newsletterSubscriptions.toArray();
  },
};
