"use client";

import { AlertTriangle, ArrowUpRight, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, type ReactNode, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CountTo } from "@/components/ui/count-to";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quote } from "@/components/ui/quote";
import { Reveal } from "@/components/ui/reveal";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "@/components/ui/toast";
import { useSpringConfig } from "@/lib/spring-config";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function DemoGroup({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid w-full gap-3">
			<p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</div>
	);
}

export function ButtonDemo() {
	const spring = useSpringConfig();
	const [loading, setLoading] = useState(false);
	const [deleted, setDeleted] = useState(false);
	const [swap, setSwap] = useState<"left" | "right" | "up" | "down">("up");
	return (
		<div className="grid w-full max-w-2xl gap-8">
			<DemoGroup label="Variants">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
			</DemoGroup>
			<DemoGroup label="Sizes">
				<Button size="sm" variant="outline">
					Small
				</Button>
				<Button>Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon" variant="outline" aria-label="Add">
					<Plus />
				</Button>
			</DemoGroup>
			<DemoGroup label="With icons">
				<Button variant="outline">
					<Mail /> Email
				</Button>
				<Button variant="secondary">
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
					<fieldset aria-label="Swap direction" className="flex flex-wrap gap-1.5 border-0 p-0">
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
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex flex-wrap justify-center gap-2">
				<Badge>Default</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="outline">Outline</Badge>
				<Badge variant="destructive">Failed</Badge>
				<Badge variant="success">Passed</Badge>
			</div>
			<div className="flex flex-wrap justify-center gap-2">
				<Badge shape="pill" variant="success" dot pulse>
					Live
				</Badge>
				<Badge shape="pill" variant="outline" dot>
					Draft
				</Badge>
				<Badge shape="pill" variant="secondary">
					v1.0.0
				</Badge>
				<Badge shape="pill" variant="destructive" dot>
					Down
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

	const submit = async (e: FormEvent) => {
		e.preventDefault();
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
							onChange={(e) => setEmail(e.target.value)}
							onBlur={() => setTouched(true)}
							aria-invalid={invalid || undefined}
							aria-describedby={invalid ? "f-email-err" : undefined}
						/>
						{invalid && (
							<p id="f-email-err" className="text-destructive text-xs">
								Please enter a valid email address.
							</p>
						)}
					</div>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="f-bio">Bio</Label>
							<span className="text-muted-foreground text-xs tabular-nums">{bio.length}/160</span>
						</div>
						<Textarea
							id="f-bio"
							placeholder="Grows as you type…"
							maxLength={160}
							value={bio}
							onChange={(e) => setBio(e.target.value)}
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
				<Avatar src="https://github.com/shadcn.png" alt="shadcn" status="busy" />
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
						Copy-paste React primitives with shadcn/ui structure and macOS refinement.
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
				<Switch id="cursor" checked={on} onCheckedChange={setOn} />
				<Label htmlFor="cursor">Enable custom cursor</Label>
			</div>
			<div className="flex gap-2">
				<Button variant="outline" size="sm">
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
	return (
		<div className="flex flex-col items-center gap-6">
			<AvatarGroup users={team} max={4} size="lg" />
			<AvatarGroup users={team.slice(0, 5)} max={3} size="sm" />
		</div>
	);
}

export function QuoteDemo() {
	return (
		<div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
			<Quote author="Jane Doe" subtitle="Design lead" avatar={<Avatar size="sm" alt="Jane Doe" />}>
				Motion that respects the user feels native.
			</Quote>
			<Quote
				variant="card"
				author="Alex Kim"
				subtitle="Engineer"
				avatar={<Avatar size="sm" alt="Alex Kim" />}
			>
				Ship the small component, then the next one.
			</Quote>
			<div className="sm:col-span-2">
				<Quote variant="large" author="Sam Lee" subtitle="Product">
					Good defaults beat configuration. Every spring here is the same spring.
				</Quote>
			</div>
		</div>
	);
}
