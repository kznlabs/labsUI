"use client";

import { Gavel, MessageSquareOff, UserMinus, UserPlus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { NativeSelect, NativeSelectGroup, NativeSelectOption } from "@/components/ui/native-select";
import { NumberInput } from "@/components/ui/number-input";
import { Rating } from "@/components/ui/rating";
import { RelativeTime } from "@/components/ui/relative-time";
import { toast } from "@/components/ui/toast";

export function NativeSelectDemo() {
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		toast.success("Saved", { description: `${data.get("zone")} · ${data.get("email")}` });
	};

	return (
		<form onSubmit={submit} className="grid w-full max-w-xs gap-4">
			<Field label="Timezone" required description="A real <select>: native picker on phones.">
				<NativeSelect name="zone" defaultValue="">
					<NativeSelectOption value="" disabled>
						Pick a timezone
					</NativeSelectOption>
					<NativeSelectGroup label="Europe">
						<NativeSelectOption value="Europe/Warsaw">Warsaw (CET)</NativeSelectOption>
						<NativeSelectOption value="Europe/London">London (GMT)</NativeSelectOption>
					</NativeSelectGroup>
					<NativeSelectGroup label="Americas">
						<NativeSelectOption value="America/New_York">New York (ET)</NativeSelectOption>
						<NativeSelectOption value="America/Los_Angeles">Los Angeles (PT)</NativeSelectOption>
					</NativeSelectGroup>
				</NativeSelect>
			</Field>
			<Field
				label="Email"
				required
				description="Native validation: red only after you leave the field."
			>
				<Input name="email" type="email" placeholder="jane@example.com" />
			</Field>
			<Button type="submit">Save</Button>
		</form>
	);
}

export function NumberInputDemo() {
	const [qty, setQty] = useState(1);

	return (
		<div className="grid w-full max-w-xs gap-5">
			<Field label="Quantity" description={`$${(qty * 29).toFixed(2)} · max 10 per order`}>
				<NumberInput value={qty} onValueChange={setQty} min={1} max={10} name="qty" />
			</Field>
			<Field label="Cooldown (seconds)">
				<NumberInput defaultValue={2.5} min={0} max={60} step={0.5} />
			</Field>
		</div>
	);
}

export function MeterDemo() {
	const [password, setPassword] = useState("spring");
	const strength = Math.min(
		4,
		(password.length >= 8 ? 1 : 0) +
			(/[A-Z]/.test(password) ? 1 : 0) +
			(/\d/.test(password) ? 1 : 0) +
			(/[^\w]/.test(password) ? 1 : 0),
	);

	return (
		<div className="grid w-full max-w-sm gap-7">
			<Meter
				label="Clip storage"
				max={100}
				valueText="71 GB of 100 GB"
				segments={[
					{ label: "Clips", value: 48 },
					{ label: "Thumbnails", value: 9 },
					{ label: "Backups", value: 14 },
				]}
			/>
			<Meter label="Bot server CPU" value={82} low={50} high={75} optimum={20} valueText="82%" />
			<div className="grid gap-2">
				<Field label="Password">
					<Input
						type="text"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</Field>
				<Meter
					value={strength}
					max={4}
					low={2}
					high={3}
					optimum={4}
					valueText={["Very weak", "Weak", "Fair", "Good", "Strong"][strength]}
				/>
			</div>
		</div>
	);
}

export function RatingDemo() {
	const [stars, setStars] = useState(4);

	return (
		<div className="grid justify-items-center gap-6">
			<div className="grid justify-items-center gap-2">
				<Rating value={stars} onValueChange={setStars} label="Rate this keyboard" name="stars" />
				<p className="text-muted-foreground text-xs">You rated {stars} of 5</p>
			</div>
			<div className="flex items-center gap-2 text-sm">
				<Rating readOnly value={4.6} size="sm" />
				<span className="font-medium">4.6</span>
				<span className="text-muted-foreground">· 1,284 reviews</span>
			</div>
		</div>
	);
}

const log = [
	{ icon: <Gavel />, text: "jane banned spam-bot#0001", ago: 12 },
	{ icon: <MessageSquareOff />, text: "alex deleted 14 messages in #clips", ago: 60 * 7 },
	{ icon: <UserPlus />, text: "sam joined the server", ago: 3600 * 3 },
	{ icon: <UserMinus />, text: "mia left the server", ago: 86400 * 2 },
];

export function RelativeTimeDemo() {
	// Demo invents timestamps after mount, Date.now() during render would break hydration.
	const [now, setNow] = useState<number | null>(null);

	useEffect(() => setNow(Date.now()), []);
	if (now === null) return <div className="h-40 w-full max-w-sm" />;

	return (
		<ul className="grid w-full max-w-sm grid-cols-1 gap-1">
			{log.map((entry) => (
				<li
					key={entry.text}
					className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm [&_svg]:size-4"
				>
					<span className="text-muted-foreground" aria-hidden="true">
						{entry.icon}
					</span>
					<span className="min-w-0 flex-1 truncate">{entry.text}</span>
					<RelativeTime
						date={now - entry.ago * 1000}
						className="shrink-0 text-muted-foreground text-xs"
					/>
				</li>
			))}
		</ul>
	);
}
