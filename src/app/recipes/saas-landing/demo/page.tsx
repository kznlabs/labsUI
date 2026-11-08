import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hero } from "@/components/blocks/hero";
import { StatsStrip } from "@/components/blocks/stats-strip";
import { Testimonial } from "@/components/blocks/testimonial";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { demoPath, site } from "@/site/config";
import { faqs, stats, teams, testimonials } from "./content";
import { Features } from "./features";
import { LandingNewsletter } from "./landing-chrome";
import { MonitorWindow } from "./monitor-window";
import { PricingSection } from "./pricing-section";

const description =
	"A reference build of the SaaS landing recipe: a hero with a live product window, features in tabs, customer quotes, pricing in euros with monthly and yearly billing, a plan finder, an FAQ and a newsletter.";
const url = `${site.url}${demoPath("saas-landing")}`;

export const metadata: Metadata = {
	title: "SaaS landing demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `SaaS landing demo · ${site.name}`, description },
};

function Section({
	id,
	eyebrow,
	title,
	intro,
	children,
	className,
}: {
	id: string;
	eyebrow: string;
	title: string;
	intro?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-heading`}
			className={cn("mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6", className)}
		>
			<div className="mx-auto mb-12 max-w-2xl text-center">
				<p className="font-medium text-primary-ink text-sm">{eyebrow}</p>

				<h2
					id={`${id}-heading`}
					className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-4xl"
				>
					{title}
				</h2>

				{intro && <p className="mt-4 text-pretty text-lg text-muted-foreground">{intro}</p>}
			</div>

			{children}
		</section>
	);
}

export default function SaasLandingDemo() {
	const [featured, ...quotes] = testimonials;

	return (
		<>
			<Hero
				className="mx-auto max-w-6xl"
				eyebrow={
					<a
						href="#features"
						className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-foreground text-sm transition-colors hover:bg-accent"
					>
						<Badge shape="pill">New</Badge>
						Status pages in 12 languages
						<ArrowRight aria-hidden="true" className="size-3.5" />
					</a>
				}
				title="Know it's down before your customers do."
				description="Pingwell checks your sites and APIs from eight regions, wakes the right person when something breaks and keeps your status page honest. Set up in five minutes, free for ten monitors."
				actions={
					<>
						<a href="#pricing" className={buttonVariants({ size: "lg" })}>
							Start monitoring free
						</a>

						<a href="#features" className={buttonVariants({ size: "lg", variant: "outline" })}>
							See how it works
						</a>

						<p className="w-full text-muted-foreground text-sm">
							14-day trial on paid plans · no card needed
						</p>
					</>
				}
				media={<MonitorWindow />}
			/>

			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<p className="text-center text-muted-foreground text-sm">
					Trusted by 1,900 teams, among them
				</p>

				<ul aria-label="Customers" className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
					{teams.map((team) => (
						<li key={team} className="font-semibold text-lg text-muted-foreground tracking-tight">
							{team}
						</li>
					))}
				</ul>

				<StatsStrip className="mt-14" stats={stats} />
			</div>

			<Section
				id="features"
				eyebrow="Features"
				title="Everything between “it's slow” and “it's fixed”"
				intro="Checks, alerts, on-call and a status page in one place, so an outage is one tab, not five."
			>
				<Features />
			</Section>

			<Section id="customers" eyebrow="Customers" title="Teams sleep better with Pingwell">
				<div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
					<Card className="justify-center p-6 sm:p-10">
						<Testimonial
							author={featured.author}
							subtitle={featured.subtitle}
							others={teams.map((team) => ({ alt: team }))}
							othersLabel="1,900 teams in 41 countries"
						>
							{featured.body}
						</Testimonial>
					</Card>

					<ul className="grid gap-4">
						{quotes.map((quote) => (
							<li key={quote.author}>
								<Card className="h-full gap-4 p-5">
									<blockquote className="text-pretty leading-relaxed">“{quote.body}”</blockquote>

									<div className="flex items-center gap-3">
										<Avatar alt={quote.author} size="sm" />

										<div>
											<p className="font-medium text-sm">{quote.author}</p>

											<p className="text-muted-foreground text-xs">{quote.subtitle}</p>
										</div>
									</div>
								</Card>
							</li>
						))}
					</ul>
				</div>
			</Section>

			<Section
				id="pricing"
				eyebrow="Pricing"
				title="Start free, pay when it matters"
				intro="Every plan has every region and unlimited status page visitors. Yearly billing takes about two months off."
			>
				<PricingSection />
			</Section>

			<Section id="faq" eyebrow="FAQ" title="Questions before you start">
				<Accordion
					type="single"
					collapsible
					defaultValue={faqs[0].id}
					className="mx-auto max-w-2xl"
				>
					{faqs.map((faq) => (
						<AccordionItem key={faq.id} value={faq.id}>
							<AccordionTrigger>{faq.question}</AccordionTrigger>

							<AccordionContent>{faq.answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</Section>

			<section aria-labelledby="free-heading" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
				<Card className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
					<div>
						<h2
							id="free-heading"
							className="text-balance font-semibold text-2xl tracking-tight sm:text-3xl"
						>
							Ten monitors, free for good.
						</h2>

						<p className="mt-3 text-muted-foreground">
							Add your first one in five minutes. Upgrade when your customers start to notice.
						</p>

						<a href="#pricing" className={cn(buttonVariants(), "mt-6")}>
							Start monitoring free
						</a>
					</div>

					<LandingNewsletter />
				</Card>
			</section>
		</>
	);
}
