"use client";

import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useDisclosure } from "@/lib/use-disclosure";

export function ConfirmDemo() {
	return (
		<div className="flex flex-wrap justify-center gap-3">
			<Button
				variant="destructive"
				onClick={async () => {
					const ok = await confirm({
						title: "Delete “Summer clips”?",
						description: "All 48 clips in this project are removed. This cannot be undone.",
						destructive: true,
					});

					if (ok) toast.success("Project deleted");
					else toast("Kept the project");
				}}
			>
				Delete project
			</Button>
			<Button
				variant="outline"
				onClick={async () => {
					if (await confirm({ title: "Publish to everyone?", confirmLabel: "Publish" }))
						toast.success("Published");
				}}
			>
				Publish
			</Button>
		</div>
	);
}

export function DialogDemo() {
	const profile = useDisclosure();

	return (
		<>
			<Dialog {...profile.props}>
				<DialogTrigger variant="outline">Edit profile</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<form
						id="profile-form"
						className="grid gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							profile.hide();
							toast.success("Profile updated");
						}}
					>
						<div className="grid gap-2">
							<Label htmlFor="d-name">Name</Label>
							<Input id="d-name" defaultValue="Jane Doe" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="d-user">Username</Label>
							<Input id="d-user" defaultValue="@jane" />
						</div>
					</form>
					<DialogFooter>
						<DialogClose>Cancel</DialogClose>
						<Button type="submit" form="profile-form">
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog>
				<DialogTrigger variant="destructive">Delete project</DialogTrigger>
				<DialogContent alert className="max-w-md">
					<DialogHeader>
						<DialogTitle>Delete “Atlas”?</DialogTitle>
						<DialogDescription>
							This permanently removes the project and its deployments. This cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose>Cancel</DialogClose>
						<DialogClose
							variant="destructive"
							onClick={() =>
								toast.error("Project deleted", {
									description: "Atlas was removed.",
									action: { label: "Undo", onClick: () => toast.success("Restored Atlas") },
								})
							}
						>
							Delete
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

let count = 0;

export function ToastDemo() {
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex flex-wrap justify-center gap-2">
				<Button
					variant="outline"
					onClick={() => toast("Event created", { description: "Fri, Nov 6 at 9:00" })}
				>
					Default
				</Button>
				<Button variant="outline" onClick={() => toast.success("Changes saved")}>
					Success
				</Button>
				<Button
					variant="outline"
					onClick={() => toast.error("Upload failed", { description: "File exceeds 10 MB." })}
				>
					Error
				</Button>
				<Button variant="outline" onClick={() => toast.info("New version available")}>
					Info
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						toast("Message archived", {
							action: { label: "Undo", onClick: () => toast("Restored") },
							duration: 8000,
						})
					}
				>
					With action
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
							loading: "Deploying…",
							success: "Deployed to production",
							error: "Deploy failed",
						})
					}
				>
					Promise
				</Button>
				<Button
					onClick={() => {
						for (let i = 0; i < 3; i++)
							setTimeout(() => toast(`Notification #${++count}`), i * 180);
					}}
				>
					Stack 3
				</Button>
			</div>
			<p className="text-muted-foreground text-xs">
				Hover the stack to expand · swipe sideways to dismiss
			</p>
		</div>
	);
}
