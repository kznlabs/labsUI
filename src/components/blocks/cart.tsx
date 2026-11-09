"use client";

import { Trash2 } from "lucide-react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { tabbables } from "@/lib/focus";
import { AppLink } from "@/lib/link";
import { cn, formatMoney } from "@/lib/utils";

/** The list of CartLines. */
export function CartList({ className, ...props }: ComponentProps<"ul">) {
	return <ul className={cn("flex flex-col divide-y", className)} {...props} />;
}

type CartLineProps = Omit<ComponentProps<"li">, "children"> & {
	/** Product name. */
	name: string;
	/** Price of one item in major units; the line shows price × quantity. */
	price: number;
	/** How many. Without `onQuantityChange` it shows as text, when above 1. */
	quantity?: number;
	/** Muted line under the name, e.g. "Size M, black". */
	details?: ReactNode;
	/** Square photo (`<img>`). */
	media?: ReactNode;
	/** Product page link for the name. */
	href?: string;
	/** Highest quantity, e.g. what is in stock. */
	max?: number;
	/** Shows the quantity field; called with the new quantity, at least 1. */
	onQuantityChange?: (quantity: number) => void;
	/** Shows the remove button; called when it is pressed. Focus moves to the next line once this one is gone. */
	onRemove?: () => void;
	/** Names the quantity field, before the product name. */
	quantityLabel?: string;
	/** Names the remove button, before the product name. */
	removeLabel?: string;
	/** ISO 4217 code for the price. */
	currency?: string;
	/** BCP 47 locale for number formatting. */
	locale?: string;
};

/** One product in the cart: photo, name, line total, quantity field and remove button. */
export function CartLine({
	name,
	price,
	quantity = 1,
	details,
	media,
	href,
	max,
	onQuantityChange,
	onRemove,
	quantityLabel = "Quantity of",
	removeLabel = "Remove",
	currency,
	locale,
	className,
	...props
}: CartLineProps) {
	const remove = (event: MouseEvent<HTMLElement>) => {
		const line = event.currentTarget.closest("li");
		const list = line?.parentElement;
		const index = line && list ? [...list.children].indexOf(line) : 0;
		const dialog = event.currentTarget.closest<HTMLElement>("[role=dialog]");

		onRemove?.();

		// The focused button leaves with its line, and a modal's Tab trap needs focus inside it.
		requestAnimationFrame(() => {
			if (line?.isConnected) return;

			const next = list?.isConnected
				? (list.children[index] ?? list.lastElementChild)?.querySelector<HTMLElement>(
						"[data-cart-remove]",
					)
				: undefined;

			(next ?? tabbables(dialog)[0] ?? dialog)?.focus();
		});
	};

	return (
		<li className={cn("flex gap-3 py-4 first:pt-0 last:pb-0", className)} {...props}>
			{media && (
				<AspectRatio
					ratio={1}
					className="w-16 shrink-0 self-start overflow-hidden rounded-lg bg-muted"
				>
					{media}
				</AspectRatio>
			)}

			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex items-baseline justify-between gap-3">
					<div className="grid min-w-0 gap-0.5">
						<p className="font-medium text-sm">
							{href ? (
								<AppLink
									href={href}
									className="outline-none hover:underline focus-visible:underline"
								>
									{name}
								</AppLink>
							) : (
								name
							)}
						</p>

						{details && <p className="text-muted-foreground text-xs">{details}</p>}

						{!onQuantityChange && quantity > 1 && (
							<p className="text-muted-foreground text-xs tabular-nums">× {quantity}</p>
						)}
					</div>

					<p className="shrink-0 text-sm tabular-nums">
						{formatMoney(price * quantity, currency, locale)}
					</p>
				</div>

				{(onQuantityChange || onRemove) && (
					<div className="flex items-center justify-between gap-2">
						{onQuantityChange ? (
							<NumberInput
								aria-label={`${quantityLabel} ${name}`}
								value={quantity}
								min={1}
								max={max}
								onValueChange={onQuantityChange}
							/>
						) : (
							<span />
						)}

						{onRemove && (
							<Button
								data-cart-remove=""
								variant="ghost"
								size="icon"
								aria-label={`${removeLabel} ${name}`}
								onClick={remove}
							>
								<Trash2 aria-hidden="true" />
							</Button>
						)}
					</div>
				)}
			</div>
		</li>
	);
}

export type OrderSummaryLine = {
	/** What the amount is for, e.g. "Subtotal" or "Shipping". */
	label: string;
	/** In major units (negative for a discount), or your own text, e.g. "Free". */
	amount: number | ReactNode;
};

type OrderSummaryProps = Omit<ComponentProps<"div">, "children"> & {
	/** Rows above the total, in order. */
	lines?: OrderSummaryLine[];
	/** What to pay. Your app computes it, and screen readers hear it change. */
	total: number;
	/** Label of the total row. */
	totalLabel?: string;
	/** Small print under the total, e.g. "Taxes calculated at checkout". */
	note?: ReactNode;
	/** Under everything, e.g. a checkout Button. */
	action?: ReactNode;
	/** ISO 4217 code for the amounts. */
	currency?: string;
	/** BCP 47 locale for number formatting. */
	locale?: string;
};

/** Subtotal, shipping and the total as a description list. It adds nothing up: the numbers are yours. */
export function OrderSummary({
	lines = [],
	total,
	totalLabel = "Total",
	note,
	action,
	currency,
	locale,
	className,
	...props
}: OrderSummaryProps) {
	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<dl className="grid gap-2 text-sm">
				{lines.map((line) => (
					<div key={line.label} className="flex justify-between gap-4">
						<dt className="text-muted-foreground">{line.label}</dt>

						<dd className="tabular-nums">
							{typeof line.amount === "number"
								? formatMoney(line.amount, currency, locale)
								: line.amount}
						</dd>
					</div>
				))}

				<div
					className={cn(
						"flex items-baseline justify-between gap-4 font-semibold",
						lines.length > 0 && "mt-1 border-t pt-3",
					)}
				>
					<dt>{totalLabel}</dt>

					<dd className="text-base tabular-nums">
						<output>{formatMoney(total, currency, locale)}</output>
					</dd>
				</div>
			</dl>

			{note && <p className="text-muted-foreground text-xs">{note}</p>}

			{action}
		</div>
	);
}
