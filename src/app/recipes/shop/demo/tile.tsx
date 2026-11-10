import { AppLink } from "@/lib/link";
import { cn } from "@/lib/utils";
import { eur, isSale, isSoldOut, type Product, storeHref } from "./catalog";
import { Photo } from "./photo";

export function Swatches({ colors, className }: { colors: Product["colors"]; className?: string }) {
	return (
		<ul
			className={cn("flex gap-1.5", className)}
			aria-label={`Colours: ${colors.map((color) => color.name).join(", ")}`}
		>
			{colors.map((color) => (
				<li
					key={color.name}
					title={color.name}
					className="size-2.5 border border-foreground/25"
					style={{ background: color.hex }}
				/>
			))}
		</ul>
	);
}

export function Price({ product, className }: { product: Product; className?: string }) {
	return (
		<span className={cn("tabular-nums", className)}>
			{product.compareAt !== undefined && (
				<>
					<s className="mr-2 text-muted-foreground">{eur(product.compareAt)}</s>

					<span className="sr-only">now</span>
				</>
			)}

			<span className={cn(isSale(product) && "text-destructive-ink")}>{eur(product.price)}</span>
		</span>
	);
}

export function Tile({
	product,
	heading: Heading = "h3",
	priority,
}: {
	product: Product;
	heading?: "h2" | "h3";
	priority?: boolean;
}) {
	const out = isSoldOut(product);

	return (
		<article className="group">
			<AppLink
				href={storeHref(`/products/${product.slug}`)}
				className="block outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				<div className="relative aspect-[3/4] overflow-hidden bg-muted">
					<Photo
						photo={product.photos[0]}
						alt=""
						priority={priority}
						className={cn(out && "opacity-50 grayscale")}
					/>

					<Photo
						photo={product.photos[1]}
						alt=""
						className={cn(
							"absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100",
							out && "grayscale",
						)}
					/>

					{(out || isSale(product)) && (
						<span
							className={cn(
								"shop-caps absolute bottom-0 left-0 bg-background px-2.5 py-2",
								out ? "text-foreground" : "text-destructive-ink",
							)}
						>
							{out ? "Sold out" : "Sale"}
						</span>
					)}
				</div>

				<div className="flex items-baseline justify-between gap-3 px-2 pt-2.5 text-[13px]">
					<Heading className="font-normal">{product.name}</Heading>

					<Price product={product} className={cn(out && "text-muted-foreground")} />
				</div>
			</AppLink>

			<Swatches colors={product.colors} className="px-2 pt-2" />
		</article>
	);
}
