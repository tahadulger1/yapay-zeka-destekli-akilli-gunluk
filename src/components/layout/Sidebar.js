"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { IconDashboard, IconTasks, IconNotes, IconCalendar, IconChevronLeft, IconChevronRight, IconZap } from '@/components/Icons';

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: IconDashboard },
  { href: '/tasks', labelKey: 'nav.tasks', icon: IconTasks },
  { href: '/notes', labelKey: 'nav.notes', icon: IconNotes },
  { href: '/events', labelKey: 'nav.events', icon: IconCalendar },
];

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      role="navigation"
      aria-label={t('a11y.mainNav')}
    >
      {/* Logo */}
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-logo" onClick={onCloseMobile}>
          <div className="sidebar-logo-icon">
            <IconZap width={20} height={20} />
          </div>
          <span className="sidebar-logo-text">AI-To</span>
        </Link>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={t('a11y.toggleSidebar')}
        >
          {collapsed ? <IconChevronRight width={16} height={16} /> : <IconChevronLeft width={16} height={16} />}
        </button>
      </div>

      {/* Navigasyon */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{t('nav.menu')}</div>
        <ul>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <li className="nav-item" key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onCloseMobile}
                >
                  <Icon />
                  <span className="nav-link-label">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
