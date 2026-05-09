"use client";
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/components/Toast';
import { useEffect } from 'react';
import { initSpeech } from '@/lib/speechFeedback';
import { SWRConfig } from 'swr';
import { swrOptions } from '@/lib/swr-config';

export default function Providers({ children }) {
  useEffect(() => { initSpeech(); }, []);

  return (
    <SWRConfig value={swrOptions}>
      <LanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </LanguageProvider>
    </SWRConfig>
  );
}
