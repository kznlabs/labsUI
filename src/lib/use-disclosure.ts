"use client";

import { useState } from "react";

/**
 * Open state for any overlay. Spread `props` onto Dialog, Drawer, Popover or DropdownMenu and
 * open it from anywhere: `const drawer = useDisclosure(); <Drawer {...drawer.props}>`, `drawer.show()`.
 */
export function useDisclosure(defaultOpen = false) {
	const [open, setOpen] = useState(defaultOpen);

	return {
		open,
		show: () => setOpen(true),
		hide: () => setOpen(false),
		toggle: () => setOpen((current) => !current),
		props: { open, onOpenChange: setOpen },
	};
}
