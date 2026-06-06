import { create } from 'zustand'

const useAppStore = create((set) => ({
  currentSystem: null,
  currentOrgan:  null,

  setCurrentSystem: (system) =>
    set({ currentSystem: system, currentOrgan: null }),

  setCurrentOrgan: (organ) =>
    set({ currentOrgan: organ }),

  reset: () =>
    set({ currentSystem: null, currentOrgan: null }),
}))

export default useAppStore
