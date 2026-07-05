import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from './richText';

export type TranslationSection = {
  key: string;
  slug: string;
  label: string;
};

export const translationSections: TranslationSection[] = [
  { key: 'navbar', slug: 'navbar', label: 'Navbar' },
  { key: 'hero', slug: 'hero', label: 'Hero' },
  { key: 'visionSection', slug: 'vision_section', label: 'Vision Section' },
  { key: 'servicesSection', slug: 'services_section', label: 'Services Section' },
  { key: 'methodologySection', slug: 'methodology_section', label: 'Approach Section' },
  { key: 'businessModelsSection', slug: 'business_models_section', label: 'Business Models Section' },
];

export const translationFields: CollectionConfig['fields'] = [
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
      description: 'Key used to look up this translation. Cannot be changed after creation.',
    },
  },
  {
    name: 'value',
    type: 'richText',
    localized: true,
    required: false,
    hooks: {
      afterRead: [({ value }) => normalizeRichTextValue(value)],
      beforeValidate: [({ value }) => normalizeRichTextValue(value)],
    },
  },
];

export const createTranslationCollection = (section: TranslationSection): CollectionConfig => ({
  slug: section.slug,
  lockDocuments: false,
  labels: {
    singular: `${section.label}`,
    plural: `${section.label}`,
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'value'],
    listSearchableFields: ['key', 'value'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: translationFields,
});
