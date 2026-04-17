import { create } from 'zustand';

export type Notification = {
  id: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
};

type NotificationState = {
  queue: Notification[];
  enqueue: (message: string, severity?: Notification['severity']) => void;
  dequeue: () => void;
};

export const useNotifications = create<NotificationState>((set) => ({
  queue: [],
  enqueue: (message, severity = 'info') =>
    set((state) => ({
      queue: [...state.queue, { id: crypto.randomUUID(), message, severity }],
    })),
  dequeue: () =>
    set((state) => ({
      queue: state.queue.slice(1),
    })),
}));
