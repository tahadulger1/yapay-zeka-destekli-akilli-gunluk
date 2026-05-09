"use client";
import { useState, useRef } from 'react';
import useSWR from 'swr';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/Toast';
import { speak } from '@/lib/speechFeedback';
import { IconSend, IconZap } from '@/components/Icons';
import { demoFetch } from '@/lib/demo-user-client';

export default function AIInputBar({ onTaskCreated }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);
  const { data: demoUserData, mutate: mutateDemoUser } = useSWR('/api/demo-user');
  const inputRef = useRef(null);
  const { t, lang } = useLanguage();
  const { addToast } = useToast();
  const aiQuota = demoUserData?.demoUser?.aiQuota;
  const isQuotaKnown = typeof aiQuota === 'number';
  const quotaExhausted = isQuotaKnown && aiQuota <= 0;
  const quotaText = lang === 'tr' ? `Kalan AI hakki: ${aiQuota}` : `AI credits left: ${aiQuota}`;
  const quotaExhaustedText = lang === 'tr'
    ? 'Demo AI hakkiniz doldu. QR demo icin yeni tarayici veya temiz localStorage ile yeni demo oturumu baslatabilirsiniz.'
    : 'Your demo AI credits are used up. For the QR demo, start a new demo session with a fresh browser or cleared localStorage.';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || rateLimitCooldown) return;

    if (quotaExhausted) {
      addToast(quotaExhaustedText, 'warning');
      speak(quotaExhaustedText, lang);
      return;
    }

    if (text.length < 3) {
      addToast(t('toast.errorShort'), 'warning');
      speak(t('speech.errorShort'), lang);
      return;
    }

    setLoading(true);
    try {
      const response = await demoFetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-secret': process.env.NEXT_PUBLIC_APP_API_SECRET
        },
        body: JSON.stringify({ text })
      });

      if (response.status === 429) {
        addToast(t('toast.errorRateLimit'), 'error');
        speak(t('speech.errorRateLimit'), lang);
        setRateLimitCooldown(true);
        setTimeout(() => setRateLimitCooldown(false), 30000);
        return;
      }

      const data = await response.json();

      if (response.status === 403 && data.error) {
        addToast(data.error, 'warning');
        speak(data.error, lang);
        mutateDemoUser();
        return;
      }

      if (!response.ok) throw new Error(data.error || 'API hatasi');

      const type = data.result.type;
      const toastKey = type === 'note' ? 'toast.noteCreated' : type === 'event' ? 'toast.eventCreated' : 'toast.taskCreated';
      const speechKey = type === 'note' ? 'speech.noteCreated' : type === 'event' ? 'speech.eventCreated' : 'speech.taskCreated';

      addToast(t(toastKey), 'success');
      speak(t(speechKey), lang);
      if (data.demoUser) {
        mutateDemoUser({ demoUser: data.demoUser }, false);
      } else {
        mutateDemoUser();
      }
      onTaskCreated?.(data.savedRecord || { type, text });
      setInput('');
    } catch {
      addToast(t('toast.errorGeneral'), 'error');
      speak(t('speech.errorGeneral'), lang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-input-section" aria-label="AI gorev girisi">
      <form onSubmit={handleSubmit} role="search">
        <div className={`ai-input-wrapper ${loading ? 'loading' : ''}`}>
          <input
            ref={inputRef}
            id="ai-input"
            type="text"
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={quotaExhausted ? quotaExhaustedText : t('dashboard.aiPlaceholder')}
            disabled={loading || quotaExhausted}
            aria-label={t('dashboard.aiPlaceholder')}
            autoComplete="off"
          />
          <button type="submit" className="ai-submit-btn" disabled={!input.trim() || loading || rateLimitCooldown || quotaExhausted} aria-label={t('dashboard.aiSend')}>
            {loading ? <span className="spinner spinner-sm" /> : <IconSend />}
            <span>
              {loading
                ? t('dashboard.aiThinking')
                : quotaExhausted
                  ? (lang === 'tr' ? 'Hak bitti' : 'No credits')
                : rateLimitCooldown
                  ? (lang === 'tr' ? 'Bekleyin...' : 'Wait...')
                  : t('dashboard.aiSend')}
            </span>
          </button>
          {loading && <div className="ai-loading-bar" />}
        </div>
      </form>
      <div className="ai-hint">
        <IconZap width={14} height={14} />
        <span>
          {t('dashboard.aiHint')}
        </span>
        {isQuotaKnown && (
          <strong className={`ai-quota-pill ${quotaExhausted ? 'exhausted' : ''}`}>
            {quotaText}
          </strong>
        )}
      </div>
      {quotaExhausted && (
        <p className="ai-quota-message" role="status">
          {quotaExhaustedText}
        </p>
      )}
    </section>
  );
}
