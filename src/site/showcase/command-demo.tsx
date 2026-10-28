"use client";

import {
	Calculator,
	Calendar,
	CreditCard,
	Hash,
	MoonStar,
	Search,
	Settings,
	Smile,
	User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { KbdGroup } from "@/components/ui/kbd";
import { toast } from "@/components/ui/toast";
import { useIsMac } from "@/lib/platform";
import { isDark, setTheme } from "@/lib/theme";
import { componentPath, withBase } from "@/site/config";
import { groups, registry } from "@/site/registry";

/** Site-wide ⌘K palette: jump to any component or flip the theme. Mount once (header). */
export function SiteCommand() {
	const [open, setOpen] = useState(false);
	const mac = useIsMac();

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
				// Icon-only on phones and while the header nav needs the room (md to lg).
				className="size-9 justify-center px-0 font-normal text-muted-foreground sm:h-8 sm:w-56 sm:justify-between sm:px-3 md:size-9 md:justify-center md:px-0 lg:h-8 lg:w-56 lg:justify-between lg:px-3"
			>
				<span className="inline-flex items-center gap-2">
					<Search aria-hidden="true" />
					<span className="max-sm:sr-only md:max-lg:sr-only">Search…</span>
				</span>
				<KbdGroup
					keys={mac ? ["⌘", "K"] : ["Ctrl", "K"]}
					className="hidden sm:inline-flex md:max-lg:hidden"
				/>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search components…" />
				<CommandList>
					<CommandEmpty>No components found.</CommandEmpty>
					{groups.map((heading) => (
						<CommandGroup key={heading} heading={heading}>
							{registry
								.filter((command) => command.group === heading)
								.map((command) => (
									<CommandItem
										key={command.id}
										value={command.name}
										keywords={[command.id, heading, command.description]}
										onSelect={() => location.assign(withBase(componentPath(command.id)))}
									>
										<Hash aria-hidden="true" />
										{command.name}
									</CommandItem>
								))}
						</CommandGroup>
					))}
					<CommandSeparator />
					<CommandGroup heading="Preferences">
						<CommandItem
							value="Toggle theme"
							keywords={["dark", "light", "appearance"]}
							onSelect={() => setTheme(isDark() ? "light" : "dark")}
						>
							<MoonStar aria-hidden="true" />
							Toggle theme
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}

const ran = (label: string) => () => toast(label);

export function CommandDemo() {
	return (
		<div className="grid w-full max-w-md gap-3">
			<Command className="shadow-md">
				<CommandInput />
				<CommandList>
					<CommandEmpty />
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={ran("Opened calendar")}>
							<Calendar aria-hidden="true" />
							Calendar
						</CommandItem>
						<CommandItem keywords={["emoji", "smiley"]} onSelect={ran("Opened emoji picker")}>
							<Smile aria-hidden="true" />
							Search emoji
						</CommandItem>
						<CommandItem disabled>
							<Calculator aria-hidden="true" />
							Calculator
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Settings">
						<CommandItem onSelect={ran("Opened profile")}>
							<User aria-hidden="true" />
							Profile
							<KbdGroup keys={["⌘", "P"]} className="ml-auto" />
						</CommandItem>
						<CommandItem keywords={["card", "invoice"]} onSelect={ran("Opened billing")}>
							<CreditCard aria-hidden="true" />
							Billing
							<KbdGroup keys={["⌘", "B"]} className="ml-auto" />
						</CommandItem>
						<CommandItem keywords={["preferences"]} onSelect={ran("Opened settings")}>
							<Settings aria-hidden="true" />
							Settings
							<KbdGroup keys={["⌘", "S"]} className="ml-auto" />
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
			<p className="text-center text-muted-foreground text-xs">
				↑ ↓ to move · Enter to run · try the site-wide palette with ⌘K / Ctrl K
			</p>
		</div>
	);
}
