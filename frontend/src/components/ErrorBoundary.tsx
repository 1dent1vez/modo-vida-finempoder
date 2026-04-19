import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Sentry } from '../lib/sentry';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/app';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-bold">Algo salió mal</h1>
          <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
            Ocurrió un error inesperado. Puedes intentar regresar al inicio.
          </p>
          {import.meta.env.DEV && (
            <pre className="max-w-full overflow-auto rounded-lg bg-[var(--color-neutral-100)] p-3 text-left text-xs">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="rounded-xl bg-[var(--color-brand-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-brand-primary-dark)] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
