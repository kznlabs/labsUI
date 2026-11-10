import { cn } from "@/lib/utils";
import type { Photo as PhotoData } from "./catalog";

/** A cropped product photo: fills its box, crop set by the product data. */
export function Photo({
	photo,
	alt,
	className,
	priority,
}: {
	photo: PhotoData;
	alt: string;
	className?: string;
	priority?: boolean;
}) {
	const pos = photo.pos ?? "50% 50%";

	return (
		// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
		<img
			src={photo.src}
			alt={alt}
			loading={priority ? "eager" : "lazy"}
			decoding="async"
			draggable={false}
			className={cn("size-full object-cover", className)}
			style={{
				objectPosition: pos,
				transform: photo.zoom ? `scale(${photo.zoom})` : undefined,
				transformOrigin: pos,
			}}
		/>
	);
}
