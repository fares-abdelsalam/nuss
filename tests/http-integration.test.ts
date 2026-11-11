/**
 * HTTP integration seam for admin save authentication (issue #3, part of #1).
 *
 * Gated: every case is skipped unless RUN_HTTP_INTEGRATION=1 is set, so lint,
 * build and CI never execute it or touch a database.
 *
 * Run against a DISPOSABLE database only:
 *
 *   RUN_HTTP_INTEGRATION=1 TEST_DATABASE_URI=postgresql://... npm run test:integration
 *
 * Without TEST_BASE_URL the suite boots the app itself (`next dev` on an
 * ephemeral port). With TEST_BASE_URL it targets an already-running app that
 * must be on the same disposable database.
 *
 * Everything — user bootstrap, fixtures, session, saves — goes through the
 * HTTP API; the test process never opens a database connection. The suite
 * refuses to start when TEST_DATABASE_URI points at the production database
 * configured in .env.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const GATED = process.env.RUN_HTTP_INTEGRATION === "1";
const SKIP = GATED
  ? false
  : "set RUN_HTTP_INTEGRATION=1 (with a disposable TEST_DATABASE_URI) to run";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL = "nuss-http-integration@example.test";
const PASSWORD = "HttpIntegration!123";
const MEDIA_FIXTURES = 10;
// Reserved TLD (RFC 2606): can never become a real, allowlisted host.
const DENIED_ORIGIN = "https://nuss-http-integration-denied.example";
const BOOT_TIMEOUT_MS = 300_000;
// 1x1 transparent PNG used as fixture upload content.
const FIXTURE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type PortfolioEntry = {
  title?: string;
  logo?: number | string | null;
  mainMedia?: number | string | null;
};

type PortfolioDoc = {
  id: number | string;
  tabs?: Array<{
    tabLabel?: string;
    tabId?: string;
    entries?: PortfolioEntry[];
  }>;
};

const ctx = {
  base: "",
  cookie: "",
  allowedOrigin: "",
  docId: 0 as number | string,
  mediaIds: [] as (number | string)[],
  child: null as ChildProcess | null,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Refuse to run when the supplied URI points at the production database
 * configured in .env (the shared Supabase pooler).
 */
