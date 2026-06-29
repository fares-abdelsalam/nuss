import fs from "node:fs";
import path from "node:path";
import type { CollectionConfig } from "payload";

const isVercel = typeof process !== "undefined" && process.env.VERCEL === "1";

export const Media: CollectionConfig = {
  slug: "media",
  lockDocuments: false,
  labels: {
    singular: "Media",
    plural: "Media",
  },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "mimeType", "filesize"],
    pagination: {
      defaultLimit: 10,
      limits: [10, 25],
    },
    listSearchableFields: ["filename"],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    // Use /tmp on Vercel because the filesystem is read-only
    staticDir: isVercel
      ? path.resolve("/tmp/media")
      : path.resolve(process.cwd(), "./public/media"),
    mimeTypes: ["image/*", "video/*", "application/pdf"],
    displayPreview: true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (
          doc &&
          typeof doc.url === "string" &&
          doc.url.startsWith("/media/")
        ) {
          const filename = doc.filename;
          if (typeof filename === "string") {
            // Only check local filesystem in dev
            if (!isVercel) {
              const publicPath = path.resolve(
                process.cwd(),
                "./public",
                filename,
              );
              if (
                typeof fs !== "undefined" &&
                fs.existsSync &&
                fs.existsSync(publicPath)
              ) {
                return { ...doc, url: `/${filename}` };
              }
            }
          }
        }
        return doc;
      },
    ],
  },
  fields: [],
};
