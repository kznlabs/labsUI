"use client";

import { Download, Eye, Trash2, Truck, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OverflowFocus } from "@/lib/overflow-focus";
import { StatusBadge, ViewHeading } from "./admin-shell";
import { useAdmin } from "./admin-store";
import {
	customers,
	dateTime,
	euro,
	isoDate,
	itemCount,
	type Order,
	orderTotal,
	type Status,
	statuses,
	statusLabel,
} from "./data";

const customerOf = (order: Order) => customers.find((customer) => customer.id === order.customer);

function exportCsv(orders: Order[]) {
	const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
	const rows = orders.map((order) =>
		[
			order.id,
			isoDate(order.placed),
			customerOf(order)?.name ?? "",
			customerOf(order)?.email ?? "",
			statusLabel(order.status),
			order.payment,
			itemCount(order),
			orderTotal(order).toFixed(2),
			order.tracking,
		]
			.map(quote)
			.join(","),
	);
	const header = [
		"Order",
		"Placed",
		"Customer",
		"Email",
		"Status",
		"Payment",
		"Items",
		"Total EUR",
		"Tracking",
	];
	const file = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
	const link = document.createElement("a");

	link.href = URL.createObjectURL(file);
	link.download = "fernhill-orders.csv";
	link.click();
	URL.revokeObjectURL(link.href);
	toast.success(`Exported ${orders.length} orders`, { description: "fernhill-orders.csv" });
}

export function Orders() {
	const {
		orders,
		statusFilter,
		setStatusFilter,
		customerFilter,
		setCustomerFilter,
		setOpenOrder,
		markShipped,
		deleteOrders,
	} = useAdmin();
	const customer = customers.find((person) => person.id === customerFilter);
	const mine = customer ? orders.filter((order) => order.customer === customer.id) : orders;
	const visible =
		statusFilter === "all" ? mine : mine.filter((order) => order.status === statusFilter);
	const counts = (status: Status) => mine.filter((order) => order.status === status).length;

	const columns: DataTableColumn<Order>[] = [
		{
			id: "id",
			header: "Order",
			accessor: (order) => order.id,
			sortable: true,
			cell: (order) => (
				<button
					type="button"
					onClick={() => setOpenOrder(order.id)}
					className="-mx-1.5 cursor-pointer rounded-md px-1.5 py-0.5 font-medium tabular-nums underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					{order.id}
				</button>
			),
		},
		{
			id: "placed",
			header: "Placed",
			accessor: (order) => order.placed,
			sortable: true,
			cell: (order) => (
				<time dateTime={isoDate(order.placed)} className="whitespace-nowrap text-muted-foreground">
					{dateTime(order.placed)}
				</time>
			),
		},
		{
			id: "customer",
			header: "Customer",
			accessor: (order) => `${customerOf(order)?.name} ${customerOf(order)?.email}`,
			sortable: true,
			cell: (order) => (
				<span className="flex items-center gap-2.5 whitespace-nowrap">
					<Avatar alt={customerOf(order)?.name ?? ""} size="sm" />

					{customerOf(order)?.name}
				</span>
			),
		},
		{
			id: "status",
			header: "Status",
			accessor: (order) => statusLabel(order.status),
			sortable: true,
			cell: (order) => <StatusBadge status={order.status} />,
		},
		{
			id: "payment",
			header: "Payment",
			accessor: (order) => order.payment,
			className: "whitespace-nowrap text-muted-foreground",
		},
		{
			id: "items",
			header: "Items",
			accessor: (order) => itemCount(order),
			sortable: true,
			className: "text-right tabular-nums",
		},
		{
			id: "total",
			header: "Total",
			accessor: (order) => orderTotal(order),
			sortable: true,
			cell: (order) => euro(orderTotal(order)),
			className: "text-right font-medium tabular-nums",
		},
	];

	return (
		<>
			<ViewHeading
				title="Orders"
				actions={
					<Button variant="outline" onClick={() => exportCsv(visible)}>
						<Download aria-hidden="true" />
						Export CSV
					</Button>
				}
			>
				{orders.length} orders in the last six weeks. Select rows to ship or delete several at once.
			</ViewHeading>

			<div className="mb-4 flex flex-wrap items-center gap-3">
				<div className="-mx-4 max-w-[100vw] overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<OverflowFocus />

					<ToggleGroup
						type="single"
						size="sm"
						aria-label="Status"
						value={statusFilter}
						onValueChange={(value: string) => value && setStatusFilter(value as Status | "all")}
					>
						<ToggleGroupItem value="all">
							All <span className="text-muted-foreground tabular-nums">{mine.length}</span>
						</ToggleGroupItem>

						{statuses.map((status) => (
							<ToggleGroupItem
								key={status.value}
								value={status.value}
								className="whitespace-nowrap"
							>
								{status.label}{" "}
								<span className="text-muted-foreground tabular-nums">{counts(status.value)}</span>
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				{customer && (
					<Button size="sm" variant="secondary" onClick={() => setCustomerFilter(null)}>
						{customer.name}

						<X aria-hidden="true" />

						<span className="sr-only">: show every customer</span>
					</Button>
				)}
			</div>

			<DataTable
				label="Orders"
				data={visible}
				columns={columns}
				getRowId={(order) => order.id}
				rowLabel={(order) => `order ${order.id}`}
				defaultSort={{ id: "placed", dir: "descending" }}
				searchPlaceholder="Search orders, customers…"
				selectable
				pageSize={12}
				toolbar={(selected) =>
					selected.length > 0 && (
						<div className="flex flex-wrap gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => markShipped(selected.map((order) => order.id))}
							>
								<Truck aria-hidden="true" />
								Mark shipped
							</Button>

							<Button
								size="sm"
								variant="destructive"
								onClick={() => deleteOrders(selected.map((order) => order.id))}
							>
								<Trash2 aria-hidden="true" />
								Delete {selected.length}
							</Button>
						</div>
					)
				}
				rowActions={(order) => (
					<>
						<DropdownMenuItem onSelect={() => setOpenOrder(order.id)}>
							<Eye />
							Open
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled={order.status !== "paid"}
							onSelect={() => markShipped([order.id])}
						>
							<Truck />
							Mark shipped
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem variant="destructive" onSelect={() => deleteOrders([order.id])}>
							<Trash2 />
							Delete
						</DropdownMenuItem>
					</>
				)}
			/>
		</>
	);
}
