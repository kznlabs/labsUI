import type { ComponentProps } from "react";
import { OverflowFocus } from "@/lib/overflow-focus";
import { cn } from "@/lib/utils";

/* Server-safe. Selectors stay inside :where(), so a child's own utilities win, and only known
   tags are styled, as children or one <section> down: a Card or demo dropped into MDX keeps its
   own look. */

const flow = [
	"[:where(&,&>section)>*+*]:mt-5",
	"[:where(&,&>section)>*+section]:mt-12",
	"[:where(&,&>section)>*+h2]:mt-12",
	"[:where(&,&>section)>*+h3]:mt-9",
	"[:where(&,&>section)>*+h4]:mt-7",
	"[:where(&,&>section)>*+hr]:mt-10",
	"[:where(&,&>section)>hr+*]:mt-10",
	"[:where(&,&>section)>:is(h1,h2,h3,h4)+:is(p,ul,ol,pre,table,blockquote,figure)]:mt-3",
];

const headings = [
	"[:where(&,&>section)>:is(h1,h2,h3,h4)]:scroll-mt-20",
	"[:where(&,&>section)>:is(h1,h2,h3,h4)]:text-balance",
	"[:where(&,&>section)>:is(h1,h2,h3,h4)]:font-semibold",
	"[:where(&,&>section)>:is(h1,h2,h3,h4)]:tracking-tight",
	"[:where(&,&>section)>h1]:text-4xl",
	"[:where(&,&>section)>h2]:text-2xl",
	"[:where(&,&>section)>h2]:leading-tight",
	"[:where(&,&>section)>h3]:text-xl",
	"[:where(&,&>section)>h3]:leading-snug",
	"[:where(&,&>section)>h4]:text-base",
];

const lists = [
	"[:where(&,&>section)>:is(ul,ol)]:pl-6",
	"[:where(&,&>section)>ul]:list-disc",
	"[:where(&,&>section)>ol]:list-decimal",
	"[:where(&,&>section)>:is(ul,ol)_ul]:mt-2",
	"[:where(&,&>section)>:is(ul,ol)_ul]:list-[circle]",
	"[:where(&,&>section)>:is(ul,ol)_ul]:pl-6",
	"[:where(&,&>section)>:is(ul,ol)_ol]:mt-2",
	"[:where(&,&>section)>:is(ul,ol)_ol]:list-decimal",
	"[:where(&,&>section)>:is(ul,ol)_ol]:pl-6",
	"[:where(&,&>section)>:is(ul,ol)_li+li]:mt-2",
	"[:where(&,&>section)>:is(ul,ol)_li>p+p]:mt-3",
	"[:where(&,&>section)>:is(ul,ol)_li]:marker:text-muted-foreground",
];

const blocks = [
	"[:where(&,&>section)>blockquote]:border-l-2",
	"[:where(&,&>section)>blockquote]:pl-4",
	"[:where(&,&>section)>blockquote]:text-muted-foreground",
	"[:where(&,&>section)>blockquote>p+p]:mt-3",
	"[:where(&,&>section)>hr]:border-t",
	"[:where(&,&>section)>figure>figcaption]:mt-2",
	"[:where(&,&>section)>figure>figcaption]:text-muted-foreground",
	"[:where(&,&>section)>figure>figcaption]:text-sm",
	"[:where(&,&>section)>:is(p,figure)_img]:h-auto",
	"[:where(&,&>section)>:is(p,figure)_img]:max-w-full",
	"[:where(&,&>section)>:is(p,figure)_img]:rounded-xl",
];

const inline = [
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:rounded-sm",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:text-primary-ink",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:underline",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:underline-offset-2",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:outline-none",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:hover:decoration-2",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:focus-visible:ring-[3px]",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_a]:focus-visible:ring-ring/50",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_strong]:font-semibold",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_mark]:rounded-sm",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_mark]:bg-warning/25",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_mark]:px-0.5",
	"[:where(&,&>section)>:is(p,ul,ol,blockquote,table,figure)_mark]:text-foreground",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:rounded-md",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:bg-muted",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:px-1.5",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:py-0.5",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:font-mono",
	"[:where(&,&>section)>:is(h1,h2,h3,h4,p,ul,ol,blockquote,table,figure)_code:not(pre_code)]:text-[0.875em]",
];

// Code blocks also sit inside lists and quotes.
const code = [
	"[:where(&>:is(ul,ol,blockquote)_pre,&>section>:is(ul,ol,blockquote)_pre)]:mt-3",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:overflow-x-auto",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:rounded-xl",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:border",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:bg-muted",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:p-4",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:font-mono",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:text-sm",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:leading-relaxed",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:outline-none",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:focus-visible:ring-[3px]",
	"[:where(&>pre,&>:is(ul,ol,blockquote)_pre,&>section>pre,&>section>:is(ul,ol,blockquote)_pre)]:focus-visible:ring-ring/50",
];

const tables = [
	"[:where(&,&>section)>table]:block",
	"[:where(&,&>section)>table]:w-fit",
	"[:where(&,&>section)>table]:max-w-full",
	"[:where(&,&>section)>table]:overflow-x-auto",
	"[:where(&,&>section)>table]:rounded-lg",
	"[:where(&,&>section)>table]:border-collapse",
	"[:where(&,&>section)>table]:text-sm",
	"[:where(&,&>section)>table]:outline-none",
	"[:where(&,&>section)>table]:focus-visible:ring-[3px]",
	"[:where(&,&>section)>table]:focus-visible:ring-ring/50",
	"[:where(&,&>section)>table_caption]:pb-2",
	"[:where(&,&>section)>table_caption]:text-left",
	"[:where(&,&>section)>table_caption]:text-muted-foreground",
	"[:where(&,&>section)>table_:is(th,td)]:border-b",
	"[:where(&,&>section)>table_:is(th,td)]:px-3",
	"[:where(&,&>section)>table_:is(th,td)]:py-2",
	"[:where(&,&>section)>table_:is(th,td)]:text-left",
	"[:where(&,&>section)>table_:is(th,td)]:align-top",
	"[:where(&,&>section)>table_th]:font-semibold",
];

const proseClass = [
	"max-w-[65ch] text-base/7 text-foreground wrap-break-word",
	...flow,
	...headings,
	...lists,
	...blocks,
	...inline,
	...code,
	...tables,
].join(" ");

type ProseProps = ComponentProps<"div"> & {
	/** The element to render; a blog post reads best as an `article`. */
	as?: "div" | "article" | "section";
};

const scrollers =
	"[data-slot=prose] > pre, [data-slot=prose] > table, [data-slot=prose] > :is(ul, ol, blockquote) pre, [data-slot=prose] > section > pre, [data-slot=prose] > section > table, [data-slot=prose] > section > :is(ul, ol, blockquote) pre";

/**
 * Typography for a Markdown or MDX body: spacing, headings, lists, code, tables, tokens only. Wide
 * code blocks and tables scroll on their own and take keyboard focus while they do.
 */
export function Prose({ as: Tag = "div", className, children, ...props }: ProseProps) {
	const classes = cn(proseClass, className);

	// React allows no children beside rendered HTML, so the marker sits next to the body instead.
	if (props.dangerouslySetInnerHTML) {
		return (
			<>
				<Tag data-slot="prose" className={classes} {...props} />

				<OverflowFocus selector={scrollers} />
			</>
		);
	}

	return (
		<Tag data-slot="prose" className={classes} {...props}>
			{children}

			<OverflowFocus selector={scrollers} />
		</Tag>
	);
}
