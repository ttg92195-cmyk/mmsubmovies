'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  X,
  User,
  Bookmark,
  Download,
  Film,
  Settings,
  Database,
  LogOut,
  Crown,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppStore, Page } from '@/store'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: Page
  label: string
  icon: typeof User
  adminOnly?: boolean
}

const menuItems: MenuItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'bookmark', label: 'Bookmark', icon: Bookmark },
  { id: 'download', label: 'Download', icon: Download },
  { id: 'genres', label: 'Genres', icon: Film },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'tmdb', label: 'TMDB Generator', icon: Database, adminOnly: true },
]

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const router = useRouter()
  const { user, setCurrentPage, logout, setSidebarOpen } = useAppStore()
  const [showLogin, setShowLogin] = useState(false)

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
    onOpenChange(false)
    if (page === 'tmdb' || page === 'settings') {
      // These pages might need additional handling
    }
  }

  const handleLogout = () => {
    logout()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] bg-[#1E1E1E] border-r border-border p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left text-lg font-bold text-primary">
            Menu
          </SheetTitle>
        </SheetHeader>

        {/* User Profile Section */}
        <div className="p-4 border-b border-border">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.username} width={48} height={48} className="object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.username}</p>
                <div className="flex items-center gap-1">
                  {user.isPremium && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                  {user.isAdmin && (
                    <span className="text-xs text-muted-foreground">Admin</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onOpenChange(false)
                setCurrentPage('account')
              }}
            >
              Login
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            if (item.adminOnly && !user?.isAdmin) return null
            
            const Icon = item.icon
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {user && (
          <>
            <Separator className="bg-border" />
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
