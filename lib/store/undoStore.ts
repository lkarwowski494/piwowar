/**
 * Piwowar (Brewcraft) — Undo Snackbar Store (Zustand)
 * DEC-03: Immediate WAL commit + bottom Snackbar "Cofnij" (32-wzorce-interakcji.md)
 */

import { create } from 'zustand';

export interface UndoState {
  visible: boolean;
  message: string;
  onUndo: (() => Promise<void> | void) | null;

  showUndo: (message: string, onUndo: () => Promise<void> | void) => void;
  hideUndo: () => void;
  triggerUndo: () => Promise<void>;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  visible: false,
  message: '',
  onUndo: null,

  showUndo: (message: string, onUndo: () => Promise<void> | void) => {
    set({
      visible: true,
      message,
      onUndo
    });

    // Auto-hide after 5 seconds if not triggered
    setTimeout(() => {
      if (get().visible && get().message === message) {
        set({ visible: false, onUndo: null });
      }
    }, 5000);
  },

  hideUndo: () => set({ visible: false, onUndo: null }),

  triggerUndo: async () => {
    const { onUndo } = get();
    if (onUndo) {
      try {
        await onUndo();
      } catch (err) {
        console.error('Failed to execute undo action:', err);
      }
    }
    set({ visible: false, onUndo: null });
  }
}));