function assertDisposableDatabase(uri: string): void {
  const host = new URL(uri).hostname;
  const envPath = path.join(ROOT, ".env");
  const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  let productionHost = "";
  for (const key of [
    "NEXT_DATABASE_URI",
    "DATABASE_URL",
    "POSTGRES_URL",
    "DATABASE_URI",
  ]) {
    const match = envText.match(new RegExp(`^\\s*${key}\\s*=\\s*(\\S+)`, "m"));
    if (!match) continue;
    try {
      productionHost = new URL(match[1].replace(/^["']|["']$/g, "")).hostname;
      break;
    } catch {
      // unparsable value in .env: no host to compare against
    }
  }
  if (productionHost && productionHost === host) {
    throw new Error(
      `refusing to run: TEST_DATABASE_URI host (${host}) is the production database from .env`,
    );
  }
}

/**
 * Reads the allowlisted origins from the app's own configuration file, so
 * this suite cannot rot when the allowlist changes.
 * shortcut: parses the literal `csrf` array; switch to evaluating the config
 * if entries ever become computed instead of string literals.
 */
function readAllowlist(): string[] {
  const source = fs.readFileSync(
    path.join(ROOT, "payload.config.ts"),
    "utf8",
  );
  const block = source.match(/csrf:\s*\[([\s\S]*?)\]/);
  if (!block) return [];
  return [...block[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1]);
}

async function freePort(): Promise<number> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  if (!port) throw new Error("could not allocate an ephemeral port");
  return port;
}

function stopApp(child: ChildProcess): void {
  if (child.exitCode !== null || child.pid === undefined) return;
  if (process.platform === "win32") {
    // kill the whole tree: next dev owns compiler workers
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

async function bootApp(databaseUri: string): Promise<{
  base: string;
  child: ChildProcess;
}> {
  const port = await freePort();
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
    cwd: ROOT,
    env: {
      ...process.env,
      // overrides .env: Next.js never overwrites vars already in process.env
      NEXT_DATABASE_URI: databaseUri,
      // keep the app off the production storage bucket that .env enables
      BUCKET_NAME: "",
      SUPABASE_BUCKET: "",
      S3_BUCKET: "",
      ACCESS_KEY_ID: "",
      SECRET_ACCESS_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logs: string[] = [];
  const record = (chunk: Buffer) => {
    logs.push(chunk.toString());
    if (logs.length > 200) logs.splice(0, logs.length - 200);
  };
  child.stdout?.on("data", record);
  child.stderr?.on("data", record);
  let exited = false;
  child.on("exit", () => {
    exited = true;
  });

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  for (;;) {
    try {
      await fetch(`${base}/api/users/me`, {
        signal: AbortSignal.timeout(10_000),
      });
      return { base, child }; // any HTTP answer means the app is serving
    } catch {
      // not ready yet
    }
    if (exited) {
      throw new Error(`next dev exited before serving requests:\n${logs.join("")}`);
    }
    if (Date.now() > deadline) {
      stopApp(child);
      throw new Error(
        `app did not become ready within ${BOOT_TIMEOUT_MS}ms:\n${logs.join("")}`,
      );
    }
    await sleep(1000);
  }
}

function sessionCookie(res: Response): string | null {
  const cookie = res.headers.getSetCookie().find((entry) => entry.includes("-token="));
  return cookie ? cookie.split(";")[0] : null;
}

function loginRequest(): Promise<Response> {
  return fetch(`${ctx.base}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ctx.allowedOrigin },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
}

/** Authenticate through the HTTP login endpoint and return the session cookie. */
async function obtainSession(): Promise<string> {
  const first = await loginRequest();
  if (first.ok) {
    const cookie = sessionCookie(first);
    if (cookie) return cookie;
    throw new Error("login succeeded but set no session cookie");
  }
  // Fresh disposable database: bootstrap the editor first, then still obtain
  // the session through the login endpoint.
  const register = await fetch(`${ctx.base}/api/users/first-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ctx.allowedOrigin },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!register.ok) {
    throw new Error(
      `login failed (${first.status}) and first-register failed (${register.status}): ${await register.text()}`,
    );
  }
  const second = await loginRequest();
  const cookie = second.ok ? sessionCookie(second) : null;
  if (!cookie) {
    throw new Error(`login after first-register failed (${second.status})`);
  }
  return cookie;
}

async function ensurePortfolioDoc(): Promise<number | string> {
  const list = await fetch(
    `${ctx.base}/api/portfolio-section?limit=1&depth=0`,
  );
  const body = (await list.json()) as { docs?: Array<{ id: number | string }> };
  const existing = body.docs?.[0];
  if (existing) return existing.id;

  const created = await fetch(`${ctx.base}/api/portfolio-section`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ctx.cookie,
      Origin: ctx.allowedOrigin,
    },
    body: "{}",
  });
  if (!created.ok) {
    throw new Error(
      `could not create the portfolio fixture: ${created.status} ${await created.text()}`,
    );
  }
  const doc = (await created.json()) as { id: number | string };
  return doc.id;
}

async function ensureMediaFixtures(): Promise<(number | string)[]> {
  const list = await fetch(
    `${ctx.base}/api/media?limit=${MEDIA_FIXTURES}&depth=0`,
  );
  const body = (await list.json()) as { docs?: Array<{ id: number | string }> };
  const ids = (body.docs ?? []).map((doc) => doc.id);
  while (ids.length < MEDIA_FIXTURES) {
    const form = new FormData();
    form.append(
      "file",
      new Blob([FIXTURE_PNG], { type: "image/png" }),
      `http-integration-fixture-${ids.length}.png`,
    );
    const created = await fetch(`${ctx.base}/api/media`, {
      method: "POST",
      headers: { Cookie: ctx.cookie, Origin: ctx.allowedOrigin },
      body: form,
    });
    if (!created.ok) {
      throw new Error(
        `could not create a media fixture: ${created.status} ${await created.text()}`,
      );
    }
    const doc = (await created.json()) as { id: number | string };
    ids.push(doc.id);
  }
  return ids;
}

async function save(
  data: Record<string, unknown>,
  options: { origin?: string; cookie?: string } = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.origin) headers.Origin = options.origin;
  if (options.cookie) headers.Cookie = options.cookie;
  return fetch(`${ctx.base}/api/portfolio-section/${ctx.docId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
}

async function readDoc(): Promise<PortfolioDoc> {
  const res = await fetch(
    `${ctx.base}/api/portfolio-section/${ctx.docId}?depth=0`,
  );
  assert.equal(res.status, 200, "re-read of the portfolio document must work");
  return (await res.json()) as PortfolioDoc;
}

function savePayload(tabLabel: string): Record<string, unknown> {
  return {
    tabs: [{ tabLabel, tabId: "integration", entries: [] }],
  };
}

before(async () => {
  if (!GATED) return;

  const databaseUri = process.env.TEST_DATABASE_URI;
  if (!databaseUri) {
    throw new Error(
      "TEST_DATABASE_URI must point at a disposable database when RUN_HTTP_INTEGRATION=1",
    );
  }
  assertDisposableDatabase(databaseUri);

  ctx.allowedOrigin = readAllowlist()[0];
  if (!ctx.allowedOrigin) {
    throw new Error(
      "payload.config.ts exposes no allowlisted origin to test against",
    );
  }

  if (process.env.TEST_BASE_URL) {
    ctx.base = process.env.TEST_BASE_URL.replace(/\/+$/, "");
  } else {
    const app = await bootApp(databaseUri);
    ctx.child = app.child;
    ctx.base = app.base;
  }

  ctx.cookie = await obtainSession();
  ctx.docId = await ensurePortfolioDoc();
  ctx.mediaIds = await ensureMediaFixtures();
});

after(async () => {
  if (ctx.child) stopApp(ctx.child);
});

test(
  "save from an allowlisted origin with a valid session round-trips",
  { skip: SKIP },
  async () => {
    const marker = `allowlisted-${Date.now()}`;
    const res = await save(savePayload(marker), {
      origin: ctx.allowedOrigin,
      cookie: ctx.cookie,
    });
    assert.equal(
      res.status,
      200,
      `expected 200 from a save on an allowlisted origin, got ${res.status}`,
    );
    const saved = (await res.json()) as PortfolioDoc;
    assert.equal(String(saved.id), String(ctx.docId));
    assert.equal(saved.tabs?.[0]?.tabLabel, marker);

    const reread = await readDoc();
    assert.equal(reread.tabs?.[0]?.tabLabel, marker);
  },
);

test(
  "save from a non-allowlisted origin is treated as unauthenticated and writes nothing",
  { skip: SKIP },
  async () => {
    const prior = await readDoc();
    const res = await save(savePayload(`denied-${Date.now()}`), {
      origin: DENIED_ORIGIN,
      cookie: ctx.cookie,
    });
    assert.ok(
      res.status === 401 || res.status === 403,
      `expected a disallowed origin to be rejected with 401/403, got ${res.status}`,
    );

    const reRead = await readDoc();
    assert.equal(
      reRead.tabs?.[0]?.tabLabel,
      prior.tabs?.[0]?.tabLabel,
      "a save from a disallowed origin must not change the stored document",
    );
  },
);

test(
  "save without a session is rejected",
  { skip: SKIP },
  async () => {
    const prior = await readDoc();
    const res = await save(savePayload(`anonymous-${Date.now()}`), {
      origin: ctx.allowedOrigin,
    });
    assert.ok(
      res.status === 401 || res.status === 403,
      `expected an anonymous save to be rejected with 401/403, got ${res.status}`,
    );

    const reRead = await readDoc();
    assert.equal(
      reRead.tabs?.[0]?.tabLabel,
      prior.tabs?.[0]?.tabLabel,
      "an anonymous save must not change the stored document",
    );
  },
);

test(
  "save carrying many media relations returns no 5xx and persists",
  { skip: SKIP },
  async () => {
    const entries = ctx.mediaIds.map((id, index) => ({
      title: `Integration entry ${index}`,
      logo: id,
      mainMedia: id,
    }));
    const res = await save(
      {
        tabs: [{ tabLabel: "media-heavy", tabId: "integration", entries }],
      },
      { origin: ctx.allowedOrigin, cookie: ctx.cookie },
    );
    assert.ok(
      res.status < 500,
      `expected no 5xx from a save carrying ${entries.length} media relations, got ${res.status}`,
    );

    const reread = await readDoc();
    const stored = reread.tabs?.[0]?.entries ?? [];
    assert.equal(
      stored.length,
      entries.length,
      "every entry with media relations must be persisted",
    );
    assert.deepEqual(
      stored.map((entry) => entry.logo),
      ctx.mediaIds,
      "persisted media relations must match what was saved",
    );
  },
);
