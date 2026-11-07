// Sample docs for Tempo, a made-up HTTP client, from the recipe's run with six more pages.
import type { ChangelogRelease } from "@/components/blocks/changelog";
import type { PropsTableRow } from "@/components/ui/props-table";
import { demoPath, withBase } from "@/site/config";

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const docsPath = (slug = "") => `${demoPath("docs-site")}${slug && `/${slug}`}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const docsHref = (slug = "") => withBase(docsPath(slug));

export type Block =
	| { type: "p"; text: string }
	| { type: "list"; items: string[] }
	| {
			type: "code";
			language: string;
			code: string;
			highlight?: (number | [number, number])[];
			/** Hover notes by line number. */
			notes?: Record<number, string>;
	  }
	| { type: "install"; packages: string; dev?: boolean }
	| { type: "callout"; tone: "info" | "warning" | "success"; title: string; text: string }
	| { type: "options"; label: string; rows: PropsTableRow[] }
	| { type: "releases" };

export type Section = {
	id: string;
	title: string;
	/** 2 for a top-level section, 3 for a subsection. */
	level?: 2 | 3;
	blocks: Block[];
};

export type DocPage = {
	slug: string;
	title: string;
	description: string;
	/** ISO date of the last edit. */
	updated: string;
	/** A sidebar badge, e.g. "New". */
	badge?: string;
	sections: Section[];
};

export type DocGroup = { label: string; pages: DocPage[] };

export const product = {
	name: "Tempo",
	version: "2.4.1",
	tagline: "A 3 kB fetch client with retries, caching and typed responses.",
};

export const releases: ChangelogRelease[] = [
	{
		version: "v2.4",
		title: "Interceptors",
		date: "Oct 28, 2026",
		dateTime: "2026-10-28",
		changes: [
			{ type: "new", text: "`onRequest` and `onResponse` interceptors, async and in order." },
			{ type: "improved", text: "`TempoError` keeps the request's `method` and `headers`." },
			{ type: "fixed", text: "A cached response no longer shares its body stream between reads." },
		],
	},
	{
		version: "v2.3",
		title: "Cancellation everywhere",
		date: "Sep 9, 2026",
		dateTime: "2026-09-09",
		changes: [
			{ type: "new", text: "`signal` on every method, and `api.abortAll()`." },
			{ type: "improved", text: "Retries stop as soon as the signal aborts." },
		],
	},
	{
		version: "v2.2",
		title: "Smaller cache",
		date: "Jul 21, 2026",
		dateTime: "2026-07-21",
		changes: [
			{ type: "improved", text: "The cache evicts least recently used entries first." },
			{ type: "fixed", text: "`cache.delete()` matched paths without their query." },
		],
	},
	{
		version: "v2.0",
		title: "One client per API",
		date: "May 4, 2026",
		dateTime: "2026-05-04",
		changes: [
			{ type: "new", text: "`createClient()` replaces the global `tempo.configure()`." },
			{ type: "new", text: "ES modules only; Node.js 20 or newer." },
		],
	},
];

export const groups: DocGroup[] = [
	{
		label: "Getting started",
		pages: [
			{
				slug: "introduction",
				title: "Introduction",
				description: "What Tempo is, and when to reach for it.",
				updated: "2026-10-28",
				sections: [
					{
						id: "what-is-tempo",
						title: "What is Tempo?",
						blocks: [
							{
								type: "p",
								text: "Tempo is a 3 kB wrapper around `fetch` that adds retries with backoff, request deduplication and an in-memory cache. It runs in browsers, Node.js 20+, Bun and edge runtimes.",
							},
							{
								type: "list",
								items: [
									"Typed responses with `client.get<T>()`.",
									"Retries on network errors and `5xx` responses, never on `4xx`.",
									"Cancellation through a standard `AbortSignal`.",
									"Interceptors for auth headers, logging and tracing.",
								],
							},
						],
					},
					{
						id: "at-a-glance",
						title: "At a glance",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `import { createClient } from "tempo-http";

const api = createClient({ baseUrl: "https://api.example.com" });

