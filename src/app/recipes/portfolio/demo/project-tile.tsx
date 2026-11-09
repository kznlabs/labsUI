"use client";

import { PostCard } from "@/components/blocks/post-card";
import { Pager } from "@/components/ui/pager";
import { coverOf, type ProjectSummary, portfolioHref } from "./projects";

type ProjectTileProps = {
	project: ProjectSummary;
	eager?: boolean;
	className?: string;
};

export function ProjectTile({ project, eager, className }: ProjectTileProps) {
	const cover = coverOf(project.slug);

	return (
		<PostCard
			className={className}
			title={project.title}
			href={portfolioHref(`/work/${project.slug}`)}
			time={project.year}
			dateTime={project.year}
			meta={`${project.kind} · ${project.role}`}
			excerpt={project.summary}
			tags={project.stack}
			media={
				cover && (
					// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
					<img src={cover.src} alt="" width={960} height={540} loading={eager ? "eager" : "lazy"} />
				)
			}
		/>
	);
}

type Link = { title: string; slug: string };

type ProjectPagerProps = { previous?: Link; next?: Link; className?: string };

export function ProjectPager({ previous, next, className }: ProjectPagerProps) {
	const link = (project?: Link) =>
		project && { title: project.title, href: portfolioHref(`/work/${project.slug}`) };

	return (
		<Pager
			className={className}
			label="More projects"
			previousLabel="Previous project"
			nextLabel="Next project"
			previous={link(previous)}
			next={link(next)}
		/>
	);
}
