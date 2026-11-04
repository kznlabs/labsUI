/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { pageRange } from "@/components/ui/pagination";
import { listKeyTarget, scrollIntoList } from "@/lib/list";
import { spyIndex } from "@/lib/scroll-spy";
import { matchesHotkey } from "@/lib/use-hotkey";
import { clamp, formatMoney } from "@/lib/utils";

const key = (pressed: string, mods: Partial<KeyboardEvent> = {}) =>
	({ key: pressed, ctrlKey: false, metaKey: false, altKey: false, ...mods }) as KeyboardEvent;
const items = ["a", "b", "c", "d"];
const vertical = { orientation: "vertical" } as const;
const horizontal = { orientation: "horizontal" } as const;

describe("clamp", () => {
	test("keeps values inside the range", () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
	});
});

describe("formatMoney", () => {
	test("whole amounts drop their decimals, others keep them", () => {
		expect(formatMoney(49)).toBe("$49");
		expect(formatMoney(49.99)).toBe("$49.99");
		expect(formatMoney(49.5)).toBe("$49.50");
		expect(formatMoney(0)).toBe("$0");
	});

	test("follows the currency and locale", () => {
		expect(formatMoney(49.99, "PLN", "pl-PL").replace(/\s/g, " ")).toBe("49,99 zł");
		expect(formatMoney(49, "PLN", "pl-PL").replace(/\s/g, " ")).toBe("49 zł");
	});
});

describe("listKeyTarget", () => {
	test("vertical lists move on ↑ ↓ and ignore ← →", () => {
		expect(listKeyTarget(items, 1, key("ArrowDown"), vertical)).toBe("c");
		expect(listKeyTarget(items, 1, key("ArrowUp"), vertical)).toBe("a");
		expect(listKeyTarget(items, 1, key("ArrowRight"), vertical)).toBeUndefined();
	});

	test("horizontal lists move on ← → and ignore ↑ ↓", () => {
		expect(listKeyTarget(items, 1, key("ArrowRight"), horizontal)).toBe("c");
		expect(listKeyTarget(items, 1, key("ArrowLeft"), horizontal)).toBe("a");
		expect(listKeyTarget(items, 1, key("ArrowDown"), horizontal)).toBeUndefined();
	});

	test("loops past the ends by default", () => {
		expect(listKeyTarget(items, 3, key("ArrowDown"), vertical)).toBe("a");
		expect(listKeyTarget(items, 0, key("ArrowUp"), vertical)).toBe("d");
	});

	test("stops at the ends without loop", () => {
		const opts = { ...vertical, loop: false };

		expect(listKeyTarget(items, 3, key("ArrowDown"), opts)).toBe("d");
		expect(listKeyTarget(items, 0, key("ArrowUp"), opts)).toBe("a");
	});

	test("with nothing active, ↓ goes to the first item and ↑ to the last (first without loop)", () => {
		expect(listKeyTarget(items, -1, key("ArrowDown"), vertical)).toBe("a");
		expect(listKeyTarget(items, -1, key("ArrowUp"), vertical)).toBe("d");
		expect(listKeyTarget(items, -1, key("ArrowUp"), { ...vertical, loop: false })).toBe("a");
	});

	test("Home and End jump to the ends", () => {
		expect(listKeyTarget(items, 2, key("Home"), vertical)).toBe("a");
		expect(listKeyTarget(items, 1, key("End"), vertical)).toBe("d");
	});

	test("homeEnd: false leaves Home and End alone", () => {
		expect(listKeyTarget(items, 2, key("Home"), { ...vertical, homeEnd: false })).toBeUndefined();
	});

	test('homeEnd: "ctrl" needs Ctrl, so a text field keeps plain Home and End', () => {
		const opts = { ...vertical, homeEnd: "ctrl" } as const;

		expect(listKeyTarget(items, 2, key("Home"), opts)).toBeUndefined();
		expect(listKeyTarget(items, 2, key("Home", { ctrlKey: true }), opts)).toBe("a");
		expect(listKeyTarget(items, 1, key("End", { ctrlKey: true }), opts)).toBe("d");
	});

	test("empty lists and other keys move nowhere", () => {
		expect(listKeyTarget([], 0, key("ArrowDown"), vertical)).toBeUndefined();
		expect(listKeyTarget(items, 1, key("a"), vertical)).toBeUndefined();
	});
});

