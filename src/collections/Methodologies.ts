import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';

export const Methodologies: CollectionConfig = {
  slug: 'methodologies',
  lockDocuments: false,
  labels: {
    singular: 'Approach Cards',
    plural: 'Approach Cards',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
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
      name: 'iconType',
      type: 'radio',
      options: [
        { label: 'Default Icon', value: 'default' },
        { label: 'Custom Icon', value: 'custom' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'iconName',
      type: 'select',
      options: [
        { label: 'Approach 1', value: 'approach-1' },
        { label: 'Approach 2', value: 'approach-2' },
        { label: 'Approach 3', value: 'approach-3' },
        { label: 'Approach 4', value: 'approach-4' },
        { label: 'Approach 5', value: 'approach-5' },
        { label: 'Approach 6', value: 'approach-6' },
      ],
      admin: {
        condition: (data, siblingData) => siblingData?.iconType === 'default',
      },
    },
    {
      name: 'customIcon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data, siblingData) => siblingData?.iconType === 'custom',
      },
    },
    {
      name: 'color',
      type: 'text',
      required: false,
      defaultValue: '#FF279E',
      hidden: true,
      admin: {
        description: 'Hex color code (e.g., #FF279E, #777DFB, #FF9400, #65F0E9)',
      },
    },
  ],
};
