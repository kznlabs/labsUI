"use client";

import {
	CloudUpload,
	FileArchive,
	File as FileIcon,
	FileImage,
	FileMusic,
	FileText,
	FileVideoCamera,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type DragEvent,
	type ReactNode,
	use,
	useRef,
	useState,
} from "react";
import { useFieldControl } from "@/components/ui/field";
import { cn, spring } from "@/lib/utils";

/* ---------- helpers ---------- */

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

/** 1536 → "1.5 kB", in the given locale. */
export function formatBytes(bytes: number, locale = "en-US") {
	let n = bytes;
	let i = 0;
	while (n >= 1024 && i < UNITS.length - 1) {
		n /= 1024;
		i++;
	}
	// Intl's short "byte" is the word itself; every other unit is already kB / MB / GB.
	if (i === 0) return `${new Intl.NumberFormat(locale).format(n)} B`;
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: UNITS[i],
		unitDisplay: "short",
		maximumFractionDigits: 1,
	}).format(n);
}

const iconFor = (type = "", name = "") => {
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	if (type.startsWith("image/")) return FileImage;
	if (type.startsWith("video/")) return FileVideoCamera;
	if (type.startsWith("audio/")) return FileMusic;
	if (/zip|rar|7z|tar|gz/.test(type + ext)) return FileArchive;
	if (type.startsWith("text/") || /pdf|doc|md|txt/.test(type + ext)) return FileText;
	return FileIcon;
};

/** Matches the `accept` attribute's rules: extensions, exact types and `type/*`. */
function accepts(file: File, accept?: string) {
	if (!accept) return true;
	const name = file.name.toLowerCase();
	return accept
		.split(",")
		.map((a) => a.trim().toLowerCase())
		.some((a) =>
			a.startsWith(".")
				? name.endsWith(a)
				: a.endsWith("/*")
					? file.type.startsWith(a.slice(0, -1))
					: file.type === a,
		);
}

/* ---------- Attachment ---------- */

const ListContext = createContext(false);

type AttachmentProps = {
	name: string;
	/** Bytes. */
	size?: number;
	/** MIME type; picks the icon, and image types show `src` as a thumbnail. */
	type?: string;
	/** Thumbnail source: a URL, or `URL.createObjectURL(file)` for a fresh upload. */
	src?: string;
	/** 0–100 while uploading; the bar springs along the bottom edge. */
	progress?: number;
	/** Replaces the size line and turns the chip red. */
	error?: string;
	/** Makes the name a download link. */
	href?: string;
	onRemove?: () => void;
	locale?: string;
	className?: string;
};

/** File chip: thumbnail or type icon, name, size, upload progress or error, and remove. */
export function Attachment({
	name,
	size,
	type,
	src,
	progress,
	error,
	href,
	onRemove,
	locale,
	className,
}: AttachmentProps) {
	const inList = use(ListContext);
	const Icon = iconFor(type, name);
	const uploading = progress !== undefined && progress < 100 && !error;
	const meta =
		error ??
		[size !== undefined && formatBytes(size, locale), uploading && `${Math.round(progress)}%`]
			.filter(Boolean)
			.join(" · ");

	// An <li> inside AttachmentList, a <div> on its own.
	const Root = inList ? motion.li : motion.div;
	return (
		<Root
			layout="position"
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={spring}
			className={cn(
				"relative flex w-64 max-w-full items-center gap-3 overflow-hidden rounded-xl border bg-card p-2 pr-3 shadow-xs",
				error && "border-destructive/50",
				className,
			)}
		>
			<span
				className={cn(
					"relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground",
					error && "bg-destructive/10 text-destructive-ink",
				)}
			>
				{src && type?.startsWith("image/") ? (
					// biome-ignore lint/performance/noImgElement: object URLs and arbitrary hosts; next/image cannot load them
					<img src={src} alt="" decoding="async" className="size-full object-cover" />
				) : (
					<Icon className="size-5" aria-hidden="true" />
				)}
			</span>
			<span className="grid min-w-0 flex-1">
				{href ? (
					<a
						href={href}
						download={name}
						className="truncate font-medium text-sm underline-offset-2 outline-none hover:underline focus-visible:underline"
					>
						{name}
					</a>
				) : (
					<span className="truncate font-medium text-sm">{name}</span>
				)}
				<span
					className={cn(
						"truncate text-xs tabular-nums",
						error ? "text-destructive-ink" : "text-muted-foreground",
					)}
				>
					{meta || " "}
				</span>
			</span>
			{onRemove && (
				<button
					type="button"
					aria-label={`Remove ${name}`}
					onClick={onRemove}
					className="-mr-1 shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					<X className="size-3.5" aria-hidden="true" />
				</button>
			)}
			{uploading && (
				<motion.span
					aria-hidden="true"
					initial={false}
					animate={{ scaleX: Math.max(progress, 2) / 100 }}
					transition={spring}
					className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
				/>
			)}
		</Root>
	);
}

