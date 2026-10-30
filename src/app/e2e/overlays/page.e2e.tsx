"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Tooltip } from "@/components/ui/tooltip";

export default function OverlaysProbe() {
	const [log, setLog] = useState<string[]>([]);
	const [wrap, setWrap] = useState(false);
	const [size, setSize] = useState("s");
	const note = (entry: string) => setLog((entries) => [...entries, entry]);

	return (
		<main className="mx-auto grid max-w-xl justify-items-start gap-4 p-4">
			<h1>Overlay probes</h1>

			<output>{log.join(",")}</output>

			<Dialog>
				<DialogTrigger>Plain dialog</DialogTrigger>

				<DialogContent>
					<DialogTitle>Plain</DialogTitle>

					<Input aria-label="Plain field" />

					<DialogClose>Cancel</DialogClose>
				</DialogContent>
			</Dialog>

			<Dialog>
				<DialogTrigger>Alert dialog</DialogTrigger>

				<DialogContent alert>
					<DialogTitle>Delete?</DialogTitle>

					<DialogClose>Cancel</DialogClose>
				</DialogContent>
			</Dialog>

			<Popover>
				<PopoverTrigger variant="outline">Filters</PopoverTrigger>

				<PopoverContent>
					<Input aria-label="First filter" />

					<Input aria-label="Last filter" />
				</PopoverContent>
			</Popover>

			<Button variant="ghost">After popover</Button>

			<Popover>
				<PopoverTrigger variant="outline">Tags</PopoverTrigger>

				<PopoverContent>
					<Input aria-label="Tag filter" />

					<TagInput name="tags" required aria-label="Tags" />
				</PopoverContent>
			</Popover>

			<Button variant="ghost">After tags</Button>

			<Dialog>
				<DialogTrigger>Form dialog</DialogTrigger>

				<DialogContent showClose={false}>
					<DialogTitle>Invite</DialogTitle>

					<Input aria-label="Email" />

					<Select
						name="role"
						required
						aria-label="Role"
						options={[{ value: "admin", label: "Admin" }]}
					/>
				</DialogContent>
			</Dialog>

			<DropdownMenu>
				<DropdownMenuTrigger variant="outline">Menu</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem onSelect={() => note("edit")}>Edit</DropdownMenuItem>

					<DropdownMenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
						Wrap
					</DropdownMenuCheckboxItem>

					<DropdownMenuRadioGroup value={size} onValueChange={setSize}>
						<DropdownMenuRadioItem value="s">Small</DropdownMenuRadioItem>

						<DropdownMenuRadioItem value="l">Large</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<CommandDialog>
				<CommandInput />

				<CommandList>
					<CommandItem onSelect={() => note("home")}>Home</CommandItem>

					<CommandItem keepOpen onSelect={() => note("theme")}>
						Toggle theme
					</CommandItem>
				</CommandList>
			</CommandDialog>

			<Tooltip content="Bold">
				<Button variant="ghost">Bold</Button>
			</Tooltip>
		</main>
	);
}
