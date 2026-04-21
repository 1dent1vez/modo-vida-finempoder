import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

import { registerSW } from 'virtual:pwa-register';
import { useNotifications } from './store/notifications';
import { useAuth } from './store/auth';
import { useProgress } from './store/progress';
import { useLessons } from './store/lessons';
import { supabase } from './lib/supabase';

import { ErrorBoundary } from './components/ErrorBoundary';
import { initSentry } from './lib/sentry';
import { SyncManager } from './lib/sync/SyncManager';

initSentry();
SyncManager.init();

const qc = new QueryClient();

// Rehidrata sesión desde Supabase al cargar y en cada cambio de auth
supabase.auth.onAuthStateChange((_event, session) => {
  const { setAuth, clearAuth, setHydrated } = useAuth.getState();
  if (session?.access_token && session.user) {
    setAuth(session.access_token, {
      id: session.user.id,
      email: session.user.email ?? '',
    });
  } else {
    clearAuth();
    useProgress.getState().reset();
    useLessons.getState().reset();
    qc.clear();
  }
  setHydrated();
});

if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      useNotifications.getState().enqueue(
        'Nueva versión disponible. Recarga la página para actualizar.',
        'info'
      );
      updateSW(true);
    },
    onOfflineReady() {
      useNotifications.getState().enqueue(
        'Aplicación lista para usarse sin conexión.',
        'success'
      );
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
