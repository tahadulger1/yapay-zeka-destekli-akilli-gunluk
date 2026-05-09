"use client";
import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { toggleSpeech, isSpeechEnabled, speak } from '@/lib/speechFeedback';
import { IconSearch, IconBell, IconGlobe, IconMenu, IconVolume, IconVolumeX, IconEye } from '@/components/Icons';
import { useState, useEffect } from 'react';

export default function Header({ sidebarCollapsed, onToggleMobileMenu }) {
  const { t, lang, toggleLang } = useLanguage();
  const [voiceOn, setVoiceOn] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setVoiceOn(isSpeechEnabled());
    const isHC = localStorage.getItem('ai-to-high-contrast') === 'true';
    if (isHC) {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
  }, []);
  const searchRef = useRef(null);

  useKeyboardNav({
    onSearch: () => searchRef.current?.focus(),
  });

  const handleVoiceToggle = () => {
    const newState = toggleSpeech();
    setVoiceOn(newState);
    if (newState) {
      speak(t('speech.voiceEnabled'), lang);
    }
  };

  const handleHighContrastToggle = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    localStorage.setItem('ai-to-high-contrast', String(newState));
    if (newState) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  return (
    <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} role="banner">
      <div className="header-left">
        <button
          className="header-btn hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label={t('a11y.toggleMenu')}
        >
          <IconMenu />
        </button>

        <div className="header-search">
          <IconSearch className="header-search-icon" />
          <input
            ref={searchRef}
            type="search"
            className="header-search-input"
            placeholder={`${t('header.search')} ( / )`}
            aria-label={t('header.search')}
          />
        </div>
      </div>

      <div className="header-actions">
        <button
          className={`header-btn voice-toggle ${voiceOn ? 'active' : ''}`}
          onClick={handleVoiceToggle}
          aria-label={t('header.voice')}
          aria-pressed={voiceOn}
        >
          {voiceOn ? <IconVolume /> : <IconVolumeX />}
        </button>

        <button
          className={`header-btn ${highContrast ? 'active' : ''}`}
          onClick={handleHighContrastToggle}
          aria-label={t('header.highContrast')}
          aria-pressed={highContrast}
        >
          <IconEye />
        </button>

        <button className="header-btn" aria-label={t('header.notifications')}>
          <IconBell />
        </button>

        <button className="lang-toggle" onClick={toggleLang} aria-label={t('header.lang')}>
          <IconGlobe width={16} height={16} />
          <span>{lang.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
}
