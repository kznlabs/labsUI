"use client";

import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";
import {
	admin,
	type Order,
	type OrderEvent,
	type Product,
	type Status,
	sampleOrders,
	sampleProducts,
	statusLabel,
} from "./data";

export type View = "overview" | "orders" | "products" | "customers" | "settings";

const views: View[] = ["overview", "orders", "products", "customers", "settings"];

export type Settings = {
	storeName: string;
	email: string;
	lowStock: number;
	newOrderMail: boolean;
	dailySummary: boolean;
};

type Admin = {
	view: View;
	show: (view: View, options?: { status?: Status | "all"; customer?: string | null }) => void;
	orders: Order[];
	products: Product[];
	settings: Settings;
	saveSettings: (settings: Settings) => void;
	/** Orders view filters, kept here so Overview and Customers can open it pre-filtered. */
	statusFilter: Status | "all";
	setStatusFilter: (status: Status | "all") => void;
	customerFilter: string | null;
	setCustomerFilter: (id: string | null) => void;
	openOrder: Order | null;
	setOpenOrder: (id: string | null) => void;
	saveOrder: (id: string, patch: Pick<Order, "status" | "tracking" | "note">) => void;
	markShipped: (ids: string[]) => void;
	deleteOrders: (ids: string[]) => Promise<boolean>;
	updateProduct: (id: string, patch: Partial<Product>) => void;
	addProduct: (product: Omit<Product, "id" | "active">) => void;
};

const AdminContext = createContext<Admin | null>(null);

export function useAdmin() {
	const context = use(AdminContext);

	if (!context) throw new Error("useAdmin needs <AdminProvider>");

	return context;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// A made-up carrier number in the demo's own format.
const newTracking = () => `FH${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}IE`;

export function AdminProvider({ children }: { children: ReactNode }) {
	const [view, setView] = useState<View>("overview");
	const [orders, setOrders] = useState(sampleOrders);
	const [products, setProducts] = useState(sampleProducts);
	const [settings, saveSettings] = useState<Settings>({
		storeName: "Fernhill",
		email: "hello@fernhill.example",
		lowStock: 8,
		newOrderMail: true,
		dailySummary: false,
	});
	const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
	const [customerFilter, setCustomerFilter] = useState<string | null>(null);
	const [openId, setOpenOrder] = useState<string | null>(null);

	// The view lives in the hash, so a reload or a shared link opens the same screen.
	useEffect(() => {
		const read = () => {
			const hash = location.hash.slice(1) as View;

			setView(views.includes(hash) ? hash : "overview");
		};

		read();
		addEventListener("hashchange", read);

		return () => removeEventListener("hashchange", read);
	}, []);

	const show: Admin["show"] = (next, options = {}) => {
		if (options.status) setStatusFilter(options.status);

		if (options.customer !== undefined) setCustomerFilter(options.customer);

		setView(next);
		history.replaceState(null, "", next === "overview" ? location.pathname : `#${next}`);
		scrollTo({ top: 0 });
	};

	const log = (order: Order, event: Omit<OrderEvent, "time">) => ({
		...order,
		events: [...order.events, { ...event, time: Date.now(), by: admin }],
	});

	const saveOrder: Admin["saveOrder"] = (id, patch) => {
		setOrders((current) =>
			current.map((order) => {
				if (order.id !== id) return order;

				let next = { ...order, ...patch };

				if (patch.status !== order.status)
					next = log(next, {
						title: statusLabel(patch.status),
						detail:
							patch.status === "shipped"
								? `Tracking ${patch.tracking}`
								: `Was ${statusLabel(order.status).toLowerCase()}`,
					});
				else if (patch.tracking !== order.tracking)
					next = log(next, { title: "Tracking updated", detail: patch.tracking });

				if (patch.note !== order.note && patch.note)
					next = log(next, { title: "Note added", detail: patch.note });

				return next;
			}),
		);

		toast.success(`Order ${id} saved`, { description: statusLabel(patch.status) });
	};

	const markShipped: Admin["markShipped"] = (ids) => {
		const ready = orders.filter((order) => ids.includes(order.id) && order.status === "paid");

		if (ready.length === 0) {
			toast.info("Nothing to ship", { description: "Only orders marked To fulfil can ship." });

			return;
		}

		const shipped = new Set(ready.map((order) => order.id));

		setOrders((current) =>
			current.map((order) => {
				if (!shipped.has(order.id)) return order;

				const tracking = newTracking();

				return log(
					{ ...order, status: "shipped", tracking },
					{ title: "Shipped", detail: `Tracking ${tracking}` },
				);
			}),
		);

		const skipped = ids.length - ready.length;

		toast.success(`${plural(ready.length, "order")} shipped`, {
			description: skipped
				? `${plural(skipped, "order")} skipped: not ready to ship.`
				: "Customers get their tracking links by email.",
		});
	};

	const deleteOrders: Admin["deleteOrders"] = async (ids) => {
		const many = ids.length > 1;
		const ok = await confirm({
			title: many ? `Delete ${ids.length} orders?` : `Delete order ${ids[0]}?`,
			description: "They leave the list and the reports. Payments already taken are not refunded.",
			confirmLabel: many ? `Delete ${ids.length}` : "Delete",
			destructive: true,
		});

		if (!ok) return false;

		const removed = orders.filter((order) => ids.includes(order.id));

		setOrders((current) => current.filter((order) => !ids.includes(order.id)));

		if (openId && ids.includes(openId)) setOpenOrder(null);

		toast.success(many ? `${ids.length} orders deleted` : `Order ${ids[0]} deleted`, {
			action: {
				label: "Undo",
				onClick: () =>
					setOrders((current) => [...current, ...removed].sort((a, b) => b.placed - a.placed)),
			},
		});

		return true;
	};

	const updateProduct: Admin["updateProduct"] = (id, patch) =>
		setProducts((current) =>
			current.map((product) => (product.id === id ? { ...product, ...patch } : product)),
		);

	const addProduct: Admin["addProduct"] = (product) => {
		const id = `FH-${101 + products.length}`;

		setProducts((current) => [{ ...product, id, active: true }, ...current]);
		toast.success(`${product.name} added`, { description: `${id}, in ${product.category}` });
	};

	return (
		<AdminContext
			value={{
				view,
				show,
				orders,
				products,
				settings,
				saveSettings,
				statusFilter,
				setStatusFilter,
				customerFilter,
				setCustomerFilter,
				openOrder: orders.find((order) => order.id === openId) ?? null,
				setOpenOrder,
				saveOrder,
				markShipped,
				deleteOrders,
				updateProduct,
				addProduct,
			}}
		>
			{children}
		</AdminContext>
	);
}
