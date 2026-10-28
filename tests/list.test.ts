/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { pageRange } from "@/components/ui/pagination";
import { listKeyTarget, scrollIntoList } from "@/lib/list";
import { matchesHotkey } from "@/lib/use-hotkey";
import { clamp } from "@/lib/utils";

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
