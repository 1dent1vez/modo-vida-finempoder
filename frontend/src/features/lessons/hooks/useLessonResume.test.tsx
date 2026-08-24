// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { db } from '../../../db/finempoderDb';
import { lessonResumeRepository } from '../../../db/lessonResume.repository';
import { useLessonResume } from './useLessonResume';

beforeEach(async () => {
  await db.userLessonData.clear();
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
});
