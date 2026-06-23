import 'server-only';

import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';

export const getPayloadClient = cache(async () => {
  return getPayload({ config });
});
