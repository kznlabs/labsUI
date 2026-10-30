"use client";

import type { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselDots, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ProductCardProps = {
	/** Product name, the card's heading. */
	name: string;
	/** Current price in major units, e.g. 49.99. */
	price: number;
	/** Struck-through original price for a sale. */
	compareAt?: number;
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
	/** Product page link for the name. */
	href?: string;
	/** Shows the add button; called when it is pressed. */
	onAddToCart?: () => void;
	/** Add button text. */
	addLabel?: ReactNode;
	className?: string;
};

/** Shop tile: photos in an AspectRatio (a Carousel when there are several), name, price, badge, add button. */
export function ProductCard({
	name,
	price,
	compareAt,
	currency = "USD",
	locale = "en-US",
	media,
	ratio = 4 / 3,
	badge,
	href,
	onAddToCart,
	addLabel = "Add to cart",
	className,
}: ProductCardProps) {
	const money = new Intl.NumberFormat(locale, { style: "currency", currency });
	const frame = (slide: ReactNode) => (
		<AspectRatio ratio={ratio} className="overflow-hidden bg-muted">
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

				{badge && (
					<Badge shape="pill" className="absolute top-2 left-2">
						{badge}
					</Badge>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-3 p-3">
				<div className="flex items-baseline justify-between gap-2">
					<h3 className="min-w-0 truncate font-medium text-sm">
						{href ? (
							<a href={href} className="outline-none hover:underline focus-visible:underline">
								{name}
							</a>
						) : (
							name
						)}
					</h3>

					<p className="shrink-0 text-sm tabular-nums">
						{compareAt !== undefined && compareAt > price && (
							<>
								<del className="mr-1.5 text-muted-foreground">{money.format(compareAt)}</del>

								<span className="sr-only">now </span>
							</>
						)}

						{money.format(price)}
					</p>
				</div>

				{onAddToCart && (
					<Button size="sm" variant="outline" className="mt-auto w-full" onClick={onAddToCart}>
						{addLabel}
					</Button>
				)}
			</div>
		</article>
	);
}
