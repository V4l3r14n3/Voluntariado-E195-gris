import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import type { AppLang } from '@/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2) as AppLang;

  const set = (lng: AppLang) => {
    if (lng !== current) i18n.changeLanguage(lng);
  };

  const baseBtn = 'px-2 py-1 text-xs font-semibold rounded-sm transition-colors';
  const active = 'bg-primary text-primary-foreground';
  const inactive = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Languages className="size-3.5 text-muted-foreground" aria-hidden />
      <div className="inline-flex items-center gap-0.5 rounded-sm border border-border bg-card p-0.5">
        <button
          type="button"
          onClick={() => set('es')}
          aria-pressed={current === 'es'}
          className={`${baseBtn} ${current === 'es' ? active : inactive}`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => set('en')}
          aria-pressed={current === 'en'}
          className={`${baseBtn} ${current === 'en' ? active : inactive}`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
