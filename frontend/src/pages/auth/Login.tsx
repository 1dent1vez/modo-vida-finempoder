// La ruta canónica de auth es /auth (App.tsx redirige /login → /auth).
// Login.tsx se conserva como re-export de AuthScreen para no romper imports
// existentes (App.tsx importa LoginPage desde este archivo).
export { default } from './AuthScreen';
