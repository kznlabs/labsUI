import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Quote } from "@/components/ui/quote";
import { cn } from "@/lib/utils";

// Server-safe: the animated parts are client components.

type TestimonialProps = {
	/** The quote. */
	children: ReactNode;
	/** Who said it. */
	author: string;
	/** Line under the author, e.g. role and company. */
	subtitle?: string;
	/** Author photo URL; initials show without one. */
	avatar?: string;
	/** Language of the quote, e.g. "pl". */
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
