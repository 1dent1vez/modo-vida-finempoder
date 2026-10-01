import { configure } from '@testing-library/dom';

// IndexedDB y React reciben instrumentación adicional durante coverage. Un
// margen común evita que cada prueba de UI tenga su propio timeout arbitrario.
configure({ asyncUtilTimeout: 8_000 });
