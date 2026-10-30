"use client";

import { AtSign, Copy, DollarSign, Link2, Search } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Attachment, AttachmentList, FileDropzone, formatBytes } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Stepper, StepperFooter, StepperList, StepperStep } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

const perms = ["Manage messages", "Kick members", "Ban members", "Manage roles"];

export function CheckboxDemo() {
	const [on, setOn] = useState<string[]>(["Manage messages"]);
	const all = on.length === perms.length;

	return (
		<div className="grid w-full max-w-xs gap-3">
			<div className="flex items-center gap-2.5 border-b pb-3">
				<Checkbox
					id="perm-all"
					checked={all}
					indeterminate={on.length > 0 && !all}
					onCheckedChange={() => setOn(all ? [] : perms)}
				/>

				<Label htmlFor="perm-all">Moderator permissions</Label>
			</div>

			{perms.map((perm) => (
				<div key={perm} className="flex items-center gap-2.5 pl-6">
					<Checkbox
						id={`perm-${perm}`}
						checked={on.includes(perm)}
						onCheckedChange={(checked) =>
							setOn(checked ? [...on, perm] : on.filter((x) => x !== perm))
						}
					/>

					<Label htmlFor={`perm-${perm}`} className="font-normal">
						{perm}
					</Label>
				</div>
			))}

			<div className="flex items-center gap-2.5 pt-1">
				<Checkbox id="perm-owner" checked disabled />

				<Label htmlFor="perm-owner">Owner (always on)</Label>
			</div>
		</div>
	);
}

export function RadioGroupDemo() {
	return (
		<div className="grid w-full max-w-sm gap-8">
			<RadioGroup legend="Plan" defaultValue="pro" name="plan">
				<RadioGroupItem value="free" description="1 server, 50 clips a month.">
					Free
				</RadioGroupItem>

				<RadioGroupItem value="pro" description="10 servers, unlimited clips, analytics.">
					Pro · $9/mo
				</RadioGroupItem>

				<RadioGroupItem value="team" description="Contact sales." disabled>
					Team
				</RadioGroupItem>
			</RadioGroup>

			<RadioGroup legend="Playback speed" defaultValue="1" orientation="horizontal">
				{["0.5", "1", "1.5", "2"].map((option) => (
					<RadioGroupItem key={option} value={option}>
						{option}×
					</RadioGroupItem>
				))}
			</RadioGroup>
		</div>
	);
}

type Errors = Partial<Record<"email" | "username" | "role" | "terms", string>>;

export function FieldDemo() {
	const [errors, setErrors] = useState<Errors>({});

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		const next: Errors = {};

		if (!/^\S+@\S+\.\S+$/.test(String(data.get("email"))))
			next.email = "Enter a valid email address.";
		if (String(data.get("username")).length < 3) next.username = "At least 3 characters.";
		if (!data.get("role")) next.role = "Pick a role.";
		if (!data.get("terms")) next.terms = "You need to accept the terms.";
		setErrors(next);
		if (Object.keys(next).length === 0) toast.success("Account created");
	};

	return (
		<form noValidate onSubmit={submit} className="grid w-full max-w-sm gap-5">
			<Field label="Email" required error={errors.email}>
				<Input name="email" type="email" placeholder="jane@example.com" />
			</Field>

			<Field
				label="Username"
				required
				description="Shown on your clips and profile."
				error={errors.username}
			>
				<InputGroup>
					<InputGroupAddon>
						<AtSign aria-hidden="true" />
					</InputGroupAddon>

					<Input name="username" placeholder="jane" />
				</InputGroup>
			</Field>

			<Field label="Role" required error={errors.role}>
				<Select
					name="role"
					placeholder="Pick a role"
					options={[
						{ value: "viewer", label: "Viewer" },
						{ value: "creator", label: "Creator" },
					]}
				/>
			</Field>

			<Field orientation="horizontal" label="Email me product updates">
				<Switch name="updates" defaultChecked />
			</Field>

			<Field orientation="horizontal" label="I accept the terms" error={errors.terms}>
				<Checkbox name="terms" />
			</Field>

			<Button type="submit">Create account</Button>
		</form>
	);
}

export function InputGroupDemo() {
	return (
		<div className="grid w-full max-w-sm gap-4">
			<InputGroup>
				<InputGroupAddon>
					<Search aria-hidden="true" />
				</InputGroupAddon>

				<Input aria-label="Search clips" placeholder="Search clips…" />

				<InputGroupAddon align="end">
					<Kbd>⌘K</Kbd>
				</InputGroupAddon>
			</InputGroup>

			<InputGroup>
				<InputGroupAddon>https://</InputGroupAddon>

				<Input aria-label="Site address" placeholder="labsui" className="px-0" />

				<InputGroupAddon align="end">.dev</InputGroupAddon>
			</InputGroup>

			<InputGroup>
				<InputGroupAddon>
					<DollarSign aria-hidden="true" />
				</InputGroupAddon>

				<Input aria-label="Price" inputMode="decimal" placeholder="0.00" className="pl-1.5" />

				<InputGroupAddon align="end">USD</InputGroupAddon>
			</InputGroup>

			<InputGroup>
				<InputGroupAddon>
					<Link2 aria-hidden="true" />
				</InputGroupAddon>

				<Input aria-label="Invite link" readOnly defaultValue="labsui.dev/invite/x7Kq2" />

				<InputGroupAddon align="end">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => toast.success("Invite link copied")}
						aria-label="Copy invite link"
					>
						<Copy aria-hidden="true" />
					</Button>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}

