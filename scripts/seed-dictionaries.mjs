import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import nextEnv from '@next/env';
import { buildConfig, getPayload } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/storage-s3';
import { Pool } from 'pg';

const { loadEnvConfig } = nextEnv;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dns.setDefaultResultOrder('ipv4first');
loadEnvConfig(process.cwd());

const buildPoolConfig = () => {
  const connectionString = process.env.NEXT_DATABASE_URI || process.env.DATABASE_URL || '';
  const forceIpv4Lookup = (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, family: 4 }, callback);
  };

  try {
    const url = new URL(connectionString);

    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      family: 4,
      lookup: forceIpv4Lookup,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  } catch {
    return {
      connectionString,
      family: 4,
      lookup: forceIpv4Lookup,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
};

const dictionariesDir = path.resolve(dirname, '../src/i18n/dictionaries');

const translationTableRenames = [
  ['navbar_translations', 'navbar'],
  ['hero_translations', 'hero'],
  ['vision_section_translations', 'vision_section'],
  ['journey_section_translations', 'journey_section'],
  ['services_section_translations', 'services_section'],
  ['portfolio_section_translations', 'portfolio_section'],
  ['methodology_section_translations', 'methodology_section'],
  ['team_section_translations', 'team_section'],
  ['business_models_section_translations', 'business_models_section'],
  ['footer_section_translations', 'footer_section'],
];

const renameIfExists = async (pool, oldName, newName) => {
  const existsResult = await pool.query(
    `select exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relname = $1
        and c.relkind = 'r'
    ) as exists`,
    [oldName],
  );

  const targetExistsResult = await pool.query(
    `select exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relname = $1
        and c.relkind = 'r'
    ) as exists`,
    [newName],
  );

  const oldExists = Boolean(existsResult.rows[0]?.exists);
  const newExists = Boolean(targetExistsResult.rows[0]?.exists);

  if (oldExists && !newExists) {
    await pool.query(`alter table "${oldName}" rename to "${newName}"`);
  }
};

const translationSections = [
  { key: 'navbar', slug: 'navbar', label: 'Navbar' },
  { key: 'hero', slug: 'hero', label: 'Hero' },
  { key: 'visionSection', slug: 'vision_section', label: 'Vision Section' },
  { key: 'servicesSection', slug: 'services_section', label: 'Services Section' },
  { key: 'methodologySection', slug: 'methodology_section', label: 'Methodology Section' },
  { key: 'businessModelsSection', slug: 'business_models_section', label: 'Business Models Section' },
];

const serviceImageOptions = [
  { value: '/service-1.svg', label: 'Service Icon 1' },
  { value: '/service-2.svg', label: 'Service Icon 2' },
  { value: '/service-3.svg', label: 'Service Icon 3' },
  { value: '/service-4.svg', label: 'Service Icon 4' },
  { value: '/service-5.svg', label: 'Service Icon 5' },
  { value: '/service-6.svg', label: 'Service Icon 6' },
];

const businessModelMedia = [
  { key: '1', mediaType: 'video', fileName: 'model-1.mp4' },
  { key: '2', mediaType: 'video', fileName: 'model-2.mp4' },
  { key: '3', mediaType: 'video', fileName: 'model-3.mp4' },
  { key: '4', mediaType: 'video', fileName: 'model-4.mp4' },
  { key: '5', mediaType: 'video', fileName: 'model-5.mp4' },
  { key: '6', mediaType: 'video', fileName: 'model-6.mp4' },
  { key: '7', mediaType: 'video', fileName: 'model-7.mp4' },
  { key: '8', mediaType: 'video', fileName: 'model-8.mp4' },
];

const Users = {
  slug: 'users',
  auth: true,
  lockDocuments: false,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
};

const Services = {
  slug: 'services',
  lockDocuments: false,
  orderable: true,
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'title', 'image'],
    defaultSort: '_order',
    listSearchableFields: ['key', 'title'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || data.key) {
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
      },
    },
    {
      name: 'title',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'image',
      type: 'select',
      required: false,
      options: serviceImageOptions,
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
        },
        {
          name: 'description',
          type: 'richText',
          localized: true,
          required: false,
        },
      ],
    },
  ],
};

const Media = {
  slug: 'media',
  lockDocuments: false,
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [],
};

