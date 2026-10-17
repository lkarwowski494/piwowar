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

let undoTimer: any = null;

export const useUndoStore = create<UndoState>((set, get) => ({
  visible: false,
  message: '',
  onUndo: null,

  showUndo: (message: string, onUndo: () => Promise<void> | void) => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = null;
    }

    set({
      visible: true,
      message,
      onUndo
    });

    undoTimer = setTimeout(() => {
      if (get().visible && get().message === message) {
        set({ visible: false, onUndo: null });
      }
    }, 5000);

    if (undoTimer && typeof undoTimer.unref === 'function') {
      undoTimer.unref();
    }
  },

  hideUndo: () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = null;
    }
    set({ visible: false, onUndo: null });
  },

  triggerUndo: async () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = null;
    }

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
