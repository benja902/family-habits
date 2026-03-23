/**
 * Store de autenticación con PIN para el Panel Familiar de Hábitos.
 * Maneja la sesión del usuario activo y el flujo de login con PIN.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // Estado
      currentUser: null,
      isAuthenticated: false,
      role: null,
      selectedUser: null,

      // Acciones
      selectUser: (user) =>
        set({ selectedUser: user }),

      login: (user) =>
        set({
          currentUser: user,
          isAuthenticated: true,
          role: user.role,
          // selectedUser: null,
        }),

      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          role: null,
          selectedUser: null,
        }),

      clearSelectedUser: () =>
        set({ selectedUser: null }),
    }),
    {
      name: 'family-habits-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);

export default useAuthStore;
