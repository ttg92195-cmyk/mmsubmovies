import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Page = 'home' | 'movies' | 'series' | 'search' | 'movie-detail' | 'series-detail' | 'download' | 'settings' | 'bookmark' | 'tmdb' | 'account' | 'genres'

export interface User {
  id: string
  username: string
  isAdmin: boolean
  isPremium: boolean
  avatarUrl?: string
}

export interface Movie {
  id: string
  title: string
  overview?: string | null
  posterUrl?: string | null
  backdropUrl?: string | null
  rating: number
  year: number
  duration?: number | null
  genre: string
  language?: string | null
  tmdbId?: number | null
  isSeries: boolean
  isFeatured: boolean
  isTrending: boolean
  isIconic: boolean
  createdAt?: string
  series?: {
    id: string
    status: string
    seasons: {
      id: string
      seasonNumber: number
      episodes: {
        id: string
        episodeNumber: number
        title: string
        thumbnailUrl?: string | null
        duration?: number | null
        overview?: string | null
        downloadLinks: { id: string; quality: string; url: string; source: string }[]
      }[]
    }[]
  } | null
  cast: {
    id: string
    name: string
    character: string
    profileUrl?: string | null
  }[]
  downloadLinks: {
    id: string
    quality: string
    url: string
    source: string
  }[]
}

export interface Settings {
  id: string
  primaryColor: string
  headerText: string
  allDownloadEnabled: boolean
}

interface AppState {
  // Navigation
  currentPage: Page
  setCurrentPage: (page: Page) => void
  
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // User
  user: User | null
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  
  // Selected movie/series for detail pages
  selectedMovieId: string | null
  setSelectedMovieId: (id: string | null) => void
  
  // Settings
  settings: Settings | null
  setSettings: (settings: Settings) => void
  primaryColor: string
  setPrimaryColor: (color: string) => void
  headerText: string
  setHeaderText: (text: string) => void
  allDownloadEnabled: boolean
  setAllDownloadEnabled: (enabled: boolean) => void
  wifiOnlyDownload: boolean
  setWifiOnlyDownload: (enabled: boolean) => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Filters
  selectedGenre: string
  setSelectedGenre: (genre: string) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  selectedRating: string
  setSelectedRating: (rating: string) => void
  
  // Available Sources Modal
  sourcesModalOpen: boolean
  setSourcesModalOpen: (open: boolean) => void
  selectedDownloadLinks: { id: string; quality: string; url: string }[]
  setSelectedDownloadLinks: (links: { id: string; quality: string; url: string }[]) => void
  
  // Bookmarks
  bookmarkIds: string[]
  setBookmarkIds: (ids: string[]) => void
  addBookmark: (id: string) => void
  removeBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean
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
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
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
          if (data.success) {
            set({ user: data.user })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },
      logout: () => set({ user: null }),
      
      // Selected movie/series
      selectedMovieId: null,
      setSelectedMovieId: (id) => set({ selectedMovieId: id }),
      
      // Settings
      settings: null,
      setSettings: (settings) => set({ 
        settings,
        primaryColor: settings.primaryColor,
        headerText: settings.headerText,
        allDownloadEnabled: settings.allDownloadEnabled,
      }),
      primaryColor: '#FFD700',
      setPrimaryColor: (color) => set({ primaryColor: color }),
      headerText: 'BurmaYoteShin',
      setHeaderText: (text) => set({ headerText: text }),
      allDownloadEnabled: false,
      setAllDownloadEnabled: (enabled) => set({ allDownloadEnabled: enabled }),
      wifiOnlyDownload: false,
      setWifiOnlyDownload: (enabled) => set({ wifiOnlyDownload: enabled }),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Filters
      selectedGenre: '',
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      selectedYear: '',
      setSelectedYear: (year) => set({ selectedYear: year }),
      selectedRating: '',
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      
      // Sources Modal
      sourcesModalOpen: false,
      setSourcesModalOpen: (open) => set({ sourcesModalOpen: open }),
      selectedDownloadLinks: [],
      setSelectedDownloadLinks: (links) => set({ selectedDownloadLinks: links }),
      
      // Bookmarks
      bookmarkIds: [],
      setBookmarkIds: (ids) => set({ bookmarkIds: ids }),
      addBookmark: (id) => set((state) => ({ bookmarkIds: [...state.bookmarkIds, id] })),
      removeBookmark: (id) => set((state) => ({ bookmarkIds: state.bookmarkIds.filter((bid) => bid !== id) })),
      isBookmarked: (id) => get().bookmarkIds.includes(id),
    }),
    {
      name: 'movie-app-storage',
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        primaryColor: state.primaryColor,
        headerText: state.headerText,
        allDownloadEnabled: state.allDownloadEnabled,
        wifiOnlyDownload: state.wifiOnlyDownload,
        bookmarkIds: state.bookmarkIds,
      }),
    }
  )
)
