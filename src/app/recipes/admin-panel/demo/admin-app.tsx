"use client";

import { useAdmin } from "./admin-store";
import { Customers } from "./customers";
import { OrderDrawer } from "./order-drawer";
import { Orders } from "./orders";
import { Overview } from "./overview";
import { Products } from "./products";
import { Settings } from "./settings";

const screens = {
	overview: Overview,
	orders: Orders,
	products: Products,
	customers: Customers,
	settings: Settings,
};

export function AdminApp() {
	const { view } = useAdmin();
	const Screen = screens[view];

	return (
		<>
			<Screen />

			<OrderDrawer />
		</>
	);
}
