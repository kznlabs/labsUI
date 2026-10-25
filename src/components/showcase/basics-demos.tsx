"use client";

import { BarChart3, Bell, KeyRound, User } from "lucide-react";
import { useState } from "react";
import { AccentPicker } from "@/components/ui/accent-picker";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CountTo } from "@/components/ui/count-to";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "@/components/ui/toast";

const stats = [
	{ label: "Members", value: 12840 },
	{ label: "Commands run", value: 48290 },
	{ label: "Clips", value: 1312 },
];

export function TabsDemo() {
	return (
		<div className="grid w-full max-w-md grid-cols-1 gap-10">
			<Tabs defaultValue="overview">
				<TabsList aria-label="Dashboard">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">
						<BarChart3 aria-hidden="true" />
						Analytics
					</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
					<TabsTrigger value="archive" disabled>
						Archive
					</TabsTrigger>
				</TabsList>
				<TabsContent value="overview" className="grid grid-cols-3 gap-2">
					{stats.map((s) => (
						<Card key={s.label} className="gap-1 py-3">
							<CardContent className="px-3">
								<p className="text-muted-foreground text-xs">{s.label}</p>
								<CountTo to={s.value} className="font-semibold text-lg tabular-nums" />
							</CardContent>
						</Card>
					))}
				</TabsContent>
				<TabsContent value="analytics">
					<p className="text-muted-foreground text-sm">
						Command usage is up 18% this week, led by <code className="font-mono">/clip</code>.
					</p>
				</TabsContent>
				<TabsContent value="reports">
					<p className="text-muted-foreground text-sm">3 reports waiting for review.</p>
				</TabsContent>
			</Tabs>

			<Tabs defaultValue="account" variant="underline">
				<TabsList aria-label="Settings">
					<TabsTrigger value="account">
						<User aria-hidden="true" />
						Account
					</TabsTrigger>
					<TabsTrigger value="password">
						<KeyRound aria-hidden="true" />
						Password
					</TabsTrigger>
					<TabsTrigger value="notifications">
						<Bell aria-hidden="true" />
						Notifications
					</TabsTrigger>
				</TabsList>
				<TabsContent value="account" className="grid gap-2">
					<Label htmlFor="tabs-name">Display name</Label>
					<Input id="tabs-name" defaultValue="Jane Doe" />
				</TabsContent>
				<TabsContent value="password" className="grid gap-2">
					<Label htmlFor="tabs-pw">New password</Label>
					<Input id="tabs-pw" type="password" />
				</TabsContent>
				<TabsContent value="notifications" className="flex items-center justify-between">
					<Label htmlFor="tabs-mail">Email me about mentions</Label>
					<Switch id="tabs-mail" defaultChecked />
				</TabsContent>
			</Tabs>
		</div>
	);
}

const shortcuts = [
	{ keys: ["⌘", "K"], label: "Search" },
	{ keys: ["⌘", "B"], label: "Toggle sidebar" },
	{ keys: ["⇧", "⌘", "P"], label: "Command palette" },
	{ keys: ["Esc"], label: "Close dialog" },
];

export function KbdDemo() {
	return (
		<div className="grid w-full max-w-xs gap-4">
			<ul className="grid gap-2 text-sm">
				{shortcuts.map((s) => (
					<li key={s.label} className="flex items-center justify-between">
						<span className="text-muted-foreground">{s.label}</span>
						<KbdGroup keys={s.keys} />
					</li>
				))}
			</ul>
			<Button
				variant="outline"
				className="justify-between text-muted-foreground"
				// Opens the site's real palette, the same as pressing the shortcut.
				onClick={() => dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
			>
				Search docs…
				<Kbd>⌘K</Kbd>
			</Button>
		</div>
	);
}

export function SeparatorDemo() {
	return (
		<div className="grid w-full max-w-xs gap-4">
			<div className="grid gap-1">
				<p className="font-medium text-sm">labsUI</p>
				<p className="text-muted-foreground text-sm">Primitives with macOS polish.</p>
			</div>
			<Separator />
			<div className="flex h-5 items-center gap-3 text-sm">
				<a href="#tabs" className="hover:underline">
					Docs
				</a>
				<Separator orientation="vertical" />
				<a href="#kbd" className="hover:underline">
					Source
				</a>
				<Separator orientation="vertical" />
				<a href="/llms.txt" className="hover:underline">
					llms.txt
				</a>
			</div>
			<Separator label="or" />
			<Button variant="outline" onClick={() => toast("Demo mode: GitHub sign-in is turned off")}>
				Continue with GitHub
			</Button>
		</div>
	);
}

export function SkeletonDemo() {
	const [loading, setLoading] = useState(true);
	return (
		<div className="grid w-full max-w-sm gap-4">
			<div className="flex items-center gap-2">
				<Switch id="sk-loading" checked={loading} onCheckedChange={setLoading} />
				<Label htmlFor="sk-loading">Loading</Label>
			</div>
			<Card className="gap-4">
				{loading ? (
					<SkeletonGroup label="Loading profile" className="grid gap-4 px-6">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-full" />
							<div className="grid flex-1 gap-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-20" />
							</div>
						</div>
						<Skeleton className="h-16 w-full" />
					</SkeletonGroup>
				) : (
					<>
						<CardHeader className="flex-row items-center gap-3">
							<Avatar alt="Jane Doe" status="online" />
							<div className="grid gap-1">
								<CardTitle>Jane Doe</CardTitle>
								<CardDescription>Design lead</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							Ships spring-perfect interfaces and reviews every pixel twice.
						</CardContent>
					</>
				)}
			</Card>
		</div>
	);
}

const people = ["Jane Doe", "Alex Kim", "Sam Rivera", "Priya Patel", "Noah Chen", "Mia Novak"];

export function SearchInputDemo() {
	const [q, setQ] = useState("");
	const found = people.filter((p) => p.toLowerCase().includes(q.trim().toLowerCase()));
	return (
		<div className="grid w-full max-w-xs gap-3">
			<SearchInput
				value={q}
				onValueChange={setQ}
				shortcut="mod+k"
				label="Search members"
				placeholder="Search members…"
			/>
			<ul aria-live="polite" className="grid gap-1">
				{found.map((p) => (
					<li key={p} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm">
						<Avatar alt={p} size="sm" />
						{p}
					</li>
				))}
				{found.length === 0 && (
					<li className="py-4 text-center text-muted-foreground text-sm">No one matches.</li>
				)}
			</ul>
		</div>
	);
}

export function AccentPickerDemo() {
	return (
		<Card className="w-full max-w-sm gap-0 py-0">
			<div className="flex items-center justify-between gap-4 px-4 py-3">
				<span className="text-sm">Appearance</span>
				<ThemeToggle />
			</div>
			<Separator />
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
				<span className="text-sm">Accent color</span>
				<AccentPicker />
			</div>
			<Separator />
			<div className="flex items-center justify-between gap-4 px-4 py-3">
				<Label htmlFor="ap-switch" className="font-normal">
					Preview
				</Label>
				<div className="flex items-center gap-3">
					<Checkbox defaultChecked aria-label="Sample checkbox" />
					<Switch id="ap-switch" defaultChecked />
					<Button size="sm" onClick={() => toast.success("Appearance saved")}>
						Save
					</Button>
				</div>
			</div>
		</Card>
	);
}
