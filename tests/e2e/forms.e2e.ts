import type { Locator, Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

function only(...ids: string[]) {
	test.skip(!ids.some(selected), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);
}

async function probe(page: Page, id: string) {
	await open(page, "e2e/forms");

	return page.locator(`form#${id}`);
}

const submit = (form: Locator) => form.getByRole("button", { name: "Submit", exact: true }).click();

const sent = (form: Locator) => form.locator("output");

// Firefox's validation popup swallows the next click, so each fix after a block starts on the keyboard.

test.describe("tag-input form", () => {
	only("tag-input");
	test("required blocks submit until a tag is added", async ({ page }) => {
		const form = await probe(page, "tags-required");
		const box = form.getByRole("textbox", { name: "Tags" });

		await submit(form);
		await expect(box).toBeFocused();
		await expect(box).toHaveAttribute("aria-invalid", "true");
		await expect(sent(form)).toHaveText("");

		await page.keyboard.type("alpha");
		await page.keyboard.press("Enter");
		await submit(form);
		await expect(sent(form)).toHaveText('[["tags","alpha"]]');
	});

	test("disabled submits nothing", async ({ page }) => {
		const form = await probe(page, "tags-disabled");

		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("rating form", () => {
	only("rating");
	test("required blocks submit until a star is picked", async ({ page }) => {
		const form = await probe(page, "rating-required");

		await submit(form);
		await expect(form.getByRole("radio").first()).toBeFocused();
		await expect(sent(form)).toHaveText("");

		await page.keyboard.press("Space");
		await submit(form);
		await expect(sent(form)).toHaveText('[["rating","1"]]');
	});

	test("disabled submits nothing", async ({ page }) => {
		const form = await probe(page, "rating-disabled");

		await expect(form.getByRole("radio").first()).toBeDisabled();
		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("slider form", () => {
	only("slider");
	test("submits one value per thumb", async ({ page }) => {
		const form = await probe(page, "slider");

		await submit(form);
		await expect(sent(form)).toHaveText('[["volume","30"],["price","10"],["price","90"]]');
	});

	test("disabled submits nothing", async ({ page }) => {
		const form = await probe(page, "slider-disabled");

		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("input-otp form", () => {
	only("input-otp");
	test("required blocks submit until every slot is filled", async ({ page }) => {
		const form = await probe(page, "otp-required");
		const code = form.locator("input[data-slot=input-otp]");

		await submit(form);
		await expect(code).toBeFocused();
		await expect(sent(form)).toHaveText("");

		await page.keyboard.type("123");
		await submit(form);
		await expect(code).toBeFocused();
		await expect(sent(form)).toHaveText("");

		await page.keyboard.type("456");
		await submit(form);
		await expect(sent(form)).toHaveText('[["code","123456"]]');
	});

	test("disabled submits nothing", async ({ page }) => {
		const form = await probe(page, "otp-disabled");

		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("file-dropzone form", () => {
	only("attachment");
	test("required blocks submit, a dropped file submits", async ({ page }) => {
		const form = await probe(page, "file-required");

		await submit(form);
		await expect(form.locator("input[type=file]")).toBeFocused();
		await expect(sent(form)).toHaveText("");

		const dataTransfer = await page.evaluateHandle(() => {
			const transfer = new DataTransfer();

			transfer.items.add(new File(["labsUI"], "dropped.txt", { type: "text/plain" }));

			return transfer;
		});

		await form.locator("label").dispatchEvent("drop", { dataTransfer });
		await submit(form);
		await expect(sent(form)).toHaveText('[["file","dropped.txt"]]');
	});

	test("disabled submits nothing", async ({ page }) => {
		const form = await probe(page, "file-disabled");

		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("radio-group form", () => {
	only("radio-group");
	test("required blocks submit until an item is picked", async ({ page }) => {
		const form = await probe(page, "radio-required");

		await submit(form);
		await expect(form.getByRole("radio", { name: "Free" })).toBeFocused();
		await expect(sent(form)).toHaveText("");

		await page.keyboard.press("Space");
		await submit(form);
		await expect(sent(form)).toHaveText('[["plan","free"]]');
	});
});

test.describe("disabled pickers", () => {
	only("select", "combobox", "date-picker");
	test("submit nothing", async ({ page }) => {
		const form = await probe(page, "pickers-disabled");

		await submit(form);
		await expect(sent(form)).toHaveText("[]");
	});
});

test.describe("stepper form", () => {
	only("stepper");
	test("checks each step, then submits every step's values", async ({ page }) => {
		await open(page, "e2e/forms");

		const form = page.locator("form#stepper");
		const email = form.getByRole("textbox", { name: "Email" });
		const plan = form.getByRole("combobox", { name: "Plan" });

		await form.getByRole("button", { name: "Continue" }).click();
		await expect(email).toBeFocused();
		await expect(plan).toBeHidden();

		await page.keyboard.type("ada@example.com");
		await form.getByRole("button", { name: "Continue" }).click();
		await expect(plan).toBeVisible();

		await form.getByRole("button", { name: "Submit" }).click();
		await expect(plan).toBeFocused();
		await expect(plan).toHaveAttribute("aria-invalid", "true");
		await expect(sent(form)).toHaveText("");

		await plan.press("Enter");
		await page.getByRole("option", { name: "Alpha" }).click();
		await form.getByRole("button", { name: "Submit" }).click();
		await expect(sent(form)).toHaveText('[["email","ada@example.com"],["plan","alpha"]]');
	});
});

test.describe("tag-input validate", () => {
	only("tag-input");
	test("a rejected tag stays in the input", async ({ page }) => {
		const form = await probe(page, "tags-validate");
		const box = form.getByRole("textbox", { name: "Short tags" });

		await box.fill("toolong");
		await box.press("Enter");
		await expect(box).toHaveValue("toolong");
		await expect(form.getByRole("button", { name: "Remove toolong" })).toHaveCount(0);

		await box.fill("ok");
		await box.press("Enter");
		await expect(box).toHaveValue("");
		await expect(form.getByRole("button", { name: "Remove ok" })).toBeVisible();
	});
});

// Playwright waits out aria-disabled before a click; force sends it while the button is busy.
test.describe("button busy", () => {
	only("button");
	test("loading ignores clicks and Enter", async ({ page }) => {
		const form = await probe(page, "button-loading");

		await form.getByRole("textbox", { name: "Query" }).press("Enter");
		await form.getByRole("button", { name: "Send" }).click({ force: true });
		await expect(form.getByRole("button", { name: "Send" })).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		await expect(sent(form)).toHaveAttribute("data-count", "0");
	});

	test("a pending onClick submits once", async ({ page }) => {
		const form = await probe(page, "button-pending");
		const send = form.getByRole("button", { name: "Send" });

		await send.click();
		await send.click({ force: true });
		await send.press("Enter");
		await expect(sent(form)).toHaveAttribute("data-count", "1");
	});
});

test.describe("combobox multiple", () => {
	only("combobox");
	test("keeps the list open while picking", async ({ page }) => {
		const form = await probe(page, "combobox-multiple");

		await form.getByRole("combobox", { name: "Channels" }).click();
		await page.getByRole("option", { name: "Alpha" }).click();
		await page.getByRole("option", { name: "Beta" }).click();
		await expect(page.getByRole("listbox")).toBeVisible();
		await page.keyboard.press("Escape");
		await submit(form);
		await expect(sent(form)).toHaveText('[["many","alpha"],["many","beta"]]');
	});
});

test.describe("stepper guard", () => {
	only("stepper");
	test("onNext resolving false stays on the step", async ({ page }) => {
		await open(page, "e2e/forms");

		const form = page.locator("form#stepper-guard");
		const next = form.getByRole("button", { name: "Continue" });

		await next.click();
		await expect(next).toHaveAttribute("aria-disabled", "true");
		await expect(next).not.toHaveAttribute("aria-disabled", "true");
		await expect(form.getByRole("textbox", { name: "Guarded" })).toBeVisible();
		await expect(form.getByRole("textbox", { name: "After" })).toBeHidden();
	});
});

test.describe("form reset", () => {
	only("rating", "tag-input", "select", "combobox", "date-picker", "radio-group", "forms");
	test("after a form action every control is back at its default", async ({ page }) => {
		const form = await probe(page, "action-reset");
		const submits = () =>
			sent(form)
				.textContent()
				.then((text) => text?.split("|") ?? []);

		const send = async (count: number) => {
			await submit(form);
			await expect.poll(async () => (await submits()).length).toBe(count);
		};

		await send(1);

		await form.locator("fieldset label").nth(2).click();
		await form.getByRole("textbox", { name: "Topics" }).fill("ui");
		await form.getByRole("textbox", { name: "Topics" }).press("Enter");
		await form.getByRole("combobox", { name: "Plan" }).click();
		await page.getByRole("listbox", { name: "Plan" }).getByRole("option", { name: "Beta" }).click();
		await form.getByRole("combobox", { name: "Channel" }).click();
		await page
			.getByRole("listbox", { name: "Channel" })
			.getByRole("option", { name: "Alpha" })
			.click();
		await page.keyboard.press("Escape");
		await form.getByRole("button", { name: "Date" }).click();
		await page.getByRole("button", { name: "Launch day" }).click();
		await form.getByRole("radio", { name: "Large" }).check();
		await form.getByRole("checkbox", { name: "Agree" }).check();
		await form.getByRole("switch", { name: "Notify" }).check();
		await form.getByRole("slider", { name: "Volume" }).press("ArrowRight");
		await form.getByRole("button", { name: "Increase" }).click();
		await form.getByRole("textbox", { name: "Code" }).fill("123456");
		await form.getByRole("textbox", { name: "Notes" }).fill("hello");

		await send(2);

		const [untouched, changed] = await submits();

		expect(changed).not.toBe(untouched);
		await expect(form.locator("svg.text-warning")).toHaveCount(0);
		await expect(form.getByRole("button", { name: /^Remove/ })).toHaveCount(0);
		await expect(form.getByRole("combobox", { name: "Plan" })).not.toHaveText("Beta");
		await expect(form.getByRole("combobox", { name: "Channel" })).toHaveValue("");
		await expect(form.getByRole("checkbox", { name: "Agree" })).not.toBeChecked();
		await expect(form.getByRole("switch", { name: "Notify" })).not.toBeChecked();
		await expect(form.getByRole("radio", { name: "Small" })).toBeChecked();
		await expect(form.getByText("0/50")).toBeVisible();

		await send(3);
		expect((await submits())[2]).toBe(untouched);
	});
});

test.describe("field label on groups", () => {
	only("field", "rating", "radio-group");
	test("names a Rating and a RadioGroup", async ({ page }) => {
		const form = await probe(page, "field-groups");

		await expect(form.getByRole("group", { name: "How was it?" })).toBeVisible();
		await expect(form.getByRole("group", { name: "Billing" })).toBeVisible();
	});
});
