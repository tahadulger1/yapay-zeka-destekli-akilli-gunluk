"use client";
import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleCollapse = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="app-layout">
      {/* Mobil Overlay */}
      <div
        className={`app-sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={closeMobileMenu}
      />

      {/* Ana Alan */}
      <div className={`app-main-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleMobileMenu={toggleMobileMenu}
        />
        <main id="main-content" className="main-content" role="main">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
