// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LessonPath, ModuleMiniPath } from './LessonPath';
import { getLessonNodeState, getPathNodeStates } from '../lessonPathState';
import { setAdminMode } from '../../lib/adminMode';
import type { ModuleFlowConfig } from '../moduleFlow';

const CONFIG: ModuleFlowConfig = {
  moduleId: 'presupuesto',
  lessonPathPrefix: '/app/presupuesto/lesson',
  overviewPath: '/app/presupuesto',
  lessons: [
    { id: 'L01', title: 'Lección uno', kind: 'content' },
    { id: 'L02', title: 'Lección dos', kind: 'content' },
    { id: 'L03', title: 'Lección tres', kind: 'content' },
  ],
};

beforeEach(() => setAdminMode(false));
afterEach(() => {
  cleanup();
  setAdminMode(false);
});

describe('getLessonNodeState — estados derivados', () => {
  it('sin completar: primera actual, resto bloqueado', () => {
    expect(getLessonNodeState(CONFIG, 'L01', {})).toBe('current');
    expect(getLessonNodeState(CONFIG, 'L02', {})).toBe('locked');
    expect(getLessonNodeState(CONFIG, 'L03', {})).toBe('locked');
  });

  it('con L01 completada: L01 completada, L02 actual, L03 bloqueada', () => {
    const completedMap = { L01: true };
    expect(getLessonNodeState(CONFIG, 'L01', completedMap)).toBe('completed');
    expect(getLessonNodeState(CONFIG, 'L02', completedMap)).toBe('current');
    expect(getLessonNodeState(CONFIG, 'L03', completedMap)).toBe('locked');
  });

  it('modo admin: ninguna lección queda bloqueada', () => {
    setAdminMode(true);
    expect(getLessonNodeState(CONFIG, 'L02', {})).toBe('current');
    expect(getLessonNodeState(CONFIG, 'L03', {})).toBe('current');
  });

  it('getPathNodeStates cubre todas las lecciones', () => {
    const states = getPathNodeStates(CONFIG, { L01: true, L02: true });
    expect(states).toEqual({ L01: 'completed', L02: 'completed', L03: 'current' });
  });
});

describe('LessonPath — render e interacción', () => {
  it('marca el nodo actual con pulso y pinta el mensaje de bienvenida de Finni', () => {
    render(<LessonPath config={CONFIG} completedMap={{ L01: true }} onNavigate={vi.fn()} />);

    const current = screen.getByRole('button', { name: /L02/ });
    expect(current).toHaveClass('finni-node-pulse');

    const locked = screen.getByRole('button', { name: /L03/ });
    expect(locked).not.toHaveClass('finni-node-pulse');

    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(1);
  });

  it('tap en nodo completado navega para repasar', () => {
    const onNavigate = vi.fn();
    render(<LessonPath config={CONFIG} completedMap={{ L01: true }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /L01/ }));
    expect(onNavigate).toHaveBeenCalledWith('L01');
  });

  it('tap en nodo actual navega', () => {
    const onNavigate = vi.fn();
    render(<LessonPath config={CONFIG} completedMap={{ L01: true }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /L02/ }));
    expect(onNavigate).toHaveBeenCalledWith('L02');
  });

  it('tap en bloqueada muestra el mensaje y NO navega', () => {
    const onNavigate = vi.fn();
    render(<LessonPath config={CONFIG} completedMap={{ L01: true }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /L03/ }));
    expect(screen.getByText('Completa la anterior para desbloquear')).toBeInTheDocument();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('con modo admin activo, tap en bloqueada navega igual', () => {
    setAdminMode(true);
    const onNavigate = vi.fn();
    render(<LessonPath config={CONFIG} completedMap={{ L01: true }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /L03/ }));
    expect(onNavigate).toHaveBeenCalledWith('L03');
  });
});

describe('ModuleMiniPath — resumen compacto', () => {
  it('muestra anterior (check), actual (número) y siguiente (candado)', () => {
    render(
      <ModuleMiniPath config={CONFIG} completedMap={{ L01: true }} onNavigate={vi.fn()} />
    );

    const prev = screen.getByRole('button', { name: /L01/ });
    const current = screen.getByRole('button', { name: /L02/ });
    const next = screen.getByRole('button', { name: /bloqueada/ });

    expect(prev.querySelector('svg')).not.toBeNull();
    expect(current).toHaveClass('finni-node-pulse');
    expect(next.querySelector('svg')).not.toBeNull();
  });

  it('tap en bloqueada del mini camino no navega; tap en actual sí', () => {
    const onNavigate = vi.fn();
    render(<ModuleMiniPath config={CONFIG} completedMap={{ L01: true }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /bloqueada/ }));
    expect(onNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /L02/ }));
    expect(onNavigate).toHaveBeenCalledWith('L02');
  });
});
