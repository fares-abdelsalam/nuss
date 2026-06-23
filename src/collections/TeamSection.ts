import type { CollectionConfig } from 'payload';
import { normalizeRichTextValue } from '../i18n/richText';
import { managerImageOptions, memberImageOptions } from '../content/teamImages';

export const TeamSection: CollectionConfig = {
  slug: 'team-section',
  lockDocuments: false,
  labels: {
    singular: 'Team Section',
    plural: 'Team Sections',
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
        description: 'Singleton key for the Team section.',
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
      name: 'managers',
      type: 'array',
      label: 'Managers',
      admin: {
        description: 'Large cards showing the team managers with name and role.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'uploadedImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description: 'Upload a custom manager photo. If provided, it will override the base photo selection.',
                width: '50%',
              },
            },
            {
              name: 'baseImage',
              type: 'select',
              required: false,
              options: managerImageOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
              admin: {
                description: 'Or choose a manager photo from the project files.',
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Image Tweaks',
          admin: {
            description: 'Fine-tune photo alignment and direction.',
          },
          fields: [
            {
              name: 'flip',
              type: 'checkbox',
              label: 'Flip horizontally',
              defaultValue: false,
              admin: {
                description: 'Mirror the image so the person faces the opposite direction.',
              },
            },
            {
              name: 'scale',
              type: 'number',
              label: 'Zoom scale',
              defaultValue: 1,
              min: 0.5,
              max: 2,
              admin: {
                description: 'Zoom in (>1) or out (<1). 1 = default.',
              },
            },
            {
              name: 'yOffset',
              type: 'text',
              label: 'Vertical offset',
              defaultValue: '0px',
              admin: {
                description: 'Move image up or down (e.g., "10px" or "-5%").',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'members',
      type: 'array',
      label: 'Team Members',
      admin: {
        description: 'Normal cards showing the rest of the team members.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: false,
          admin: {
            description: 'Alt name text for accessibility (does not show in layout).',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'uploadedImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description: 'Upload a custom member photo. If provided, it will override the base photo selection.',
                width: '50%',
              },
            },
            {
              name: 'baseImage',
              type: 'select',
              required: false,
              options: memberImageOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
              admin: {
                description: 'Or choose a member photo from the project files.',
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Image Tweaks',
          admin: {
            description: 'Fine-tune photo alignment and direction.',
          },
          fields: [
            {
              name: 'flip',
              type: 'checkbox',
              label: 'Flip horizontally',
              defaultValue: false,
              admin: {
                description: 'Mirror the image so the person faces the opposite direction.',
              },
            },
            {
              name: 'scale',
              type: 'number',
              label: 'Zoom scale',
              defaultValue: 1,
              min: 0.5,
              max: 2,
              admin: {
                description: 'Zoom in (>1) or out (<1). 1 = default.',
              },
            },
            {
              name: 'yOffset',
              type: 'text',
              label: 'Vertical offset',
              defaultValue: '0px',
              admin: {
                description: 'Move image up or down (e.g., "10px" or "-5%").',
              },
            },
          ],
        },
      ],
    },
  ],
};
