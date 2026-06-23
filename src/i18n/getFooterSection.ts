import 'server-only';
import { cache } from 'react';
import type { Locale } from './config';
import { getPayloadClient } from './getPayloadClient';

export type SocialPlatform = 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'whatsapp' | 'tiktok' | 'website' | 'email';

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

type FooterSectionDoc = {
  footerText?: unknown;
  socialLinks?: SocialLink[] | null;
};

export type FooterSectionData = {
  footerText?: unknown;
  socialLinks: SocialLink[];
};

export const getFooterSection = cache(
  async (locale: Locale): Promise<FooterSectionData> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: 'footer-data',
        pagination: false,
        locale,
        fallbackLocale: false,
        depth: 1,
      });

      const doc = result.docs[0] as FooterSectionDoc | undefined;
      if (!doc) {
        return { socialLinks: [] };
      }

      return {
        footerText: doc.footerText,
        socialLinks: (doc.socialLinks ?? []).map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch footer section:', error);
      return { socialLinks: [] };
    }
  },
);
