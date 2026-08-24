// src/features/lessons/hooks/useLessonResume.ts
// Autoguardado intra-lección: expone si hay un snapshot guardado y las
// acciones para guardarlo (con debounce), retomarlo o descartarlo.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  lessonResumeRepository,
  type LessonResumeState,
} from '../../../db/lessonResume.repository';

const DEBOUNCE_MS = 500;

export type LessonResume = {
  hasSaved: boolean;
  savedStep?: number;
  save: (state: LessonResumeState) => void;
  accept: () => { step: number } | null;
  ignore: () => void;
  clear: () => void;
};

export function useLessonResume(moduleId: string, lessonId: string): LessonResume {
  const [hasSaved, setHasSaved] = useState(false);
  const [savedStep, setSavedStep] = useState<number | undefined>(undefined);
  const snapshotRef = useRef<LessonResumeState | null>(null);
  const moduleIdRef = useRef(moduleId);
  const lessonIdRef = useRef(lessonId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  moduleIdRef.current = moduleId;
  lessonIdRef.current = lessonId;

  useEffect(() => {
    let cancelled = false;
    void lessonResumeRepository.get(moduleId, lessonId).then((snapshot) => {
      if (cancelled || dirtyRef.current) return;
      snapshotRef.current = snapshot;
      setHasSaved(snapshot !== null);
      setSavedStep(snapshot?.step);
    });
    return () => {
      cancelled = true;
    };
  }, [moduleId, lessonId]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const save = useCallback((state: LessonResumeState) => {
    dirtyRef.current = true;
    snapshotRef.current = state;
    setSavedStep(state.step);
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void lessonResumeRepository.save(moduleIdRef.current, lessonIdRef.current, state);
    }, DEBOUNCE_MS);
  }, []);

  const accept = useCallback((): { step: number } | null => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return null;
    clearTimer();
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
    return { step: snapshot.step };
  }, []);

  const ignore = useCallback(() => {
    clearTimer();
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
  }, []);

  const clear = useCallback(() => {
    clearTimer();
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return useMemo(
    () => ({ hasSaved, savedStep, save, accept, ignore, clear }),
    [hasSaved, savedStep, save, accept, ignore, clear]
  );
}
