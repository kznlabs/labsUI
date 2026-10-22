"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

const sizes = {
	sm: { root: "size-8 text-xs", dot: "size-2" },
	default: { root: "size-10 text-sm", dot: "size-2.5" },
	lg: { root: "size-14 text-base", dot: "size-3.5" },
} as const;

const statuses = {
	online: "bg-emerald-500",
	away: "bg-amber-400",
	busy: "bg-red-500",
	offline: "bg-zinc-400",
} as const;

type AvatarProps = {
	src?: string;
	/** Person's name: used for alt text and initials fallback. */
	alt: string;
	/** Overrides initials (text or icon). */
	fallback?: ReactNode;
	status?: keyof typeof statuses;
	size?: keyof typeof sizes;
	className?: string;
};

const initials = (name: string) =>
	name
		.split(/\s+/)
		.map((p) => p[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

export function Avatar({ src, alt, fallback, status, size = "default", className }: AvatarProps) {
	// Keyed by src so a new src retries after a previous failure.
	const [loaded, setLoaded] = useState<string>();
	const [failed, setFailed] = useState<string>();
	const showImg = src && failed !== src;

	return (
		<span className={cn("relative inline-flex shrink-0", sizes[size].root, className)}>
			<span
				role="img"
				aria-label={alt}
				className="relative flex size-full select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground ring-1 ring-border"
			>
				<span aria-hidden="true">{fallback ?? initials(alt)}</span>
				{showImg && (
					// biome-ignore lint/performance/noImgElement: arbitrary remote avatars; no next/image loader config
					<img
						src={src}
						alt=""
						onLoad={() => setLoaded(src)}
						onError={() => setFailed(src)}
						className={cn(
							"absolute inset-0 size-full object-cover transition-opacity duration-300",
							loaded === src ? "opacity-100" : "opacity-0",
						)}
					/>
				)}
			</span>
			{status && (
				<span
					className={cn(
						"absolute right-0 bottom-0 rounded-full ring-2 ring-background",
						sizes[size].dot,
						statuses[status],
					)}
				>
					<span className="sr-only">{status}</span>
				</span>
			)}
		</span>
	);
}
