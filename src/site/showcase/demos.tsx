"use client";

import { AlertTriangle, ArrowUpRight, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, type MouseEvent, type ReactNode, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { buttonVariants } from "@/components/ui/button-variants";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CountTo } from "@/components/ui/count-to";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Quote } from "@/components/ui/quote";
import { Reveal } from "@/components/ui/reveal";
import { Switch } from "@/components/ui/switch";
import { TextSwap } from "@/components/ui/text-swap";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "@/components/ui/toast";
import { Typewriter } from "@/components/ui/typewriter";
import { useMediaQuery } from "@/lib/platform";
import { cn, spring } from "@/lib/utils";
import { withBase } from "@/site/config";
import { useSetDynamicCode } from "@/site/showcase-context";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DemoGroup({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid w-full gap-3">
			<p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</div>
	);
}

export function ButtonDemo() {
	const [loading, setLoading] = useState(false);
	const [deleted, setDeleted] = useState(false);
	const [swap, setSwap] = useState<"left" | "right" | "up" | "down">("up");

	return (
		<div className="grid w-full max-w-2xl gap-8">
			<DemoGroup label="Variants">
				<Button onClick={() => toast.success("Saved")}>Default</Button>
				<Button variant="secondary" onClick={() => toast("Draft kept")}>
					Secondary
				</Button>
				<Button variant="outline" onClick={() => toast("Exported as CSV")}>
					Outline
				</Button>
				<Button variant="ghost" onClick={() => toast("Dismissed")}>
					Ghost
				</Button>
				<Button variant="destructive" onClick={() => toast.error("Demo mode: nothing was deleted")}>
					Destructive
				</Button>
			</DemoGroup>
			<DemoGroup label="Sizes">
				<Button size="sm" variant="outline" onClick={() => toast("Small button")}>
					Small
				</Button>
				<Button onClick={() => toast("Default button")}>Default</Button>
				<Button size="lg" onClick={() => toast("Large button")}>
					Large
				</Button>
				<Button
					size="icon"
					variant="outline"
					aria-label="Add"
					onClick={() => toast.success("Item added")}
				>
					<Plus />
				</Button>
			</DemoGroup>
			<DemoGroup label="With icons">
				<Button variant="outline" onClick={() => toast("Demo mode: no email was sent")}>
					<Mail /> Email
				</Button>
				<Button variant="secondary" onClick={() => toast.success("We'll let you know")}>
					<Bell /> Notify me
				</Button>
				<a href="#toast" className={buttonVariants({ variant: "ghost" })}>
					Link as button <ArrowUpRight />
				</a>
			</DemoGroup>
			<DemoGroup label="Async feedback">
				<Button
					loading={loading}
					loadingLabel="Saving…"
					onClick={async () => {
						setLoading(true);
						await wait(1800);
						setLoading(false);
					}}
				>
					Click to load
				</Button>
				<Button disabled variant="secondary">
					Disabled
				</Button>
			</DemoGroup>
			<DemoGroup label="Two-step confirm & swap">
				<div className="grid w-full gap-3">
					<div className="flex flex-wrap items-center gap-3">
						<Button
							variant="destructive"
							className="border border-transparent data-[state=armed]:bg-destructive/80 data-[state=armed]:ring-[3px] data-[state=armed]:ring-destructive/40 data-[state=armed]:border-white/30 data-[state=loading]:bg-destructive/70 data-[state=success]:border-success data-[state=success]:bg-success"
							confirmLabel={
								<>
									<motion.span
										initial={{ scale: 0, rotate: -90 }}
										animate={{ scale: 1, rotate: 0 }}
										transition={spring}
										className="inline-flex"
									>
										<AlertTriangle />
									</motion.span>
									Yes, delete my account
								</>
							}
							loadingLabel="Deleting…"
							swap={swap}
							status={deleted ? "success" : "idle"}
							successLabel="Account deleted"
							onClick={async () => {
								await wait(800);
								setDeleted(true);
							}}
						>
							<Trash2 /> Delete account
						</Button>
						<Button
							variant="outline"
							confirmLabel="Sure? Click again"
							confirmTimeout={2500}
							swap={swap}
							onClick={() => toast.info("Logged out")}
						>
							Log out
						</Button>
					</div>
					<fieldset aria-label="Swap direction" className="flex flex-wrap gap-1.5">
						{(["left", "right", "up", "down"] as const).map((dir) => (
							<Button
								key={dir}
								size="sm"
								variant={swap === dir ? "default" : "ghost"}
								aria-pressed={swap === dir}
								onClick={() => setSwap(dir)}
							>
								Out {dir}
							</Button>
						))}
					</fieldset>
				</div>
			</DemoGroup>
		</div>
	);
}

