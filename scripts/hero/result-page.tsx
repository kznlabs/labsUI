// The page the CLI run ends on: copied into the fresh app, built from what it just added.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

const roles = [
	{ value: "admin", label: "Admin" },
	{ value: "moderator", label: "Moderator" },
	{ value: "member", label: "Member" },
];

const members = [
	{ name: "Maya Chen", role: "Admin" },
	{ name: "Tom Reed", role: "Moderator" },
	{ name: "Ines Costa", role: "Member" },
];

export default function Home() {
	const [role, setRole] = useState("member");

	function sendInvite(event: React.FormEvent) {
		event.preventDefault();

		toast.success("Invite sent", {
			action: { label: "Undo", onClick: () => toast("Invite cancelled") },
		});
	}

	return (
		<main className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Your team</CardTitle>

					<CardDescription>Three people, one open seat.</CardDescription>
				</CardHeader>

				<CardContent>
					<Tabs defaultValue="members">
						<TabsList aria-label="Team">
							<TabsTrigger value="members">Members</TabsTrigger>

							<TabsTrigger value="invite">Invite</TabsTrigger>
						</TabsList>

						<TabsContent value="members">
							<ul className="flex flex-col gap-3 pt-4 text-sm">
								{members.map((member) => (
									<li className="flex justify-between" key={member.name}>
										<span>{member.name}</span>

										<span className="text-muted-foreground">{member.role}</span>
									</li>
								))}
							</ul>
						</TabsContent>

						<TabsContent value="invite">
							<form className="flex flex-col gap-4 pt-4" onSubmit={sendInvite}>
								<Field label="Email">
									<Input defaultValue="sam@example.com" name="email" type="email" />
								</Field>

								<Field label="Role">
									<Select name="role" onValueChange={setRole} options={roles} value={role} />
								</Field>

								<Button type="submit">Send invite</Button>
							</form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</main>
	);
}
