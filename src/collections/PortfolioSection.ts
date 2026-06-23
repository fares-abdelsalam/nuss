import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';

export const PortfolioSection: CollectionConfig = {
  slug: 'portfolio-section',
  lockDocuments: false,
  labels: {
    singular: 'Portfolio',
    plural: 'Portfolios',
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
        description: 'Singleton key for the Portfolio section.',
      },
    },
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
      name: 'tabs',
      type: 'array',
      label: 'Portfolio Tabs',
      admin: {
        description:
          'Each tab represents a sector (e.g. Gov, Private, Non-Profit, Nuss). Add entries inside each tab.',
      },
      fields: [
        {
          name: 'tabLabel',
          type: 'text',
          localized: true,
          required: false,
          admin: {
            description: 'Display label for this tab (e.g. "Gov Sector", "القطاع الحكومي").',
          },
        },
        {
          name: 'tabId',
          type: 'text',
          required: false,
          admin: {
            description:
              'A unique identifier for this tab (e.g. "gov", "private", "nonProfit", "nuss"). Used internally.',
          },
        },
        {
          name: 'entries',
          type: 'array',
          label: 'Portfolio Entries',
          admin: {
            description: 'Individual portfolio items shown inside this tab.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: false,
              admin: {
                description: 'Title for this portfolio entry.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description: 'Client / project logo image.',
              },
            },
            {
              name: 'mainMedia',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description:
                  'Main media for this entry (image or video). Videos will auto-play in the portfolio carousel.',
              },
            },
          ],
        },
      ],
    },
  ],
};
