// Sample posts for the blog demo, from the recipe's run, with five more and CC0 covers.
import { demoPath, withBase } from "@/site/config";

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const blogPath = (path = "") => `${demoPath("blog")}${path}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const blogHref = (path = "") => withBase(blogPath(path));

export type Block =
	| { type: "p"; text: string }
	| { type: "list"; items: string[] }
	| { type: "quote"; text: string }
	| { type: "code"; language: string; code: string };

export type Section = {
	id: string;
	title: string;
	/** 2 for a top-level section, 3 for a subsection. */
	level?: 2 | 3;
	blocks: Block[];
};

export type Post = {
	slug: string;
	title: string;
	/** ISO date. */
	date: string;
	minutes: number;
	excerpt: string;
	tags: Tag[];
	sections: Section[];
};

export const tags = ["TypeScript", "React", "Performance", "Servers", "Tooling", "Teams"] as const;

export type Tag = (typeof tags)[number];

export const site = {
	name: "Field Notes",
	description:
		"Notes on building for the web: TypeScript, React, servers and the small things in between.",
	author: {
		name: "Alex Rivera",
		role: "Software engineer, platform team",
		bio: "I build web apps and the tools around them, and write down what I learn so I don't have to learn it twice.",
	},
};

export type Credit = { slug: string; alt: string; creator: string; source: string };

/** Cover photos: CC0 from StockSnap, found through Openverse. */
export const covers: Credit[] = [
	{
		slug: "typescript-narrowing",
		alt: "A dirt path narrowing between tall pines",
		creator: "Lukasz Szmigiel",
		source: "https://stocksnap.io/photo/trees-forest-ZJOY89B3SM",
	},
	{
		slug: "http-caching",
		alt: "Wooden shelves filled with rows of books",
		creator: "Aleksi Tappura",
		source: "https://stocksnap.io/photo/library-books-C4001BDB1C",
	},
	{
		slug: "streaming-server-components",
		alt: "A stream falling over layered rock in a green gorge",
		creator: "Ryan McGuire",
		source: "https://stocksnap.io/photo/river-water-590AD278FA",
	},
	{
		slug: "debugging-in-the-fog",
		alt: "Clouds rolling over a dark mountain ridge",
		creator: "World Travel Adventures",
		source: "https://stocksnap.io/photo/mountain-fog-Y9HUXYMTDP",
	},
	{
		slug: "small-cli-tools",
		alt: "Hand tools hung in rows on a workshop wall",
		creator: "Barn Images",
		source: "https://stocksnap.io/photo/tools-workshop-KD30XPQR0A",
	},
	{
		slug: "zero-downtime-migrations",
		alt: "A railway line curving through autumn trees",
		creator: "Matt Moloney",
		source: "https://stocksnap.io/photo/train-tracks-HHJDXRO0R9",
	},
	{
		slug: "hard-to-misuse",
		alt: "Cable-stayed bridge cables seen from below",
		creator: "Gerrit Vermeulen",
		source: "https://stocksnap.io/photo/bridge-architecture-9CGW06WAWR",
	},
	{
		slug: "write-it-down",
		alt: "An open notebook with a pen and glasses on a white desk",
		creator: "Artsy Crafty",
		source: "https://stocksnap.io/photo/notebook-desk-GRGCZJ7CNE",
	},
	{
		slug: "about",
		alt: "A leather notebook and a ruler on a wooden desk",
		creator: "Jeff Sheldon",
		source: "https://stocksnap.io/photo/hardwood-table-F672CBDC0F",
	},
];

export const coverOf = (slug: string) => {
	const credit = covers.find((cover) => cover.slug === slug);

	return credit && { src: withBase(`/recipes/media/blog-${slug}.webp`), alt: credit.alt };
};

const unsorted: Post[] = [
	{
		slug: "typescript-narrowing",
		title: "A field guide to TypeScript narrowing",
		date: "2026-10-28",
		minutes: 9,
		excerpt:
			"typeof, in, discriminated unions and custom type guards: how the compiler follows your control flow, and how to help it when it can't.",
		tags: ["TypeScript"],
		sections: [
			{
				id: "why-narrowing",
				title: "Why narrowing matters",
				blocks: [
					{
						type: "p",
						text: "Most values in a real program arrive with a type that is wider than what you need. A form field is `string | undefined`, an API response is a union of success and error shapes, and an event handler receives whatever the browser decided to send. Narrowing is how TypeScript follows your checks through the code and shrinks those wide types down to the one you are actually holding.",
					},
					{
						type: "p",
						text: "The good news is that you rarely have to ask for it. The compiler performs control-flow analysis on every function: each `if`, `return`, `throw` and assignment teaches it something about the variables in scope. The trick is learning which checks it understands, so you can write code that reads naturally and still type-checks without casts.",
					},
					{
						type: "quote",
						text: "Every `as` in a codebase is a place where a human promised the compiler something it couldn't verify. Narrowing lets you keep fewer promises.",
					},
				],
			},
			{
				id: "typeof-and-truthiness",
				title: "typeof and truthiness",
				blocks: [
					{
						type: "p",
						text: "The simplest guards are the ones JavaScript already has. `typeof` checks narrow primitives, and a truthiness check removes `null` and `undefined` (along with `0` and the empty string, which is the classic trap).",
					},
					{
						type: "code",
						language: "ts",
						code: `function formatPrice(value: number | string | undefined) {
  if (value === undefined) return "—";

  if (typeof value === "string") {
    // value: string
    return value.trim();
  }

  // value: number
  return value.toFixed(2);
}`,
					},
					{
						type: "p",
						text: "Notice that the early `return` does as much work as the `if` itself. After the first line, `undefined` is gone from the type for the rest of the function. Early returns keep the happy path flat and give the compiler clear boundaries to reason about.",
					},
				],
			},
			{
				id: "discriminated-unions",
				title: "Discriminated unions",
				blocks: [
					{
						type: "p",
						text: "When you control the shape of your data, the most robust pattern is a discriminated union: every member carries a literal field, usually called `type`, `kind` or `status`, that tells them apart. A `switch` on that field narrows each branch to exactly one member.",
					},
					{
						type: "code",
						language: "ts",
						code: `type Result<T> =
  | { status: "ok"; data: T }
  | { status: "error"; error: string; retryable: boolean };

