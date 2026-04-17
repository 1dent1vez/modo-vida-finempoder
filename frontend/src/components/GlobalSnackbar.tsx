import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotifications } from '../store/notifications';

export default function GlobalSnackbar() {
  const queue = useNotifications((s) => s.queue);
  const dequeue = useNotifications((s) => s.dequeue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (queue.length > 0) setOpen(true);
  }, [queue]);

  const handleClose = () => {
    setOpen(false);
    dequeue();
  };

  const current = queue[0];

  const content = current ? (
    <Alert severity={current.severity ?? 'info'} onClose={handleClose} variant="filled" sx={{ width: '100%' }}>
      {current.message}
    </Alert>
  ) : undefined;

  return (
    <Snackbar
      open={open && !!current}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {content}
    </Snackbar>
  );
}
