import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { IBM_Plex_Sans_Arabic, Cairo } from 'next/font/google';
import { COOKIE_NAME, Locale, i18n } from '@/i18n/config';
import '../globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  subsets: ['arabic'],
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic'],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get(COOKIE_NAME)?.value || i18n.defaultLocale) as Locale;

  return {
    title: locale === 'ar' ? 'Nuss - نصنع الأثر' : 'Nuss - We create the impact',
    description: locale === 'ar' ? 'نصنع الأثر الذي يميزك' : 'that distinguishes you',
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
    },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get(COOKIE_NAME)?.value || i18n.defaultLocale) as Locale;

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${ibmPlexSansArabic.variable} ${cairo.variable}`}>{children}</body>
    </html>
  );
}
