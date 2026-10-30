import { Fragment } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { nav } from "@/site/catalog";
import { componentPath, withBase } from "@/site/config";

/** Sidebar on a component page: every component as a link, the current one marked. */
export function PageNav({ current, className }: { current: string; className?: string }) {
	return (
		<nav
			aria-label="Components"
			className={cn(
				"-mx-1 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain px-1 pb-4",
				className,
			)}
		>
			{nav.map((group, groupIndex) => (
				<Fragment key={group.label}>
					{groupIndex > 0 && <Separator className="my-3" />}

					<p className="mb-1 px-2 font-medium text-muted-foreground text-xs">{group.label}</p>

					<ul className="flex flex-col gap-0.5">
						{group.items.map((item) => (
							<li key={item.id}>
								<a
									href={withBase(componentPath(item.id))}
									aria-current={item.id === current ? "page" : undefined}
									className={cn(
										"block rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
										item.id === current
											? "bg-accent font-medium text-foreground"
											: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
									)}
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</Fragment>
			))}
		</nav>
	);
}
