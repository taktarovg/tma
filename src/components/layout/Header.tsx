// src/components/layout/Header.tsx - update
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, LogOut, Menu } from 'lucide-react'
import { useAuthContext } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { SideMenu } from './SideMenu'

export function Header() {
  const { user, logout } = useAuthContext()
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем наличие текущей сессии
    const checkSession = async () => {
      try {
        const response = await fetch('/api/profile')
        setIsLoading(false)
      } catch (error) {
        console.error('Session check error:', error)
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex items-center gap-1">
              <h1 className="text-xl font-semibold">TopInBeauty</h1>
              <Crown 
                className="h-5 w-5 stroke-black" 
                fill="#FFD700"  // Добавляем золотую заливку
                strokeWidth={1.5}  // Делаем контур чуть тоньше для лучшего вида
              />
            </Link>

            <div className="flex items-center gap-4">
              {isLoading ? null : (
                <>
                  {user ? (
                    <button 
                      onClick={logout}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Выйти"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  ) : (
                    <Button 
                      asChild
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Link href="/login">Войти</Link>
                    </Button>
                  )}
                </>
              )}
              <button 
                onClick={() => setIsSideMenuOpen(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Меню"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
      />
    </>
  )
}