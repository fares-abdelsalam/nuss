import type { CollectionConfig } from 'payload';

export const BusinessModels: CollectionConfig = {
  slug: 'business-models',
  lockDocuments: false,
  orderable: true,
  labels: {
    singular: 'Business Model',
    plural: 'Business Models',
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'title', 'media'],
    listSearchableFields: ['key', 'title'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        let nextData = data;

        if (operation === 'create' && (!data || !data.key)) {
          const existing = await req.payload.find({
            collection: 'business-models',
            pagination: false,
            select: {
              key: true,
            },
            overrideAccess: true,
          });

          const highestKey = existing.docs.reduce((max, doc) => {
            const numericKey = Number(doc.key);
            if (!Number.isFinite(numericKey)) {
              return max;
            }

            return numericKey > max ? numericKey : max;
          }, 0);

          nextData = {
            ...nextData,
            key: String(highestKey + 1),
          };
        }

        return nextData;
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: false,
      unique: true,
      access: {
        create: () => true,
        read: () => true,
        update: () => false,
      },
      admin: {
        readOnly: true,
        description: 'Auto-generated business model number. This stays fixed even if you reorder entries.',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: false,
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Choose or upload the media file for this business model.',
      },
    },
  ],
};