export function BadgeDemo() {
	const [shape, setShape] = useState<"badge" | "pill">("pill");
	const [dot, setDot] = useState(true);
	const [pulse, setPulse] = useState(true);

	const shapeProp = shape === "pill" ? ' shape="pill"' : "";
	const dotProp = dot ? " dot" : "";
	const pulseProp = pulse ? " pulse" : "";

	useSetDynamicCode(
		`import { Badge } from "@/components/ui/badge";\n\nexport function StatusBadges() {\n  return (\n    <div className="flex gap-2">\n      <Badge variant="default"${shapeProp}${dotProp}${pulseProp}>Default</Badge>\n      <Badge variant="secondary"${shapeProp}${dotProp}${pulseProp}>Secondary</Badge>\n      <Badge variant="outline"${shapeProp}${dotProp}${pulseProp}>Draft</Badge>\n      <Badge variant="success"${shapeProp}${dotProp}${pulseProp}>Live</Badge>\n      <Badge variant="destructive"${shapeProp}${dotProp}${pulseProp}>Failed</Badge>\n    </div>\n  );\n}`,
	);

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex flex-wrap items-center justify-center gap-4 text-xs">
				<label className="flex items-center gap-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={shape === "pill"}
						onChange={(event) => setShape(event.target.checked ? "pill" : "badge")}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Pill shape</span>
				</label>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={dot}
						onChange={(event) => setDot(event.target.checked)}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Status dot</span>
				</label>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={pulse}
						onChange={(event) => setPulse(event.target.checked)}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Pulse animation</span>
				</label>
			</div>

			<div className="flex flex-wrap justify-center gap-3">
				<Badge shape={shape} variant="default" dot={dot} pulse={pulse}>
					Default
				</Badge>
				<Badge shape={shape} variant="secondary" dot={dot} pulse={pulse}>
					Secondary
				</Badge>
				<Badge shape={shape} variant="outline" dot={dot} pulse={pulse}>
					Draft
				</Badge>
				<Badge shape={shape} variant="success" dot={dot} pulse={pulse}>
					Live
				</Badge>
				<Badge shape={shape} variant="destructive" dot={dot} pulse={pulse}>
					Failed
				</Badge>
			</div>
		</div>
	);
}

export function FormDemo() {
	const [email, setEmail] = useState("");
	const [touched, setTouched] = useState(false);
	const [bio, setBio] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
	const invalid = touched && !/^\S+@\S+\.\S+$/.test(email);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setTouched(true);
		if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
		setStatus("loading");
		await wait(1200);
		setStatus("success");
		toast.success("Account created", { description: email });
		await wait(2000);
		setStatus("idle");
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Create account</CardTitle>
				<CardDescription>Focus, invalid and disabled states.</CardDescription>
			</CardHeader>
			<form onSubmit={submit} noValidate className="contents">
				<CardContent className="flex flex-col gap-4">
					<div className="grid gap-2">
						<Label htmlFor="f-name">Name</Label>
						<Input id="f-name" placeholder="Jane Doe" autoComplete="name" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="f-email">Email</Label>
						<Input
							id="f-email"
							type="email"
							placeholder="jane@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							onBlur={() => setTouched(true)}
							aria-invalid={invalid || undefined}
							aria-describedby={invalid ? "f-email-err" : undefined}
						/>
						{invalid && (
							<p id="f-email-err" className="text-destructive-ink text-xs">
								Please enter a valid email address.
							</p>
						)}
					</div>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="f-bio">Bio</Label>
						</div>
						<Textarea
							id="f-bio"
							placeholder="Grows as you type…"
							maxLength={160}
							showCount
							value={bio}
							onChange={(event) => setBio(event.target.value)}
							className="max-h-40"
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<Label htmlFor="f-news">Product updates</Label>
						<Switch id="f-news" defaultChecked />
					</div>
					<Input disabled placeholder="Disabled input" aria-label="Disabled example" />
				</CardContent>
				<CardFooter className="pt-6">
					<Button type="submit" status={status} successLabel="Created!" className="w-full">
						Create account
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

export function CardDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
			<Card>
				<CardHeader>
					<CardDescription>Monthly revenue</CardDescription>
					<CardTitle className="text-3xl tabular-nums">
						<CountTo to={48290} prefix="$" />
					</CardTitle>
				</CardHeader>
				<CardFooter>
					<Badge variant="success" shape="pill">
						+12.4%
					</Badge>
					<span className="text-muted-foreground text-xs">vs last month</span>
				</CardFooter>
			</Card>
			<Card glass>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>Glass variant · backdrop blur.</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-between gap-3">
					<span className="flex items-center gap-2 text-sm">
						<Bell className="size-4 text-muted-foreground" /> Push alerts
					</span>
					<Switch aria-label="Push alerts" />
				</CardContent>
			</Card>
		</div>
	);
}