const user = await api.get<User>("/users/42");`,
								highlight: [3],
							},
						],
					},
					{
						id: "when-not-to-use-it",
						title: "When not to use it",
						blocks: [
							{
								type: "p",
								text: "Tempo is for JSON APIs. For uploads with progress, streams you read chunk by chunk or a GraphQL client with normalized caching, use `fetch` directly or a tool made for that job.",
							},
						],
					},
					{
						id: "browser-support",
						title: "Browser support",
						blocks: [
							{
								type: "p",
								text: "Any browser with native `fetch` and `AbortController`: every evergreen browser released since 2020.",
							},
						],
					},
				],
			},
			{
				slug: "installation",
				title: "Installation",
				description: "Add Tempo to a project with your package manager.",
				updated: "2026-10-12",
				sections: [
					{
						id: "install-the-package",
						title: "Install the package",
						blocks: [
							{ type: "install", packages: "tempo-http" },
							{
								type: "callout",
								tone: "info",
								title: "No dependencies",
								text: "Tempo uses the platform's `fetch`, `URL` and `AbortController`, so it adds nothing else to your lockfile.",
							},
						],
					},
					{
						id: "typescript",
						title: "TypeScript",
						blocks: [
							{
								type: "p",
								text: 'Types ship with the package. Tempo needs `"moduleResolution": "bundler"` or `"nodenext"` in your `tsconfig.json`.',
							},
							{
								type: "code",
								language: "json",
								code: `{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true
  }
}`,
								highlight: [4],
							},
						],
					},
					{
						id: "cdn",
						title: "From a CDN",
						level: 3,
						blocks: [
							{
								type: "code",
								language: "html",
								code: `<script type="module">
  import { createClient } from "https://esm.sh/tempo-http@2";
</script>`,
							},
						],
					},
				],
			},
			{
				slug: "quick-start",
				title: "Quick start",
				description: "Make your first request in five minutes.",
				updated: "2026-10-12",
				sections: [
					{
						id: "create-a-client",
						title: "Create a client",
						blocks: [
							{
								type: "p",
								text: "Create one client per API and share it. Put it in its own module so every import reuses the same cache.",
							},
							{
								type: "code",
								language: "ts",
								code: `// lib/api.ts
import { createClient } from "tempo-http";

