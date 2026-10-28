"use client";

import { Mail } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type NewsletterProps = {
	/** Resolves when the address is saved; a rejection shows its message in the toast. */
	onSubscribe: (email: string) => Promise<unknown>;
	/** Heading above the form. */
	title?: ReactNode;
	/** Supporting line under the heading. */
	description?: ReactNode;
	/** Email field placeholder. */
	placeholder?: string;
	/** Submit button text. */
	submitLabel?: string;
	/** Toast after success, e.g. "Check your inbox to confirm". */
	successMessage?: ReactNode;
	className?: string;
};

/**
 * Email signup: InputGroup with a submit Button inside, native email validation, and a
 * a loading toast that turns into a success toast. The button confirms in place, then resets for the next address.
 */
export function Newsletter({
	onSubscribe,
	title,
	description,
	placeholder = "you@example.com",
	submitLabel = "Subscribe",
	successMessage = "Check your inbox to confirm",
	className,
}: NewsletterProps) {
	const id = useId();
	const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const form = event.currentTarget;
		const email = String(new FormData(form).get("email") ?? "").trim();

		setStatus("loading");
		toast
			.promise(onSubscribe(email), {
				loading: "Subscribing…",
				success: () => successMessage,
				error: (err) => (err instanceof Error ? err.message : "Could not subscribe"),
			})
			.then(
				() => {
					form.reset();
					setStatus("success");
					setTimeout(() => setStatus("idle"), 2000);
				},
				() => setStatus("idle"),
			);
	};

	return (
		<form
			onSubmit={submit}
			aria-labelledby={title ? `${id}-title` : undefined}
			className={cn("flex flex-col gap-3", className)}
		>
			{(title || description) && (
				<div className="flex flex-col gap-1">
					{title && (
						<h3 id={`${id}-title`} className="font-semibold">
							{title}
						</h3>
					)}
					{description && <p className="text-muted-foreground text-sm">{description}</p>}
				</div>
			)}
			<InputGroup>
				<InputGroupAddon>
					<Mail aria-hidden="true" />
				</InputGroupAddon>
				<Input
					type="email"
					name="email"
					required
					autoComplete="email"
					placeholder={placeholder}
					aria-label="Email address"
				/>
				<InputGroupAddon align="end">
					<Button type="submit" size="sm" status={status} successLabel="Subscribed">
						{submitLabel}
					</Button>
				</InputGroupAddon>
			</InputGroup>
		</form>
	);
}
