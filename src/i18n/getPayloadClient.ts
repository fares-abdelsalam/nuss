import 'server-only';

import { getPayload } from 'payload';
import type { BasePayload } from 'payload';
import config from '@payload-config';

// globalThis survives across requests within same Vercel container.
// Saves one Payload init per container (not per request).
// On init failure, clears itself so next call retries.
// No react cache() — that would permanently cache a rejected promise,
// making the container dead until recycled.
const globalForPayload = globalThis as typeof globalThis & {
  __payloadClient?: Promise<BasePayload>;
};

export const getPayloadClient = async (): Promise<BasePayload> => {
  if (!globalForPayload.__payloadClient) {
    globalForPayload.__payloadClient = getPayload({ config }).catch((err) => {
      // Clear on failure so next invocation retries
      globalForPayload.__payloadClient = undefined;
      throw err;
    });
  }
  return globalForPayload.__payloadClient;
};