const BusinessModels = {
  slug: 'business-models',
  lockDocuments: false,
  orderable: true,
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'title', 'media'],
    defaultSort: '_order',
    listSearchableFields: ['key', 'title'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        let nextData = data;

        if (operation === 'create' && !data.key) {
          const existing = await req.payload.find({
            collection: 'business-models',
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

          nextData = {
            ...nextData,
            key: String(highestKey + 1),
          };
        }

        return nextData;
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
        description: 'Auto-generated business model number. This stays fixed even if you reorder entries.',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: false,
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
};

const Journeys = {
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
    defaultSort: '_order',
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
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      required: false,
    },
  ],
};


const partnerLogoOptions = Array.from({ length: 25 }, (_, i) => ({
  value: `/partner-${i + 1}.svg`,
  label: `Partner ${i + 1}`,
}));

const Methodologies = {
  slug: 'methodologies',
  lockDocuments: false,
  labels: {
    singular: 'Methodology Card',
    plural: 'Methodology Cards',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      required: false,
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
    },
    {
      name: 'customIcon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'color',
      type: 'text',
      required: false,
      defaultValue: '#FF279E',
    },
  ],
};

const JourneySection = {
  slug: 'journey-section-data',
  lockDocuments: false,
  labels: {
    singular: 'Journey Section',
    plural: 'Journey Section',
  },
  admin: {
    useAsTitle: 'key',
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
    },
    {
      name: 'sectionTitle',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'introTitle',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'introDescription',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'stats',
      type: 'array',
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
        },
        {
          name: 'suffix',
          type: 'text',
          localized: true,
        },
        {
          name: 'label',
          type: 'richText',
          localized: true,
          required: false,
        },
      ],
    },
  ],
};

const PartnersSection = {
  slug: 'partners-section',
  lockDocuments: false,
  labels: {
    singular: 'Partners Section',
    plural: 'Partners Section',
  },
  admin: {
    useAsTitle: 'key',
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
    },
    {
      name: 'title',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'profileFile',
      type: 'upload',
      relationTo: 'media',
      required: false,
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
        },
        {
          name: 'uploadedLogo',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'baseLogo',
          type: 'select',
          required: false,
          options: partnerLogoOptions,
        },
      ],
    },
  ],
};