export function AvatarDemo() {
	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex items-end gap-4">
				<Avatar size="sm" alt="Ana Silva" status="online" />
				<Avatar src={withBase("/avatar-demo.svg")} alt="Robin Park" status="busy" />
				<Avatar size="lg" alt="Kai Moreno" status="away" />
				<Avatar size="lg" src="/broken-image.png" alt="Broken Image" status="offline" />
			</div>
			<AvatarGroup users={team.slice(0, 6)} max={4} size="sm" />
		</div>
	);
}

export function AccordionDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
			<Accordion type="single" defaultValue="what" className="rounded-xl border bg-card px-4">
				<AccordionItem value="what">
					<AccordionTrigger>What is labsUI?</AccordionTrigger>
					<AccordionContent>
						React primitives you copy into your project and own, with smooth spring motion.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="motion">
					<AccordionTrigger>How is it animated?</AccordionTrigger>
					<AccordionContent>
						Every interaction uses one spring from motion: stiffness 400, damping 30.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="a11y">
					<AccordionTrigger>Is it accessible?</AccordionTrigger>
					<AccordionContent>
						Yes. Native buttons, aria-expanded/controls, inert closed panels, reduced-motion aware.
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="multiple" className="rounded-xl border bg-card px-4">
				<AccordionItem value="1">
					<AccordionTrigger>Multiple mode</AccordionTrigger>
					<AccordionContent>Open as many panels as you like.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="2">
					<AccordionTrigger>Independent panels</AccordionTrigger>
					<AccordionContent>Each item toggles on its own.</AccordionContent>
				</AccordionItem>
				<AccordionItem value="3">
					<AccordionTrigger>SEO friendly</AccordionTrigger>
					<AccordionContent>
						Closed content stays in the DOM so crawlers can read it.
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

export function ThemeDemo() {
	return (
		<div className="flex items-center gap-3 rounded-full border bg-card py-1 pr-4 pl-1 shadow-xs">
			<ThemeToggle />
			<span className="text-muted-foreground text-sm">Toggle light / dark</span>
		</div>
	);
}

export function CursorDemo() {
	const [on, setOn] = useState(false);

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex items-center gap-3">
				<Switch id="cursor-toggle" checked={on} onCheckedChange={setOn} />
				<Label htmlFor="cursor-toggle">Enable custom cursor</Label>
			</div>
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => toast("Clicked. Turn the cursor on and hover to see it react.")}
				>
					Hover me
				</Button>
				<a
					href="mailto:hello@example.com"
					className={buttonVariants({ variant: "ghost", size: "sm" })}
				>
					<Mail /> Or this link
				</a>
			</div>
			<p className="text-muted-foreground text-xs">
				Mouse/trackpad only. Disabled on touch & reduced motion.
			</p>
			{on && <CustomCursor />}
		</div>
	);
}

