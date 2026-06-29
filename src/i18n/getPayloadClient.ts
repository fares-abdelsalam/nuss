import 'server-only';

import { cache } from 'react';
import { getPayload } from 'payload';
import type { BasePayload } from 'payload';
import config from '@payload-config';

// globalThis survives Turbopack HMR module reloads, ensuring
// only ONE Payload instance ever created per dev session.
// Prevents connection pool exhaustion from orphaned instances.
const globalForPayload = globalThis as typeof globalThis & {
  __payloadClient?: Promise<BasePayload>;
};

export const getPayloadClient = cache(async () => {
  if (!globalForPayload.__payloadClient) {
    globalForPayload.__payloadClient = getPayload({ config });
  }
  return globalForPayload.__payloadClient;
});
