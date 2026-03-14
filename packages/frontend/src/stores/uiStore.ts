import { create } from 'zustand';

interface UiState {
  isOnline: boolean;
  setOnline: (value: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (value) => set({ isOnline: value }),
}));