export function CountToDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
			{[
				{ label: "Revenue", node: <CountTo to={48290} prefix="$" /> },
				{ label: "Users", node: <CountTo to={12840} /> },
				{ label: "Uptime", node: <CountTo to={99.9} decimals={1} suffix="%" /> },
			].map((stat, i) => (
				<Reveal key={stat.label} delay={i * 0.1}>
					<Card>
						<CardHeader>
							<CardDescription>{stat.label}</CardDescription>
							<CardTitle className="text-3xl tabular-nums">{stat.node}</CardTitle>
						</CardHeader>
					</Card>
				</Reveal>
			))}
		</div>
	);
}

export function RevealDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
			{["First", "Second", "Third"].map((name, i) => (
				<Reveal key={name} delay={i * 0.12}>
					<Card className="h-24 items-center justify-center text-center">
						<CardContent className="text-sm">{name} · rises on scroll</CardContent>
					</Card>
				</Reveal>
			))}
		</div>
	);
}

const team = [
	{ alt: "Jane Doe" },
	{ alt: "Alex Kim" },
	{ alt: "Sam Lee" },
	{ alt: "Mia Chen" },
	{ alt: "Leo Park" },
	{ alt: "Ana Ruiz" },
	{ alt: "Tom Hill" },
	{ alt: "Ivy Ng" },
	{ alt: "Max Wu" },
	{ alt: "Zoe Li" },
];

export function AvatarGroupDemo() {
	const [max, setMax] = useState(4);
	const [size, setSize] = useState<"sm" | "default" | "lg">("lg");

	useSetDynamicCode(
		`import { AvatarGroup } from "@/components/ui/avatar-group";\n\nexport function TeamRoster({ users }) {\n  return <AvatarGroup users={users} max={${max}} size="${size}" />;\n}`,
	);

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex flex-wrap items-center justify-center gap-5 text-xs">
				<label className="flex items-center gap-2">
					<span className="text-muted-foreground">Max visible:</span>
					<input
						type="range"
						min={2}
						max={6}
						step={1}
						value={max}
						onChange={(event) => setMax(Number(event.target.value))}
						className="accent-primary w-20"
					/>
					<span className="font-mono tabular-nums">{max}</span>
				</label>
				<div className="flex items-center gap-1.5">
					<span className="mr-0.5 text-muted-foreground">Size:</span>
					{(["sm", "default", "lg"] as const).map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setSize(option)}
							className={cn(
								"rounded px-2 py-0.5 text-xs capitalize transition-colors",
								size === option
									? "bg-primary font-medium text-primary-foreground"
									: "bg-muted text-muted-foreground hover:text-foreground",
							)}
						>
							{option}
						</button>
					))}
				</div>
			</div>

			<AvatarGroup users={team} max={max} size={size} />
		</div>
	);
}

export function QuoteDemo() {
	return (
		<div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
			{/* Pan Tadeusz, tr. George Rapall Noyes (1917): public domain (Project Gutenberg #28240). */}
			<Quote
				typewriter
				author="Adam Mickiewicz"
				subtitle="Pan Tadeusz, Book I · tr. G. R. Noyes"
				avatar={<Avatar size="sm" alt="Adam Mickiewicz" />}
			>
				Lithuania, my country, thou art like health; how much thou shouldst be prized only he can
				learn who has lost thee.
			</Quote>
			<Quote
				variant="card"
				author="Adam Mickiewicz"
				subtitle="Pan Tadeusz, Book XI · tr. G. R. Noyes"
				avatar={<Avatar size="sm" alt="Adam Mickiewicz" />}
			>
				Born in slavery and chained in my swaddling bands, I have had but one such spring in my
				whole life.
			</Quote>
			<div className="sm:col-span-2">
				<Quote
					variant="large"
					author="Adam Mickiewicz"
					subtitle="Pan Tadeusz · tr. G. R. Noyes, 1917"
					textSwap={[
						"O spring! Happy is he who beheld thee then in our country!",
						"To-day thy beauty in all its splendour I see and describe, for I yearn for thee.",
						"Memorable spring of war, spring of harvest!",
					]}
				>
					O spring! Happy is he who beheld thee then in our country!
				</Quote>
			</div>
		</div>
	);
}

/** Demo crumbs point here; say where a real app would go instead of jumping nowhere. */
const crumb = (to: string) => (event: MouseEvent<HTMLAnchorElement>) => {
	event.preventDefault();
	toast(`Demo mode: would open “${to}”`);
};

