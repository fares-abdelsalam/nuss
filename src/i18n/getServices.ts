import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';

export type ServicePoint = {
  title: unknown;
  description: unknown;
};

export type ServiceItem = {
  id: string;
  key: string;
  title: unknown;
  image: string;
  points: ServicePoint[];
};

type PayloadPoint = {
  title?: unknown;
  description?: unknown;
};

type PayloadService = {
  id: string;
  key?: string | null;
  title?: unknown;
  image?: string | null;
  points?: PayloadPoint[];
};

export const getServices = cache(async (locale: Locale): Promise<ServiceItem[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'services',
        pagination: false,
        locale,
        fallbackLocale: false,
        sort: '_order',
        select: {
        key: true,
        title: true,
        image: true,
        points: true,
      },
    });

    return (result.docs as PayloadService[]).map((doc) => ({
      id: doc.id,
      key: typeof doc.key === 'string' ? doc.key : '',
      title: doc.title ?? '',
      image: typeof doc.image === 'string' ? doc.image : '',
      points: (doc.points || [])
        .filter(
          (point): point is Required<PayloadPoint> =>
            point?.title != null && point?.description != null,
        )
        .map((point) => ({
          title: point.title,
          description: point.description,
        })),
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
});
