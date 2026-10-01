// @vitest-environment jsdom
/** Captura de email tras el 3er logro (F3-CRECIMIENTO): trigger por suma de
 *  tiers vistos, una sola vez (flag), validación y guardado en Dexie. */
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../db/finempoderDb';
import { SEEN_BADGES_KEY } from '../../../lib/badgeCelebration';
import { NEWSLETTER_ASKED_KEY } from '../../../lib/newsletter';
import { CONSENT_TEXT, CONFIRMATION_TEXT, NewsletterPrompt } from './NewsletterPrompt';

function seen(tiers: Record<string, number>) {
  localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(tiers));
}

beforeEach(async () => {
  localStorage.clear();
  await db.newsletterSubscriptions.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('NewsletterPrompt — trigger', () => {
  it('no aparece con menos de 3 tiers explorados', () => {
    seen({ racha: 1, lecciones: 1 });
    render(<NewsletterPrompt />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('aparece al sumar 3 tiers explorados', () => {
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    render(<NewsletterPrompt />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Un tip financiero cada semana?')).toBeInTheDocument();
  });

  it('"Ahora no" lo marca y no reaparece ni con el 4to logro', () => {
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    const first = render(<NewsletterPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
    expect(localStorage.getItem(NEWSLETTER_ASKED_KEY)).toBe('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 4to logro (suma 4) + evento del store: sigue sin reaparecer.
    seen({ racha: 2, lecciones: 1, presupuesto: 1 });
    act(() => {
      window.dispatchEvent(new CustomEvent('fe:badges-state-updated'));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    first.unmount();
    render(<NewsletterPrompt />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con el flag marcado desde antes, nunca aparece', () => {
    localStorage.setItem(NEWSLETTER_ASKED_KEY, '1');
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    render(<NewsletterPrompt />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('NewsletterPrompt — validación y suscripción', () => {
  it('el botón Suscribirme queda deshabilitado con email inválido o sin consentimiento', () => {
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    render(<NewsletterPrompt />);
    const submit = () => screen.getByRole('button', { name: 'Suscribirme' });

    expect(submit()).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Tu correo'), { target: { value: 'correo-invalido' } });
    expect(submit()).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Tu correo'), { target: { value: 'algo@correo.com' } });
    expect(submit()).toBeDisabled(); // falta el consentimiento

    fireEvent.click(screen.getByRole('checkbox'));
    expect(submit()).toBeEnabled();
  });

  it('guarda en Dexie con synced:false y createdAt ISO, y muestra la confirmación honesta', async () => {
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    render(<NewsletterPrompt />);

    fireEvent.change(screen.getByLabelText('Tu correo'), {
      target: { value: ' Algo@Correo.com ' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Suscribirme' }));

    await waitFor(() => {
      expect(screen.getByText(CONFIRMATION_TEXT)).toBeInTheDocument();
    });

    const subs = await db.newsletterSubscriptions.toArray();
    expect(subs).toHaveLength(1);
    expect(subs[0]).toMatchObject({
      email: 'algo@correo.com',
      source: 'app',
      synced: false,
    });
    expect(new Date(subs[0].createdAt).toISOString()).toBe(subs[0].createdAt);

    // Tras suscribirse tampoco vuelve a aparecer (flag marcado).
    expect(localStorage.getItem(NEWSLETTER_ASKED_KEY)).toBe('1');
  });

  it('muestra el texto exacto de consentimiento', () => {
    seen({ racha: 1, lecciones: 1, presupuesto: 1 });
    render(<NewsletterPrompt />);
    expect(screen.getByText(CONSENT_TEXT)).toBeInTheDocument();
  });
});
