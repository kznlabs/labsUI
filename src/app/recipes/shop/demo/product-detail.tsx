"use client";

import { RotateCcw, Truck, Wrench } from "lucide-react";
import { useState } from "react";
import { ProductGallery } from "@/components/blocks/product-gallery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rating } from "@/components/ui/rating";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { useCart } from "./cart";
import { bySlug, euro, freeShippingFrom, soldOut } from "./catalog";

export function ProductDetail({ slug }: { slug: string }) {
	const cart = useCart();
	const [size, setSize] = useState("");
	const [error, setError] = useState("");
	const [added, setAdded] = useState(false);
	const product = bySlug(slug);

	if (!product) return null;

	const gone = soldOut(product);
	const few = size && product.stock[size] <= 3;

	function addToCart() {
		if (!product) return;

		if (!size) {
			setError("Choose a size first.");

			return;
		}

		cart.add(product.slug, size);
		setAdded(true);
		setTimeout(() => setAdded(false), 1600);
		setTimeout(cart.open, 350);
	}

	return (
		<div className="grid gap-8 md:grid-cols-2 md:gap-12">
			<ProductGallery
				label={`${product.name} photos`}
				ratio={3 / 2}
				media={product.photos.map((photo) => (
					// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
					<img key={photo.src} src={photo.src} alt={photo.alt} width={960} height={640} />
				))}
			/>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-3">
					{(product.was || product.badge || gone) && (
						<div className="flex gap-2">
							{product.was && <Badge>Sale</Badge>}

							{product.badge && !product.was && <Badge variant="secondary">{product.badge}</Badge>}

							{gone && <Badge variant="outline">Sold out</Badge>}
						</div>
					)}

					<h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">{product.name}</h1>

					<p className="text-muted-foreground">{product.tagline}</p>

					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Rating
							value={product.rating}
							readOnly
							size="sm"
							aria-label={`Rated ${product.rating} out of 5`}
						/>
						{product.rating} · {product.reviews} reviews
					</div>

					<div>
						<p className="flex items-baseline gap-2">
							<span className="font-semibold text-2xl tabular-nums">
								{euro.format(product.price)}
							</span>

							{product.was && (
								<s className="text-muted-foreground tabular-nums">
									<span className="sr-only">was </span>

									{euro.format(product.was)}
								</s>
							)}
						</p>

						{product.lowest && (
							<p className="mt-1 text-muted-foreground text-xs">
								Lowest price in the 30 days before the reduction: {euro.format(product.lowest)}
							</p>
						)}

						<p className="mt-1 text-muted-foreground text-xs">Including VAT.</p>
					</div>
				</div>

				<Separator />

				{gone ? (
					<Alert>
						<AlertDescription className="flex flex-wrap items-center justify-between gap-3">
							Sold out in every size. A new batch arrives in December.
							<Button
								variant="outline"
								size="sm"
								onClick={() => toast(`Demo mode: would email you when the ${product.name} is back`)}
							>
								Notify me
							</Button>
						</AlertDescription>
					</Alert>
				) : (
					<form
						className="flex flex-col gap-4"
						noValidate
						onSubmit={(event) => {
							event.preventDefault();
							addToCart();
						}}
					>
						<RadioGroup
							legend={product.sizeLabel}
							name="size"
							variant="card"
							orientation="horizontal"
							value={size}
							onValueChange={(value) => {
								setSize(value);
								setError("");
							}}
							aria-invalid={Boolean(error)}
							aria-describedby="size-note"
						>
							{Object.entries(product.stock).map(([value, left]) => (
								<RadioGroupItem key={value} value={value} disabled={left === 0}>
									{value}
								</RadioGroupItem>
							))}
						</RadioGroup>

						<p
							id="size-note"
							aria-live="polite"
							className={error ? "text-destructive-ink text-sm" : "text-muted-foreground text-sm"}
						>
							{error ||
								(few
									? `Only ${product.stock[size]} left in ${size}.`
									: "Greyed-out sizes are sold out.")}
						</p>

						<Button
							type="submit"
							size="lg"
							status={added ? "success" : "idle"}
							successLabel="Added to cart"
						>
							Add to cart
						</Button>
					</form>
				)}

				<ul className="grid gap-2 text-muted-foreground text-sm">
					<li className="flex items-center gap-2">
						<Truck className="size-4 shrink-0" aria-hidden="true" />
						Free standard delivery over {euro.format(freeShippingFrom)}
					</li>

					<li className="flex items-center gap-2">
						<RotateCcw className="size-4 shrink-0" aria-hidden="true" />
						30-day returns, free in the EU
					</li>

					<li className="flex items-center gap-2">
						<Wrench className="size-4 shrink-0" aria-hidden="true" />
						Repairs for life at cost price
					</li>
				</ul>

				<Separator />

				<div className="flex flex-col gap-3 text-sm leading-relaxed">
					<h2 className="font-semibold text-base">Details</h2>

					<p>{product.description}</p>

					<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
						{product.details.map((detail) => (
							<li key={detail}>{detail}</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