/** Attachments that spring in, out and into place when one is removed. Key each child. */
export function AttachmentList({ className, children, ...props }: ComponentProps<"ul">) {
	return (
		<ListContext value={true}>
			<ul className={cn("flex flex-wrap gap-2", className)} {...props}>
				<AnimatePresence initial={false} mode="popLayout">
					{children}
				</AnimatePresence>
			</ul>
		</ListContext>
	);
}

/* ---------- FileDropzone ---------- */

type Rejection = { file: File; reason: "type" | "size" };

type FileDropzoneProps = {
	/** Same syntax as the input attribute: ".pdf,image/*". Enforced on drop and paste too. */
	accept?: string;
	multiple?: boolean;
	/** Bytes. */
	maxSize?: number;
	onFiles?: (files: File[]) => void;
	onReject?: (rejected: Rejection[]) => void;
	/** Form field name: picked and dropped files both submit with the form. */
	name?: string;
	id?: string;
	disabled?: boolean;
	required?: boolean;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	/** Replaces the default "Drop files or browse" content. */
	children?: ReactNode;
	className?: string;
};

/**
 * Drop area around a real file input: click, Enter/Space and the native picker work as-is, and
 * dropped files are written back into the input so plain forms and Server Actions get them.
 */
export function FileDropzone(allProps: FileDropzoneProps) {
	const {
		accept,
		multiple = false,
		maxSize,
		onFiles,
		onReject,
		name,
		className,
		children,
		disabled,
		...input
	} = useFieldControl(allProps);
	const ref = useRef<HTMLInputElement>(null);
	const [over, setOver] = useState(false);
	// dragenter/leave fire for every child crossed; count them so the highlight doesn't flicker.
	const depth = useRef(0);

	const take = (list: FileList | File[], fromInput: boolean) => {
		const all = [...list];
		const picked = multiple ? all : all.slice(0, 1);
		const ok: File[] = [];
		const rejected: Rejection[] = [];
		for (const file of picked) {
			if (!accepts(file, accept)) rejected.push({ file, reason: "type" });
			else if (maxSize !== undefined && file.size > maxSize)
				rejected.push({ file, reason: "size" });
			else ok.push(file);
		}
		// Keep the input's files in step, so the form submits exactly what was accepted.
		const el = ref.current;
		if (el && (!fromInput || rejected.length)) {
			const dt = new DataTransfer();
			for (const f of ok) dt.items.add(f);
			el.files = dt.files;
		}
		if (rejected.length) onReject?.(rejected);
		if (ok.length) onFiles?.(ok);
	};

	const onDrop = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		depth.current = 0;
		setOver(false);
		if (!disabled) take(e.dataTransfer.files, false);
	};

	const hint = [
		accept
			?.split(",")
			.map((a) => a.trim().replace(/^\./, "").replace("/*", ""))
			.join(", "),
		maxSize !== undefined && `up to ${formatBytes(maxSize)}`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<motion.label
			animate={{ scale: over ? 1.01 : 1 }}
			transition={spring}
			onDragEnter={(e) => {
				e.preventDefault();
				depth.current++;
				if (!disabled) setOver(true);
			}}
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={() => {
				depth.current--;
				if (depth.current <= 0) setOver(false);
			}}
			onDrop={onDrop}
			onPaste={(e) => e.clipboardData.files.length > 0 && take(e.clipboardData.files, false)}
			className={cn(
				"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card p-6 text-center transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
				over ? "border-primary bg-primary/5" : "hover:border-foreground/25",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
		>
			<input
				ref={ref}
				type="file"
				name={name}
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				onChange={(e) => e.target.files && take(e.target.files, true)}
				className="sr-only"
				{...input}
			/>
			{children ?? (
				<>
					<span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
						<CloudUpload className="size-5" aria-hidden="true" />
					</span>
					<span className="text-sm">
						<span className="font-medium">Drop {multiple ? "files" : "a file"}</span> or{" "}
						<span className="font-medium text-primary-ink">browse</span>
					</span>
					{hint && <span className="text-muted-foreground text-xs">{hint}</span>}
				</>
			)}
		</motion.label>
	);
}
