import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug, products } from "../../catalog";
import { Footer } from "../../footer";
import { Header } from "../../header";
import { Photo } from "../../photo";
import { ProductPanel } from "../../product-panel";
import { Tile } from "../../tile";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = () => products.map((product) => ({ slug: product.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const product = bySlug(slug);

	return { title: product ? `${product.name} · Anselm` : "Not found" };
}

export default async function ProductPage({ params }: Props) {
	const { slug } = await params;
	const product = bySlug(slug);

	if (!product) notFound();

	// Two photos, plus a close crop of the first.
	const photos = [
		product.photos[0],
		product.photos[1],
		{ ...product.photos[0], zoom: (product.photos[0].zoom ?? 1) + 0.9 },
	];
	const related = product.goesWith.map(bySlug).filter((x) => x !== undefined);

	return (
		<main className="pt-26 pb-24 lg:pb-0">
			<Header />

			<div className="grid lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_32rem]">
				<div className="flex flex-col gap-1">
					{photos.map((photo) => (
						<div
							key={`${photo.src}${photo.pos}${photo.zoom}`}
							className="aspect-[3/4] overflow-hidden bg-muted lg:aspect-[4/5]"
						>
							<Photo
								photo={photo}
								alt={photo === photos[0] ? product.name : ""}
								priority={photo === photos[0]}
							/>
						</div>
					))}
				</div>

				<div className="lg:py-10">
					<div className="lg:sticky lg:top-36">
						<ProductPanel product={product} />
					</div>
				</div>
			</div>

			<section className="mt-28">
				<h2 className="shop-display px-4 pb-6 text-3xl sm:px-6 sm:text-4xl">Goes with</h2>

				<div className="grid grid-cols-2 gap-x-1 gap-y-8 md:grid-cols-4">
					{related.map((product) => (
						<Tile key={product.slug} product={product} />
					))}
				</div>
			</section>

			<Footer />
		</main>
	);
}
