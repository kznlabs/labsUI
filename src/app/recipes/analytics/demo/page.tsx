import type { Metadata } from "next";
import { demoPath, site } from "@/site/config";
import { Dashboard } from "./dashboard";

const description =
	"A reference build of the analytics dashboard recipe: key figures that count up, revenue against the period before, a date range with day, week and month, live orders, top products, channels and countries.";
const url = `${site.url}${demoPath("analytics")}`;

export const metadata: Metadata = {
	title: "Analytics dashboard demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Analytics dashboard demo · ${site.name}`, description },
};

export default function AnalyticsDemo() {
	return <Dashboard />;
}
