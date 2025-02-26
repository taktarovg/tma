// src/components/layout/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Calendar, UserCircle, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/providers/AuthProvider';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const items = [
    {
      id: 'home',
      href: '/',
      label: 'Главная',
      icon: Home,
    },
    {
      id: 'favorites',
      href: user ? '/favorites' : '/login',
      label: 'Избранное',
      icon: Heart,
    },
    {
      id: 'bookings',
      href: user ? '/bookings' : '/login',
      label: 'К мастерам',
      icon: Calendar,
    },
    // Специальный пункт меню для мастеров
    ...(user?.role === 'MASTER' ? [
      {
        id: 'master-schedule',
        href: '/master/schedule',
        label: 'Ко мне',
        icon: CalendarClock,
      },
    ] : []),
    {
      id: 'profile',
      href: user ? '/profile' : '/login',
      label: 'Профиль',
      icon: UserCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="max-w-[800px] mx-auto">
        <div className="flex justify-around items-center h-14">
          {items.map(({ id, href, label, icon: Icon }) => {
            const isActive = pathname
              ? pathname === href || pathname.startsWith(`${href}/`)
              : false; // Проверка на null
            return (
              <Link
                key={id}
                href={href}
                className={cn(
                  'flex flex-col items-center px-3 py-1 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'text-pink-600 shadow-[0_0_12px_rgba(213,63,140,0.3)]' 
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}