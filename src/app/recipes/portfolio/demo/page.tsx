import {
	Accessibility,
	Blocks,
	Briefcase,
	Clock,
	GraduationCap,
	Layers,
	MapPin,
	Mic,
	Rocket,
	Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { Hero } from "@/components/blocks/hero";
import { StatsStrip } from "@/components/blocks/stats-strip";
import { Testimonial } from "@/components/blocks/testimonial";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TextSwap } from "@/components/ui/text-swap";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { demoPath, site as labs, withBase } from "@/site/config";
import { ContactForm, CopyEmail } from "./contact-form";
import { ProjectBrowser } from "./project-browser";
import { portfolioHref, projects, site, summaryOf } from "./projects";

const description =
	"A reference build of the portfolio recipe: an intro, projects filtered by kind, a case study per project and a contact form.";
const url = `${labs.url}${demoPath("portfolio")}`;

export const metadata: Metadata = {
	title: "Portfolio demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Portfolio demo · ${labs.name}`, description },
};

const services = [
	{
		icon: <Rocket />,
		title: "Product engineering",
		body: "A new product or a feature that's stuck, built end to end with your team and handed over with docs.",
		price: "From €12,000",
	},
	{
		icon: <Layers />,
		title: "Design systems",
		body: "Tokens, components and the guidelines around them, so every team ships the same quality.",
		price: "From €18,000",
	},
	{
		icon: <Accessibility />,
		title: "Accessibility audits",
		body: "A WCAG 2.2 review with screen reader and keyboard testing, and fixes ranked by who they help.",
		price: "From €3,500",
	},
];

const clients = ["Porto Eira", "Northline", "Ledgerly", "Mise", "Fernhill", "Quayside", "Orbital"];

function Heading({ id, eyebrow, children }: { id: string; eyebrow: string; children: string }) {
	return (
		<div className="mb-8 max-w-2xl">
			<p className="font-medium text-muted-foreground text-sm">{eyebrow}</p>

			<h2 id={id} className="mt-1 text-balance font-semibold text-2xl tracking-tight sm:text-3xl">
				{children}
			</h2>
		</div>
	);
}

function ProfileCard() {
	return (
		<Card className="mx-auto w-full max-w-sm gap-0 p-0">
			<div className="flex items-center gap-4 p-5">
				<Avatar src={withBase("/avatar-demo.svg")} alt={site.name} size="lg" status="online" />

				<div className="min-w-0">
					<p className="font-semibold">{site.name}</p>

					<p className="text-muted-foreground text-sm">{site.role}</p>
				</div>
			</div>

			<Separator />

			<dl className="grid gap-3 p-5 text-sm">
				<div className="flex items-center gap-2">
					<dt>
						<MapPin aria-hidden="true" className="size-4 text-muted-foreground" />

						<span className="sr-only">Based in</span>
					</dt>

					<dd>
						{site.location} <span className="text-muted-foreground">({site.timezone})</span>
					</dd>
				</div>

				<div className="flex items-center gap-2">
					<dt>
						<Clock aria-hidden="true" className="size-4 text-muted-foreground" />

						<span className="sr-only">Availability</span>
					</dt>

					<dd>{site.available}</dd>
				</div>

				<div className="flex items-center gap-2">
					<dt>
						<Sparkles aria-hidden="true" className="size-4 text-muted-foreground" />

						<span className="sr-only">Now</span>
					</dt>

					<dd>Leading the Harbor Booking rollout</dd>
				</div>
			</dl>

			<Separator />

			<div className="flex flex-wrap gap-1.5 p-5">
				{["TypeScript", "React", "Next.js", "Postgres", "Accessibility"].map((skill) => (
					<Badge key={skill} variant="secondary">
						{skill}
					</Badge>
				))}
			</div>
		</Card>
	);
}

