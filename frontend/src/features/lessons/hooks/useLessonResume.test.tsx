// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { db } from '../../../db/finempoderDb';
import { lessonResumeRepository } from '../../../db/lessonResume.repository';
import { useLessonResume } from './useLessonResume';

beforeEach(async () => {
  await db.userLessonData.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useLessonResume', () => {
  it('no reporta snapshot al montar sin datos guardados', () => {
    const { result } = renderHook(() => useLessonResume('presupuesto', 'L01'));
    expect(result.current.hasSaved).toBe(false);
    expect(result.current.savedStep).toBeUndefined();
  });

  it('save persiste el snapshot (debounce) y accept lo devuelve y borra', async () => {
    const { result } = renderHook(() => useLessonResume('presupuesto', 'L03'));

    act(() => {
      result.current.save({ step: 3, payload: { draft: true } });
    });

    await waitFor(async () => {
      expect(await lessonResumeRepository.get('presupuesto', 'L03')).toEqual({
        step: 3,
        payload: { draft: true },
      });
    });

    let accepted: { step: number } | null = null;
    act(() => {
      accepted = result.current.accept();
    });

    expect(accepted).toEqual({ step: 3 });
    expect(result.current.hasSaved).toBe(false);
    await waitFor(async () => {
      expect(await lessonResumeRepository.get('presupuesto', 'L03')).toBeNull();
    });
  });

  it('ignore borra el snapshot sin aplicarlo', async () => {
    const { result } = renderHook(() => useLessonResume('ahorro', 'L07'));

    act(() => {
      result.current.save({ step: 2 });
    });
    await waitFor(async () => {
      expect(await lessonResumeRepository.get('ahorro', 'L07')).toEqual({ step: 2 });
    });

    act(() => {
      result.current.ignore();
    });

    expect(result.current.hasSaved).toBe(false);
    await waitFor(async () => {
      expect(await lessonResumeRepository.get('ahorro', 'L07')).toBeNull();
    });
  });

  it('clear borra el snapshot', async () => {
    const { result } = renderHook(() => useLessonResume('inversion', 'L12'));

    act(() => {
      result.current.save({ step: 5 });
    });
    await waitFor(async () => {
      expect(await lessonResumeRepository.get('inversion', 'L12')).toEqual({ step: 5 });
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.hasSaved).toBe(false);
    await waitFor(async () => {
      expect(await lessonResumeRepository.get('inversion', 'L12')).toBeNull();
    });
  });

  it('un clear posterior invalida el save pendiente (carrera debounce-vs-clear)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { result } = renderHook(() => useLessonResume('presupuesto', 'L03'));

    act(() => {
      result.current.save({ step: 3 });
    });

    // El LessonShell invoca el clear del repositorio al completar, ANTES de
    // que venza el debounce del último save de la lección.
    await act(async () => {
      await lessonResumeRepository.clear('presupuesto', 'L03');
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(await lessonResumeRepository.get('presupuesto', 'L03')).toBeNull();
  });
});
