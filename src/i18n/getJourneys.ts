import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';
import type { Dictionary } from './LocaleContext';

export type JourneyItem = {
  id: string;
  year: string;
  title: unknown;
  description: unknown;
};

type JourneyDoc = {
  id: string;
  year?: unknown;
  title?: unknown;
  description?: unknown;
};

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

const fallbackJourneys = (dictionary: Dictionary): JourneyItem[] => [
  {
    id: 'fallback-2014',
    year: '2014',
    title: getDictionaryString(dictionary, 'journeySection.title2014'),
    description: getDictionaryString(dictionary, 'journeySection.desc2014'),
  },
  {
    id: 'fallback-2018',
    year: '2018',
    title: getDictionaryString(dictionary, 'journeySection.title2018'),
    description: getDictionaryString(dictionary, 'journeySection.desc2018'),
  },
  {
    id: 'fallback-2023',
    year: '2023',
    title: getDictionaryString(dictionary, 'journeySection.title2023'),
    description: getDictionaryString(dictionary, 'journeySection.desc2023'),
  },
].filter((item) => item.title.length > 0 || item.description.length > 0);

export const getJourneys = cache(async (locale: Locale, dictionary: Dictionary): Promise<JourneyItem[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'journeys',
      pagination: false,
      locale,
      fallbackLocale: false,
      sort: '_order',
      select: {
        year: true,
        title: true,
        description: true,
      },
    });

    const items = (result.docs as JourneyDoc[])
      .map((doc, index) => ({
        id: doc.id,
        year: typeof doc.year === 'string' ? doc.year : '',
        title: doc.title ?? '',
        description: doc.description ?? '',
        index,
      }))
      .filter((item) => item.year.length > 0 || item.title || item.description)
      .map(({ index, ...item }) => ({
        ...item,
        id: item.id || `journey-${index}`,
      }));

    if (items.length > 0) {
      return items;
    }
  } catch {
    // If the collection schema has not been applied yet, fall back to bundled copy.
  }

  return fallbackJourneys(dictionary);
});