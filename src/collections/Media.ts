import fs from 'node:fs';
import path from 'node:path';
import type { CollectionConfig } from 'payload';


export const Media: CollectionConfig = {
  slug: 'media',
  lockDocuments: false,
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize'],
    pagination: {
      defaultLimit: 10,
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), './public/media'),
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    displayPreview: true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        // If the URL is set to /media/filename but the file actually lives in /public directly, fix the URL
        if (doc && typeof doc.url === 'string' && doc.url.startsWith('/media/')) {
          const filename = doc.filename;
          if (typeof filename === 'string') {
            const publicPath = path.resolve(process.cwd(), './public', filename);
            if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(publicPath)) {
              return { ...doc, url: `/${filename}` };
            }
          }
        }
        return doc;
      },
    ],
  },
  fields: [],
};