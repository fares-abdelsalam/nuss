import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';

export const JourneySection: CollectionConfig = {
  slug: 'journey-section-data',
  lockDocuments: false,
  labels: {
    singular: 'Journey Section',
    plural: 'Journey Section',
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
      defaultValue: 'main',
      admin: {
        readOnly: true,
        description: 'Singleton key for the Journey section copy.',
      },
    },
    {
      name: 'sectionTitle',
      type: 'richText',
      localized: true,
      required: false,
      hooks: {
        afterRead: [({ value }) => normalizeRichTextValue(value)],
        beforeValidate: [({ value }) => normalizeRichTextValue(value)],
      },
    },
    {
      name: 'introTitle',
      type: 'richText',
      localized: true,
      required: false,
      hooks: {
        afterRead: [({ value }) => normalizeRichTextValue(value)],
        beforeValidate: [({ value }) => normalizeRichTextValue(value)],
      },
    },
    {
      name: 'introDescription',
      type: 'richText',
      localized: true,
      required: false,
      hooks: {
        afterRead: [({ value }) => normalizeRichTextValue(value)],
        beforeValidate: [({ value }) => normalizeRichTextValue(value)],
      },
    },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'number',
          type: 'number',
          required: false,
        },
        {
          name: 'prefix',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional symbol before the number (e.g., %)',
          },
        },
        {
          name: 'suffix',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional symbol after the number (e.g., +)',
          },
        },
        {
          name: 'label',
          type: 'richText',
          localized: true,
          required: false,
          hooks: {
            afterRead: [({ value }) => normalizeRichTextValue(value)],
            beforeValidate: [({ value }) => normalizeRichTextValue(value)],
          },
        },
      ],
    },
  ],
};