"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { confirm } from "@/components/ui/confirm";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { ViewHeading } from "./admin-shell";
import { type Settings as StoreSettings, useAdmin } from "./admin-store";
import { admin } from "./data";

export function Settings() {
	const { settings, saveSettings } = useAdmin();
	const [draft, setDraft] = useState(settings);
	const changed = JSON.stringify(draft) !== JSON.stringify(settings);
	const set = <Key extends keyof StoreSettings>(key: Key, value: StoreSettings[Key]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const next = { ...draft, storeName: draft.storeName.trim() };

		saveSettings(next);
		setDraft(next);
		toast.success("Settings saved", {
			description: `Low stock now means ${next.lowStock} or fewer.`,
		});
	}

	async function pause() {
		const ok = await confirm({
			title: `Pause ${settings.storeName}?`,
			description:
				"Shoppers see a closed sign and can't check out. Orders already placed still ship.",
			confirmLabel: "Pause store",
			destructive: true,
		});

		if (ok)
			toast.info("Demo mode: the store stays open", {
				description: "A live admin would close checkout now.",
			});
	}

	return (
		<>
			<ViewHeading title="Settings">
				Signed in as {admin}, owner. Changes apply to the whole admin.
			</ViewHeading>

			<form onSubmit={submit} className="flex max-w-3xl flex-col gap-6">
				<Card>
					<CardHeader>
						<CardTitle as="h2">Store</CardTitle>

						<CardDescription>Shown on receipts and in the sidebar.</CardDescription>
					</CardHeader>

					<CardContent className="grid gap-4 sm:grid-cols-2">
						<Field label="Store name" required>
							<Input
								value={draft.storeName}
								onChange={(event) => set("storeName", event.target.value)}
								maxLength={24}
							/>
						</Field>

						<Field label="Support email" required>
							<Input
								type="email"
								value={draft.email}
								onChange={(event) => set("email", event.target.value)}
							/>
						</Field>

						<Field label="Currency" description="Prices and reports are in euros.">
							<Input value="EUR, euro" readOnly />
						</Field>

						<Field label="Low stock at" description="Flag a product with this many units or fewer.">
							<NumberInput
								value={draft.lowStock}
								onValueChange={(value) => set("lowStock", value)}
								min={0}
								max={50}
							/>
						</Field>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle as="h2">Notifications</CardTitle>

						<CardDescription>Sent to {draft.email || "the support email"}.</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<Field orientation="horizontal" label="An email for every new order">
							<Switch
								checked={draft.newOrderMail}
								onCheckedChange={(value) => set("newOrderMail", value)}
							/>
						</Field>

						<Field orientation="horizontal" label="A summary every morning at 8:00">
							<Switch
								checked={draft.dailySummary}
								onCheckedChange={(value) => set("dailySummary", value)}
							/>
						</Field>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						disabled={!changed}
						onClick={() => setDraft(settings)}
					>
						Discard
					</Button>

					<Button type="submit" disabled={!changed}>
						Save settings
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle as="h2">Pause the store</CardTitle>

						<CardDescription>
							For holidays or a stocktake. You can open it again at any time.
						</CardDescription>
					</CardHeader>

					<CardFooter>
						<Button type="button" variant="destructive" onClick={pause}>
							Pause store
						</Button>
					</CardFooter>
				</Card>
			</form>
		</>
	);
}
