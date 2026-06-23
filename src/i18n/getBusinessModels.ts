import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';

export type BusinessModelItem = {
  id: string;
  key: string;
  title: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
};

type PayloadBusinessModel = {
  id: string;
  key?: string | null;
  title?: unknown;
  media?: {
    url?: string | null;
    mimeType?: string | null;
  } | number | string | null;
};

export const getBusinessModels = cache(async (locale: Locale): Promise<BusinessModelItem[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'business-models',
      pagination: false,
      locale,
      fallbackLocale: false,
      sort: '_order',
      select: {
        key: true,
        title: true,
        media: true,
      },
      depth: 1,
    });

    return (result.docs as PayloadBusinessModel[]).map((doc) => ({
      id: doc.id,
      key: typeof doc.key === 'string' ? doc.key : '',
      title: typeof doc.title === 'string' ? doc.title : '',
      mediaType: typeof doc.media === 'object' && doc.media !== null && typeof doc.media.mimeType === 'string' && doc.media.mimeType.startsWith('video/')
        ? 'video'
        : 'image',
      mediaUrl: typeof doc.media === 'object' && doc.media !== null && typeof doc.media.url === 'string'
        ? doc.media.url
        : '',
    }));
  } catch (error) {
    console.error('Error fetching business models:', error);
    return [];
  }
});