export const api = createClient({
  baseUrl: process.env.API_URL,
  headers: { Authorization: \`Bearer \${process.env.API_TOKEN}\` },
});`,
							},
						],
					},
					{
						id: "make-a-request",
						title: "Make a request",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `import { api } from "./lib/api";

type Post = { id: number; title: string };

const posts = await api.get<Post[]>("/posts", { query: { limit: 10 } });
const created = await api.post<Post>("/posts", { body: { title: "Hello" } });`,
								highlight: [[5, 6]],
							},
						],
					},
					{
						id: "next-steps",
						title: "Next steps",
						blocks: [
							{
								type: "list",
								items: [
									"Read every option of `createClient`.",
									"Tune `retry` for flaky upstreams.",
									"Turn on caching for read-heavy endpoints.",
								],
							},
						],
					},
				],
			},
		],
	},
	{
		label: "Core concepts",
		pages: [
			{
				slug: "requests",
				title: "Requests",
				description: "Methods, paths, query strings and bodies.",
				updated: "2026-09-30",
				sections: [
					{
						id: "methods",
						title: "Methods",
						blocks: [
							{
								type: "p",
								text: "A client has `get`, `post`, `put`, `patch` and `delete`. Each takes a path and an options object and returns the parsed body.",
							},
							{
								type: "code",
								language: "ts",
								code: `await api.get<User>("/users/42");
await api.put<User>("/users/42", { body: { name: "Ada" } });
await api.delete("/users/42");`,
							},
						],
					},
					{
						id: "query-strings",
						title: "Query strings",
						blocks: [
							{
								type: "p",
								text: "Pass `query` as an object. Arrays repeat the key, `undefined` values are left out, so optional filters need no `if`.",
							},
							{
								type: "code",
								language: "ts",
								code: `await api.get("/orders", {
  query: { status: ["paid", "shipped"], after: cursor, limit: 50 },
});
// GET /orders?status=paid&status=shipped&limit=50`,
								highlight: [4],
							},
						],
					},
					{
						id: "bodies",
						title: "Bodies",
						blocks: [
							{
								type: "p",
								text: "Plain objects are sent as JSON with the matching `Content-Type`. `FormData`, `Blob` and `URLSearchParams` pass through untouched.",
							},
						],
					},
					{
						id: "deduplication",
						title: "Deduplication",
						blocks: [
							{
								type: "p",
								text: "Two `GET`s to the same URL while the first is in flight share one request. Both callers get the same parsed body.",
							},
							{
								type: "callout",
								tone: "warning",
								title: "Don't mutate shared results",
								text: "Deduplicated callers receive the same object. Copy it before changing it, or turn deduplication off with `dedupe: false`.",
							},
						],
					},
				],
			},
			{
				slug: "interceptors",
				title: "Interceptors",
				description: "Change every request and response in one place.",
				updated: "2026-10-28",
				badge: "New",
				sections: [
					{
						id: "on-request",
						title: "Before a request",
						blocks: [
							{
								type: "p",
								text: "`onRequest` runs before each try, retries included, so a refreshed token is picked up on the next attempt. Return the request to send.",
							},
							{
								type: "code",
								language: "ts",
								code: `const api = createClient({
  baseUrl: "https://api.example.com",
  onRequest: async (request) => {
    const token = await session.token();
    request.headers.set("Authorization", \`Bearer \${token}\`);
    return request;
  },
});`,
								highlight: [[3, 7]],
								notes: {
									4: "Runs per try: a token refreshed between retries is used",
									6: "Return a new Request to replace it entirely",
								},
							},
						],
					},
					{
						id: "on-response",
						title: "After a response",
						blocks: [
							{
								type: "p",
								text: "`onResponse` sees the raw `Response` before Tempo parses it. Throw to turn a success into a failure.",
							},
							{
								type: "code",
								language: "ts",
								code: `onResponse: (response, request) => {
  metrics.timing("api", performance.now() - request.startedAt);
  return response;
},`,
							},
						],
					},
					{
						id: "order",
						title: "Order",
						blocks: [
							{
								type: "p",
								text: "Pass an array to run several in order. Request interceptors run first to last, response interceptors last to first, like layers around the call.",
							},
						],
					},
				],
			},
			{
				slug: "cancellation",
				title: "Cancellation",
				description: "Stop requests nobody is waiting for.",
				updated: "2026-09-09",
				sections: [
					{
						id: "abort-signal",
						title: "With an AbortSignal",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `const controller = new AbortController();

const search = api.get("/search", { query: { q }, signal: controller.signal });

controller.abort(); // rejects with error.reason === "aborted"`,
								highlight: [3],
							},
						],
					},
					{
						id: "in-react",
						title: "In a React effect",
						blocks: [
							{
								type: "p",
								text: "Abort in the effect's cleanup, so a fast typist never sees results for an old query.",
							},
							{
								type: "code",
								language: "tsx",
								code: `useEffect(() => {
  const controller = new AbortController();

  api
    .get<Result[]>("/search", { query: { q }, signal: controller.signal })
    .then(setResults)
    .catch(ignoreAbort);

  return () => controller.abort();
}, [q]);`,
								highlight: [9],
							},
						],
					},
					{
						id: "abort-all",
						title: "Abort everything",
						level: 3,
						blocks: [
							{
								type: "p",
								text: "`api.abortAll()` cancels every request in flight, e.g. when a user signs out.",
							},
						],
					},
				],
			},
		],
	},
	{
		label: "API reference",
		pages: [
			{
				slug: "create-client",
				title: "createClient",
				description: "Create a configured client instance.",
				updated: "2026-10-28",
				sections: [
					{
						id: "signature",
						title: "Signature",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: "function createClient(options?: ClientOptions): Client;",
							},
						],
					},
					{
						id: "options",
						title: "Options",
						blocks: [
							{
								type: "options",
								label: "createClient options",
								rows: [
									{
										name: "baseUrl",
										type: "string",
										required: true,
										description: "Prefix for every relative path, e.g. `https://api.example.com`.",
									},
									{
										name: "headers",
										type: "HeadersInit",
										default: "{}",
										description:
											"Sent with every request. Per-request `headers` are merged on top.",
									},
									{
										name: "timeout",
										type: "number",
										default: "10000",
										description: "Milliseconds before a request is aborted. `0` waits forever.",
									},
									{
										name: "retry",
										type: "RetryOptions | false",
										default: "{ attempts: 3 }",
										description: "How failed requests are retried. `false` turns retries off.",
									},
									{
										name: "cache",
										type: "CacheOptions | false",
										default: "false",
										description: "In-memory cache for `GET` requests.",
									},
									{
										name: "dedupe",
										type: "boolean",
										default: "true",
										description: "Share one in-flight `GET` between callers of the same URL.",
									},
									{
										name: "onRequest",
										type: "Interceptor | Interceptor[]",
										description: "Runs before each try; returns the request to send.",
									},
									{
										name: "onResponse",
										type: "ResponseInterceptor | ResponseInterceptor[]",
										description: "Runs on the raw response before it is parsed.",
									},
									{
										name: "fetch",
										type: "typeof fetch",
										default: "globalThis.fetch",
										description: "Custom fetch implementation, e.g. for tests.",
									},
									{
										name: "onError",
										type: "(error: TempoError) => void",
										description: "Called once per request after the last retry fails.",
									},
								],
							},
						],
					},
					{
						id: "returns",
						title: "Returns",
						blocks: [
							{
								type: "p",
								text: "A `Client` with `get`, `post`, `put`, `patch` and `delete` methods. Each returns a promise of the parsed JSON body.",
							},
						],
					},
					{
						id: "example",
						title: "Example",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `const api = createClient({
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retry: { attempts: 5, backoff: "exponential" },
  onError: (error) => console.error(error.status, error.url),
});`,
								highlight: [[3, 4]],
							},
						],
					},
				],
			},
			{
				slug: "retry",
				title: "retry",
				description: "Retry policies and backoff strategies.",
				updated: "2026-09-09",
				sections: [
					{
						id: "overview",
						title: "Overview",
						blocks: [
							{
								type: "p",
								text: "Tempo retries requests that fail with a network error, a timeout, or a status in `retryOn`. Non-idempotent methods (`POST`, `PATCH`) are only retried when you opt in.",
							},
						],
					},
					{
						id: "retry-options",
						title: "Options",
						blocks: [
							{
								type: "options",
								label: "Retry options",
								rows: [
									{
										name: "attempts",
										type: "number",
										default: "3",
										description: "Tries in total, including the first.",
									},
									{
										name: "backoff",
										type: '"fixed" | "linear" | "exponential"',
										default: '"exponential"',
										description: "How the delay grows between tries.",
									},
									{
										name: "delay",
										type: "number",
										default: "300",
										description: "Base delay in milliseconds.",
									},
									{
										name: "jitter",
										type: "boolean",
										default: "true",
										description: "Adds up to 20% at random, so clients don't retry in step.",
									},
									{
										name: "retryOn",
										type: "number[]",
										default: "[408, 429, 500, 502, 503, 504]",
										description: "Statuses that trigger a retry.",
									},
									{
										name: "methods",
										type: "string[]",
										default: '["GET", "PUT", "DELETE"]',
										description: "Methods that may be retried.",
									},
								],
							},
						],
					},
					{
						id: "retry-after",
						title: "Retry-After",
						blocks: [
							{
								type: "p",
								text: "A `429` or `503` with a `Retry-After` header waits as long as the server asks, up to `timeout`, instead of the backoff delay.",
							},
						],
					},
					{
						id: "per-request",
						title: "Per-request overrides",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `await api.post("/payments", {
  body,
  retry: { attempts: 2, methods: ["POST"] },
});`,
								highlight: [3],
							},
							{
								type: "callout",
								tone: "warning",
								title: "Retry a POST only with an idempotency key",
								text: "Otherwise a timeout after the server committed charges twice. Send an `Idempotency-Key` header the server checks.",
							},
						],
					},
				],
			},
			{
				slug: "cache",
				title: "cache",
				description: "Cache GET responses in memory.",
				updated: "2026-07-21",
				sections: [
					{
						id: "enable-caching",
						title: "Enable caching",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `const api = createClient({
  baseUrl: "https://api.example.com",
  cache: { ttl: 60_000, max: 500 },
});`,
								highlight: [3],
							},
						],
					},
					{
						id: "cache-options",
						title: "Options",
						blocks: [
							{
								type: "options",
								label: "Cache options",
								rows: [
									{
										name: "ttl",
										type: "number",
										default: "30000",
										description: "Milliseconds an entry stays fresh.",
									},
									{
										name: "max",
										type: "number",
										default: "100",
										description: "Entries kept before the least recently used is evicted.",
									},
									{
										name: "key",
										type: "(url: URL) => string",
										default: "url.href",
										description: "Builds the cache key for a request.",
									},
								],
							},
						],
					},
					{
						id: "invalidation",
						title: "Invalidation",
						blocks: [
							{
								type: "p",
								text: "Call `api.cache.delete(path)` after a write, or `api.cache.clear()` to drop everything.",
							},
						],
					},
				],
			},
			{
				slug: "tempo-error",
				title: "TempoError",
				description: "The error every failed request rejects with.",
				updated: "2026-10-28",
				sections: [
					{
						id: "fields",
						title: "Fields",
						blocks: [
							{
								type: "options",
								label: "TempoError fields",
								rows: [
									{
										name: "status",
										type: "number",
										description: "HTTP status, or `0` when no response arrived.",
									},
									{
										name: "reason",
										type: '"http" | "network" | "timeout" | "aborted"',
										description: "Why the request failed.",
									},
									{ name: "url", type: "string", description: "The full URL of the last try." },
									{ name: "method", type: "string", description: "The request's method." },
									{
										name: "attempts",
										type: "number",
										description: "Tries made, the first included.",
									},
									{
										name: "body",
										type: "unknown",
										description: "The parsed error body, when the server sent one.",
									},
								],
							},
						],
					},
					{
						id: "is-tempo-error",
						title: "Narrowing",
						blocks: [
							{
								type: "p",
								text: "`instanceof TempoError` works across bundles: the check reads a symbol, not the class identity.",
							},
						],
					},
				],
			},
		],
	},
	{
		label: "Guides",
		pages: [
			{
				slug: "error-handling",
				title: "Error handling",
				description: "Catch, inspect and recover from failed requests.",
				updated: "2026-10-28",
				sections: [
					{
						id: "catching-errors",
						title: "Catching errors",
						blocks: [
							{
								type: "p",
								text: "Every failure rejects with a `TempoError` carrying `status`, `url`, `attempts` and the parsed `body` when there is one.",
							},
							{
								type: "code",
								language: "ts",
								code: `import { TempoError } from "tempo-http";

try {
  await api.get("/users/42");
} catch (error) {
  if (error instanceof TempoError && error.status === 404) {
    return null;
  }
  throw error;
}`,
								highlight: [[6, 8]],
							},
						],
					},
					{
						id: "timeouts",
						title: "Timeouts",
						blocks: [
							{
								type: "p",
								text: 'A timeout rejects with `error.status === 0` and `error.reason === "timeout"`. It counts as a failed attempt, so it is retried.',
							},
						],
					},
					{
						id: "reporting",
						title: "Reporting",
						blocks: [
							{
								type: "p",
								text: "`onError` runs once per request, after the last retry, so an error tracker sees one event, not one per try.",
							},
						],
					},
				],
			},
			{
				slug: "testing",
				title: "Testing",
				description: "Swap the network for a stub in unit tests.",
				updated: "2026-08-15",
				sections: [
					{
						id: "stub-fetch",
						title: "Stub fetch",
						blocks: [
							{
								type: "p",
								text: "Pass your own `fetch` to the client. No global mocks, so tests can run in parallel.",
							},
							{
								type: "code",
								language: "ts",
								code: `import { expect, test } from "bun:test";
import { createClient } from "tempo-http";

test("reads a user", async () => {
  const api = createClient({
    baseUrl: "https://api.test",
    fetch: async () => Response.json({ id: 42, name: "Ada" }),
  });

  expect(await api.get("/users/42")).toEqual({ id: 42, name: "Ada" });
});`,
								highlight: [7],
							},
						],
					},
					{
						id: "retries-in-tests",
						title: "Retries in tests",
						blocks: [
							{
								type: "p",
								text: "Set `retry: { delay: 0 }` so a test of the failure path doesn't wait for backoff.",
							},
						],
					},
				],
			},
			{
				slug: "migrating",
				title: "Migrating from v1",
				description: "Move from the global client to createClient.",
				updated: "2026-05-04",
				sections: [
					{
						id: "before-you-start",
						title: "Before you start",
						blocks: [
							{
								type: "callout",
								tone: "info",
								title: "Takes about ten minutes",
								text: "Most apps change one file: the place that called `tempo.configure()`.",
							},
						],
					},
					{
						id: "replace-configure",
						title: "Replace configure",
						blocks: [
							{
								type: "code",
								language: "ts",
								code: `// v1
import tempo from "tempo-http";
tempo.configure({ baseUrl: API_URL });

// v2
import { createClient } from "tempo-http";
export const api = createClient({ baseUrl: API_URL });`,
								highlight: [[6, 7]],
							},
						],
					},
					{
						id: "renamed-options",
						title: "Renamed options",
						blocks: [
							{
								type: "list",
								items: [
									"`retries` is now `retry.attempts`.",
									"`cacheTime` is now `cache.ttl`, in milliseconds.",
									"`onFail` is now `onError`.",
								],
							},
						],
					},
					{
						id: "esm-only",
						title: "ES modules only",
						level: 3,
						blocks: [
							{
								type: "p",
								text: '`require("tempo-http")` no longer works. Node.js 20 can `import` it from CommonJS with a dynamic `import()`.',
							},
						],
					},
				],
			},
		],
	},
	{
		label: "Resources",
		pages: [
			{
				slug: "changelog",
				title: "Changelog",
				description: "What changed in each release.",
				updated: "2026-10-28",
				sections: [{ id: "releases", title: "Releases", blocks: [{ type: "releases" }] }],
			},
		],
	},
];

export const pages = groups.flatMap((group) => group.pages);

export function pageBySlug(slug: string) {
	const index = pages.findIndex((page) => page.slug === slug);
	const page = pages[index];

	if (!page) return;

	const group = groups.find((group) => group.pages.includes(page));

	return { page, group, previous: pages[index - 1], next: pages[index + 1] };
}

export const formatDate = (iso: string) =>
	new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
