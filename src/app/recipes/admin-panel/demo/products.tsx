"use client";

import { EyeOff, PackagePlus, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
	Drawer,
	DrawerBody,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { useDisclosure } from "@/lib/use-disclosure";
import { ViewHeading } from "./admin-shell";
import { useAdmin } from "./admin-store";
import { type Category, categories, euro, type Product } from "./data";

const restock = 24;

function NewProduct({ onDone }: { onDone: () => void }) {
	const { addProduct } = useAdmin();
	const [category, setCategory] = useState<Category>("Kitchen");
	const [stock, setStock] = useState(12);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		addProduct({
			name: String(data.get("name")).trim(),
			category,
			price: Number(data.get("price")),
			stock,
		});
		onDone();
	}

	return (
		<form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
			<DrawerHeader>
				<DrawerTitle>New product</DrawerTitle>

				<DrawerDescription>It goes live in the store as soon as you add it.</DrawerDescription>
			</DrawerHeader>

			<DrawerBody className="flex flex-col gap-4">
				<Field label="Name" required>
					<Input
						name="name"
						minLength={3}
						maxLength={60}
						placeholder="Stoneware jug, sand"
						autoComplete="off"
					/>
				</Field>

				<Field label="Category">
					<Select
						options={categories.map((value) => ({ value, label: value }))}
						value={category}
						onValueChange={(value) => setCategory(value as Category)}
					/>
				</Field>

				<Field label="Price" required description="VAT included.">
					<InputGroup>
						<InputGroupAddon>€</InputGroupAddon>

						<Input
							name="price"
							type="number"
							inputMode="decimal"
							min={1}
							max={2000}
							step={0.01}
							placeholder="24.00"
						/>
					</InputGroup>
				</Field>

				<Field label="Units in stock">
					<NumberInput value={stock} onValueChange={setStock} min={0} max={999} />
				</Field>
			</DrawerBody>

			<DrawerFooter className="flex-row justify-end">
				<DrawerClose>Cancel</DrawerClose>

				<Button type="submit">Add product</Button>
			</DrawerFooter>
		</form>
	);
}

export function Products() {
	const { products, updateProduct, settings } = useAdmin();
	const adding = useDisclosure();
	// A new key per open, so the form starts empty without blanking while the drawer slides out.
	const [round, setRound] = useState(0);

	function toggle(product: Product, active: boolean) {
		updateProduct(product.id, { active });
		toast(active ? `${product.name} is live` : `${product.name} is hidden`, {
			description: active
				? "Shoppers can find and buy it again."
				: "It stays in your list, out of the store.",
		});
	}

	function refill(product: Product) {
		updateProduct(product.id, { stock: product.stock + restock });
		toast.success(`${restock} ${product.name} received`, {
			description: `${product.stock + restock} in stock now`,
		});
	}

	const columns: DataTableColumn<Product>[] = [
		{
			id: "name",
			header: "Product",
			accessor: (product) => `${product.name} ${product.id}`,
			sortable: true,
			cell: (product) => (
				<span className="block min-w-44">
					<span className="block font-medium">{product.name}</span>

					<span className="block text-muted-foreground text-xs tabular-nums">{product.id}</span>
				</span>
			),
		},
		{ id: "category", header: "Category", accessor: (product) => product.category, sortable: true },
		{
			id: "price",
			header: "Price",
			accessor: (product) => product.price,
			sortable: true,
			cell: (product) => euro(product.price),
			className: "text-right tabular-nums",
		},
		{
			id: "stock",
			header: "Stock",
			accessor: (product) => product.stock,
			sortable: true,
			cell: (product) => (
				<span className="flex items-center justify-end gap-2 whitespace-nowrap">
					{product.stock === 0 ? (
						<Badge variant="destructive">Sold out</Badge>
					) : (
						product.stock <= settings.lowStock && <Badge variant="outline">Low</Badge>
					)}

					<span className="w-8 tabular-nums">{product.stock}</span>
				</span>
			),
			className: "text-right",
		},
		{
			id: "active",
			header: "In store",
			accessor: (product) => (product.active ? "Live" : "Hidden"),
			cell: (product) => (
				<Switch
					aria-label={`${product.name} in store`}
					checked={product.active}
					onCheckedChange={(active) => toggle(product, active)}
				/>
			),
		},
	];

	const live = products.filter((product) => product.active).length;

	return (
		<>
			<ViewHeading
				title="Products"
				actions={
					<Button
						onClick={() => {
							setRound(round + 1);
							adding.show();
						}}
					>
						<Plus aria-hidden="true" />
						Add product
					</Button>
				}
			>
				{live} of {products.length} live in the store. Low means {settings.lowStock} or fewer left;
				change that in Settings.
			</ViewHeading>

			<DataTable
				label="Products"
				data={products}
				columns={columns}
				getRowId={(product) => product.id}
				rowLabel={(product) => product.name}
				defaultSort={{ id: "stock", dir: "ascending" }}
				searchPlaceholder="Search products or SKU…"
				pageSize={12}
				rowActions={(product) => (
					<>
						<DropdownMenuItem onSelect={() => refill(product)}>
							<PackagePlus />
							Receive {restock}
						</DropdownMenuItem>

						<DropdownMenuItem onSelect={() => toggle(product, !product.active)}>
							<EyeOff />

							{product.active ? "Hide from store" : "Show in store"}
						</DropdownMenuItem>
					</>
				)}
			/>

			<Drawer {...adding.props}>
				<DrawerContent side="right" className="sm:max-w-md">
					<NewProduct key={round} onDone={adding.hide} />
				</DrawerContent>
			</Drawer>
		</>
	);
}
