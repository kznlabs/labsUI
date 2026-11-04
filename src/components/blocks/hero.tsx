import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

/* Server-safe. No entrance motion: the title is usually the page's largest paint. */

type HeroProps = Omit<ComponentProps<"section">, "title"> & {
	/** Short line above the title, e.g. a Badge. */
	eyebrow?: ReactNode;
	/** The headline. */
	title: ReactNode;
	/** Supporting text under the title. */
	description?: ReactNode;
	/** Links or buttons under the text, e.g. anchors styled with `buttonVariants()`. */
	actions?: ReactNode;
	/** Image, video or a live composition. Beside the text when wide, below it otherwise. */
	media?: ReactNode;
	/** Text alignment. `center` always keeps `media` below the text. */
	align?: "start" | "center";
	/** Heading level of the title. Keep one `h1` per page. */
	as?: "h1" | "h2";
};

/** Opening section of a page: title, text, actions and media. */
export function Hero({
	eyebrow,
	title,
	description,
	actions,
	media,
	align = "start",
	as: Heading = "h1",
	className,
	...props
}: HeroProps) {
	const titleId = useId();
	const centered = align === "center";

	return (
		<section aria-labelledby={titleId} className={cn("@container w-full", className)} {...props}>
			<div
				className={cn(
					"mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 @2xl:py-24",
					media && !centered && "@3xl:grid-cols-2 @3xl:items-center @3xl:gap-12",
				)}
			>
				<div
					className={cn(
						"flex min-w-0 flex-col gap-5",
						centered ? "items-center text-center" : "items-start",
					)}
				>
					{eyebrow && <div className="text-muted-foreground text-sm">{eyebrow}</div>}

					<Heading
						id={titleId}
						className="text-balance font-semibold text-4xl tracking-tight @2xl:text-5xl @6xl:text-6xl"
					>
						{title}
					</Heading>

					{description && (
						<p className="max-w-[60ch] text-pretty text-lg text-muted-foreground leading-relaxed">
							{description}
						</p>
					)}

					{actions && (
						<div
							className={cn("mt-1 flex flex-wrap items-center gap-3", centered && "justify-center")}
						>
							{actions}
						</div>
					)}
				</div>

				{media && <div className="min-w-0">{media}</div>}
			</div>
		</section>
	);
}
