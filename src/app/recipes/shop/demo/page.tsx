import type { Metadata } from "next";
import { Suspense } from "react";
import { demoPath, site, withBase } from "@/site/config";
import { products } from "./catalog";
import { CollectionFromUrl } from "./collection";
import { Footer } from "./footer";
import { Header } from "./header";

const description =
	"A reference build of the fashion recipe: a lookbook with a transparent header, filters, product pages, a bag and a checkout.";
const url = `${site.url}${demoPath("shop")}`;

export const metadata: Metadata = {
	title: "Fashion store demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Fashion store demo · ${site.name}`, description },
};

export default function Home() {
	return (
		<main>
			<Header overHero />

			<section className="relative h-[calc(100svh-3rem)] min-h-[560px] overflow-hidden bg-muted">
				{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
				<img
					src={withBase("/recipes/media/shop-1cxi0cspe5.webp")}
					alt="A woman in a long green printed dress lifts the skirt between two sand-coloured walls."
					className="absolute inset-0 size-full object-cover object-[50%_40%]"
					fetchPriority="high"
				/>

				<div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 sm:pb-12">
					<h1 className="shop-display max-w-[11ch] text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
						Winter, in green
					</h1>

					<a
						href="#collection"
						className="shop-caps mt-6 inline-block py-2 underline underline-offset-8"
					>
						Twelve pieces, below
					</a>
				</div>
			</section>

			<section className="grid gap-10 px-4 py-28 sm:px-6 md:grid-cols-12 md:py-40">
				<p className="shop-display text-3xl leading-snug md:col-span-6 md:col-start-5 md:text-4xl">
					Suede that softens, knits that hold their shape, linen that is meant to crease. We chose
					the cold months for what they ask of clothes: to be worn every day, and to look better for
					it.
				</p>
			</section>

			<section id="collection" className="scroll-mt-26">
				<Suspense fallback={<div className="h-[100svh]" />}>
					<CollectionFromUrl products={products} />
				</Suspense>
			</section>

			<Footer />
		</main>
	);
}
