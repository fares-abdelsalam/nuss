import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';


export type MethodologyCard = {
  id: string;
  title: unknown;
  description: unknown;
  color: string;
  iconType: 'default' | 'custom';
  iconName?: string;
  customIconUrl?: string;
};

export type MethodologySectionData = {
  title?: unknown;
  cards: MethodologyCard[];
};

export const getMethodologySection = cache(async (locale: Locale): Promise<MethodologySectionData> => {
  const defaultResponse = { title: '', cards: [] };

  try {
    const payload = await getPayloadClient();

    // Fetch title from methodology_section translation collection
    const titleResult = await payload.find({
      collection: 'methodology_section',
      where: {
        key: {
          equals: 'titleLine1',
        },
      },
      locale,
      depth: 1,
    });

    const sectionTitle = titleResult.docs?.[0]?.value || '';

    // Fetch cards from methodologies collection
    const result = await payload.find({
      collection: 'methodologies',
      pagination: false,
      locale,
      fallbackLocale: false,
      depth: 2,
    });

    const cards = Array.isArray(result.docs) ? result.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title ?? '',
      description: doc.description ?? '',
      color: typeof doc.color === 'string' ? doc.color : '#FF279E',
      iconType: doc.iconType || 'default',
      iconName: doc.iconName,
      customIconUrl: typeof doc.customIcon === 'object' ? doc.customIcon?.url : undefined,
    })) : [];

    return {
      title: sectionTitle,
      cards,
    };
  } catch (error) {
    console.error('Failed to fetch methodology section data:', error);
    return defaultResponse;
  }
});
