import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';

export const Journeys: CollectionConfig = {
  slug: 'journeys',
  lockDocuments: false,
  orderable: true,
  labels: {
    singular: 'Journey',
    plural: 'Journeys',
  },
  admin: {
    useAsTitle: 'year',
    defaultColumns: ['year', 'title'],
    listSearchableFields: ['year', 'title', 'description'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'year',
      type: 'text',
      required: false,
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
  ],
};