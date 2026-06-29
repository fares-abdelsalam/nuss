import "server-only";

import { cache } from "react";
import type { Locale } from "./config";
import { getPayloadClient } from "./getPayloadClient";
import { partnerLogoOptions } from "../content/partnerLogos";

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
  profileFile?: string | null;
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

export const getPartnersSection = cache(
  async (locale: Locale): Promise<PartnersSectionData> => {
    try {
      const payload = await getPayloadClient();

      // Fetch all media in ONE query to build a map of ID -> URL
      const mediaResult = await payload.find({
        collection: "media",
        limit: 1000,
        depth: 0,
      });
      const mediaMap = new Map(
        mediaResult.docs.map((m) => [String(m.id), m.url]),
      );

      const result = await payload.find({
        collection: "partners-section",
        where: {
          key: {
            equals: "main",
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

      const profileFileUrl =
        typeof doc.profileFile === "string" && doc.profileFile.length > 0
          ? doc.profileFile
          : null;

      const partners: Partner[] = (doc.partners || []).map((p) => {
        let logoUrl = "";

        // Check if uploadedLogo is a string (could be a URL or an old ID)
        if (typeof p.uploadedLogo === "string" && p.uploadedLogo.length > 0) {
          // If it's a URL (starts with http), use it directly
          if (p.uploadedLogo.startsWith("http")) {
            logoUrl = p.uploadedLogo;
          } else {
            // Otherwise, it's an old ID, so look it up in our media map!
            const mappedUrl = mediaMap.get(p.uploadedLogo);
            if (mappedUrl) {
              logoUrl = mappedUrl;
            }
          }
        } else if (typeof p.baseLogo === "string") {
          logoUrl = p.baseLogo;
        }

        return {
          id: String(p.id),
          name: typeof p.name === "string" ? p.name : "",
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
      console.error("Error fetching partners section:", error);
      return { partners: buildDefaultPartners(), profileFileUrl: null };
    }
  },
);
