/**
 * Store para la preferencia de tema (claro/oscuro).
 * Persiste la preferencia en localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'theme-preference' }
  )
);

export default useThemeStore;
