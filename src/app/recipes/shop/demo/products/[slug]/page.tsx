import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { site } from "@/site/config";
import { bySlug, products, shopHref, shopPath } from "../../catalog";
import { ProductDetail } from "../../product-detail";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const product = bySlug((await params).slug);

	if (!product) return {};

	const url = `${site.url}${shopPath(`/products/${product.slug}`)}`;

	return {
		title: `${product.name} · Shop demo`,
		description: product.tagline,
		alternates: { canonical: url },
		openGraph: {
			url,
			title: `${product.name} · Shop demo · ${site.name}`,
			description: product.tagline,
		},
	};
}

export default async function ProductPage({ params }: Props) {
	const product = bySlug((await params).slug);

	if (!product) notFound();

	return (
		<>
			<Breadcrumb
				className="mb-6"
				items={[{ label: "Shop", href: shopHref() }, { label: product.name }]}
			/>

			<ProductDetail slug={product.slug} />
		</>
	);
}
