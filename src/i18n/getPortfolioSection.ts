import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';

export type PortfolioEntry = {
  title: string;
  logoUrl: string;
  mainMediaUrl: string;
  mainMediaType: 'video' | 'image';
};

export type PortfolioTab = {
  tabId: string;
  tabLabel: string;
  entries: PortfolioEntry[];
};

export type PortfolioSectionData = {
  title?: unknown;
  description?: unknown;
  tabs: PortfolioTab[];
};

type PayloadMediaRef =
  | {
      url?: string | null;
      mimeType?: string | null;
    }
  | number
  | string
  | null
  | undefined;

function resolveMediaUrl(media: PayloadMediaRef): string {
  if (typeof media === 'object' && media !== null && typeof media.url === 'string') {
    return media.url;
  }
  return '';
}

function resolveMediaType(media: PayloadMediaRef): 'video' | 'image' {
  if (
    typeof media === 'object' &&
    media !== null &&
    typeof media.mimeType === 'string' &&
    media.mimeType.startsWith('video/')
  ) {
    return 'video';
  }
  return 'image';
}

type PayloadEntry = {
  title?: unknown;
  logo?: PayloadMediaRef;
  mainMedia?: PayloadMediaRef;
};

type PayloadTab = {
  tabId?: string | null;
  tabLabel?: unknown;
  entries?: PayloadEntry[] | null;
};

type PayloadPortfolioDoc = {
  id: string;
  key?: string | null;
  title?: unknown;
  description?: unknown;
  tabs?: PayloadTab[] | null;
};

export const getPortfolioSection = cache(
  async (locale: Locale): Promise<PortfolioSectionData> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: 'portfolio-section',
        pagination: false,
        locale,
        fallbackLocale: false,
        depth: 2,
      });

      const doc = (result.docs as unknown as PayloadPortfolioDoc[])[0];
      if (!doc) {
        return { tabs: [] };
      }

      const tabs: PortfolioTab[] = (doc.tabs ?? []).map((tab) => ({
        tabId: typeof tab.tabId === 'string' ? tab.tabId : '',
        tabLabel: typeof tab.tabLabel === 'string' ? tab.tabLabel : '',
        entries: (tab.entries ?? []).map((entry) => ({
          title: typeof entry.title === 'string' ? entry.title : '',
          logoUrl: resolveMediaUrl(entry.logo),
          mainMediaUrl: resolveMediaUrl(entry.mainMedia),
          mainMediaType: resolveMediaType(entry.mainMedia),
        })),
      }));

      return { 
        title: doc.title,
        description: doc.description,
        tabs, 
      };
    } catch (error) {
      console.error('Failed to fetch portfolio section:', error);
      return { tabs: [] };
    }
  },
);
