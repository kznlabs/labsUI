"use client";

import { Check, Copy } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { site } from "./projects";

const topics = [
	{ value: "build", label: "A new product or feature" },
	{ value: "audit", label: "An accessibility audit" },
	{ value: "system", label: "A design system" },
	{ value: "role", label: "A full-time role" },
];

const budgets = [
	{ value: "small", label: "Under €10k", description: "An audit or a focused fix" },
	{ value: "medium", label: "€10k–30k", description: "A feature or a small app" },
	{ value: "large", label: "€30k–60k", description: "A product from scratch" },
	{ value: "open", label: "Not sure yet", description: "Let's work it out together" },
];

export function ContactForm() {
	const [sending, setSending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = event.currentTarget;
		const name = String(new FormData(form).get("name") ?? "").split(" ")[0];

		setSending(true);
		// Swap this wait for a Server Action or a form service to send for real.
		await new Promise((done) => setTimeout(done, 900));
		setSending(false);
		toast.success(`Thanks, ${name}!`, {
			description: "Demo mode: no message was sent. A real portfolio replies within two days.",
		});
		form.reset();
	}

	return (
		<form onSubmit={onSubmit} aria-label="Contact" className="grid gap-5">
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Name" required>
					<Input name="name" autoComplete="name" placeholder="Jane Doe" />
				</Field>

				<Field label="Email" required>
					<Input name="email" type="email" autoComplete="email" placeholder="jane@company.com" />
				</Field>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Company (optional)">
					<Input name="company" autoComplete="organization" />
				</Field>

				<Field label="What do you need?">
					<Select name="topic" options={topics} defaultValue="build" />
				</Field>
			</div>

			<RadioGroup legend="Budget" name="budget" variant="card" defaultValue="medium">
				<div className="grid gap-2 sm:grid-cols-2">
					{budgets.map((budget) => (
						<RadioGroupItem
							key={budget.value}
							value={budget.value}
							description={budget.description}
						>
							{budget.label}
						</RadioGroupItem>
					))}
				</div>
			</RadioGroup>

			<Field label="Message" required>
				<Textarea
					name="message"
					rows={5}
					minLength={20}
					maxLength={1200}
					showCount
					placeholder="What are you building, and where could I help?"
					className="max-h-80"
				/>
			</Field>

			<div className="flex flex-wrap items-center gap-3">
				<Button type="submit" loading={sending} loadingLabel="Sending…">
					Send message
				</Button>

				<p className="text-muted-foreground text-sm">Replies within two working days.</p>
			</div>
		</form>
	);
}

export function CopyEmail() {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(site.email);
			setCopied(true);
			toast.success("Email address copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Couldn't copy, select the address instead");
		}
	}

	return (
		<Button variant="outline" size="sm" onClick={copy}>
			{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}

			{copied ? "Copied" : "Copy email"}
		</Button>
	);
}
