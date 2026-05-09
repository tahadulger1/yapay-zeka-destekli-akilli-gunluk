"use client";
import { useEffect, useCallback } from 'react';

export function useKeyboardNav({ onSearch, onNewTask, onEscape }) {
  const handleKeyDown = useCallback((e) => {
    // Modal veya input aktifken kısayolları devre dışı bırak
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (e.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }

    if (isInput) return;

    // / tuşu ile arama odaklama
    if (e.key === '/' && onSearch) {
      e.preventDefault();
      onSearch();
    }

    // Ctrl+N ile yeni görev
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && onNewTask) {
      e.preventDefault();
      onNewTask();
    }
  }, [onSearch, onNewTask, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
