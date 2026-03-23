import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  UI preferences (persisted to localStorage)                         */
/* ------------------------------------------------------------------ */

interface UIState {
  soundEnabled: boolean;
  currentSound: string | null;
  volume: number;
  goldenHourActive: boolean;
  season: string;
  breathingVisible: boolean;
  sidebarOpen: boolean;

  toggleSound: () => void;
  setCurrentSound: (sound: string | null) => void;
  setVolume: (volume: number) => void;
  setGoldenHour: (active: boolean) => void;
  setSeason: (season: string) => void;
  toggleBreathing: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      currentSound: null,
      volume: 0.3,
      goldenHourActive: false,
      season: '',
      breathingVisible: true,
      sidebarOpen: false,

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      setCurrentSound: (sound) => set({ currentSound: sound }),

      setVolume: (volume) =>
        set({ volume: Math.min(Math.max(volume, 0), 1) }),

      setGoldenHour: (active) => set({ goldenHourActive: active }),

      setSeason: (season) => set({ season }),

      toggleBreathing: () =>
        set((state) => ({ breathingVisible: !state.breathingVisible })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'prana-ui-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        goldenHourActive: state.goldenHourActive,
        season: state.season,
        breathingVisible: state.breathingVisible,
      }),
    },
  ),
);
