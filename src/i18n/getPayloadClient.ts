import "server-only";
import { getPayload } from "payload";
import type { BasePayload } from "payload";
import config from "@payload-config";

const globalForPayload = globalThis as typeof globalThis & {
  __payloadClient?: Promise<BasePayload>;
  __payloadRetryAt?: number;
};

const RETRY_DELAY_MS = 500;

export const getPayloadClient = async (): Promise<BasePayload> => {
  // If a previous attempt failed recently, wait before retrying
  if (!globalForPayload.__payloadClient && globalForPayload.__payloadRetryAt) {
    const waitMs = globalForPayload.__payloadRetryAt - Date.now();
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  if (!globalForPayload.__payloadClient) {
    globalForPayload.__payloadClient = getPayload({ config }).catch((err) => {
      globalForPayload.__payloadClient = undefined;
      // Back off 500ms before the next container in this instance retries
      globalForPayload.__payloadRetryAt = Date.now() + RETRY_DELAY_MS;
      throw err;
    });
  }

  return globalForPayload.__payloadClient;
};
