import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, Search, MessageSquare, FileText,
  BookOpen, UserCircle, LogOut, ShieldCheck, CalendarPlus, Award
} from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(['sidebar', 'common']);

  if (!user) return null;

  const adminLinks = [
    { to: '/dashboard', label: t('sidebar:nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/organizations', label: t('sidebar:nav.organizations'), icon: Building2 },
    { to: '/forum', label: t('sidebar:nav.forum'), icon: MessageSquare },
    { to: '/profile', label: t('sidebar:nav.profile'), icon: UserCircle },
  ];
  const orgLinks = [
    { to: '/dashboard', label: t('sidebar:nav.dashboard'), icon: LayoutDashboard },
    { to: '/opportunities', label: t('sidebar:nav.opportunities'), icon: CalendarPlus },
    { to: '/forum', label: t('sidebar:nav.forum'), icon: MessageSquare },
    { to: '/blog', label: t('sidebar:nav.blog'), icon: BookOpen },
    { to: '/reports', label: t('sidebar:nav.reports'), icon: FileText },
    { to: '/profile', label: t('sidebar:nav.profile'), icon: UserCircle },
  ];
  const volunteerLinks = [
    { to: '/dashboard', label: t('sidebar:nav.dashboard'), icon: LayoutDashboard },
    { to: '/search', label: t('sidebar:nav.findOpportunities'), icon: Search },
    { to: '/forum', label: t('sidebar:nav.forum'), icon: MessageSquare },
    { to: '/blog', label: t('sidebar:nav.blog'), icon: BookOpen },
    { to: '/reports', label: t('sidebar:nav.myReports'), icon: Award },
    { to: '/profile', label: t('sidebar:nav.profile'), icon: UserCircle },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'organization' ? orgLinks : volunteerLinks;
  const roleLabel = t(`common:roles.${user.role}` as const);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-64 border-r border-border bg-card flex flex-col shrink-0 h-screen sticky top-0"
    >
      <div className="h-14 flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <span className="font-semibold tracking-tight text-base">{t('common:brand')}</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          {t('sidebar:panel', { role: roleLabel })}
        </div>
        {links.map((link, i) => {
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
          return (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
            >
              <Link
                to={link.to as any}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <link.icon className="size-4" />
                <span>{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border shrink-0">
        <div className="px-2 mb-3">
          <LanguageToggle />
        </div>
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="size-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
        >
          <LogOut className="size-4" />
          {t('common:signOut')}
        </motion.button>
      </div>
    </motion.aside>
  );
}
