import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';

export const MethodologySection: CollectionConfig = {
  slug: 'methodology-section',
  lockDocuments: false,
  labels: {
    singular: 'Approach Section',
    plural: 'Approach Section',
  },
  admin: {
    useAsTitle: 'key',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          return {
            ...data,
            key: 'main',
          };
        }
        return data;
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
        description: 'Singleton key for the Approach section.',
      },
    },

    {
      name: 'cards',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'richText',
          localized: true,
          required: false,
          hooks: {
            afterRead: [({ value }) => normalizeRichTextValue(value)],
            beforeValidate: [({ value }) => normalizeRichTextValue(value)],
          },
        },
        {
          name: 'description',
          type: 'richText',
          localized: true,
          required: false,
          hooks: {
            afterRead: [({ value }) => normalizeRichTextValue(value)],
            beforeValidate: [({ value }) => normalizeRichTextValue(value)],
          },
        },
        {
          name: 'color',
          type: 'text',
          required: false,
          hidden: true,
          defaultValue: '#FF279E',
          admin: {
            description: 'Hex color code (e.g., #FF279E, #777DFB, #FF9400, #65F0E9)',
          },
        },
      ],
    },
  ],
};
