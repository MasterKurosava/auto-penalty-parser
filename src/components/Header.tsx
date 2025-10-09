'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, Key, BarChart3 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface HeaderProps {
  username?: string
}

export const Header = React.memo(function Header({ username }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        toast.success('Вы вышли из системы')
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      toast.error('Ошибка выхода')
    }
  }, [router])

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            AFP
          </Link>

          {username && (
            <nav className="hidden md:flex items-center gap-4">
                      <Link href="/ecp">
                        <Button
                          variant={pathname === '/ecp' ? 'default' : 'ghost'}
                          size="sm"
                          className={pathname === '/ecp' ? 'bg-primary' : ''}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Мои Сессии
                        </Button>
                      </Link>
                      <Link href="/fines">
                        <Button
                          variant={pathname === '/fines' ? 'default' : 'ghost'}
                          size="sm"
                          className={pathname === '/fines' ? 'bg-primary' : ''}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Штрафы
                        </Button>
                      </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {username && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {username}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {username && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Выйти</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
})
