"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');

    // Navigate to the same path with new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1 bg-white">
      {locales.map((loc) => (
        <Button
          key={loc}
          onClick={() => switchLocale(loc)}
          variant={locale === loc ? "default" : "ghost"}
          size="sm"
          className={`
            min-w-[50px] text-sm font-medium transition-all
            ${locale === loc
              ? 'bg-[#FF6B35] text-white hover:bg-[#ff5722]'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
