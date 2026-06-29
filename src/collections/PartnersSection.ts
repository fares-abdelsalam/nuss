import type { CollectionConfig } from "payload";
import { normalizeRichTextValue } from "../i18n/richText";
import { partnerLogoOptions } from "../content/partnerLogos";

export const PartnersSection: CollectionConfig = {
  slug: "partners-section",
  lockDocuments: false,
  labels: {
    singular: "Partners Section",
    plural: "Partners Section",
  },
  admin: {
    useAsTitle: "key",
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
        if (operation === "create") {
          return {
            ...data,
            key: "main",
          };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: false,
      unique: true,
      access: {
        create: () => true,
        read: () => true,
        update: () => false,
      },
      admin: {
        readOnly: true,
        description: "Singleton key for the Partners section.",
      },
    },
    {
      name: "title",
      type: "richText",
      localized: true,
      required: false,
      hooks: {
        afterRead: [({ value }) => normalizeRichTextValue(value)],
        beforeValidate: [({ value }) => normalizeRichTextValue(value)],
      },
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      required: false,
      hooks: {
        afterRead: [({ value }) => normalizeRichTextValue(value)],
        beforeValidate: [({ value }) => normalizeRichTextValue(value)],
      },
    },
    {
      name: "profileFile",
      type: "text",
      required: false,
      admin: {
        description:
          "Enter a URL to the company profile / brochure (e.g. a PDF hosted on your site or a Google Drive link).",
      },
    },
    {
      name: "partners",
      type: "array",
      required: false,
      fields: [
        {
          name: "name",
          type: "text",
          localized: true,
          required: false,
          admin: {
            description: "Partner name (used as alt text for the logo)",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "uploadedLogo",
              type: "text", // Changed to text to stop admin API spam
              required: false,
              admin: {
                description:
                  "Paste the Supabase URL of the logo. Leave empty to use Base Logo.",
                width: "50%",
              },
              hooks: {
                // THIS IS THE MAGIC: Automatically translates old IDs to URLs for the frontend
                afterRead: [
                  async ({ value, req }) => {
                    if (
                      value &&
                      typeof value === "string" &&
                      /^\d+$/.test(value)
                    ) {
                      try {
                        const media = await req.payload.findByID({
                          collection: "media",
                          id: value,
                          depth: 0,
                        });
                        if (media && typeof media.url === "string") {
                          return media.url;
                        }
                      } catch (e) {
                        return value;
                      }
                    }
                    return value;
                  },
                ],
              },
            },
            {
              name: "baseLogo",
              type: "select",
              required: false,
              options: partnerLogoOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
              admin: {
                description: "Or choose a base logo from the project files.",
                width: "50%",
              },
            },
          ],
        },
      ],
    },
  ],
};