export function BreadcrumbDemo() {
	return (
		<div className="flex flex-col gap-5">
			<Breadcrumb
				items={[
					{ label: "Home", href: "#breadcrumb", onClick: crumb("Home") },
					{ label: "Components", href: "#breadcrumb", onClick: crumb("Components") },
					{ label: "Breadcrumb" },
				]}
			/>
			<Breadcrumb
				separator="/"
				items={[
					{ label: "Projects", href: "#breadcrumb", onClick: crumb("Projects") },
					{ label: "Design system", href: "#breadcrumb", onClick: crumb("Design system") },
					{ label: "Tokens" },
				]}
			/>
		</div>
	);
}

export function ButtonGroupDemo() {
	const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
	const [attached, setAttached] = useState(true);
	const [range, setRange] = useState("Days");

	const orientProp = orientation === "vertical" ? ' orientation="vertical"' : "";
	const attachProp = !attached ? " attached={false}" : "";

	useSetDynamicCode(
		`import { Button } from "@/components/ui/button";\nimport { ButtonGroup } from "@/components/ui/button-group";\n\nexport function SegmentedActions() {\n  return (\n    <ButtonGroup${orientProp}${attachProp}>\n      <Button variant="outline" size="sm">Years</Button>\n      <Button variant="outline" size="sm">Months</Button>\n      <Button variant="default" size="sm">Days</Button>\n    </ButtonGroup>\n  );\n}`,
	);

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex flex-wrap items-center justify-center gap-4 text-xs">
				<label className="flex cursor-pointer items-center gap-1.5">
					<input
						type="checkbox"
						checked={orientation === "vertical"}
						onChange={(event) => setOrientation(event.target.checked ? "vertical" : "horizontal")}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Vertical layout</span>
				</label>
				<label className="flex cursor-pointer items-center gap-1.5">
					<input
						type="checkbox"
						checked={attached}
						onChange={(event) => setAttached(event.target.checked)}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Fused borders (attached)</span>
				</label>
			</div>

			<ButtonGroup orientation={orientation} attached={attached}>
				{["Years", "Months", "Days"].map((unit) => (
					<Button
						key={unit}
						variant={range === unit ? "default" : "outline"}
						size="sm"
						aria-pressed={range === unit}
						onClick={() => setRange(unit)}
					>
						{unit}
					</Button>
				))}
			</ButtonGroup>
		</div>
	);
}

export function TypewriterDemo() {
	const [speed, setSpeed] = useState(36);
	const [pauseDuration, setPauseDuration] = useState(1800);
	const [cursor, setCursor] = useState(true);

	const cursorProp = cursor ? "" : " cursor={false}";

	useSetDynamicCode(
		`import { Typewriter } from "@/components/ui/typewriter";\n\nexport function Headline() {\n  return (\n    <h2>\n      Design for{" "}\n      <Typewriter\n        text={[\n          "clean, precise details.",\n          "accessible keyboard navigation.",\n          "delightful micro-interactions.",\n        ]}\n        speed={${speed}}\n        pauseDuration={${pauseDuration}}${cursorProp}\n      />\n    </h2>\n  );\n}`,
	);

	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div className="flex flex-wrap items-center justify-center gap-5 text-xs">
				<label className="flex items-center gap-2">
					<span className="text-muted-foreground">Speed:</span>
					<input
						type="range"
						min={15}
						max={80}
						step={5}
						value={speed}
						onChange={(event) => setSpeed(Number(event.target.value))}
						className="accent-primary w-20"
					/>
					<span className="font-mono tabular-nums">{speed}ms</span>
				</label>
				<label className="flex items-center gap-2">
					<span className="text-muted-foreground">Pause:</span>
					<input
						type="range"
						min={800}
						max={3500}
						step={200}
						value={pauseDuration}
						onChange={(event) => setPauseDuration(Number(event.target.value))}
						className="accent-primary w-20"
					/>
					<span className="font-mono tabular-nums">{pauseDuration}ms</span>
				</label>
				<label className="flex cursor-pointer items-center gap-1.5">
					<input
						type="checkbox"
						checked={cursor}
						onChange={(event) => setCursor(event.target.checked)}
						className="accent-primary"
					/>
					<span className="text-muted-foreground">Cursor</span>
				</label>
			</div>

			<p className="min-h-9 font-medium text-base sm:text-lg">
				Design for{" "}
				<span className="font-semibold text-primary-ink underline decoration-accent decoration-2 underline-offset-4">
					<Typewriter
						key={`${speed}-${pauseDuration}-${cursor}`}
						text={[
							"clean, precise details.",
							"accessible keyboard navigation.",
							"delightful micro-interactions.",
							"subtle physics-based springs.",
						]}
						speed={speed}
						deleteSpeed={20}
						pauseDuration={pauseDuration}
						cursor={cursor}
					/>
				</span>
			</p>
		</div>
	);
}

