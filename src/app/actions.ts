"use server"

import { cookies } from 'next/headers';
import { COOKIE_NAME, Locale } from '@/i18n/config';

export async function updateLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, { path: '/' });
}