import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatsStrip } from "@/components/blocks/stats-strip";
import { Testimonial } from "@/components/blocks/testimonial";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Prose } from "@/components/ui/prose";
import { site as labs } from "@/site/config";
import { ProjectLinks } from "../../project-links";
import { ProjectPager, ProjectTile } from "../../project-tile";
import {
	coverOf,
	portfolioHref,
	portfolioPath,
	projectBySlug,
	projects,
	site,
	summaryOf,
} from "../../projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const project = projectBySlug((await params).slug);

	if (!project) return {};

	const url = `${labs.url}${portfolioPath(`/work/${project.slug}`)}`;

	return {
		title: `${project.title} · Portfolio demo`,
		description: project.summary,
		alternates: { canonical: url },
		openGraph: {
			url,
			title: `${project.title} · Portfolio demo · ${labs.name}`,
			description: project.summary,
		},
	};
}

export default async function ProjectPage({ params }: Props) {
	const project = projectBySlug((await params).slug);

	if (!project) notFound();

	const index = projects.indexOf(project);
	const cover = coverOf(project.slug);
	const related = projects.filter(
		(other) => other.slug !== project.slug && other.kind === project.kind,
	);
	const more = (related.length > 0 ? related : projects.filter((other) => other !== project)).slice(
		0,
		2,
	);
	const facts = [
		{ label: "Client", value: project.client },
		{ label: "Role", value: project.role },
		{ label: "Year", value: project.year },
		{ label: "Duration", value: project.duration },
	];

	return (
		<article className="mx-auto max-w-4xl">
			<Breadcrumb
				items={[
					{ label: site.name, href: portfolioHref() },
					{ label: "Work", href: portfolioHref("#work") },
					{ label: project.title },
				]}
			/>

			<header className="mt-8">
				<Badge variant="secondary">{project.kind}</Badge>

				<h1 className="mt-3 text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
					{project.title}
				</h1>

				<p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
					{project.summary}
				</p>

				<dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 sm:grid-cols-4">
					{facts.map((fact) => (
						<div key={fact.label}>
							<dt className="text-muted-foreground text-sm">{fact.label}</dt>

							<dd className="mt-0.5 font-medium">{fact.value}</dd>
						</div>
					))}
				</dl>
			</header>

			{cover && (
				<AspectRatio ratio={16 / 9} className="mt-8 overflow-hidden rounded-2xl bg-muted">
					{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
					<img src={cover.src} alt={cover.alt} width={960} height={540} className="object-cover" />
				</AspectRatio>
			)}

			<section aria-labelledby="results-heading" className="mt-12">
				<h2 id="results-heading" className="mb-4 font-semibold text-xl tracking-tight">
					Results
				</h2>

				<StatsStrip stats={project.results} />
			</section>

			<div className="mt-12 grid gap-10 lg:grid-cols-[1fr_14rem]">
				<Prose>
					<h2 id="challenge">The challenge</h2>

					{project.challenge.map((text) => (
						<p key={text}>{text}</p>
					))}

					<h2 id="approach">The approach</h2>

					{project.approach.map((text) => (
						<p key={text}>{text}</p>
					))}

					<h2 id="built">What I built</h2>

					<ul>
						{project.highlights.map((text) => (
							<li key={text}>{text}</li>
						))}
					</ul>
				</Prose>

				<aside aria-label="Project links" className="flex flex-col gap-6 lg:pt-2">
					<div>
						<h2 className="font-medium text-muted-foreground text-sm">Stack</h2>

						<ul className="mt-2 flex flex-wrap gap-1.5">
							{project.stack.map((name) => (
								<li key={name}>
									<Badge variant="outline">{name}</Badge>
								</li>
							))}
						</ul>
					</div>

					<ProjectLinks title={project.title} />
				</aside>
			</div>

			{project.quote && (
				<Card className="mt-12 p-6 sm:p-8">
					<Testimonial author={project.quote.author} subtitle={project.quote.role}>
						{project.quote.text}
					</Testimonial>
				</Card>
			)}

			<ProjectPager className="mt-12" previous={projects[index - 1]} next={projects[index + 1]} />

			<section aria-labelledby="more-heading" className="mt-16">
				<h2 id="more-heading" className="mb-6 font-semibold text-xl tracking-tight">
					{related.length > 0 ? `More ${project.kind.toLowerCase()} work` : "More work"}
				</h2>

				<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
					{more.map((other) => (
						<li key={other.slug}>
							<ProjectTile project={summaryOf(other)} />
						</li>
					))}
				</ul>
			</section>
		</article>
	);
}
