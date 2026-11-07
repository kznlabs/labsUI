"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { spring } from "@/lib/utils";
import { ProjectTile } from "./project-tile";
import { type Kind, kinds, type ProjectSummary } from "./projects";

export function ProjectBrowser({ projects }: { projects: ProjectSummary[] }) {
	const [kind, setKind] = useState<Kind | "all">("all");
	const shown = projects.filter((project) => kind === "all" || project.kind === kind);
	const count = (name: Kind) => projects.filter((project) => project.kind === name).length;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0">
					<ToggleGroup
						aria-label="Kind of project"
						size="sm"
						value={kind}
						onValueChange={(value) => value && setKind(value as Kind | "all")}
					>
						<ToggleGroupItem value="all">All</ToggleGroupItem>

						{kinds.map((name) => (
							<ToggleGroupItem key={name} value={name}>
								{name}

								<span className="text-muted-foreground tabular-nums">{count(name)}</span>
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				<p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
					{shown.length} {shown.length === 1 ? "project" : "projects"}
				</p>
			</div>

			<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence initial={false} mode="popLayout">
					{shown.map((project, i) => (
						<motion.li
							key={project.slug}
							layout
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={spring}
						>
							<ProjectTile project={project} eager={i < 3} />
						</motion.li>
					))}
				</AnimatePresence>
			</ul>
		</div>
	);
}
