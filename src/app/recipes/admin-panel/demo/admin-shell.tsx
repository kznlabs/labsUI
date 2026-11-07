"use client";

import { LayoutDashboard, Package, Settings, ShoppingBag, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AdminProvider, useAdmin, type View } from "./admin-store";
import { admin, type Status, statusLabel } from "./data";

const statusVariants = {
	pending: "outline",
	paid: "default",
	shipped: "secondary",
	delivered: "success",
	cancelled: "destructive",
	refunded: "outline",
} as const;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
	return (
		<Badge variant={statusVariants[status]} dot className={cn("whitespace-nowrap", className)}>
			{statusLabel(status)}
		</Badge>
	);
}

/** The view's `h1`, its line of context and its actions; the sidebar toggle sits in front. */
export function ViewHeading({
	title,
	children,
	actions,
}: {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-wrap items-start gap-x-4 gap-y-3 sm:mb-8">
			<SidebarTrigger className="-ml-1.5 mt-0.5 shrink-0" />

			<div className="min-w-0 flex-1">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>

				<p className="mt-1 text-muted-foreground text-sm">{children}</p>
			</div>

			{actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>}
		</div>
	);
}

function Navigation({ children }: { children: ReactNode }) {
	const { view, show, orders, products, settings } = useAdmin();
	const toFulfil = orders.filter((order) => order.status === "paid").length;
	const low = products.filter(
		(product) => product.active && product.stock <= settings.lowStock,
	).length;

	return (
		<SidebarLayout className="items-start">
			<Sidebar
				label="Admin"
				className="sticky top-12 h-[calc(100dvh-3rem)]"
				header={
					<div className="flex h-9 items-center gap-2.5 overflow-hidden px-1">
						<span
							aria-hidden="true"
							className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary font-semibold text-primary-foreground text-sm"
						>
							{settings.storeName.slice(0, 1)}
						</span>

						<span className="truncate font-semibold">{settings.storeName}</span>
					</div>
				}
				groups={[
					{
						items: [{ id: "overview", label: "Overview", icon: <LayoutDashboard /> }],
					},
					{
						label: "Store",
						items: [
							{
								id: "orders",
								label: "Orders",
								icon: <ShoppingBag />,
								badge: toFulfil || undefined,
							},
							{ id: "products", label: "Products", icon: <Package />, badge: low || undefined },
							{ id: "customers", label: "Customers", icon: <Users /> },
						],
					},
				]}
				footer={[
					{ id: "settings", label: "Settings", icon: <Settings /> },
					{
						id: "profile",
						label: admin,
						icon: <Avatar alt={admin} size="sm" className="-ml-1 size-6 text-[0.625rem]" />,
					},
				]}
				current={view}
				onSelect={(id) => show(id === "profile" ? "settings" : (id as View))}
			/>

			<main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
				<div className="mx-auto max-w-6xl">{children}</div>
			</main>
		</SidebarLayout>
	);
}

export function AdminShell({ children }: { children: ReactNode }) {
	return (
		<AdminProvider>
			<Navigation>{children}</Navigation>
		</AdminProvider>
	);
}
