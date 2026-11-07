import type { Metadata } from "next";
import { demoPath, site } from "@/site/config";
import { AdminApp } from "./admin-app";

const description =
	"A reference build of the admin panel recipe: a sidebar, orders with search, status filters and bulk actions, an order drawer that edits and refunds, products, customers and settings.";
const url = `${site.url}${demoPath("admin-panel")}`;

export const metadata: Metadata = {
	title: "Admin panel demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Admin panel demo · ${site.name}`, description },
};

export default function AdminPanelDemo() {
	return <AdminApp />;
}
