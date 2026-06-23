import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './LocaleContext';
import { getPayloadClient } from './getPayloadClient';
import { translationSections } from './translationCollections';
import arDictionary from './dictionaries/ar.json';
import enDictionary from './dictionaries/en.json';

type DictionaryDoc = {
  key: string;
  value?: unknown;
};

const setNestedValue = (
  target: Record<string, unknown>,
  keyPath: string,
  value: unknown,
) => {
  const parts = keyPath.split('.');
  let cursor: Record<string, unknown> = target;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const isLeaf = index === parts.length - 1;

    if (isLeaf) {
      cursor[part] = value;
      return;
    }

    const nextValue = cursor[part];
    if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) {
      cursor[part] = {};
    }

    cursor = cursor[part] as Record<string, unknown>;
  }
};

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const baseDictionary = locale === 'en' ? enDictionary : arDictionary;
  
  try {
    const payload = await getPayloadClient();
    const dictionary: Record<string, unknown> = JSON.parse(JSON.stringify(baseDictionary));

    const results = await Promise.all(
      translationSections.map((section) =>
        payload.find({
          collection: section.slug,
          pagination: false,
          locale,
          fallbackLocale: false,
          sort: 'key',
          select: {
            key: true,
            value: true,
          },
        })),
    );

    results.forEach((result, index) => {
      const section = translationSections[index];

      for (const doc of result.docs as DictionaryDoc[]) {
        if (typeof doc.key !== 'string' || doc.value == null) {
          continue;
        }

        if (!dictionary[section.key] || typeof dictionary[section.key] !== 'object') {
          dictionary[section.key] = {};
        }

        setNestedValue(dictionary[section.key] as Record<string, unknown>, doc.key, doc.value);
      }
    });

    return dictionary as Dictionary;
  } catch (error) {
    console.error('Failed to fetch dictionary from CMS, falling back to local files:', error);
    return baseDictionary as Dictionary;
  }
});
