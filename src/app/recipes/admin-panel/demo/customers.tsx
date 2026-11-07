"use client";

import { Copy, ShoppingBag } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { ViewHeading } from "./admin-shell";
import { useAdmin } from "./admin-store";
import {
	type Customer,
	countryNames,
	customers,
	euro,
	euroWhole,
	isoDate,
	orderTotal,
	shortDate,
} from "./data";

type Row = Customer & {
	orders: number;
	spent: number;
	last: number | null;
	segment: "VIP" | "Returning" | "New" | "No orders";
};

const vipFrom = 500;
const segmentVariants = {
	VIP: "default",
	Returning: "secondary",
	New: "outline",
	"No orders": "outline",
} as const;

export function Customers() {
	const { orders, show } = useAdmin();

	const rows: Row[] = customers.map((customer) => {
		const theirs = orders.filter(
			(order) =>
				order.customer === customer.id &&
				order.status !== "cancelled" &&
				order.status !== "refunded",
		);
		const spent = theirs.reduce((sum, order) => sum + orderTotal(order), 0);
		const segment =
			theirs.length === 0
				? "No orders"
				: spent >= vipFrom
					? "VIP"
					: theirs.length > 1
						? "Returning"
						: "New";

		return { ...customer, orders: theirs.length, spent, last: theirs[0]?.placed ?? null, segment };
	});

	const vip = rows.filter((row) => row.segment === "VIP").length;

	async function copy(row: Row) {
		try {
			await navigator.clipboard.writeText(row.email);
			toast.success("Email copied", { description: row.email });
		} catch {
			toast.error("Couldn't copy", { description: row.email });
		}
	}

	const columns: DataTableColumn<Row>[] = [
		{
			id: "name",
			header: "Customer",
			accessor: (row) => `${row.name} ${row.email}`,
			sortable: true,
			cell: (row) => (
				<span className="flex min-w-48 items-center gap-3">
					<Avatar alt={row.name} size="sm" />

					<span className="min-w-0">
						<span className="block font-medium">{row.name}</span>

						<span className="block text-muted-foreground text-xs">{row.email}</span>
					</span>
				</span>
			),
		},
		{
			id: "location",
			header: "Location",
			accessor: (row) => `${row.city}, ${countryNames[row.country]}`,
			sortable: true,
			className: "whitespace-nowrap",
		},
		{
			id: "segment",
			header: "Segment",
			accessor: (row) => row.segment,
			sortable: true,
			cell: (row) => <Badge variant={segmentVariants[row.segment]}>{row.segment}</Badge>,
		},
		{
			id: "orders",
			header: "Orders",
			accessor: (row) => row.orders,
			sortable: true,
			className: "text-right tabular-nums",
		},
		{
			id: "spent",
			header: "Spent",
			accessor: (row) => row.spent,
			sortable: true,
			cell: (row) => euro(row.spent),
			className: "text-right font-medium tabular-nums",
		},
		{
			id: "last",
			header: "Last order",
			accessor: (row) => row.last ?? 0,
			sortable: true,
			cell: (row) =>
				row.last ? (
					<time dateTime={isoDate(row.last)} className="whitespace-nowrap text-muted-foreground">
						{shortDate(row.last)}
					</time>
				) : (
					<span className="text-muted-foreground">Never</span>
				),
		},
	];

	return (
		<>
			<ViewHeading title="Customers">
				{customers.length} customers, {vip} of them VIP: {euroWhole(vipFrom)} or more spent. Open a
				customer's menu to see their orders.
			</ViewHeading>

			<DataTable
				label="Customers"
				data={rows}
				columns={columns}
				getRowId={(row) => row.id}
				rowLabel={(row) => row.name}
				defaultSort={{ id: "spent", dir: "descending" }}
				searchPlaceholder="Search name, email or city…"
				pageSize={12}
				rowActions={(row) => (
					<>
						<DropdownMenuItem
							disabled={row.orders === 0}
							onSelect={() => show("orders", { status: "all", customer: row.id })}
						>
							<ShoppingBag />
							View orders
						</DropdownMenuItem>

						<DropdownMenuItem onSelect={() => copy(row)}>
							<Copy />
							Copy email
						</DropdownMenuItem>
					</>
				)}
			/>
		</>
	);
}
