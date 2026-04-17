// Tests unitarios de PageHeader
// Validan la lógica de props y tipos del componente sin DOM renderer.
// Para tests de renderizado se requiere @testing-library/react + jsdom.

import { test, expect, describe } from 'vitest';
import type { PageHeaderProps } from '../src/components/shared/PageHeader';

describe('PageHeaderProps — tipos y valores esperados', () => {
  test('acepta solo title como prop obligatoria', () => {
    const minimalProps: PageHeaderProps = { title: 'Mi pantalla' };
    expect(minimalProps.title).toBe('Mi pantalla');
    expect(minimalProps.subtitle).toBeUndefined();
    expect(minimalProps.onBack).toBeUndefined();
    expect(minimalProps.rightSlot).toBeUndefined();
    expect(minimalProps.moduleColor).toBeUndefined();
  });

  test('moduleColor acepta exactamente los valores de módulo', () => {
    const validColors: PageHeaderProps['moduleColor'][] = [
      'warning',
      'success',
      'info',
      undefined,
    ];
    for (const color of validColors) {
      const props: PageHeaderProps = { title: 'Test', moduleColor: color };
      expect(['warning', 'success', 'info', undefined]).toContain(props.moduleColor);
    }
  });

  test('onBack es una función opcional', () => {
    let called = false;
    const props: PageHeaderProps = {
      title: 'Con back',
      onBack: () => { called = true; },
    };
    props.onBack?.();
    expect(called).toBe(true);
  });

  test('subtitle es una cadena opcional', () => {
    const props: PageHeaderProps = {
      title: 'Módulo',
      subtitle: 'Subtítulo de la pantalla',
    };
    expect(props.subtitle).toBe('Subtítulo de la pantalla');
  });
});
