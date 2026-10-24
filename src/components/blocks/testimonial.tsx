import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Quote } from "@/components/ui/quote";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"): the parts that animate are client components. */

type TestimonialProps = {
	children: ReactNode;
	author: string;
	subtitle?: string;
	avatar?: string;
	lang?: string;
	/** Everyone else who agrees: the first few stack, the rest fold into `+N`. */
	others?: { alt: string; src?: string; id?: string }[];
	/** Line beside the stack, e.g. "Trusted by 2,400 streamers". */
	othersLabel?: ReactNode;
	className?: string;
};

/** A large Quote carried by its author, with the crowd behind it as an AvatarGroup. */
export function Testimonial({
	children,
	author,
	subtitle,
	avatar,
	lang,
	others,
	othersLabel,
	className,
}: TestimonialProps) {
	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Quote
				variant="large"
				author={author}
				subtitle={subtitle}
				lang={lang}
				avatar={<Avatar src={avatar} alt={author} size="sm" />}
			>
				{children}
			</Quote>
			{others && others.length > 0 && (
				<div className="flex flex-wrap items-center gap-3 border-t pt-5">
					<AvatarGroup users={others} max={5} size="sm" />
					{othersLabel && <p className="text-muted-foreground text-sm">{othersLabel}</p>}
				</div>
			)}
		</div>
	);
}
