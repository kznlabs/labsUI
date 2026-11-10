import { Check, Minus, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button-variants";
import { Chart } from "@/components/ui/chart";
import { Rating } from "@/components/ui/rating";
import { AppLink } from "@/lib/link";
import { AddToCart } from "../../add-to-cart";
import {
	bySlug,
	categories,
	euro,
	historyRows,
	lowest30,
	price,
	products,
	storeHref,
} from "../../catalog";
import { Delivery } from "../../delivery";
import { Instalments, PriceBlock } from "../../price";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
	const product = bySlug((await params).slug);

	return { title: `${product?.name ?? "Product"} · Electronics demo` };
}

export function generateStaticParams() {
	return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: Props) {
	const { slug } = await params;
	const product = bySlug(slug);

	if (!product) notFound();

	const cat = categories.find((entry) => entry.id === product.category);

	if (!cat) notFound();

	return (
		<>
			<Breadcrumb
				items={[
					{ label: "Home", href: storeHref() },
					{ label: cat.label, href: storeHref(`/c/${cat.id}`) },
					{ label: product.name },
				]}
			/>

			<div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
				<div className="overflow-hidden rounded-xl border bg-muted">
					{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
					<img
						src={product.image}
						alt={product.name}
						className="aspect-[4/3] size-full object-cover"
						style={{ objectPosition: product.imagePosition }}
					/>
				</div>

				<div className="space-y-4">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>

						<div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
							<Rating readOnly value={product.rating} size="sm" />

							<span className="tabular-nums">
								{product.rating.toFixed(1)} · {product.reviews} reviews
							</span>

							<span>· {product.brand}</span>
						</div>
					</div>

					<div className="space-y-2 rounded-xl border p-3">
						<PriceBlock product={product} size="lg" chart={false} />

						<Instalments amount={price(product)} />

						<figure className="pt-1">
							<Chart
								type="line"
								height={150}
								label={`Price of ${product.name} over the last 30 days`}
								data={historyRows(product)}
								index="day"
								series={[{ key: "price", label: "Price" }]}
								format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
								locale="en-IE"
							/>

							<figcaption className="mt-1 text-xs text-muted-foreground">
								Last 30 days. Lowest:{" "}
								<span className="font-medium text-foreground tabular-nums">
									{euro(lowest30(product))}
								</span>
								. A reduction is shown only when today’s price is under the lowest price of the 29
								days before.
							</figcaption>
						</figure>

						{product.stock > 0 ? (
							<Delivery />
						) : (
							<p className="text-sm text-muted-foreground">
								Out of stock. We’ll show a delivery date when it’s back.
							</p>
						)}

						{product.stock > 0 && product.stock < 10 && (
							<p className="text-sm text-warning-ink">Only {product.stock} left</p>
						)}

						<AddToCart product={product} size="lg" className="w-full" />

						{product.slug === "aero-14" && (
							<AppLink
								href={storeHref("/configure/aero-14")}
								className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}
							>
								<SlidersHorizontal aria-hidden /> Configure size, chip, memory and storage
							</AppLink>
						)}
					</div>
				</div>
			</div>

			<section aria-labelledby="specs" className="mt-8">
				<h2 id="specs" className="mb-2 text-lg font-semibold">
					Specifications
				</h2>

				<div className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
					{product.specs.map((group) => (
						<div key={group.label} className="mb-4">
							<h3 className="border-b pb-1 text-sm font-semibold">{group.label}</h3>

							<dl className="divide-y text-sm">
								{group.rows.map(([label, value]) => (
									<div key={label} className="flex justify-between gap-4 py-1.5">
										<dt className="text-muted-foreground">{label}</dt>

										<dd className="text-right font-medium tabular-nums">
											{value === true ? (
												<>
													<Check className="inline size-4 text-success-ink" aria-hidden />

													<span className="sr-only">Yes</span>
												</>
											) : value === false ? (
												<>
													<Minus className="inline size-4 text-muted-foreground" aria-hidden />

													<span className="sr-only">No</span>
												</>
											) : (
												value
											)}
										</dd>
									</div>
								))}
							</dl>
						</div>
					))}
				</div>
			</section>
		</>
	);
}
