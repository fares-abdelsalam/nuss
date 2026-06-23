import 'server-only';

import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';
import { partnerLogoOptions } from '../content/partnerLogos';

export type Partner = {
  id: string;
  name: string;
  logo: string;
};

export type PartnersSectionData = {
  title?: unknown;
  description?: unknown;
  partners: Partner[];
  profileFileUrl: string | null;
};

type PayloadPartner = {
  id: string | number;
  name?: string | null;
  uploadedLogo?: { url?: string | null } | string | number | null;
  baseLogo?: string | null;
};

type PayloadPartnersDoc = {
  id: string;
  title?: unknown;
  description?: unknown;
  profileFile?: { url?: string | null } | string | number | null;
  partners?: PayloadPartner[] | null;
};

/**
 * Build a default partner list from available logos when no CMS data exists yet.
 */
const buildDefaultPartners = (): Partner[] =>
  partnerLogoOptions.map((opt, idx) => ({
    id: String(idx),
    name: opt.label,
    logo: opt.value,
  }));

function resolveMediaUrl(media: any): string {
  if (typeof media === 'object' && media !== null && typeof media.url === 'string') {
    return media.url;
  }
  return '';
}

export const getPartnersSection = cache(async (locale: Locale): Promise<PartnersSectionData> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'partners-section',
      where: {
        key: {
          equals: 'main',
        },
      },
      locale,
      fallbackLocale: false,
      depth: 1,
    });

    const doc = (result.docs as unknown as PayloadPartnersDoc[])[0];

    if (!doc) {
      return { partners: buildDefaultPartners(), profileFileUrl: null };
    }

    const profileFileUrl = resolveMediaUrl(doc.profileFile) || null;

    const partners: Partner[] = (doc.partners || []).map((p) => {
      let logoUrl = '';
      
      // Prioritize the uploaded custom logo
      if (p.uploadedLogo && typeof p.uploadedLogo === 'object' && 'url' in p.uploadedLogo && p.uploadedLogo.url) {
        logoUrl = p.uploadedLogo.url;
      } else if (typeof p.baseLogo === 'string') {
        // Fallback to the base logo from project files
        logoUrl = p.baseLogo;
      }

      return {
        id: String(p.id),
        name: typeof p.name === 'string' ? p.name : '',
        logo: logoUrl,
      };
    });

    return {
      title: doc.title,
      description: doc.description,
      partners,
      profileFileUrl,
    };
  } catch (error) {
    console.error('Error fetching partners section:', error);
    return { partners: buildDefaultPartners(), profileFileUrl: null };
  }
});
