import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';
import type { Dictionary } from './LocaleContext';


const getDictionaryString = (dictionary: Dictionary, path: string) => {
  const parts = path.split('.');
  let value: unknown = dictionary;

  for (const part of parts) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !(part in value)) {
      return '';
    }

    value = (value as Record<string, unknown>)[part];
  }

  return typeof value === 'string' ? value : '';
};

export type JourneyStat = {
  number: number;
  prefix?: string;
  suffix?: string;
  label: unknown;
};

export type JourneySectionData = {
  sectionTitle: unknown;
  introTitle: unknown;
  introDescription: unknown;
  stats: JourneyStat[];
};

export const getJourneySection = cache(async (locale: Locale, dictionary: Dictionary): Promise<JourneySectionData> => {
  const fallback: JourneySectionData = {
    sectionTitle: getDictionaryString(dictionary, 'journeySection.sectionTitle'),
    introTitle: getDictionaryString(dictionary, 'journeySection.introTitle'),
    introDescription: getDictionaryString(dictionary, 'journeySection.introDescription'),
    stats: [
      { number: 120, suffix: getDictionaryString(dictionary, 'journeySection.plusSuffixDesktop'), label: getDictionaryString(dictionary, 'journeySection.projects') },
      { number: 900, prefix: getDictionaryString(dictionary, 'journeySection.percentPrefix'), label: getDictionaryString(dictionary, 'journeySection.localization') },
      { number: 350, suffix: getDictionaryString(dictionary, 'journeySection.plusSuffixDesktop'), label: getDictionaryString(dictionary, 'journeySection.clients') },
    ],
  };

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'journey-section-data',
      pagination: false,
      locale,
      fallbackLocale: false,
      limit: 1,
    });

    const doc = result.docs[0] as any;

    if (!doc) {
      return fallback;
    }

    return {
      sectionTitle: doc.sectionTitle ?? fallback.sectionTitle,
      introTitle: doc.introTitle ?? fallback.introTitle,
      introDescription: doc.introDescription ?? fallback.introDescription,
      stats: Array.isArray(doc.stats) && doc.stats.length > 0 ? doc.stats.map((s: any) => ({
        number: s.number,
        prefix: s.prefix ?? '',
        suffix: s.suffix ?? '',
        label: s.label ?? '',
      })) : fallback.stats,
    };
  } catch {
    return fallback;
  }
});