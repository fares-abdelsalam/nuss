import type { CollectionConfig } from 'payload';
import { serviceImageOptions } from '../content/serviceImages';
import { normalizeRichTextValue } from '../i18n/richText';

export const Services: CollectionConfig = {
  slug: 'services',
  lockDocuments: false,
  orderable: true,
  labels: {
    singular: 'Service',
    plural: 'Services',
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'title', 'image'],
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
        if (operation !== 'create' || (data && data.key)) {
          return data;
        }

        const existing = await req.payload.find({
          collection: 'services',
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

        return {
          ...data,
          key: String(highestKey + 1),
        };
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
        description: 'Auto-generated service number. This stays fixed even if you reorder services.',
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
      name: 'image',
      type: 'select',
      required: false,
      options: serviceImageOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
      admin: {
        description: 'Choose one of the provided service icons.',
        components: {
          Field: './components/ServiceImageSelect#ServiceImageSelect',
        },
      },
    },
    {
      name: 'points',
      type: 'array',
      minRows: 1,
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
      ],
      admin: {
        initCollapsed: false,
      },
    },
  ],
};
