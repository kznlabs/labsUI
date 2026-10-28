"use client";

import { Bold, Italic, LayoutGrid, List, Underline, Volume1, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function SliderDemo() {
	const [volume, setVolume] = useState([62]);
	const [price, setPrice] = useState([40, 180]);
	const level = volume[0] ?? 0;
	const VolumeIcon = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;

	return (
		<div className="grid w-full max-w-sm gap-7">
			<div className="flex items-center gap-3">
				<VolumeIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				<Slider value={volume} onValueChange={setVolume} labels={["Volume"]} />
				<span className="w-8 shrink-0 text-right text-muted-foreground text-xs tabular-nums">
					{level}
				</span>
			</div>
			<Field label="Price" description={`$${price[0]} – $${price[1]}`}>
				<Slider value={price} onValueChange={setPrice} min={0} max={250} step={5} name="price" />
			</Field>
			<Field label="Clip quality (Pro)" disabled>
				<Slider defaultValue={[30]} />
			</Field>
		</div>
	);
}

export function ToggleGroupDemo() {
	const [view, setView] = useState("grid");
	const [billing, setBilling] = useState("yearly");
	const [marks, setMarks] = useState<string[]>(["bold"]);

	return (
		<div className="grid justify-items-center gap-6">
			<ToggleGroup aria-label="View" value={view} onValueChange={setView}>
				<ToggleGroupItem value="grid" aria-label="Grid view">
					<LayoutGrid aria-hidden="true" />
				</ToggleGroupItem>
				<ToggleGroupItem value="list" aria-label="List view">
					<List aria-hidden="true" />
				</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup aria-label="Billing period" value={billing} onValueChange={setBilling}>
				<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
				<ToggleGroupItem value="yearly">
					Yearly
					<Badge variant="success" shape="pill" className="px-1.5 py-0 text-[10px]">
						−20%
					</Badge>
				</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup
				type="multiple"
				size="sm"
				aria-label="Text style"
				value={marks}
				onValueChange={setMarks}
			>
				<ToggleGroupItem value="bold" aria-label="Bold">
					<Bold aria-hidden="true" />
				</ToggleGroupItem>
				<ToggleGroupItem value="italic" aria-label="Italic">
					<Italic aria-hidden="true" />
				</ToggleGroupItem>
				<ToggleGroupItem value="underline" aria-label="Underline">
					<Underline aria-hidden="true" />
				</ToggleGroupItem>
			</ToggleGroup>
			<p className="text-muted-foreground text-xs">
				{view} view · billed {billing} · {marks.length ? marks.join(", ") : "plain text"}
			</p>
		</div>
	);
}
