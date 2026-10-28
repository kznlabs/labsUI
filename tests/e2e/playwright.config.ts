import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/labsUI";
const CI = !!process.env.CI;

const engines = [
	["chromium", devices["Desktop Chrome"]],
	["firefox", devices["Desktop Firefox"]],
	["webkit", devices["Desktop Safari"]],
] as const;

export default defineConfig({
	testDir: ".",
	testMatch: /\.e2e\.ts$/,
	outputDir: "../../test-results",
	timeout: 60_000,
	fullyParallel: true,
	// Pages are CPU-heavy, more workers just add timeouts. CI runners have 2 cores.
	workers: CI ? 2 : "50%",
	forbidOnly: CI,
	retries: CI ? 1 : 0,
	reporter: [
		[CI ? "dot" : "line"],
		...(CI
			? [["github"] as const, ["json", { outputFile: "../../e2e-results.json" }] as const]
			: []),
		["html", { outputFolder: "../../playwright-report", open: "never" }],
	],
	use: {
		baseURL: `http://localhost:${PORT}${BASE}/`,
		reducedMotion: "reduce",
		trace: "retain-on-failure",
	},
	projects: engines.flatMap(([name, device]) => [
		{
			name: `${name}-390`,
			use: {
				...device,
				viewport: { width: 390, height: 844 },
				hasTouch: true,
				// Firefox has no mobile emulation.
				isMobile: name !== "firefox",
			},
		},
		{ name: `${name}-1280`, use: { ...device, viewport: { width: 1280, height: 900 } } },
	]),
	webServer: {
		command: "bun serve.ts",
		url: `http://localhost:${PORT}${BASE}/`,
		env: { PORT: String(PORT), NEXT_PUBLIC_BASE_PATH: BASE },
		reuseExistingServer: !CI,
	},
});