const PortfolioSection = {
  slug: 'portfolio-section',
  lockDocuments: false,
  labels: {
    singular: 'Portfolio',
    plural: 'Portfolios',
  },
  admin: {
    useAsTitle: 'key',
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
    },
    {
      name: 'title',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'tabs',
      type: 'array',
      fields: [
        {
          name: 'tabLabel',
          type: 'text',
          localized: true,
          required: false,
        },
        {
          name: 'tabId',
          type: 'text',
          required: false,
        },
        {
          name: 'entries',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: false,
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
            {
              name: 'mainMedia',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
  ],
};

const FooterSection = {
  slug: 'footer-data',
  lockDocuments: false,
  labels: {
    singular: 'Footer Section',
    plural: 'Footer Sections',
  },
  admin: {
    useAsTitle: 'key',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: false,
      unique: true,
    },
    {
      name: 'footerText',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};

const TeamSection = {
  slug: 'team-section',
  lockDocuments: false,
  labels: {
    singular: 'Team Section',
    plural: 'Team Sections',
  },
  admin: {
    useAsTitle: 'key',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: false,
      unique: true,
      defaultValue: 'main',
    },
    {
      name: 'title',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      required: false,
    },
    {
      name: 'managers',
      type: 'array',
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
              type: 'text',
              required: false,
              admin: {
                description: 'Project-file manager photo path, for example /team-manager-1.webp.',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'members',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: false,
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
              type: 'text',
              required: false,
              admin: {
                description: 'Project-file member photo path, for example /team-1.webp.',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
};

const config = buildConfig({
  editor: lexicalEditor({}),
  upload: {
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  },
  collections: [Users, Media, Services, BusinessModels, Methodologies, JourneySection, Journeys, PartnersSection, PortfolioSection, FooterSection, TeamSection, ...translationSections.map((section) => ({
    slug: section.slug,
    lockDocuments: false,
    dbName: section.slug,
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
      },
      {
        name: 'value',
        type: 'richText',
        localized: true,
        required: false,
      },
    ],
  }))],
  localization: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
  },
  db: postgresAdapter({
    push: process.argv.includes('--schema-only') || process.env.SCHEMA_ONLY === 'true',
    pool: buildPoolConfig(),
  }),
  plugins: [
    s3Storage({
      enabled: Boolean(
        (process.env.SUPABASE_BUCKET || process.env.S3_BUCKET || process.env.BUCKET_NAME) &&
        process.env.ACCESS_KEY_ID &&
        process.env.SECRET_ACCESS_KEY,
      ),
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const bucket = process.env.SUPABASE_BUCKET || process.env.S3_BUCKET || process.env.BUCKET_NAME || '';
            const key = prefix ? `${prefix}/${filename}` : filename;
            return `https://qiqzydlgwddiagetthgk.storage.supabase.co/storage/v1/object/public/${bucket}/${key}`;
          },
        },
      },
      bucket: process.env.SUPABASE_BUCKET || process.env.S3_BUCKET || process.env.BUCKET_NAME || '',
      config: {
        endpoint: 'https://qiqzydlgwddiagetthgk.storage.supabase.co/storage/v1/s3',
        region: 'ap-south-1',
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID || '',
          secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
});

const readJson = async (fileName) => {
  const filePath = path.join(dictionariesDir, fileName);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
};

const readTranslations = async (locale) => {
  return readJson(`${locale}.json`);
};

const buildRichText = (value, locale) => {
  const text = typeof value === 'string' ? value : '';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const children = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    if (index > 0) {
      children.push({
        type: 'linebreak',
        version: 1,
      });
    }

    if (line.length > 0) {
      children.push({
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: line,
        type: 'text',
        version: 1,
      });
    }
  });

  return {
    root: {
      children: [
        {
          children: children.length > 0 ? children : [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '',
              type: 'text',
              version: 1,
            },
          ],
          direction,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
};

const joinWithLineBreaks = (...parts) => parts.filter((part) => typeof part === 'string' && part.length > 0).join('\n');

const normalizePoints = (serviceData) => {
  const pointKeys = Object.keys(serviceData)
    .filter((key) => /^point\d+$/.test(key))
    .sort((left, right) => Number(left.replace('point', '')) - Number(right.replace('point', '')));

  return pointKeys.map((pointKey) => ({
    key: pointKey,
    title: serviceData[pointKey]?.title,
    description: serviceData[pointKey]?.description,
  }));
};

const readServiceDefinitions = async (locale) => {
  const json = await readJson(`${locale}.json`);
  const services = json?.servicesSection?.service || {};

  return Object.entries(services)
    .map(([serviceKey, serviceData]) => {
      const order = Number(serviceKey);
      if (!Number.isInteger(order)) {
        return null;
      }

      return {
        key: String(order),
        title: serviceData?.title,
        points: normalizePoints(serviceData),
      };
    })
    .filter(Boolean)
    .sort((left, right) => Number(left.key) - Number(right.key));
};

const readBusinessModelDefinitions = async (locale) => {
  const json = await readJson(`${locale}.json`);
  const models = json?.businessModelsSection?.models || [];

  return models.map((title, index) => ({
    key: String(index + 1),
    title,
    mediaType: businessModelMedia[index]?.mediaType || 'video',
    fileName: businessModelMedia[index]?.fileName || '',
  }));
};

const readJourneysDefinitions = async (locale) => {
  const json = await readJson(`${locale}.json`);
  const section = json?.journeySection || {};
  return [
    { year: '2014', title: section.title2014, description: section.desc2014 },
    { year: '2018', title: section.title2018, description: section.desc2018 },
    { year: '2023', title: section.title2023, description: section.desc2023 },
  ].filter((j) => j.title || j.description);
};

const renameTranslationTables = async () => {
  const connectionString = process.env.NEXT_DATABASE_URI || process.env.DATABASE_URL || '';
  const pool = new Pool({
    ...buildPoolConfig(),
    connectionString,
  });

  try {
    for (const [oldName, newName] of translationTableRenames) {
      await renameIfExists(pool, oldName, newName);
      await renameIfExists(pool, `${oldName}_locales`, `${newName}_locales`);
    }
  } finally {
    await pool.end();
  }
};

const main = async () => {
  if (!process.env.NEXT_DATABASE_URI && !process.env.DATABASE_URL) {
    throw new Error('Missing NEXT_DATABASE_URI or DATABASE_URL.');
  }

  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('Missing PAYLOAD_SECRET.');
  }

  const schemaOnly = process.argv.includes('--schema-only') || process.env.SCHEMA_ONLY === 'true';

  if (!schemaOnly) {
    await renameTranslationTables();
  }

  const payload = await getPayload({ config });

  if (schemaOnly) {
    console.log('Payload schema push completed.');
    return;
  }

  const [enDictionary, arDictionary, enServices, arServices, enBusinessModels, arBusinessModels, enJourneys, arJourneys] = await Promise.all([
    readTranslations('en'),
    readTranslations('ar'),
    readServiceDefinitions('en'),
    readServiceDefinitions('ar'),
    readBusinessModelDefinitions('en'),
    readBusinessModelDefinitions('ar'),
    readJourneysDefinitions('en'),
    readJourneysDefinitions('ar'),
  ]);

  const enServicesSection = enDictionary?.servicesSection || {};
  const arServicesSection = arDictionary?.servicesSection || {};
  const servicesSectionRichValues = {
    mainTitle: {
      en: buildRichText(joinWithLineBreaks(
        enServicesSection?.mainTitle?.line1,
        enServicesSection?.mainTitle?.line2,
        enServicesSection?.mainTitle?.line3,
      ), 'en'),
      ar: buildRichText(joinWithLineBreaks(
        arServicesSection?.mainTitle?.line1,
        arServicesSection?.mainTitle?.line2,
        arServicesSection?.mainTitle?.line3,
      ), 'ar'),
    },
    description: {
      en: buildRichText(joinWithLineBreaks(
        enServicesSection?.description?.line1,
        enServicesSection?.description?.line2,
      ), 'en'),
      ar: buildRichText(joinWithLineBreaks(
        arServicesSection?.description?.line1,
        arServicesSection?.description?.line2,
      ), 'ar'),
    },
    descriptionMobile: {
      en: buildRichText(enServicesSection?.descriptionMobile, 'en'),
      ar: buildRichText(arServicesSection?.descriptionMobile, 'ar'),
    },
  };

  for (const section of translationSections) {
    const sectionEntries = section.key === 'servicesSection'
      ? new Set(['mainTitle', 'description', 'descriptionMobile'])
      : new Set([
        ...Object.keys(enDictionary?.[section.key] || {}),
        ...Object.keys(arDictionary?.[section.key] || {}),
      ]);

    const existingDocs = await payload.find({
      collection: section.slug,
      pagination: false,
      select: {
        key: true,
      },
    });

    const existingBusinessModels = await payload.find({
      collection: 'business-models',
      pagination: false,
      select: {
        key: true,
      },
    });

    const existingMedia = await payload.find({
      collection: 'media',
      pagination: false,
      select: {
        filename: true,
      },
    });

    const mediaByFilename = new Map(existingMedia.docs.map((doc) => [doc.filename, doc]));

    const ensureMedia = async (mediaDefinition) => {
      const existing = mediaByFilename.get(mediaDefinition.fileName);

      if (existing) {
        return existing;
      }

      const created = await payload.create({
        collection: 'media',
        data: {},
        filePath: path.resolve(dirname, '../public', mediaDefinition.fileName),
        overrideAccess: true,
      });

      mediaByFilename.set(mediaDefinition.fileName, created);
      return created;
    };

    const existingBusinessModelsByKey = new Map(existingBusinessModels.docs.map((doc) => [doc.key, doc]));

    for (const enModel of enBusinessModels) {
      const arModel = arBusinessModels.find((model) => model.key === enModel.key) || enModel;
      const mediaDefinition = businessModelMedia[Number(enModel.key) - 1];
      const mediaDoc = mediaDefinition ? await ensureMedia(mediaDefinition) : null;
      const existingDoc = existingBusinessModelsByKey.get(enModel.key);

      if (existingDoc) {
        await payload.update({
          collection: 'business-models',
          id: existingDoc.id,
          locale: 'en',
          data: {
            title: enModel.title,
            media: mediaDoc?.id,
          },
          overrideAccess: true,
          overrideLock: true,
        });

        await payload.update({
          collection: 'business-models',
          id: existingDoc.id,
          locale: 'ar',
          data: {
            title: arModel.title,
            media: mediaDoc?.id,
          },
          overrideAccess: true,
          overrideLock: true,
        });

        continue;
      }

      const createdDoc = await payload.create({
        collection: 'business-models',
        locale: 'en',
        data: {
          key: enModel.key,
          title: enModel.title,
          media: mediaDoc?.id,
        },
        overrideAccess: true,
      });

      await payload.update({
        collection: 'business-models',
        id: createdDoc.id,
        locale: 'ar',
        data: {
          title: arModel.title,
          media: mediaDoc?.id,
        },
        overrideAccess: true,
        overrideLock: true,
      });
    }


    const existingByKey = new Map(existingDocs.docs.map((doc) => [doc.key, doc]));

    for (const key of sectionEntries) {
      const enValue = section.key === 'servicesSection'
        ? servicesSectionRichValues[key]?.en
        : enDictionary?.[section.key]?.[key];
      const arValue = section.key === 'servicesSection'
        ? servicesSectionRichValues[key]?.ar
        : arDictionary?.[section.key]?.[key];
      const value = typeof enValue === 'string' ? enValue : arValue;

      if (section.key !== 'servicesSection' && typeof value !== 'string') {
        continue;
      }
      const enRichText = section.key === 'servicesSection'
        ? enValue
        : buildRichText(typeof enValue === 'string' ? enValue : value, 'en');
      const arRichText = section.key === 'servicesSection'
        ? arValue
        : buildRichText(typeof arValue === 'string' ? arValue : value, 'ar');

      const existingDoc = existingByKey.get(key);

      if (existingDoc) {
        await payload.update({
          collection: section.slug,
          id: existingDoc.id,
          locale: 'en',
          data: {
            value: enRichText,
          },
          overrideAccess: true,
          overrideLock: true,
        });

        await payload.update({
          collection: section.slug,
          id: existingDoc.id,
          locale: 'ar',
          data: {
            value: arRichText,
          },
          overrideAccess: true,
          overrideLock: true,
        });

        continue;
      }

      const createdDoc = await payload.create({
        collection: section.slug,
        locale: 'en',
        data: {
          key,
          value: enRichText,
        },
        overrideAccess: true,
      });

      await payload.update({
        collection: section.slug,
        id: createdDoc.id,
        locale: 'ar',
        data: {
          value: arRichText,
        },
        overrideAccess: true,
        overrideLock: true,
      });
    }

    console.log(`Seeded ${sectionEntries.size} entries for ${section.key}.`);
  }

  const existingServices = await payload.find({
    collection: 'services',
    pagination: false,
    select: {
      key: true,
    },
    sort: '_order',
  });

  const existingServicesByKey = new Map(
    existingServices.docs.map((doc) => [doc.key, doc]),
  );

  for (const service of enServices) {
    const arService = arServices.find((item) => item.key === service.key);
    const serviceNumber = Number(service.key);
    const image = serviceImageOptions[(serviceNumber - 1) % serviceImageOptions.length]?.value || serviceImageOptions[0].value;
    const existingService = existingServicesByKey.get(service.key);

    const servicePayload = {
      key: service.key,
      title: buildRichText(service.title || '', 'en'),
      image,
      points: service.points.map((point) => ({
        title: buildRichText(point.title || '', 'en'),
        description: buildRichText(point.description || '', 'en'),
      })),
    };

    if (existingService) {
      await payload.update({
        collection: 'services',
        id: existingService.id,
        locale: 'en',
        data: {
          title: buildRichText(service.title || '', 'en'),
          image,
          points: service.points.map((point) => ({
            title: buildRichText(point.title || '', 'en'),
            description: buildRichText(point.description || '', 'en'),
          })),
        },
        overrideAccess: true,
        overrideLock: true,
      });

      await payload.update({
        collection: 'services',
        id: existingService.id,
        locale: 'ar',
        data: {
          title: buildRichText(arService?.title || service.title || '', 'ar'),
          image,
          points: (arService?.points || service.points).map((point) => ({
            title: buildRichText(point.title || '', 'ar'),
            description: buildRichText(point.description || '', 'ar'),
          })),
        },
        overrideAccess: true,
        overrideLock: true,
      });

      continue;
    }

    const createdService = await payload.create({
      collection: 'services',
      locale: 'en',
      data: servicePayload,
      overrideAccess: true,
    });

    await payload.update({
      collection: 'services',
      id: createdService.id,
      locale: 'ar',
      data: {
        title: buildRichText(arService?.title || service.title || '', 'ar'),
        image,
        points: (arService?.points || service.points).map((point) => ({
          title: buildRichText(point.title || '', 'ar'),
          description: buildRichText(point.description || '', 'ar'),
        })),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  }

  console.log(`Seeded ${enServices.length} services.`);
  
  // Seed Journey Section
  const existingJourneySection = await payload.find({
    collection: 'journey-section-data',
    where: { key: { equals: 'main' } },
    depth: 0,
  });

  const enJourneyData = enDictionary?.journeySection || {};
  const arJourneyData = arDictionary?.journeySection || {};

  const journeyPayload = {
    key: 'main',
    sectionTitle: buildRichText(enJourneyData.sectionTitle || 'Our Journey', 'en'),
    introTitle: buildRichText(enJourneyData.introTitle || '', 'en'),
    introDescription: buildRichText(enJourneyData.introDescription || '', 'en'),
    stats: [
      {
        number: 120,
        suffix: enJourneyData.plusSuffixDesktop || '+',
        label: buildRichText(enJourneyData.projects || 'Completed Projects', 'en'),
      },
      {
        number: 900,
        prefix: enJourneyData.percentPrefix || '%',
        label: buildRichText(enJourneyData.localization || 'Localization Rate', 'en'),
      },
      {
        number: 350,
        suffix: enJourneyData.plusSuffixDesktop || '+',
        label: buildRichText(enJourneyData.clients || 'Clients', 'en'),
      },
    ],
  };

  if (existingJourneySection.docs.length > 0) {
    const docId = existingJourneySection.docs[0].id;
    await payload.update({
      collection: 'journey-section-data',
      id: docId,
      locale: 'en',
      data: journeyPayload,
      overrideAccess: true,
      overrideLock: true,
    });
    await payload.update({
      collection: 'journey-section-data',
      id: docId,
      locale: 'ar',
      data: {
        sectionTitle: buildRichText(arJourneyData.sectionTitle || 'رحلتنا', 'ar'),
        introTitle: buildRichText(arJourneyData.introTitle || '', 'ar'),
        introDescription: buildRichText(arJourneyData.introDescription || '', 'ar'),
        stats: [
          {
            number: 120,
            suffix: arJourneyData.plusSuffixDesktop || '+',
            label: buildRichText(arJourneyData.projects || 'مشروع مكتمل', 'ar'),
          },
          {
            number: 900,
            prefix: arJourneyData.percentPrefix || '%',
            label: buildRichText(arJourneyData.localization || 'معدل التوطين', 'ar'),
          },
          {
            number: 350,
            suffix: arJourneyData.plusSuffixDesktop || '+',
            label: buildRichText(arJourneyData.clients || 'عميل', 'ar'),
          },
        ],
      },
      overrideAccess: true,
      overrideLock: true,
    });
  } else {
    const created = await payload.create({
      collection: 'journey-section-data',
      locale: 'en',
      data: journeyPayload,
      overrideAccess: true,
    });
    await payload.update({
      collection: 'journey-section-data',
      id: created.id,
      locale: 'ar',
      data: {
        sectionTitle: buildRichText(arJourneyData.sectionTitle || 'رحلتنا', 'ar'),
        introTitle: buildRichText(arJourneyData.introTitle || '', 'ar'),
        introDescription: buildRichText(arJourneyData.introDescription || '', 'ar'),
        stats: [
          {
            number: 120,
            suffix: arJourneyData.plusSuffixDesktop || '+',
            label: buildRichText(arJourneyData.projects || 'مشروع مكتمل', 'ar'),
          },
          {
            number: 900,
            prefix: arJourneyData.percentPrefix || '%',
            label: buildRichText(arJourneyData.localization || 'معدل التوطين', 'ar'),
          },
          {
            number: 350,
            suffix: arJourneyData.plusSuffixDesktop || '+',
            label: buildRichText(arJourneyData.clients || 'عميل', 'ar'),
          },
        ],
      },
      overrideAccess: true,
      overrideLock: true,
    });
  }
  console.log('Seeded Journey Section.');

  // Seed Partners Section
  const existingPartnersSection = await payload.find({
    collection: 'partners-section',
    where: { key: { equals: 'main' } },
    depth: 0,
  });

  const enPartnersData = enDictionary?.partnersSection || {};
  const arPartnersData = arDictionary?.partnersSection || {};

  const partnersPayload = {
    key: 'main',
    title: buildRichText(enPartnersData.title || 'Our Partners', 'en'),
    description: buildRichText(enPartnersData.description || '', 'en'),
    partners: partnerLogoOptions.map((opt) => ({
      name: opt.label,
      baseLogo: opt.value,
    })),
  };

  if (existingPartnersSection.docs.length > 0) {
    const docId = existingPartnersSection.docs[0].id;
    // Only update if requested or if needed, but for now let's just ensure title/description exist if they are empty
    // Actually, let's just always update it during seeding to keep it in sync with dictionaries if it's the first time
    await payload.update({
      collection: 'partners-section',
      id: docId,
      locale: 'en',
      data: partnersPayload,
      overrideAccess: true,
      overrideLock: true,
    });
    await payload.update({
      collection: 'partners-section',
      id: docId,
      locale: 'ar',
      data: {
        title: buildRichText(arPartnersData.title || 'شركاؤنا', 'ar'),
        description: buildRichText(arPartnersData.description || '', 'ar'),
        partners: partnerLogoOptions.map((opt) => ({
          name: opt.label,
          baseLogo: opt.value,
        })),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  } else {
    const created = await payload.create({
      collection: 'partners-section',
      locale: 'en',
      data: partnersPayload,
      overrideAccess: true,
    });
    await payload.update({
      collection: 'partners-section',
      id: created.id,
      locale: 'ar',
      data: {
        title: buildRichText(arPartnersData.title || 'شركاؤنا', 'ar'),
        description: buildRichText(arPartnersData.description || '', 'ar'),
        partners: partnerLogoOptions.map((opt) => ({
          name: opt.label,
          baseLogo: opt.value,
        })),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  }
  console.log('Seeded Partners Section.');

  // Seed Portfolio Section
  const existingPortfolioSection = await payload.find({
    collection: 'portfolio-section',
    where: { key: { equals: 'main' } },
    depth: 0,
  });

  const enPortfolioData = enDictionary?.portfolioSection || {};
  const arPortfolioData = arDictionary?.portfolioSection || {};

  const portfolioPayload = {
    key: 'main',
    title: buildRichText(joinWithLineBreaks(enPortfolioData.mainTitleLine1, enPortfolioData.mainTitleLine2), 'en'),
    description: buildRichText(enPortfolioData.description || '', 'en'),
  };

  if (existingPortfolioSection.docs.length > 0) {
    const docId = existingPortfolioSection.docs[0].id;
    await payload.update({
      collection: 'portfolio-section',
      id: docId,
      locale: 'en',
      data: portfolioPayload,
      overrideAccess: true,
      overrideLock: true,
    });
    await payload.update({
      collection: 'portfolio-section',
      id: docId,
      locale: 'ar',
      data: {
        title: buildRichText(joinWithLineBreaks(arPortfolioData.mainTitleLine1, arPortfolioData.mainTitleLine2), 'ar'),
        description: buildRichText(arPortfolioData.description || '', 'ar'),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  } else {
    const created = await payload.create({
      collection: 'portfolio-section',
      locale: 'en',
      data: portfolioPayload,
      overrideAccess: true,
    });
    await payload.update({
      collection: 'portfolio-section',
      id: created.id,
      locale: 'ar',
      data: {
        title: buildRichText(joinWithLineBreaks(arPortfolioData.mainTitleLine1, arPortfolioData.mainTitleLine2), 'ar'),
        description: buildRichText(arPortfolioData.description || '', 'ar'),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  }
  console.log('Seeded Portfolio Section.');

  // Seed Journeys
  const existingJourneys = await payload.find({
    collection: 'journeys',
    pagination: false,
    select: {
      year: true,
    },
  });

  const existingJourneysByYear = new Map(existingJourneys.docs.map((doc) => [doc.year, doc]));

  for (const enJourney of enJourneys) {
    const arJourney = arJourneys.find((j) => j.year === enJourney.year) || enJourney;
    const existingDoc = existingJourneysByYear.get(enJourney.year);

    if (existingDoc) {
      await payload.update({
        collection: 'journeys',
        id: existingDoc.id,
        locale: 'en',
        data: {
          title: buildRichText(enJourney.title || '', 'en'),
          description: buildRichText(enJourney.description || '', 'en'),
        },
        overrideAccess: true,
        overrideLock: true,
      });

      await payload.update({
        collection: 'journeys',
        id: existingDoc.id,
        locale: 'ar',
        data: {
          title: buildRichText(arJourney.title || '', 'ar'),
          description: buildRichText(arJourney.description || '', 'ar'),
        },
        overrideAccess: true,
        overrideLock: true,
      });

      continue;
    }

    const createdDoc = await payload.create({
      collection: 'journeys',
      locale: 'en',
      data: {
        year: enJourney.year,
        title: buildRichText(enJourney.title || '', 'en'),
        description: buildRichText(enJourney.description || '', 'en'),
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: 'journeys',
      id: createdDoc.id,
      locale: 'ar',
      data: {
        title: buildRichText(arJourney.title || '', 'ar'),
        description: buildRichText(arJourney.description || '', 'ar'),
      },
      overrideAccess: true,
      overrideLock: true,
    });
  }

  console.log(`Seeded ${enJourneys.length} journeys.`);

  // Seed Team Section
  const existingTeamSections = await payload.find({
    collection: 'team-section',
    where: { key: { equals: 'main' } },
    depth: 0,
  });

  const seedManagers = [
    { nameEn: 'Abdulrahman Al-Badr', nameAr: 'عبد الرحمن البدر', roleEn: 'CEO', roleAr: 'الرئيس التنفيذي', imageFile: 'team-manager-6.webp' },
    { nameEn: 'Mohammed Al-Mohammed', nameAr: 'محمد المحمد', roleEn: 'Head of Content', roleAr: 'رئيس قطاع المحتوى', imageFile: 'team-manager-5.webp' },
    { nameEn: 'Talal Al-Sulaimi', nameAr: 'طلال السليمي', roleEn: 'Head of Accounts', roleAr: 'رئيس قطاع الحسابات', imageFile: 'team-manager-4.webp' },
    { nameEn: 'Mustafa Khalil', nameAr: 'مصطفى خليل', roleEn: 'Head of Technical Sector', roleAr: 'رئيس القطاع الفني', imageFile: 'team-manager-3.webp' },
    { nameEn: 'Alaa Al-Zour', nameAr: 'علاء الزور', roleEn: 'Head of Technical Sector', roleAr: 'رئيس القطاع الفني', imageFile: 'team-manager-2.webp' },
    { nameEn: 'Ahmed Allama', nameAr: 'أحمد علامة', roleEn: 'Head of Accounting', roleAr: 'رئيس قطاع المحاسبة', imageFile: 'team-manager-1.webp' },
  ];

  const managersDataEn = [];
  const managersDataAr = [];

  for (const mgr of seedManagers) {
    managersDataEn.push({
      name: mgr.nameEn,
      role: mgr.roleEn,
      baseImage: `/${mgr.imageFile}`,
    });
    managersDataAr.push({
      name: mgr.nameAr,
      role: mgr.roleAr,
      baseImage: `/${mgr.imageFile}`,
    });
  }

  const membersDataEn = [];
  const membersDataAr = [];
  for (let i = 1; i <= 51; i++) {
    const imageFile = `team-${i}.webp`;
    membersDataEn.push({
      name: `Team Member ${i}`,
      baseImage: `/${imageFile}`,
    });
    membersDataAr.push({
      name: `عضو فريق ${i}`,
      baseImage: `/${imageFile}`,
    });
  }

  const teamSectionPayloadEn = {
    key: 'main',
    title: buildRichText('Our Team', 'en'),
    description: buildRichText('The pillars of Nuss success and the makers of its glory', 'en'),
    managers: managersDataEn,
    members: membersDataEn,
  };

  const teamSectionPayloadAr = {
    title: buildRichText('فريقنا', 'ar'),
    description: buildRichText('أعمدة نجاح النّص وصنّاع أمجاده', 'ar'),
    managers: managersDataAr,
    members: membersDataAr,
  };

  if (existingTeamSections.docs.length > 0) {
    const docId = existingTeamSections.docs[0].id;
    await payload.update({
      collection: 'team-section',
      id: docId,
      locale: 'en',
      data: teamSectionPayloadEn,
      overrideAccess: true,
      overrideLock: true,
    });
    await payload.update({
      collection: 'team-section',
      id: docId,
      locale: 'ar',
      data: teamSectionPayloadAr,
      overrideAccess: true,
      overrideLock: true,
    });
  } else {
    const created = await payload.create({
      collection: 'team-section',
      locale: 'en',
      data: teamSectionPayloadEn,
      overrideAccess: true,
    });
    await payload.update({
      collection: 'team-section',
      id: created.id,
      locale: 'ar',
      data: teamSectionPayloadAr,
      overrideAccess: true,
      overrideLock: true,
    });
  }
  console.log('Seeded Team Section.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
