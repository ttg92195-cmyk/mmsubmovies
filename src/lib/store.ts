import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  isAdmin: boolean
  isPremium: boolean
}

interface AppState {
  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // User
  user: User | null
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void

  // Settings
  primaryColor: string
  setPrimaryColor: (color: string) => void
  headerText: string
  setHeaderText: (text: string) => void
  allDownloadEnabled: boolean
  setAllDownloadEnabled: (enabled: boolean) => void

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // User
      user: null,
      setUser: (user) => set({ user }),
      login: async (username: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          const data = await res.json()
          if (data.success && data.user) {
            set({ user: data.user })
            return true
          }
          return false
        } catch {
          return false
        }
      },
      logout: () => {
        set({ user: null })
        fetch('/api/auth/logout', { method: 'POST' })
      },

      // Settings
      primaryColor: '#FFC107',
      setPrimaryColor: (color) => set({ primaryColor: color }),
      headerText: 'BurmaYoteShin',
      setHeaderText: (text) => set({ headerText: text }),
      allDownloadEnabled: false,
      setAllDownloadEnabled: (enabled) => set({ allDownloadEnabled: enabled }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'movie-app-storage',
      partialize: (state) => ({
        user: state.user,
        primaryColor: state.primaryColor,
        headerText: state.headerText,
        allDownloadEnabled: state.allDownloadEnabled,
        theme: state.theme,
      }),
    }
  )
)
