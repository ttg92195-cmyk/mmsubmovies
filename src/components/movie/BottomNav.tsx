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
  { id: 'search', label: 'Search', icon: Search, path: '/?page=search' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { primaryColor } = useAppStore()

  // Determine active nav based on pathname
  const getActiveNav = () => {
    if (pathname === '/') return 'home'
    if (pathname === '/movies') return 'movies'
    if (pathname === '/series') return 'series'
    if (pathname.startsWith('/movie/') || pathname.startsWith('/series/')) {
      // On detail pages, highlight based on type
      if (pathname.startsWith('/movie/')) return 'movies'
      if (pathname.startsWith('/series/')) return 'series'
    }
    return 'home'
  }

  const activeNav = getActiveNav()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          
          return (
            <Link
              key={item.id}
              href={item.path}
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
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
