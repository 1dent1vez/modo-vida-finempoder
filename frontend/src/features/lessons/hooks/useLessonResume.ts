// src/features/lessons/hooks/useLessonResume.ts
// Autoguardado intra-lección: expone si hay un snapshot guardado y las
// acciones para guardarlo (con debounce), retomarlo o descartarlo.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  lessonResumeRepository,
  type LessonResumeState,
} from '../../../db/lessonResume.repository';
import { track, EVENTOS } from '../../../lib/analytics';

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

  const save = useCallback((state: LessonResumeState) => {
    dirtyRef.current = true;
    snapshotRef.current = state;
    setSavedStep(state.step);
    // El debounce vive en el repositorio (timer registrado por key), de modo
    // que clearLessonResume del shell pueda cancelar cualquier save pendiente.
    lessonResumeRepository.scheduleSave(moduleIdRef.current, lessonIdRef.current, state);
  }, []);

  const accept = useCallback((): { step: number } | null => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return null;
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
    // Punto único de "lección reanudada": todos los banners de las 45
    // lecciones pasan por accept() (F6-ANALYTICS).
    track(EVENTOS.LESSON_RESUMED, { moduleId: moduleIdRef.current, lessonId: lessonIdRef.current });
    return { step: snapshot.step };
  }, []);

  const ignore = useCallback(() => {
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
  }, []);

  const clear = useCallback(() => {
    snapshotRef.current = null;
    setHasSaved(false);
    setSavedStep(undefined);
    void lessonResumeRepository.clear(moduleIdRef.current, lessonIdRef.current);
  }, []);

  useEffect(() => {
    return () => {
      // Al desmontar se descarta el save pendiente (mismo comportamiento que
      // con el timer local previo).
      lessonResumeRepository.cancelPendingSave(moduleIdRef.current, lessonIdRef.current);
    };
  }, []);

  return useMemo(
    () => ({ hasSaved, savedStep, save, accept, ignore, clear }),
    [hasSaved, savedStep, save, accept, ignore, clear]
  );
}