function render(result: Result<User[]>) {
  switch (result.status) {
    case "ok":
      return result.data.map((user) => user.name).join(", ");
    case "error":
      return result.retryable ? "Try again" : result.error;
  }
}`,
					},
					{
						type: "p",
						text: "This scales well because adding a new member is a compile-time event. Every switch that handles the union now has a branch it does not cover, and with an exhaustiveness check the compiler will point at each one.",
					},
				],
			},
			{
				id: "exhaustiveness",
				title: "Exhaustiveness checks",
				level: 3,
				blocks: [
					{
						type: "p",
						text: "Assigning the narrowed value to `never` in the default branch turns a forgotten case into a type error rather than a runtime surprise:",
					},
					{
						type: "code",
						language: "ts",
						code: `function assertNever(value: never): never {
  throw new Error(\`Unhandled case: \${JSON.stringify(value)}\`);
}

switch (result.status) {
  case "ok": /* … */ break;
  case "error": /* … */ break;
  default:
    assertNever(result);
}`,
					},
				],
			},
			{
				id: "custom-guards",
				title: "Custom type guards",
				blocks: [
					{
						type: "p",
						text: "Sometimes the check you need is too involved for the compiler to infer, such as validating data from `JSON.parse`. A function with a `value is T` return type tells TypeScript what a `true` result means.",
					},
					{
						type: "code",
						language: "ts",
						code: `type User = { id: string; name: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

const users = JSON.parse(body).filter(isUser); // User[]`,
					},
					{
						type: "p",
						text: "Since TypeScript 5.5, simple arrow functions passed to `filter` infer their own predicate, so `values.filter((v) => v !== null)` already returns a non-null array. Reach for an explicit guard when the logic is reused or more than a line long.",
					},
				],
			},
			{
				id: "takeaways",
				title: "Takeaways",
				blocks: [
					{
						type: "list",
						items: [
							"Return early: each exit removes a case from the rest of the function.",
							"Model states as discriminated unions instead of optional fields.",
							"Add an exhaustiveness check where new cases are likely.",
							"Write type guards for data you don't control, and keep them next to the type.",
						],
					},
					{
						type: "p",
						text: "None of this requires exotic type-level programming. It's ordinary JavaScript, written so that both your colleagues and the compiler can follow it.",
					},
				],
			},
		],
	},
	{
		slug: "streaming-server-components",
		title: "Streaming pages with Server Components",
		date: "2026-10-09",
		minutes: 7,
		excerpt:
			"Send the shell first and fill in slow parts as they resolve. A walk through Suspense boundaries, loading states and what the user actually sees.",
		tags: ["React", "Performance"],
		sections: [
			{
				id: "the-problem",
				title: "The problem with waiting",
				blocks: [
					{
						type: "p",
						text: "A traditional server-rendered page is only as fast as its slowest query. If the product details take 40 ms but the recommendations take 900 ms, the user stares at a blank tab for almost a second, even though most of the page was ready almost immediately.",
					},
					{
						type: "p",
						text: "Streaming flips that around. The server sends HTML as soon as it has any, and keeps the connection open to send the rest. The browser paints the header, the navigation and the main content right away, and the slow parts slot in when they are done.",
					},
				],
			},
			{
				id: "suspense-boundaries",
				title: "Suspense boundaries",
				blocks: [
					{
						type: "p",
						text: "In React, the unit of streaming is a `<Suspense>` boundary. Everything outside it is part of the first chunk; everything inside it can arrive later, with the `fallback` shown in the meantime.",
					},
					{
						type: "code",
						language: "tsx",
						code: `import { Suspense } from "react";

export default async function ProductPage({ params }: PageProps<"/p/[id]">) {
  const { id } = await params;
  const product = await getProduct(id); // fast

  return (
    <>
      <ProductDetails product={product} />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={id} /> {/* slow */}
      </Suspense>
    </>
  );
}`,
					},
					{
						type: "p",
						text: "Where you put the boundary is a design decision, not just a technical one. Too many boundaries and the page pops in piece by piece; too few and you're back to waiting on the slowest part.",
					},
				],
			},
			{
				id: "skeletons",
				title: "Designing fallbacks",
				blocks: [
					{
						type: "p",
						text: "A good fallback has the same size as the content it stands in for, so nothing jumps when the real content arrives. It should be quiet: a few muted blocks, not a spinner in the middle of the page.",
					},
					{
						type: "list",
						items: [
							"Match the final layout's height to avoid layout shift.",
							"Keep the number of distinct loading states small.",
							"Announce loading once to screen readers, not once per block.",
						],
					},
				],
			},
			{
				id: "measuring",
				title: "Measuring the result",
				blocks: [
					{
						type: "p",
						text: "The metric that moves the most is time to first byte, followed by first contentful paint. Total load time often stays the same, because the slow query is still slow. That's fine: what users notice is how long they wait before something useful appears.",
					},
					{
						type: "code",
						language: "bash",
						code: `# Watch chunks arrive one by one
curl -N --no-buffer https://localhost:3000/p/42`,
					},
				],
			},
		],
	},
	{
		slug: "small-cli-tools",
		title: "Writing small CLI tools in Bun",
		date: "2026-09-17",
		minutes: 5,
		excerpt:
			"Argument parsing, colors, exit codes and shipping a single binary: everything you need to turn a script into a tool your team will actually use.",
		tags: ["Tooling"],
		sections: [
			{
				id: "start-with-a-script",
				title: "Start with a script",
				blocks: [
					{
						type: "p",
						text: "Every useful tool begins life as a script someone ran twice. The moment a third person asks how to run it, it's worth spending an hour to give it a name, a `--help` and sensible exit codes.",
					},
				],
			},
			{
				id: "parsing-arguments",
				title: "Parsing arguments",
				blocks: [
					{
						type: "p",
						text: "Node's built-in `parseArgs` works in Bun too, and covers most needs without a dependency:",
					},
					{
						type: "code",
						language: "ts",
						code: `import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
  options: {
    out: { type: "string", short: "o", default: "dist" },
    watch: { type: "boolean", short: "w" },
  },
});

if (positionals.length === 0) {
  console.error("usage: pack <entry> [-o dir] [-w]");
  process.exit(2);
}`,
					},
				],
			},
			{
				id: "shipping",
				title: "Shipping a binary",
				blocks: [
					{
						type: "p",
						text: "`bun build --compile` bundles your code and the runtime into one executable. No install step for your colleagues, and no question about which Node version they have.",
					},
					{
						type: "code",
						language: "bash",
						code: `bun build ./src/cli.ts --compile --outfile pack
./pack src/index.ts -o build`,
					},
					{
						type: "p",
						text: "Keep the tool small and boring. The best internal tools do one thing, print what they did, and exit with a non-zero code when they fail so they compose with everything else.",
					},
				],
			},
		],
	},
	{
		slug: "http-caching",
		title: "HTTP caching, from the headers up",
		date: "2026-10-21",
		minutes: 8,
		excerpt:
			"Cache-Control, ETags and stale-while-revalidate: what each header promises, who honours it, and the three settings that cover most sites.",
		tags: ["Performance", "Servers"],
		sections: [
			{
				id: "two-caches",
				title: "Two caches, one header",
				blocks: [
					{
						type: "p",
						text: "Every response can be stored twice on its way to the user: once in a shared cache (a CDN or a proxy) and once in the browser. `Cache-Control` speaks to both, and most caching bugs come from forgetting that the same header is read by two very different readers.",
					},
					{
						type: "p",
						text: "`max-age` tells the browser how long a copy stays fresh. `s-maxage` overrides it for shared caches only. `private` keeps a response out of shared caches entirely, which is what you want for anything that depends on a cookie.",
					},
				],
			},
			{
				id: "three-settings",
				title: "Three settings that cover most sites",
				blocks: [
					{
						type: "code",
						language: "ts",
						code: `const caching = {
  // Fingerprinted assets: the URL changes when the file does.
  asset: "public, max-age=31536000, immutable",
  // HTML: always ask, but let the CDN answer quickly.
  page: "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
  // Anything behind a login.
  account: "private, no-store",
};`,
					},
					{
						type: "p",
						text: "The first line is safe only because the file name carries a hash of its contents. The second keeps pages fresh for users while the CDN serves a copy up to ten minutes old and refreshes it in the background.",
					},
				],
			},
			{
				id: "validation",
				title: "Validation with ETags",
				blocks: [
					{
						type: "p",
						text: "When a copy goes stale, the cache doesn't have to download it again. It sends the `ETag` it has in `If-None-Match`, and the server answers `304 Not Modified` with an empty body if nothing changed.",
					},
					{
						type: "code",
						language: "bash",
						code: `curl -I https://example.com/feed.xml
# etag: "5f2b-18c"

curl -I -H 'If-None-Match: "5f2b-18c"' https://example.com/feed.xml
# HTTP/2 304`,
					},
				],
			},
			{
				id: "checklist",
				title: "A short checklist",
				blocks: [
					{
						type: "list",
						items: [
							"Hash asset file names, then cache them for a year.",
							"Send `private` with anything that reads a cookie.",
							"Use `stale-while-revalidate` for pages, not `max-age` alone.",
							"Check the headers your CDN actually sends, not the ones you set.",
						],
					},
				],
			},
		],
	},
	{
		slug: "debugging-in-the-fog",
		title: "Debugging in the fog",
		date: "2026-09-30",
		minutes: 6,
		excerpt:
			"No debugger, no repro, one angry graph. How to narrow down a production problem with logs, timing and a written list of guesses.",
		tags: ["Servers", "Tooling"],
		sections: [
			{
				id: "write-the-guesses",
				title: "Write the guesses down",
				blocks: [
					{
						type: "p",
						text: "The first ten minutes of an incident decide the next two hours. Before changing anything, write down what you know, what you think, and what would prove each guess wrong. It feels slow; it is the fastest way to stop chasing the same idea twice.",
					},
					{
						type: "quote",
						text: "A guess you can't disprove isn't a lead. It's a mood.",
					},
				],
			},
			{
				id: "structured-logs",
				title: "Logs you can query",
				blocks: [
					{
						type: "p",
						text: "A log line is only useful in an incident if you can filter on it. Log events as objects with a request id, a duration and the few fields you will want to group by later.",
					},
					{
						type: "code",
						language: "ts",
						code: `const started = performance.now();

try {
  return await handler(request);
} finally {
  log.info({
    event: "request",
    id: request.headers.get("x-request-id"),
    route: new URL(request.url).pathname,
    ms: Math.round(performance.now() - started),
  });
}`,
					},
				],
			},
			{
				id: "bisect",
				title: "Bisect in time",
				blocks: [
					{
						type: "p",
						text: "Most production problems start at a moment. Line the graph up with deploys, config changes and traffic, and the list of suspects usually shrinks to one or two. If it doesn't, the cause is probably outside your code: a dependency, a certificate, a quota.",
					},
					{
						type: "list",
						items: [
							"When did it start, to the minute?",
							"What shipped or changed within an hour before?",
							"Is it every request, one route, or one customer?",
						],
					},
				],
			},
		],
	},
	{
		slug: "zero-downtime-migrations",
		title: "Database migrations without downtime",
		date: "2026-09-02",
		minutes: 7,
		excerpt:
			"Expand, migrate, contract: renaming a column while the old code is still running, in three deploys you can each roll back.",
		tags: ["Servers"],
		sections: [
			{
				id: "two-versions",
				title: "Two versions at once",
				blocks: [
					{
						type: "p",
						text: "During a rolling deploy, old and new code run side by side against the same database. A migration that the new code needs and the old code can't survive will break production for a few minutes, every time.",
					},
				],
			},
			{
				id: "expand",
				title: "Expand",
				blocks: [
					{
						type: "p",
						text: "Add the new shape next to the old one. Nothing reads it yet, so this step is always safe to ship and to roll back.",
					},
					{
						type: "code",
						language: "sql",
						code: `ALTER TABLE users ADD COLUMN display_name text;

UPDATE users SET display_name = full_name
WHERE display_name IS NULL;`,
					},
				],
			},
			{
				id: "migrate",
				title: "Migrate",
				blocks: [
					{
						type: "p",
						text: "Ship code that writes both columns and reads the new one. Backfill in batches so a large table doesn't hold a lock for minutes.",
					},
					{
						type: "code",
						language: "ts",
						code: `await db.update(users)
  .set({ fullName: name, displayName: name })
  .where(eq(users.id, id));`,
					},
				],
			},
			{
				id: "contract",
				title: "Contract",
				blocks: [
					{
						type: "p",
						text: "Once no running code reads the old column, drop it. Wait a full deploy cycle first: the step you can't roll back should be the one nobody depends on.",
					},
				],
			},
		],
	},
	{
		slug: "hard-to-misuse",
		title: "Designing APIs that are hard to misuse",
		date: "2026-08-19",
		minutes: 8,
		excerpt:
			"Good names, fewer booleans and types that make wrong calls fail to compile. Notes from reviewing a few hundred pull requests against a shared library.",
		tags: ["TypeScript", "Teams"],
		sections: [
			{
				id: "booleans",
				title: "One boolean is fine, three are a bug",
				blocks: [
					{
						type: "p",
						text: "A call like `send(message, true, false, true)` can't be reviewed: nobody remembers what the third flag means. Booleans also combine into states that make no sense, like `loading` and `error` both true.",
					},
					{
						type: "code",
						language: "ts",
						code: `// Before: 8 combinations, 3 of them valid
type Props = { loading: boolean; error: boolean; empty: boolean };

// After: exactly the states that exist
type Props = { status: "loading" | "error" | "empty" | "ready" };`,
					},
				],
			},
			{
				id: "options-objects",
				title: "Options objects over positions",
				blocks: [
					{
						type: "p",
						text: "Past two arguments, take an object. Callers read like documentation, new options don't break old calls, and defaults live in one place.",
					},
					{
						type: "code",
						language: "ts",
						code: `retry(fetchUser, { attempts: 3, backoff: "exponential" });`,
					},
				],
			},
			{
				id: "branded-types",
				title: "Make wrong calls fail to compile",
				level: 3,
				blocks: [
					{
						type: "p",
						text: "Two ids that are both strings will be swapped one day. A brand costs nothing at runtime and turns that swap into a type error.",
					},
					{
						type: "code",
						language: "ts",
						code: `type UserId = string & { readonly brand: "UserId" };
type TeamId = string & { readonly brand: "TeamId" };

declare function addMember(team: TeamId, user: UserId): Promise<void>;

addMember(userId, teamId); // error: arguments are swapped`,
					},
				],
			},
			{
				id: "errors",
				title: "Errors that say what to do",
				blocks: [
					{
						type: "p",
						text: 'An error message is part of the API. Say what was expected, what arrived, and the next step: `Expected a TeamId, got "u_123" (a UserId). Did you swap the arguments?` saves a support thread.',
					},
				],
			},
		],
	},
	{
		slug: "write-it-down",
		title: "Write the decision down",
		date: "2026-08-05",
		minutes: 4,
		excerpt:
			"Decision records for small teams: one page, five headings, written the day you decide. Why they beat a long design doc nobody updates.",
		tags: ["Teams"],
		sections: [
			{
				id: "why",
				title: "Why bother",
				blocks: [
					{
						type: "p",
						text: "Six months from now someone will ask why the app uses a queue here, or why that library was dropped. If the answer lives in a chat thread, it's gone. A short record written on the day you decide is the cheapest documentation a team can keep.",
					},
				],
			},
			{
				id: "template",
				title: "The template",
				blocks: [
					{
						type: "code",
						language: "md",
						code: `# 014: Queue outgoing email

Date: 2026-08-05 · Status: accepted

## Context
Sending inline made checkout slow when the mail API lagged.

## Decision
Push emails to a queue; a worker sends them with retries.

## Consequences
Emails can arrive a minute late. Failures show up in the worker's dashboard.`,
					},
					{
						type: "p",
						text: "Number the records and never edit an accepted one. When a decision changes, write a new record that supersedes the old one, so the history stays readable.",
					},
				],
			},
			{
				id: "habits",
				title: "Habits that keep it alive",
				blocks: [
					{
						type: "list",
						items: [
							"Keep records in the repo, next to the code they explain.",
							"Link the record from the pull request that implements it.",
							"Write it in the meeting, not after it.",
						],
					},
				],
			},
		],
	},
];

export const posts = unsorted.toSorted((a, b) => b.date.localeCompare(a.date));

export const postBySlug = (slug: string) => posts.find((post) => post.slug === slug);

export const formatDate = (iso: string) =>
	new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IE", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
