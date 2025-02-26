// src/app/(protected)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import TelegramAutoAuth from '@/components/telegram/TelegramAutoAuth';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { TelegramHeader } from '@/components/telegram/TelegramHeader';
import { Navigation } from '@/components/layout/Navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const { isReady, isInTelegram } = useTelegramClient();

  useEffect(() => {
    console.log('ProtectedLayout useEffect - user:', user, 'isLoading:', isLoading, 'isReady:', isReady, 'isInTelegram:', isInTelegram);
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router, isReady, isInTelegram]);

  console.log('ProtectedLayout render - isLoading:', isLoading, 'isReady:', isReady, 'isInTelegram:', isInTelegram, 'user:', user);

  if (isLoading || !isReady) {
    console.log('Rendering TelegramAutoAuth due to loading or not ready');
    return <TelegramAutoAuth />;
  }

  if (!isInTelegram) {
    console.log('Rendering redirect to Telegram');
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-xl font-bold">TopInBeauty</h1>
          <p className="mb-4">
            Это приложение работает только в Telegram.
          </p>
          <a 
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
            className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Открыть в Telegram
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Rendering TelegramAutoAuth due to no user');
    return <TelegramAutoAuth />;
  }

  console.log('Rendering protected content with user:', user);
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <TelegramHeader 
        title="TopInBeauty" 
        transparent={false}
      />
      <main className="flex-1 p-4">
        {children}
      </main>
      <Navigation />
    </div>
  );
}