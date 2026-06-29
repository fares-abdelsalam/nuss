import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';
import { partnerLogoOptions } from '../content/partnerLogos';

export const PartnersSection: CollectionConfig = {
  slug: 'partners-section',
  lockDocuments: false,
  labels: {
    singular: 'Partners Section',
    plural: 'Partners Section',
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
        description: 'Singleton key for the Partners section.',
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
      name: 'profileFile',
      type: 'text',
      required: false,
      admin: {
        description:
          'Enter a URL to the company profile / brochure (e.g. a PDF hosted on your site or a Google Drive link).',
      },
    },
    {
      name: 'partners',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: false,
          admin: {
            description: 'Partner name (used as alt text for the logo)',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'uploadedLogo',
              type: 'relationship',
              relationTo: 'media',
              required: false,
              admin: {
                description: 'Select an already-uploaded logo from Media. Upload new logos in the Media collection first.',
                width: '50%',
              },
            },
            {
              name: 'baseLogo',
              type: 'select',
              required: false,
              options: partnerLogoOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
              admin: {
                description: 'Or choose a base logo from the project files.',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
};
