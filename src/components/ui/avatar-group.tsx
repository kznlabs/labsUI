"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn, spring } from "@/lib/utils";

type GroupUser = {
	alt: string;
	src?: string;
	/** Stable key when names can repeat. */
	id?: string;
};

type AvatarGroupProps = {
	users: GroupUser[];
	/** How many avatars to show before the `+N` chip. */
	max?: number;
	size?: "sm" | "default" | "lg";
	className?: string;
};

/** Chip matches the avatars; overlap grows with size so the stack reads as one shape. */
const sizes = {
	sm: { chip: "size-8 text-xs", overlap: "-space-x-1.5" },
	default: { chip: "size-10 text-sm", overlap: "-space-x-2" },
	lg: { chip: "size-14 text-base", overlap: "-space-x-3" },
} as const;

/** Cut-out between avatars, in the color of the card they usually sit on. */
const cutout = "ring-2 ring-card";

/** Overlapping avatars with a `+N` overflow chip. Hover gently enlarges the avatar on a spring, staying in stack order. */
export function AvatarGroup({ users, max = 4, size = "default", className }: AvatarGroupProps) {
	const [hovered, setHovered] = useState<number | null>(null);
	const visible = users.slice(0, max);
	const overflow = users.length - visible.length;

	return (
		<ul
			aria-label={`${users.length} people`}
			className={cn("flex items-center", sizes[size].overlap, className)}
			onMouseLeave={() => setHovered(null)}
		>
			{visible.map((user, i) => (
				<motion.li
					key={user.id ?? `${i}-${user.alt}`}
					title={user.alt}
					onMouseEnter={() => setHovered(i)}
					animate={{
						scale: hovered === i ? 1.1 : hovered !== null && Math.abs(hovered - i) === 1 ? 1.04 : 1,
					}}
					transition={spring}
					className={cn("relative rounded-full", cutout, hovered === i && "z-10")}
				>
					<Avatar src={user.src} alt={user.alt} size={size} />
				</motion.li>
			))}
			{overflow > 0 && (
				<li
					className={cn(
						"relative grid place-items-center rounded-full bg-muted font-medium text-muted-foreground tabular-nums",
						cutout,
						sizes[size].chip,
					)}
				>
					+{overflow}
					<span className="sr-only"> more</span>
				</li>
			)}
		</ul>
	);
}
