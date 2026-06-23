import { cookies, headers } from 'next/headers';
import { COOKIE_NAME, Locale, i18n } from '@/i18n/config';
import { getHomePageData } from '@/i18n/getHomePageData';
import { LocaleProvider } from '@/i18n/LocaleContext';
import { HomePageClient } from './HomePageClient';

export default async function Home() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = (cookieStore.get(COOKIE_NAME)?.value || i18n.defaultLocale) as Locale;
  const homePageData = await getHomePageData();
  const forwardedHost = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? 'localhost:3000';
  const forwardedProto = headerStore.get('x-forwarded-proto') ?? 'http';
  const serverURL = `${forwardedProto}://${forwardedHost}`;

  return (
    <LocaleProvider
      locale={locale}
      dictionaries={{
        ar: homePageData.ar.dictionary,
        en: homePageData.en.dictionary,
      }}
    >
      <HomePageClient data={homePageData} serverURL={serverURL} />
    </LocaleProvider>
  );
}
