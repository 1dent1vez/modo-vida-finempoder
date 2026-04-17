import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
          p={3}
          textAlign="center"
        >
          <Typography variant="h5" fontWeight={700}>
            Algo salió mal
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={360}>
            Ocurrió un error inesperado. Puedes intentar regresar al inicio.
          </Typography>
          {import.meta.env.DEV && (
            <Box
              component="pre"
              sx={{ fontSize: 11, textAlign: 'left', bgcolor: 'grey.100', p: 2, borderRadius: 1, maxWidth: '100%', overflow: 'auto' }}
            >
              {this.state.error.message}
            </Box>
          )}
          <Button variant="contained" onClick={this.handleReset}>
            Volver al inicio
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