export function TextSwapDemo() {
	const [direction, setDirection] = useState<"up" | "down" | "fade">("up");
	const [interval, setIntervalTime] = useState(2600);

	useSetDynamicCode(
		`import { TextSwap } from "@/components/ui/text-swap";\n\nexport function DynamicTag() {\n  return (\n    <span>\n      Crafted with{" "}\n      <TextSwap\n        items={[\n          "Next.js 16 App Router",\n          "Tailwind CSS 4",\n          "Motion 14 springs",\n          "OKLCH design tokens",\n        ]}\n        direction="${direction}"\n        interval={${interval}}\n      />\n    </span>\n  );\n}`,
	);

	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div className="flex flex-wrap items-center justify-center gap-5 text-xs">
				<div className="flex items-center gap-1.5">
					<span className="mr-0.5 text-muted-foreground">Direction:</span>
					{(["up", "down", "fade"] as const).map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setDirection(option)}
							className={cn(
								"rounded px-2 py-0.5 capitalize transition-colors",
								direction === option
									? "bg-primary font-medium text-primary-foreground"
									: "bg-muted text-muted-foreground hover:text-foreground",
							)}
						>
							{option}
						</button>
					))}
				</div>
				<label className="flex items-center gap-2">
					<span className="text-muted-foreground">Interval:</span>
					<input
						type="range"
						min={1500}
						max={4500}
						step={200}
						value={interval}
						onChange={(event) => setIntervalTime(Number(event.target.value))}
						className="accent-primary w-20"
					/>
					<span className="font-mono tabular-nums">{interval}ms</span>
				</label>
			</div>

			<div className="flex items-center gap-2 font-medium text-base sm:text-lg">
				<span className="text-muted-foreground">Crafted with</span>
				<span className="rounded-md border bg-accent/40 px-2.5 py-1 text-foreground">
					<TextSwap
						key={`${direction}-${interval}`}
						items={[
							"Next.js 16 App Router",
							"Tailwind CSS 4",
							"Motion 14 springs",
							"OKLCH design tokens",
							"Refined details",
						]}
						interval={interval}
						direction={direction}
					/>
				</span>
			</div>
		</div>
	);
}

const starred = ["labsui/primitives", "labsui/cli", "labsui/icons"];

export function CollapsibleDemo() {
	const [open, setOpen] = useState(false);

	return (
		<Collapsible open={open} onOpenChange={setOpen} className="grid w-full max-w-sm gap-2">
			<CollapsibleTrigger className="w-full justify-between rounded-lg px-3 py-2 hover:bg-accent">
				<span>
					<span className="font-semibold">@labsui</span>{" "}
					<span className="text-muted-foreground">starred {starred.length} repositories</span>
				</span>
			</CollapsibleTrigger>
			<div className="rounded-lg border px-4 py-2.5 font-mono text-sm">{starred[0]}</div>
			<CollapsibleContent className="grid gap-2">
				{starred.slice(1).map((repo) => (
					<div key={repo} className="rounded-lg border px-4 py-2.5 font-mono text-sm">
						{repo}
					</div>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function PaginationDemo() {
	const [page, setPage] = useState(6);
	// Phones get one fewer page on each side so the row fits.
	const wide = useMediaQuery("(min-width: 640px)");

	return (
		<div className="flex flex-col items-center gap-3">
			<Pagination page={page} total={12} onPageChange={setPage} siblings={wide ? 1 : 0} />
			<p className="text-muted-foreground text-xs tabular-nums">Page {page} of 12</p>
		</div>
	);
}