describe("matchesHotkey", () => {
	test('"mod+k" matches ⌘K and Ctrl+K, not plain K or with Alt', () => {
		expect(matchesHotkey(key("k", { metaKey: true }), "mod+k")).toBe(true);
		expect(matchesHotkey(key("K", { ctrlKey: true }), "mod+k")).toBe(true);
		expect(matchesHotkey(key("k"), "mod+k")).toBe(false);
		expect(matchesHotkey(key("k", { ctrlKey: true, altKey: true }), "mod+k")).toBe(false);
	});

	test("a single key matches only without modifiers", () => {
		expect(matchesHotkey(key("/"), "/")).toBe(true);
		expect(matchesHotkey(key("/", { ctrlKey: true }), "/")).toBe(false);
		expect(matchesHotkey(key("x"), "/")).toBe(false);
	});
});

describe("scrollIntoList", () => {
	const box = (scrollTop: number) => ({ scrollTop, clientHeight: 100 }) as HTMLElement;
	const item = (offsetTop: number) => ({ offsetTop, offsetHeight: 20 }) as HTMLElement;

	test("scrolls up to an item above the view, with padding", () => {
		const element = box(50);

		scrollIntoList(element, item(30));
		expect(element.scrollTop).toBe(26);
	});

	test("scrolls down to an item below the view, with padding", () => {
		const element = box(0);

		scrollIntoList(element, item(150), 6);
		expect(element.scrollTop).toBe(76);
	});

	test("leaves a visible item alone", () => {
		const element = box(0);

		scrollIntoList(element, item(40));
		expect(element.scrollTop).toBe(0);
	});
});

describe("pageRange", () => {
	test("short ranges list every page", () => {
		expect(pageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	test("gaps become an ellipsis around the current page", () => {
		expect(pageRange(6, 12)).toEqual([1, "…", 5, 6, 7, "…", 12]);
		expect(pageRange(1, 12)).toEqual([1, 2, 3, 4, 5, "…", 12]);
		expect(pageRange(12, 12)).toEqual([1, "…", 8, 9, 10, 11, 12]);
	});

	test("the row keeps one length on every page", () => {
		const lengths = new Set(Array.from({ length: 30 }, (_, i) => pageRange(i + 1, 30).length));

		expect([...lengths]).toEqual([7]);
		expect(pageRange(10, 30, 0)).toHaveLength(5);
	});
});

describe("spyIndex", () => {
	test("nothing is current before the first heading reaches the line", () => {
		expect(spyIndex([500, 1500], 0, 3000, 100)).toBe(-1);
		expect(spyIndex([500, 1500], 399, 3000, 100)).toBe(-1);
	});

	test("a heading is current from the line until the next one reaches it", () => {
		expect(spyIndex([500, 1500], 400, 3000, 100)).toBe(0);
		expect(spyIndex([500, 1500], 1399, 3000, 100)).toBe(0);
		expect(spyIndex([500, 1500], 1400, 3000, 100)).toBe(1);
	});

	test("short last sections each get a turn, in order, before the end", () => {
		const tops = [0, 1000, 1900, 1950];

		expect(spyIndex(tops, 1100, 1500, 100)).toBe(1);
		expect(spyIndex(tops, 1450, 1500, 100)).toBe(1);
		expect(spyIndex(tops, 1480, 1500, 100)).toBe(2);
		expect(spyIndex(tops, 1500, 1500, 100)).toBe(3);
	});

	test("the line stays put when every heading can reach it", () => {
		expect(spyIndex([0, 900, 1500], 1000, 1500, 100)).toBe(1);
		expect(spyIndex([0, 900, 1500], 1500, 1500, 100)).toBe(2);
	});

	test("a scroll position a pixel short of the end still counts as the end", () => {
		expect(spyIndex([0, 1900], 1499.5, 1500, 100)).toBe(1);
	});

	test("a page that can't scroll has no end stretch", () => {
		expect(spyIndex([50, 400], 0, 0, 100)).toBe(0);
	});

	test("a heading with no position is skipped", () => {
		expect(spyIndex([0, Number.POSITIVE_INFINITY, 900], 1000, 3000, 100)).toBe(2);
		expect(spyIndex([0, Number.POSITIVE_INFINITY], 1000, 1000, 100)).toBe(0);
		expect(spyIndex([], 0, 0, 100)).toBe(-1);
	});
});
