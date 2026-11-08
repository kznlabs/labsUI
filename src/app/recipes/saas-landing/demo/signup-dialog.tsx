"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { euro, type Period, type PlanId, planOf } from "./content";

const trialEnd = (from: Date) =>
	new Date(from.getTime() + 14 * 86_400_000).toLocaleDateString("en-IE", {
		day: "numeric",
		month: "long",
	});

/** The trial signup a plan's button opens. Nothing is created: it answers in demo mode. */
export function SignupDialog({
	open,
	onOpenChange,
	plan: planId,
	period,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	plan: PlanId;
	period: Period;
}) {
	const [status, setStatus] = useState<"idle" | "loading">("idle");
	const plan = planOf(planId);
	const free = plan.price.monthly === 0;
	const price = plan.price[period];

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const workspace = String(new FormData(event.currentTarget).get("workspace") ?? "").trim();

		setStatus("loading");
		setTimeout(() => {
			setStatus("idle");
			onOpenChange(false);
			toast.success(`Demo mode: ${workspace} wasn't created`, {
				description: free
					? "On a real site you'd land in your new workspace now."
					: `On a real site your ${plan.name} trial would run until ${trialEnd(new Date())}.`,
			});
		}, 900);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={submit} className="grid gap-5">
					<DialogHeader>
						<DialogTitle>
							{free ? "Create your workspace" : `Try ${plan.name} for 14 days`}
						</DialogTitle>

						<DialogDescription>
							{free
								? `${plan.name} is free for up to ${plan.monitors} monitors.`
								: `No card needed. After the trial, ${euro(price)} a month${period === "yearly" ? ", billed yearly" : ""}, or drop back to Hobby.`}
						</DialogDescription>
					</DialogHeader>

					<Field label="Work email">
						<Input
							type="email"
							name="email"
							required
							autoComplete="email"
							placeholder="you@company.com"
						/>
					</Field>

					<Field label="Workspace name" description="Your team or product, e.g. Harbourline.">
						<Input name="workspace" required minLength={2} autoComplete="organization" />
					</Field>

					<DialogFooter>
						<DialogClose type="button">Cancel</DialogClose>

						<Button type="submit" loading={status === "loading"} loadingLabel="Creating…">
							{free ? "Create workspace" : "Start trial"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