const botSteps = [
	{ value: "server", title: "Server", description: "Where the bot will live." },
	{ value: "bot", title: "Bot", description: "How members will see it." },
	{ value: "access", title: "Access", description: "What it may do." },
];

export function StepperDemo() {
	return (
		<Stepper
			steps={botSteps}
			className="w-full max-w-lg"
			onSubmit={(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);

				toast.success(`${data.get("botName")} is ready`, {
					description: `Server ${data.get("serverId")} · prefix ${data.get("prefix")} · ${data.getAll("perm").length} permissions · ${data.get("plan")}`,
				});
			}}
		>
			<StepperList />

			<StepperStep
				value="server"
				// Runs after the native checks pass, a promise keeps Continue spinning.
				onNext={async () => {
					await new Promise((resolve) => setTimeout(resolve, 700));

					const id = (document.getElementById("server-id") as HTMLInputElement | null)?.value;

					if (id?.startsWith("000")) {
						toast.error("Server not found", { description: "Is the bot invited to it?" });

						return false;
					}
				}}
			>
				<Field
					id="server-id"
					label="Server ID"
					description="17–20 digits. Try one starting with 000."
					required
				>
					<Input
						name="serverId"
						inputMode="numeric"
						pattern="[0-9]{17,20}"
						placeholder="1029384756102938475"
					/>
				</Field>
			</StepperStep>

			<StepperStep value="bot">
				<Field label="Display name" required>
					<Input name="botName" defaultValue="Clipper" maxLength={32} />
				</Field>

				<Field label="Command prefix" description="One to three characters.">
					<Input name="prefix" defaultValue="!" required minLength={1} maxLength={3} />
				</Field>
			</StepperStep>

			<StepperStep value="access">
				<div className="grid gap-3">
					{["Read messages", "Manage clips", "Kick members"].map((permission, i) => (
						<div key={permission} className="flex items-center gap-2">
							<Checkbox id={`perm-${i}`} name="perm" value={permission} defaultChecked={i < 2} />

							<Label htmlFor={`perm-${i}`}>{permission}</Label>
						</div>
					))}
				</div>

				<RadioGroup legend="Plan" name="plan" defaultValue="Free" orientation="horizontal">
					<RadioGroupItem value="Free">Free</RadioGroupItem>

					<RadioGroupItem value="Pro">Pro</RadioGroupItem>
				</RadioGroup>
			</StepperStep>

			<StepperFooter submitLabel="Create bot" />
		</Stepper>
	);
}

type Upload = {
	id: string;
	name: string;
	size: number;
	type: string;
	src?: string;
	progress: number;
	error?: string;
};

const MB = 1024 * 1024;

export function AttachmentDemo() {
	const [files, setFiles] = useState<Upload[]>([
		{ id: "a", name: "summer-montage.mp4", size: 48.3 * MB, type: "video/mp4", progress: 100 },
		{
			id: "b",
			name: "sponsor-brief.pdf",
			size: 0.24 * MB,
			type: "application/pdf",
			progress: 40,
			error: "Upload failed. Try again.",
		},
	]);
	// Object URLs for previews, revoked on remove and unmount.
	const urls = useRef(new Map<string, string>());

	useEffect(() => {
		const map = urls.current;

		return () => {
			for (const url of map.values()) URL.revokeObjectURL(url);
		};
	}, []);

	const uploading = files.some((file) => file.progress < 100 && !file.error);

	useEffect(() => {
		if (!uploading) return;

		const timer = setInterval(
			() =>
				setFiles((fs) =>
					fs.map((item) =>
						item.error || item.progress >= 100
							? item
							: { ...item, progress: Math.min(100, item.progress + 9) },
					),
				),
			220,
		);

		return () => clearInterval(timer);
	}, [uploading]);

	const remove = (id: string) => {
		const url = urls.current.get(id);

		if (url) URL.revokeObjectURL(url);
		urls.current.delete(id);
		setFiles((fs) => fs.filter((item) => item.id !== id));
	};

	return (
		<div className="grid w-full max-w-xl gap-4">
			<FileDropzone
				multiple
				accept="image/*,video/*,.pdf"
				maxSize={50 * MB}
				onFiles={(added) =>
					setFiles((fs) => [
						...fs,
						...added.map((file) => {
							const id = crypto.randomUUID();
							let src: string | undefined;

							if (file.type.startsWith("image/")) {
								src = URL.createObjectURL(file);
								urls.current.set(id, src);
							}

							return { id, name: file.name, size: file.size, type: file.type, src, progress: 0 };
						}),
					])
				}
				onReject={(rejected) =>
					toast.error(`${rejected.length} file${rejected.length > 1 ? "s" : ""} skipped`, {
						description: rejected
							.map(
								(rejection) =>
									`${rejection.file.name}: ${rejection.reason === "size" ? `over ${formatBytes(50 * MB)}` : "not an image, video or PDF"}`,
							)
							.join(", "),
					})
				}
			/>

			<AttachmentList aria-label="Uploads">
				{files.map((file) => (
					<Attachment
						key={file.id}
						name={file.name}
						size={file.size}
						type={file.type}
						src={file.src}
						progress={file.progress}
						error={file.error}
						onRemove={() => remove(file.id)}
					/>
				))}
			</AttachmentList>
		</div>
	);
}
