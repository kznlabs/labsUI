"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useSpringConfig } from "@/lib/spring-config";
import { cn } from "@/lib/utils";

type GroupUser = { alt: string; src?: string };

type AvatarGroupProps = {
	users: GroupUser[];
	/** How many avatars to show before the `+N` chip. */
	max?: number;
	size?: "sm" | "default" | "lg";
	className?: string;
};

/** One step larger than the avatars, so the overflow chip reads as a summary. */
const chipSize = {
	sm: "size-9 text-xs",
	default: "size-11 text-sm",
	lg: "size-16 text-base",
} as const;

/** Overlapping avatars with a `+N` overflow chip. Hover gently enlarges the avatar on a spring, staying in stack order. */
export function AvatarGroup({ users, max = 4, size = "default", className }: AvatarGroupProps) {
	const spring = useSpringConfig();
	const [hovered, setHovered] = useState<number | null>(null);
	const visible = users.slice(0, max);
	const overflow = users.length - visible.length;

	return (
		<ul
			aria-label={`${users.length} people`}
			className={cn("flex items-center -space-x-2", className)}
			onMouseLeave={() => setHovered(null)}
		>
			{visible.map((user, i) => (
				<motion.li
					key={user.alt}
					title={user.alt}
					onMouseEnter={() => setHovered(i)}
					animate={{ scale: hovered === i ? 1.1 : 1 }}
					transition={spring}
					className="relative rounded-full ring-2 ring-background"
				>
					<Avatar src={user.src} alt={user.alt} size={size} />
				</motion.li>
			))}
			{overflow > 0 && (
				<li
					className={cn(
						"relative grid place-items-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background ring-inset",
						chipSize[size],
					)}
				>
					+{overflow}
				</li>
			)}
		</ul>
	);
}
