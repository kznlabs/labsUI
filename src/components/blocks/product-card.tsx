"use client";

import type { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselDots, CarouselItem } from "@/components/ui/carousel";
import { Rating } from "@/components/ui/rating";
import { cn, formatMoney } from "@/lib/utils";

type ProductCardProps = {
	/** Product name, the card's heading. */
	name: string;
	/** Heading level, to fit the page's outline. */
	as?: "h2" | "h3" | "h4";
	/** Current price in major units, e.g. 49.99. */
	price: number;
	/** Struck-through original price for a sale. */
	compareAt?: number;
	/** Lowest price from the 30 days before a reduction, shown as text under the price. Pass it only during a promotion. */
	lowestPrice?: number;
	/** Text before `lowestPrice`, without a colon: one follows. Polish: "Najniższa cena z 30 dni przed obniżką". */
	lowestPriceLabel?: ReactNode;
	/** Read by screen readers between `compareAt` and the price. */
	nowLabel?: string;
	/** ISO 4217 code for the price. */
	currency?: string;
	/** BCP 47 locale for number formatting. */
	locale?: string;
	/** Photos (`<img>`), one per slide. Several become a swipeable carousel with dots. */
	media: ReactNode[];
	/** Media width/height, e.g. 1 for square. */
	ratio?: number;
	/** Small label over the media, e.g. "New". */
	badge?: string;
	/** Score out of 5, fractions included; shows read-only stars. */
	rating?: number;
	/** Beside the stars, e.g. "128 reviews". */
	ratingNote?: ReactNode;
	/** Product page link for the name. */
	href?: string;
	/** Dims the photos, shows `soldOutLabel` in place of `badge` and disables the add button. */
	soldOut?: boolean;
	/** Label over the media when sold out. */
	soldOutLabel?: string;
	/** Shows the add button; called when it is pressed. */
	onAddToCart?: () => void;
	/** Add button text. */
	addLabel?: ReactNode;
	/** Your own control in place of the add button, e.g. "Notify me" on a sold-out product. */
	action?: ReactNode;
	className?: string;
};

/** Shop tile: photos in an AspectRatio (a Carousel when there are several), name, price, rating, badge, add button or your own action. */
export function ProductCard({
	name,
	as: Heading = "h3",
	price,
	compareAt,
	lowestPrice,
	lowestPriceLabel = "Lowest price in the 30 days before the reduction",
	nowLabel = "now",
	currency,
	locale,
	media,
	ratio = 4 / 3,
	badge,
	rating,
	ratingNote,
	href,
	soldOut,
	soldOutLabel = "Sold out",
	onAddToCart,
	addLabel = "Add to cart",
	action,
	className,
}: ProductCardProps) {
	const label = soldOut ? soldOutLabel : badge;
	const frame = (slide: ReactNode) => (
		<AspectRatio ratio={ratio} className={cn("overflow-hidden bg-muted", soldOut && "opacity-60")}>
			{slide}
		</AspectRatio>
	);

	return (
		<article
			className={cn(
				"group/product flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs",
				className,
			)}
		>
			<div className="relative">
				{media.length > 1 ? (
					<Carousel label={`${name} photos`}>
						<CarouselContent className="[--gap:0px]">
							{media.map((slide, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: photos are positions
								<CarouselItem key={i}>{frame(slide)}</CarouselItem>
							))}
						</CarouselContent>

						<CarouselDots className="absolute inset-x-0 bottom-2 mt-0" />
					</Carousel>
				) : (
					frame(media[0])
				)}

				{label && (
					<Badge
						variant={soldOut ? "secondary" : "default"}
						shape="pill"
						className="absolute top-2 left-2"
					>
						{label}
					</Badge>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-3 p-3">
				<div className="grid gap-1.5">
					<div className="flex items-baseline justify-between gap-2">
						<Heading className="min-w-0 truncate font-medium text-sm">
							{href ? (
								<a href={href} className="outline-none hover:underline focus-visible:underline">
									{name}
								</a>
							) : (
								name
							)}
						</Heading>

						<p className="shrink-0 text-sm tabular-nums">
							{compareAt !== undefined && compareAt > price && (
								<>
									<del className="mr-1.5 text-muted-foreground">
										{formatMoney(compareAt, currency, locale)}
									</del>

									<span className="sr-only">{nowLabel} </span>
								</>
							)}

							{formatMoney(price, currency, locale)}
						</p>
					</div>

					{lowestPrice !== undefined && (
						<p className="text-muted-foreground text-xs">
							{lowestPriceLabel}:{" "}
							<span className="tabular-nums">{formatMoney(lowestPrice, currency, locale)}</span>
						</p>
					)}

					{rating !== undefined && (
						<div className="flex items-center gap-1.5">
							<Rating readOnly value={rating} size="sm" />

							{ratingNote && <span className="text-muted-foreground text-xs">{ratingNote}</span>}
						</div>
					)}
				</div>

				{action ? (
					<div className="mt-auto">{action}</div>
				) : (
					onAddToCart && (
						<Button
							size="sm"
							variant="outline"
							className="mt-auto w-full"
							disabled={soldOut}
							onClick={onAddToCart}
						>
							{addLabel}
						</Button>
					)
				)}
			</div>
		</article>
	);
}