export default function PortfolioDemo() {
	return (
		<>
			<Hero
				className="-mx-4 -mt-8 w-auto sm:-mx-6 sm:-mt-12"
				eyebrow={
					<Badge variant="success" shape="pill" dot pulse>
						{site.available}
					</Badge>
				}
				title={
					<>
						I build web apps that feel{" "}
						<TextSwap
							items={["fast.", "calm.", "obvious.", "accessible."]}
							controls
							pauseLabel="Pause the changing word"
							className="text-primary-ink"
						/>
					</>
				}
				description={`Hi, I'm Ada, a product engineer in ${site.location.split(",")[0]}. For nine years I've shipped booking, transit and finance products with small teams, and I care about the details: performance budgets, keyboard support and interfaces that stay out of the way.`}
				actions={
					<>
						<a href={portfolioHref("#work")} className={buttonVariants()}>
							See my work
						</a>

						<a href={portfolioHref("#contact")} className={buttonVariants({ variant: "outline" })}>
							Get in touch
						</a>
					</>
				}
				media={<ProfileCard />}
			/>

			<StatsStrip
				stats={[
					{ label: "Years on the web", value: 9 },
					{ label: "Products shipped", value: 23 },
					{ label: "Avg. accessibility score", value: 98, hint: "last 12 launches" },
					{ label: "Client rating", value: 4.9, decimals: 1, suffix: " / 5", hint: "31 reviews" },
				]}
			/>

			<section id="work" aria-labelledby="work-heading" className="scroll-mt-28 pt-20">
				<Heading id="work-heading" eyebrow="Selected work">
					Six projects, from marinas to mountain trails
				</Heading>

				<ProjectBrowser projects={projects.map(summaryOf)} />
			</section>

			<section aria-labelledby="services-heading" className="pt-20">
				<Heading id="services-heading" eyebrow="Services">
					How I can help
				</Heading>

				<ul className="grid gap-4 md:grid-cols-3">
					{services.map((service) => (
						<li key={service.title}>
							<Card className="h-full gap-3 p-6">
								<span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary-ink [&_svg]:size-5">
									{service.icon}
								</span>

								<h3 className="font-semibold text-lg">{service.title}</h3>

								<p className="flex-1 text-muted-foreground text-sm leading-relaxed">
									{service.body}
								</p>

								<p className="font-medium text-sm">{service.price}</p>
							</Card>
						</li>
					))}
				</ul>
			</section>

			<section aria-labelledby="praise-heading" className="pt-20">
				<h2 id="praise-heading" className="sr-only">
					What clients say
				</h2>

				<Card className="p-6 sm:p-10">
					<Testimonial
						author="Inês Carvalho"
						subtitle="Harbour master, Porto Eira Marina"
						others={clients.map((client) => ({ alt: client }))}
						othersLabel="Fourteen teams across Europe since 2017"
					>
						Our mornings used to belong to the phone. Now the harbour office opens to a list of
						confirmed arrivals, and Ada left us a tool we can change ourselves.
					</Testimonial>
				</Card>
			</section>

			<section
				id="about"
				aria-labelledby="about-heading"
				className="grid scroll-mt-28 gap-10 pt-20 lg:grid-cols-[1fr_1.1fr]"
			>
				<div>
					<Heading id="about-heading" eyebrow="About">
						From schema to focus ring
					</Heading>

					<div className="flex max-w-prose flex-col gap-4 text-muted-foreground leading-relaxed">
						<p>
							I work end to end: data models, APIs, the interface and the tests that keep it honest.
							Most of my projects start with a week of listening to the people who'll use the thing,
							and end with a handover their team can run without me.
						</p>

						<p>
							Lately I've been shipping with Next.js, TypeScript and Postgres, mentoring junior
							engineers and speaking about accessibility. Outside of work: trail running, slow bread
							and bad puns.
						</p>
					</div>
				</div>

				<Timeline aria-label="Experience">
					<TimelineItem icon={<Briefcase />} variant="active" time="2023 – now" title="Freelance">
						Product engineering and accessibility work for teams across Europe.
					</TimelineItem>

					<TimelineItem icon={<Blocks />} time="2020 – 2023" title="Staff engineer, Northline">
						Led the web and app platform, and the design system three teams shared.
					</TimelineItem>

					<TimelineItem icon={<Mic />} time="2022" title="Talk: Accessible by default">
						Forty minutes on making the accessible path the easy one.
					</TimelineItem>

					<TimelineItem icon={<GraduationCap />} time="2017 – 2020" title="Engineer, Quayside">
						Built booking flows for ferries and marinas, my first production React app.
					</TimelineItem>
				</Timeline>
			</section>

			<section
				id="contact"
				aria-labelledby="contact-heading"
				className="grid scroll-mt-28 gap-10 pt-20 lg:grid-cols-[1fr_1.6fr]"
			>
				<div>
					<Heading id="contact-heading" eyebrow="Contact">
						Tell me about your project
					</Heading>

					<p className="max-w-prose text-muted-foreground leading-relaxed">
						A few lines are enough: what you're building, who it's for and when it should ship. I'll
						reply with questions or a time for a call.
					</p>

					<div className="mt-6 flex flex-wrap items-center gap-3">
						<a href={`mailto:${site.email}`} className="font-medium underline underline-offset-4">
							{site.email}
						</a>

						<CopyEmail />
					</div>
				</div>

				<Card className="p-5 sm:p-8">
					<ContactForm />
				</Card>
			</section>
		</>
	);
}
