import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { AppLink } from "@/lib/link";
import { bySlug, categories, discountPercent, price, products, storeHref } from "./catalog";
import { Instalments, PriceBlock } from "./price";

export default function Home() {
	const drops = products
		.filter((product) => discountPercent(product) > 0 && product.stock > 0)
		.sort((a, b) => discountPercent(b) - discountPercent(a));
	const aero = bySlug("aero-14");

	if (!aero) notFound();

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<section aria-labelledby="drops">
				<h1 id="drops" className="text-2xl font-semibold tracking-tight">
					Cheaper than anything in the last 30 days
				</h1>

				<p className="mt-1 max-w-xl text-sm text-muted-foreground">
					These are under the lowest price of the 29 days before today. A price that was raised and
					then “cut” back doesn’t qualify.
				</p>

				<ul className="mt-3 divide-y rounded-xl border">
					{drops.map((product) => (
						<li
							key={product.slug}
							className="grid grid-cols-[4.5rem_1fr] items-center gap-3 p-3 sm:grid-cols-[4.5rem_1fr_auto]"
						>
							{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
							<img
								src={product.image}
								alt=""
								className="aspect-square w-full rounded-lg object-cover"
								style={{ objectPosition: product.imagePosition }}
							/>

							<div className="min-w-0">
								<h2 className="font-semibold leading-snug">
									<AppLink href={storeHref(`/p/${product.slug}`)} className="hover:underline">
										{product.name}
									</AppLink>
								</h2>

								<p className="text-xs text-muted-foreground">
									{product.key.map(([, value]) => value).join(" · ")}
								</p>

								<Instalments amount={price(product)} className="mt-0.5" />
							</div>

							<div className="col-span-2 sm:col-span-1">
								<PriceBlock product={product} />
							</div>
						</li>
					))}
				</ul>

				<AppLink
					href={storeHref("/c/all")}
					className={buttonVariants({ variant: "ghost", className: "mt-2 -ml-2" })}
				>
					All {products.length} products <ArrowRight aria-hidden />
				</AppLink>
			</section>

			<div className="space-y-6">
				<nav aria-label="Shop by category">
					<h2 className="mb-1.5 text-base font-semibold">Shop by category</h2>

					<ul className="divide-y rounded-xl border">
						{categories.map((entry) => (
							<li key={entry.id}>
								<AppLink
									href={storeHref(`/c/${entry.id}`)}
									className="flex items-center gap-3 p-2 hover:bg-secondary"
								>
									{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
									<img
										src={entry.image}
										alt=""
										className="size-12 rounded-md object-cover"
										style={{ objectPosition: entry.position }}
									/>

									<span className="min-w-0">
										<span className="block text-sm font-medium">{entry.label}</span>

										<span className="block truncate text-xs text-muted-foreground">
											{entry.blurb}
										</span>
									</span>
								</AppLink>
							</li>
						))}
					</ul>
				</nav>

				<div className="rounded-xl border p-3">
					<h2 className="text-base font-semibold">Build your {aero.name}</h2>

					<p className="mt-1 text-sm text-muted-foreground">
						Four questions: size, chip, memory, storage. Price and delivery date update as you
						answer.
					</p>

					<AppLink
						href={storeHref("/configure/aero-14")}
						className={buttonVariants({ size: "sm", className: "mt-2" })}
					>
						Start configuring
					</AppLink>
				</div>
			</div>
		</div>
	);
}
