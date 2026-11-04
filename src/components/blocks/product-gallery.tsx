"use client";

import type { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselThumbs,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
	/** Names the gallery for screen readers, e.g. "Clip camera photos". */
	label: string;
	/** Photos (`<img>`), one per slide. */
	media: ReactNode[];
	/** Smaller versions for the row of thumbnails. Defaults to `media`. */
	thumbnails?: ReactNode[];
	/** Media width/height, e.g. 1 for square. */
	ratio?: number;
	className?: string;
};

/** A product page's photos: a swipeable Carousel with thumbnails under it. One photo stays a plain picture. */
export function ProductGallery({
	label,
	media,
	thumbnails = media,
	ratio = 1,
	className,
}: ProductGalleryProps) {
	const frame = (slide: ReactNode) => (
		<AspectRatio ratio={ratio} className="overflow-hidden rounded-xl bg-muted">
			{slide}
		</AspectRatio>
	);

	if (media.length < 2) return <div className={className}>{frame(media[0])}</div>;

	return (
		<Carousel label={label} className={cn("flex flex-col gap-3", className)}>
			<div className="relative">
				<CarouselContent className="[--gap:0.75rem]">
					{media.map((slide, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: photos are positions
						<CarouselItem key={i}>{frame(slide)}</CarouselItem>
					))}
				</CarouselContent>

				<CarouselPrevious />

				<CarouselNext />
			</div>

			<CarouselThumbs items={thumbnails} />
		</Carousel>
	);
}
