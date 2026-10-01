// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signOut: vi.fn() } },
}));

import Settings from './Settings';
import { useDailyGoal } from '../../store/dailyGoal';

describe('Settings — selector de meta diaria', () => {
  it('cambia y persiste el nivel al tocar una opción', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(useDailyGoal.getState().level).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Intensa/ }));
    expect(useDailyGoal.getState().level).toBe('intense');

    fireEvent.click(screen.getByRole('button', { name: /Relajada/ }));
    expect(useDailyGoal.getState().level).toBe('relaxed');
  });
});
