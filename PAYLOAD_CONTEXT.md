# Payload CMS Integration Context

When adding a new schema or collection to Payload CMS in this project, please follow these standard steps:

1. **Create the Collection Config:**
   - Add a new TypeScript file in `src/collections/` (e.g., `src/collections/MyNewSection.ts`).
   - Define the `CollectionConfig` focusing on access controls, fields, and singleton logic if applicable (using `beforeValidate` hooks to lock keys to 'main').
   - Keep localized fields explicitly defined with `localized: true`.

2. **Register the Collection in Payload Config:**
   - Open `payload.config.ts`.
   - Import your new collection.
   - Add it to the `collections` array inside `buildConfig()`.
   - Add its slug to the `admin.livePreview.collections` array so that Live Preview functions properly for it.

3. **Create the Data Fetcher:**
   - Create a corresponding fetcher in `src/i18n/` (e.g., `src/i18n/getMyNewSection.ts`).
   - Use the `getPayloadClient` to query the new collection based on the current `locale`.
   - Implement a fallback to `i18n` dictionaries (`en.json`, `ar.json`) or default values if the CMS query returns empty. This ensures the component works safely prior to CMS seeding.

4. **When to use Getters vs. Default Translation Collections:**
   - **Simple Sections:** If a section only consists of standard title and description fields (like `teamSection`, `navbar`, etc.), **do not** create a custom Collection Config or a custom getter. Instead, rely on `src/i18n/translationCollections.ts` which automatically creates a Payload CMS collection for each predefined section and dynamically syncs it with `getDictionary.ts`. Your component can directly fetch these values using `t('sectionKey', 'fieldKey')` which handles rich text gracefully.
   - **Complex Sections:** If a section requires complex, repeatable data structures, dynamic arrays (e.g., repeating cards, portfolio items, or selectable lists), or custom image references, you **must** create a custom Collection Config and write a custom getter (like `getMethodologySection.ts`) to query the data and pass it as a prop.

5. **Update the Main Page (for Complex Sections Only):**
   - In `src/app/(site)/page.tsx`, import your new fetcher.
   - Add the fetcher to the `Promise.all` block.
   - Pass the fetched CMS data as props to the React component corresponding to your new section.

5. **Update the Component to Handle Props:**
   - In your section's `.tsx` file, accept the props fetched from the CMS.
   - Use a fallback approach: if CMS props are provided and valid, use them. Otherwise, fall back to default values or `i18n` translated strings using `useTranslation()`.

Following these steps ensures that any new schema aligns correctly with both Payload CMS's structure and Next.js App Router's i18n data fetching paradigm.

## Database Schema Updates

When you add new collections or modify existing ones (especially adding new fields or relations), you need to update the database schema. Drizzle ORM is used to manage the PostgreSQL schema.

To push schema changes to the database:
1. Ensure your local or remote database is running and accessible (check `DATABASE_URL` in `.env`).
2. Request of the user to run the schema push command (don't run it yourself):
   ```bash
   npm run schema:push
   ```
   This command uses the Payload schema push utility, which analyzes your Payload config and automatically creates or updates tables and columns in your Postgres database to match your schema definition.
3. This is essential for new fields (like localized text fields or new collections) to be correctly saved. If you don't push the schema, Payload might throw database errors when trying to save or query data.
