import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { categories, products, storeHref } from "../../catalog";
import { CategoryBrowser, CategoryWithQuery } from "../../category-browser";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return [{ category: "all" }, ...categories.map((entry) => ({ category: entry.id }))];
}

export async function generateMetadata({ params }: Props) {
	const { category } = await params;
	const label = categories.find((entry) => entry.id === category)?.label ?? "All products";

	return { title: `${label} · Electronics demo` };
}

export default async function CategoryPage({ params }: Props) {
	const { category } = await params;
	const cat = categories.find((entry) => entry.id === category);

	if (!cat && category !== "all") notFound();

	const list = cat ? products.filter((product) => product.category === cat.id) : products;

	return (
		<>
			<Breadcrumb
				items={[{ label: "Home", href: storeHref() }, { label: cat?.label ?? "All products" }]}
			/>

			<h1 className="mt-1 mb-3 text-2xl font-semibold tracking-tight">
				{cat?.label ?? "All products"}
			</h1>

			<Suspense fallback={<CategoryBrowser products={list} />}>
				<CategoryWithQuery products={list} />
			</Suspense>

			<div className="h-16" aria-hidden />
		</>
	);
}
