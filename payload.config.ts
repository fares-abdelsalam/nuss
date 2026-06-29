import path from "node:path";
import dns from "node:dns";

import fs from "node:fs";
import type { CollectionConfig } from "payload";

import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { Services } from "./src/collections/Services";
import { BusinessModels } from "./src/collections/BusinessModels";
import { Media } from "./src/collections/Media";
import { Methodologies } from "./src/collections/Methodologies";
import { JourneySection } from "./src/collections/JourneySection";
import { Journeys } from "./src/collections/Journeys";
import { PortfolioSection } from "./src/collections/PortfolioSection";
import { PartnersSection } from "./src/collections/PartnersSection";
import { FooterSection } from "./src/collections/FooterSection";
import { TeamSection } from "./src/collections/TeamSection";
import { s3Storage } from "@payloadcms/storage-s3";
import {
  createTranslationCollection,
  translationSections,
} from "./src/i18n/translationCollections";

const dirname =
  typeof process !== "undefined" && typeof process.cwd === "function"
    ? process.cwd()
    : "";

let publicFiles = new Set<string>();
try {
  if (typeof fs !== "undefined" && fs.readdirSync) {
    publicFiles = new Set(fs.readdirSync(path.resolve(dirname, "./public")));
  }
} catch (e) {
  // Ignore if directory doesn't exist
}

try {
  if (dns && typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // ignore in browser
}

const rawConnectionString =
  process.env.NEXT_DATABASE_URI ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URI ||
  "";

let connectionString = rawConnectionString;
if (connectionString) {
  try {
    const url = new URL(connectionString);
    // Switch Supabase pooler to transaction mode
    if (url.hostname.includes("pooler.supabase.com") && url.port === "5432") {
      url.port = "6543";
    }
    if (
      url.hostname.includes("pooler.supabase.com") &&
      !url.searchParams.has("pgbouncer")
    ) {
      url.searchParams.set("pgbouncer", "true");
    }
    connectionString = url.toString();
  } catch (e) {
    // ignore
  }
}

// On Vercel, serverless functions each get their own pool.
// Must keep per-instance connections tiny and release fast
// so PgBouncer can multiplex across many instances without
// exhausting Supabase's 200-connection limit.
const isVercel = typeof process !== "undefined" && process.env.VERCEL === "1";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  lockDocuments: false,
  admin: {
    useAsTitle: "email",
    hidden: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};

export default buildConfig({
  editor: lexicalEditor({}),
  upload: {
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  },
  admin: {
    user: "users",
    livePreview: {
      url: "/",
      collections: [
        "services",
        "business-models",
        "methodologies",
        "journey-section-data",
        "journeys",
        "partners-section",
        "portfolio-section",
        "footer-data",
        "team-section",
        ...translationSections.map((section) => section.slug),
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname, "./src/app/(payload)"),
      importMapFile: path.resolve(
        dirname,
        "./src/app/(payload)/admin/importMap.js",
      ),
    },
  },
  collections: [
    Users,
    Media,
    Services,
    BusinessModels,
    Methodologies,
    JourneySection,
    Journeys,
    PartnersSection,
    PortfolioSection,
    FooterSection,
    TeamSection,
    ...translationSections.map(createTranslationCollection),
  ],
  plugins: [
    s3Storage({
      enabled: Boolean(
        (process.env.SUPABASE_BUCKET ||
          process.env.S3_BUCKET ||
          process.env.BUCKET_NAME) &&
        process.env.ACCESS_KEY_ID &&
        process.env.SECRET_ACCESS_KEY,
      ),
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            if (publicFiles.has(filename)) {
              return `/${filename}`;
            }
            const bucket = process.env.BUCKET_NAME || "";
            const key = prefix ? `${prefix}/${filename}` : filename;
            return `https://qiqzydlgwddiagetthgk.storage.supabase.co/storage/v1/object/public/${bucket}/${key}`;
          },
        },
      },
      bucket:
        process.env.SUPABASE_BUCKET ||
        process.env.S3_BUCKET ||
        process.env.BUCKET_NAME ||
        "",
      config: {
        endpoint:
          "https://qiqzydlgwddiagetthgk.storage.supabase.co/storage/v1/s3",
        region: "ap-south-1",
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID || "",
          secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
        },
        forcePathStyle: true,
      },
    }),
  ],
  localization: {
    defaultLocale: "ar",
    locales: ["ar", "en"],
  },
  db: postgresAdapter({
    pool: {
      connectionString,
      max: isVercel ? 2 : 5, // 2 allows batch of 3 to queue without timing out
      ssl: { rejectUnauthorized: false },
      idleTimeoutMillis: isVercel ? 1_000 : 2_000,
      connectionTimeoutMillis: isVercel ? 8_000 : 10_000,
      allowExitOnIdle: true,
    },
    push:
      typeof process !== "undefined" && process.env.NODE_ENV !== "production"
        ? true
        : process.env.PAYLOAD_SCHEMA_PUSH === "true",
  }),
  secret:
    process.env.PAYLOAD_SECRET ||
    "sk_live_fallback_secret_for_development_only",
  typescript: {
    outputFile: path.resolve(dirname, "./src/payload-types.ts"),
  },
});
