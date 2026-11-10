import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { bySlug, storeHref } from "../../catalog";
import { Configurator } from "../../configurator";

export const metadata = { title: "Configure Aero 14 · Electronics demo" };

export const dynamicParams = false;

export function generateStaticParams() {
	return [{ slug: "aero-14" }];
}

export default async function ConfigurePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = slug === "aero-14" ? bySlug(slug) : undefined;

	if (!product) notFound();

	return (
		<>
			<Breadcrumb
				items={[
					{ label: "Home", href: storeHref() },
					{ label: "Laptops", href: storeHref("/c/laptops") },
					{ label: product.name, href: storeHref(`/p/${product.slug}`) },
					{ label: "Configure" },
				]}
			/>

			<h1 className="mt-1 mb-3 text-2xl font-semibold tracking-tight">
				Configure your {product.name}
			</h1>

			<Configurator product={product} />
		</>
	);
}
