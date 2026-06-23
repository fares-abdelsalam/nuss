import "server-only";

import { cache } from "react";
import type { Locale } from "./config";
import { getPayloadClient } from "./getPayloadClient";

export type TeamManager = {
  id: string;
  name: string;
  role: string;
  image: string;
  flip?: boolean;
  scale?: number;
  yOffset?: string;
};

export type TeamMember = {
  flip?: boolean;
  scale?: number;
  yOffset?: string;
  id: string;
  name: string;
  image: string;
};

export type TeamSectionData = {
  title?: unknown;
  description?: unknown;
  managers: TeamManager[];
  members: TeamMember[];
};

type MediaRef = {
  url?: unknown;
};

type PayloadTeamPerson = {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  uploadedImage?: unknown;
  image?: unknown;
  baseImage?: unknown;
  flip?: unknown;
  scale?: unknown;
  yOffset?: unknown;
};

type PayloadTeamSectionDoc = {
  title?: unknown;
  description?: unknown;
  managers?: PayloadTeamPerson[] | null;
  members?: PayloadTeamPerson[] | null;
};

function resolveMediaUrl(media: unknown): string {
  if (
    typeof media === "string" &&
    (media.startsWith("/") || media.startsWith("http"))
  ) {
    return media;
  }
  if (
    typeof media === "object" &&
    media !== null &&
    typeof (media as MediaRef).url === "string"
  ) {
    return (media as { url: string }).url;
  }
  return "";
}

function resolveTeamImage(m: PayloadTeamPerson): string {
  if (m.uploadedImage) {
    const url = resolveMediaUrl(m.uploadedImage);
    if (url) return url;
  }
  if (m.image) {
    const url = resolveMediaUrl(m.image);
    if (url) return url;
  }
  return typeof m.baseImage === "string" ? m.baseImage : "";
}

const imageTweaks: Record<
  string,
  { flip?: boolean; scale?: number; yOffset?: string }
> = {
  // EXAMPLES (Change these based on what you see on your screen):
  "/team-1.webp": { flip: true }, // Flips the first person to face the other way
  "/team-2.webp": { scale: 1.15, yOffset: "10px" }, // Zooms person 2 in, moves them down
  "/team-5.webp": { scale: 0.9 }, // Zooms person 5 out
  // Add as many tweaks as you need here...
};

export const getTeamSection = cache(
  async (locale: Locale): Promise<TeamSectionData> => {
    const defaultManagers =
      locale === "ar"
        ? [
            {
              id: "m1",
              name: "عبد الرحمن البدر",
              role: "الرئيس التنفيذي",
              image: "/team-manager-6.webp",
            },
            {
              id: "m2",
              name: "محمد المحمد",
              role: "رئيس قطاع المحتوى",
              image: "/team-manager-5.webp",
            },
            {
              id: "m3",
              name: "طلال السليمي",
              role: "رئيس قطاع الحسابات",
              image: "/team-manager-4.webp",
            },
            {
              id: "m4",
              name: "مصطفى خليل",
              role: "رئيس القطاع الفني",
              image: "/team-manager-3.webp",
            },
            {
              id: "m5",
              name: "علاء الزور",
              role: "رئيس القطاع الفني",
              image: "/team-manager-2.webp",
            },
            {
              id: "m6",
              name: "أحمد علامة",
              role: "رئيس قطاع المحاسبة",
              image: "/team-manager-1.webp",
            },
          ]
        : [
            {
              id: "m1",
              name: "Abdulrahman Al-Badr",
              role: "CEO",
              image: "/team-manager-6.webp",
            },
            {
              id: "m2",
              name: "Mohammed Al-Mohammed",
              role: "Head of Content",
              image: "/team-manager-5.webp",
            },
            {
              id: "m3",
              name: "Talal Al-Sulaimi",
              role: "Head of Accounts",
              image: "/team-manager-4.webp",
            },
            {
              id: "m4",
              name: "Mustafa Khalil",
              role: "Head of Technical Sector",
              image: "/team-manager-3.webp",
            },
            {
              id: "m5",
              name: "Alaa Al-Zour",
              role: "Head of Technical Sector",
              image: "/team-manager-2.webp",
            },
            {
              id: "m6",
              name: "Ahmed Allama",
              role: "Head of Accounting",
              image: "/team-manager-1.webp",
            },
          ];

    const defaultMembers = Array.from({ length: 51 }, (_, i) => {
      const imagePath = `/team-${i + 1}.webp`;
      const tweaks = imageTweaks[imagePath] || {}; // Check if this photo needs fixing

      return {
        id: `mem-${i + 1}`,
        name: locale === "ar" ? `عضو فريق ${i + 1}` : `Team Member ${i + 1}`,
        image: imagePath,
        ...tweaks, // Applies flip, scale, and yOffset if they exist
      };
    });

    const defaultResponse: TeamSectionData = {
      title: locale === "ar" ? "فريقنا" : "Our Team",
      description:
        locale === "ar"
          ? "أعمدة نجاح النّص وصنّاع أمجاده"
          : "The pillars of Nuss success and the makers of its glory",
      managers: defaultManagers,
      members: defaultMembers,
    };

    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "team-section",
        where: {
          key: {
            equals: "main",
          },
        },
        locale,
        fallbackLocale: false,
        depth: 2,
      });

      const doc = result.docs?.[0] as PayloadTeamSectionDoc | undefined;
      if (!doc) {
        return defaultResponse;
      }

      const managers = (doc.managers || []).map((m) => ({
        id: typeof m.id === "string" ? m.id : String(Math.random()),
        name: typeof m.name === "string" ? m.name : "",
        role: typeof m.role === "string" ? m.role : "",
        image:
          resolveTeamImage(m) ||
          defaultManagers.find((dm) => dm.name === m.name)?.image ||
          "",
        // PULL THE VALUES FROM THE DATABASE HERE:
        flip: typeof m.flip === "boolean" ? m.flip : false,
        scale: typeof m.scale === "number" ? m.scale : 1,
        yOffset: typeof m.yOffset === "string" ? m.yOffset : "0px",
      }));

      const members = (doc.members || []).map((m) => ({
        id: typeof m.id === "string" ? m.id : String(Math.random()),
        name: typeof m.name === "string" ? m.name : "",
        image: resolveTeamImage(m) || "",
        // PULL THE VALUES FROM THE DATABASE HERE:
        flip: typeof m.flip === "boolean" ? m.flip : false,
        scale: typeof m.scale === "number" ? m.scale : 1,
        yOffset: typeof m.yOffset === "string" ? m.yOffset : "0px",
      }));

      return {
        title: doc.title || defaultResponse.title,
        description: doc.description || defaultResponse.description,
        managers: managers.length > 0 ? managers : defaultManagers,
        members: members.length > 0 ? members : defaultMembers,
      };
    } catch (error) {
      console.error("Failed to fetch team section:", error);
      return defaultResponse;
    }
  },
);
