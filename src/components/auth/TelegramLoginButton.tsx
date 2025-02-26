'use client';

import { useAuthContext } from '@/providers/AuthProvider';
import { useEffect, useRef } from 'react';

export default function TelegramLoginButton({ botName }: { botName: string }) {
  const { login } = useAuthContext();
  const telegramLoginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', '/api/auth/telegram');
    script.setAttribute('data-request-access', 'write');

    script.onload = () => {
      console.log('Telegram Widget загружен');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [botName, login]);

  return (
    <div ref={telegramLoginRef} id="telegram-login" className="flex justify-center">
      <style jsx>{`
        #telegram-login iframe {
          position: relative !important;
          z-index: 10 !important;
          width: 100% !important;
          max-width: 300px !important;
          height: 48px !important;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}