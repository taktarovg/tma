// src/components/layout/SideMenu.tsx
'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const menuItems = [
    { label: 'О сервисе', href: '/about' },
    { label: 'Пользовательское соглашение', href: '/terms' }, // Заглушка
    { label: 'Тарифы', href: '/pricing' }, // Заглушка
    { label: 'Вопросы-ответы', href: '/faq' }, // Заглушка
    { label: 'Блог', href: '/blog' }, // Заглушка
    { label: 'Контакты', href: '/contacts' }, // Заглушка
  ];

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-white transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4 border-b">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 py-4">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href} passHref>
                <button
                  className="w-full text-left px-6 py-3 hover:bg-gray-50 text-gray-700 focus:outline-none"
                  onClick={onClose} // Закрываем меню при клике
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          <div className="p-6 border-t text-sm text-gray-500">
            © 2025 TopInBeauty
          </div>
        </div>
      </div>
    </div>
  );
}