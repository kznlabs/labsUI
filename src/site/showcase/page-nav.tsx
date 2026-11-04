import { cn } from "@/lib/utils";
import { nav } from "@/site/catalog";
import { PageNavGroups } from "@/site/showcase/page-nav-groups";

const groups = nav.map(({ label, items }) => ({
	label,
	items: items.map(({ id, name }) => ({ id, name })),
}));

// Links reload the page, so the list starts at the top. This runs as the HTML parses: waiting for
// hydration shows the list jump, by 400 ms on a desktop and seconds on a slow connection.
const revealCurrent = `(() => {
	const box = document.currentScript.previousElementSibling;
	const link = box.querySelector('[aria-current="page"]');
	if (!link) return;
	const area = box.getBoundingClientRect();
	const target = link.getBoundingClientRect();
	if (target.top < area.top || target.bottom > area.bottom)
		box.scrollTop += target.top - area.top - (box.clientHeight - target.height) / 2;
})()`;

/** Sidebar on a component page: every component as a link, the current one marked and in view. */
export function PageNav({ current, className }: { current: string; className?: string }) {
	return (
		<>
			<nav
				aria-label="Components"
				className={cn(
					"-mx-1 flex max-h-[calc(100dvh-6rem)] flex-col gap-0.5 overflow-y-auto overscroll-contain px-1 pb-4",
					className,
				)}
			>
				<PageNavGroups groups={groups} current={current} />
			</nav>

			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string, no outside input */}
			<script dangerouslySetInnerHTML={{ __html: revealCurrent }} />
		</>
	);
}
