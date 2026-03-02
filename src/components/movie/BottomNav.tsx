'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Film, Tv, Search } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'movies', label: 'Movies', icon: Film, path: '/movies' },
  { id: 'series', label: 'Series', icon: Tv, path: '/series' },
  { id: 'search', label: 'Search', icon: Search, path: null }, // No path, uses state
]

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { primaryColor, currentPage, setCurrentPage } = useAppStore()

  // Determine active nav based on pathname and currentPage
  const getActiveNav = () => {
    if (currentPage === 'search') return 'search'
    if (pathname === '/') return 'home'
    if (pathname === '/movies') return 'movies'
    if (pathname === '/series') return 'series'
    if (pathname.startsWith('/movie/') || pathname.startsWith('/series/')) {
      if (pathname.startsWith('/movie/')) return 'movies'
      if (pathname.startsWith('/series/')) return 'series'
    }
    return 'home'
  }

  const activeNav = getActiveNav()

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'search') {
      // For search, set state and navigate to home
      setCurrentPage('search')
      router.push('/')
    } else {
      // For other items, clear search state and navigate
      if (currentPage === 'search') {
        setCurrentPage('home')
      }
      if (item.path) {
        router.push(item.path)
      }
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors min-w-[60px]'
              )}
              style={{ color: isActive ? primaryColor : '#9ca3af' }}
            >
              <Icon 
                className={cn('w-5 h-5')} 
                style={isActive ? { fill: `${primaryColor}20`, color: primaryColor } : undefined} 
              />
              <span className="text-xs">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
