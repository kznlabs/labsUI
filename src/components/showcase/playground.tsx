"use client";

import { RotateCcw } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type SpringConfig, SpringScope } from "@/lib/spring-config";
import { cn, spring as defaultSpring } from "@/lib/utils";

const defaults: { stiffness: number; damping: number } = {
	stiffness: defaultSpring.stiffness,
	damping: defaultSpring.damping,
};

type SliderFieldProps = {
	id: string;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
};

function SliderField({ id, label, value, min, max, step, onChange }: SliderFieldProps) {
	return (
		<div className="grid w-44 gap-1.5">
			<div className="flex items-center justify-between text-xs">
				<Label htmlFor={id}>{label}</Label>
				<span className="text-muted-foreground tabular-nums">{value}</span>
			</div>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="accent-primary"
			/>
		</div>
	);
}

/**
 * Preview toolbar + canvas. Replay remounts the demo so entrance animations run again.
 * Stiffness and damping feed the spring for every component inside.
 */
export function Playground({
	previewClassName,
	children,
}: {
	previewClassName?: string;
	children: ReactNode;
}) {
	const [run, setRun] = useState(0);
	const [stiffness, setStiffness] = useState(defaults.stiffness);
	const [damping, setDamping] = useState(defaults.damping);
	const config = useMemo<SpringConfig>(
		() => ({ type: "spring", stiffness, damping }),
		[stiffness, damping],
	);

	return (
		<>
			<div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b bg-muted/40 px-4 py-3">
				<Button size="sm" variant="outline" onClick={() => setRun((n) => n + 1)}>
					<RotateCcw /> Replay
				</Button>
				<SliderField
					id={`stiffness-${run}`}
					label="Stiffness"
					value={stiffness}
					min={50}
					max={1000}
					step={10}
					onChange={setStiffness}
				/>
				<SliderField
					id={`damping-${run}`}
					label="Damping"
					value={damping}
					min={5}
					max={80}
					step={1}
					onChange={setDamping}
				/>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => {
						setStiffness(defaults.stiffness);
						setDamping(defaults.damping);
					}}
				>
					Reset
				</Button>
			</div>
			<div
				className={cn(
					"flex min-h-44 flex-wrap items-center justify-center gap-4 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-6 sm:p-10",
					previewClassName,
				)}
			>
				<SpringScope value={config}>
					<div key={run} className="contents">
						{children}
					</div>
				</SpringScope>
			</div>
		</>
	);
}
