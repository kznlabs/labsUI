/** Usage snippets shown in the showcase. Formatted with Prettier. */
export const snippets: Record<string, { name: string; code: string }[]> = {
	button: [
		{
			name: "save-button.tsx",
			code: 'import { Button } from "@/components/ui/button";\nexport function SaveButton({\n  saving,\n  saved,\n}: {\n  saving: boolean;\n  saved: boolean;\n}) {\n  return (\n    <Button\n      variant="outline"\n      status={saving ? "loading" : saved ? "success" : "idle"}\n      loadingLabel="Saving…"\n      successLabel="Saved!"\n    >\n      Save\n    </Button>\n  );\n}',
		},
		{
			name: "delete-account.tsx",
			code: 'import { Button } from "@/components/ui/button";\nexport function DeleteAccount({\n  status,\n  onDelete,\n}: {\n  status: "idle" | "loading" | "success";\n  onDelete: () => Promise<void>;\n}) {\n  return (\n    <Button\n      variant="destructive"\n      confirmLabel="Yes, delete my account"\n      loadingLabel="Deleting…"\n      successLabel="Account deleted"\n      status={status}\n      onClick={onDelete}\n    >\n      Delete account\n    </Button>\n  );\n}',
		},
	],
	badge: [
		{
			name: "status.tsx",
			code: 'import { Badge } from "@/components/ui/badge";\nexport function Status() {\n  return (\n    <Badge variant="success" shape="pill" dot pulse>\n      Live\n    </Badge>\n  );\n}',
		},
	],
	forms: [
		{
			name: "sign-up.tsx",
			code: 'import { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\nimport { Switch } from "@/components/ui/switch";\nimport { Textarea } from "@/components/ui/textarea";\nexport function SignUp({ error }: { error: boolean }) {\n  return (\n    <form className="grid gap-4">\n      <div className="grid gap-2">\n        <Label htmlFor="email">Email</Label>\n        <Input id="email" type="email" aria-invalid={error} />\n      </div>\n      <div className="grid gap-2">\n        <Label htmlFor="bio">Bio</Label>\n        <Textarea id="bio" maxLength={160} />\n      </div>\n      <Switch defaultChecked />\n    </form>\n  );\n}',
		},
	],
	card: [
		{
			name: "revenue.tsx",
			code: 'import { Badge } from "@/components/ui/badge";\nimport {\n  Card,\n  CardDescription,\n  CardFooter,\n  CardHeader,\n  CardTitle,\n} from "@/components/ui/card";\nimport { CountTo } from "@/components/ui/count-to";\nexport function Revenue() {\n  return (\n    <Card>\n      <CardHeader>\n        <CardDescription>Monthly revenue</CardDescription>\n        <CardTitle>\n          <CountTo to={48290} prefix="$" />\n        </CardTitle>\n      </CardHeader>\n      <CardFooter>\n        <Badge variant="success" shape="pill">\n          +12.4%\n        </Badge>\n      </CardFooter>\n    </Card>\n  );\n}',
		},
	],
	avatar: [
		{
			name: "user.tsx",
			code: 'import { Bot } from "lucide-react";\nimport { Avatar } from "@/components/ui/avatar";\nexport function User() {\n  return (\n    <Avatar\n      src="/jane.png"\n      alt="Jane Doe"\n      status="online"\n      size="lg"\n      fallback={<Bot />}\n    />\n  );\n}',
		},
	],
	accordion: [
		{
			name: "faq.tsx",
			code: 'import {\n  Accordion,\n  AccordionContent,\n  AccordionItem,\n  AccordionTrigger,\n} from "@/components/ui/accordion";\nexport function Faq() {\n  return (\n    <Accordion type="single" collapsible defaultValue="a">\n      <AccordionItem value="a">\n        <AccordionTrigger>Is it accessible?</AccordionTrigger>\n        <AccordionContent>\n          Yes, keyboard and screen reader friendly.\n        </AccordionContent>\n      </AccordionItem>\n    </Accordion>\n  );\n}',
		},
	],
	chat: [
		{
			name: "message.tsx",
			code: 'import { Avatar } from "@/components/ui/avatar";\nimport { Code } from "@/components/ui/code";\nimport { MessageBubble } from "@/components/ui/message-bubble";\nexport function Reply({ code }: { code: string }) {\n  return (\n    <MessageBubble\n      from="assistant"\n      avatar={<Avatar size="sm" alt="Assistant" />}\n      streaming\n    >\n      <p>Here is the component:</p>\n      <Code code={code} language="tsx" />\n    </MessageBubble>\n  );\n}',
		},
	],
	dialog: [
		{
			name: "edit-profile.tsx",
			code: 'import {\n  Dialog,\n  DialogClose,\n  DialogContent,\n  DialogDescription,\n  DialogFooter,\n  DialogHeader,\n  DialogTitle,\n  DialogTrigger,\n} from "@/components/ui/dialog";\nexport function EditProfile() {\n  return (\n    <Dialog>\n      <DialogTrigger variant="outline">Edit profile</DialogTrigger>\n      <DialogContent>\n        <DialogHeader>\n          <DialogTitle>Edit profile</DialogTitle>\n          <DialogDescription>Changes apply to your account.</DialogDescription>\n        </DialogHeader>\n        <DialogFooter>\n          <DialogClose>Cancel</DialogClose>\n        </DialogFooter>\n      </DialogContent>\n    </Dialog>\n  );\n}',
		},
	],
	toast: [
		{
			name: "save.tsx",
			code: 'import { toast } from "@/components/ui/toast";\nexport function notifySaved() {\n  toast.success("Changes saved", {\n    description: "All changes synced",\n    action: { label: "Undo", onClick: undo },\n  });\n}',
		},
	],
	"mac-window": [
		{
			name: "preview.tsx",
			code: 'import { MacWindow } from "@/components/ui/mac-window";\nexport function Preview() {\n  return (\n    <MacWindow title="Preview" onClose={close} glass bodyClassName="p-5">\n      <p>Window content goes here.</p>\n    </MacWindow>\n  );\n}',
		},
	],
	"theme-toggle": [
		{
			name: "header.tsx",
			code: 'import { ThemeToggle } from "@/components/ui/theme-toggle";\nexport function Header() {\n  return <ThemeToggle />;\n}',
		},
	],
	cursor: [
		{
			name: "layout.tsx",
			code: 'import { CustomCursor } from "@/components/ui/custom-cursor";\nexport function Layout({ enabled }: { enabled: boolean }) {\n  return <>{enabled && <CustomCursor />}</>;\n}',
		},
	],
	"count-to": [
		{
			name: "stats.tsx",
			code: 'import { CountTo } from "@/components/ui/count-to";\nexport function Stats() {\n  return <CountTo to={99.9} decimals={1} suffix="%" />;\n}',
		},
	],
	reveal: [
		{
			name: "feature.tsx",
			code: 'import { Reveal } from "@/components/ui/reveal";\nexport function Feature() {\n  return (\n    <Reveal delay={0.1}>\n      <article>Rises into view on scroll.</article>\n    </Reveal>\n  );\n}',
		},
	],
	"avatar-group": [
		{
			name: "team.tsx",
			code: 'import { AvatarGroup } from "@/components/ui/avatar-group";\nexport function Team({ users }: { users: { alt: string; src?: string }[] }) {\n  return <AvatarGroup users={users} max={4} size="lg" />;\n}',
		},
	],
	quote: [
		{
			name: "testimonial.tsx",
			code: 'import { Avatar } from "@/components/ui/avatar";\nimport { Quote } from "@/components/ui/quote";\nexport function Testimonial() {\n  return (\n    <Quote\n      variant="card"\n      author="Jane Doe"\n      subtitle="Design lead"\n      avatar={<Avatar size="sm" alt="Jane Doe" />}\n      typewriter\n    >\n      Motion that respects the user feels native.\n    </Quote>\n  );\n}',
		},
	],
	breadcrumb: [
		{
			name: "nav-trail.tsx",
			code: 'import {\n  Breadcrumb,\n  BreadcrumbList,\n  BreadcrumbItem,\n  BreadcrumbLink,\n  BreadcrumbSeparator,\n  BreadcrumbPage,\n} from "@/components/ui/breadcrumb";\n\nexport function NavTrail() {\n  return (\n    <Breadcrumb>\n      <BreadcrumbList>\n        <BreadcrumbItem>\n          <BreadcrumbLink href="/">Home</BreadcrumbLink>\n        </BreadcrumbItem>\n        <BreadcrumbSeparator />\n        <BreadcrumbItem>\n          <BreadcrumbPage>Components</BreadcrumbPage>\n        </BreadcrumbItem>\n      </BreadcrumbList>\n    </Breadcrumb>\n  );\n}',
		},
	],
	"button-group": [
		{
			name: "segmented-actions.tsx",
			code: 'import { Button } from "@/components/ui/button";\nimport { ButtonGroup } from "@/components/ui/button-group";\n\nexport function SegmentedActions() {\n  return (\n    <ButtonGroup>\n      <Button variant="outline" size="sm">Years</Button>\n      <Button variant="outline" size="sm">Months</Button>\n      <Button variant="default" size="sm">Days</Button>\n    </ButtonGroup>\n  );\n}',
		},
	],
	typewriter: [
		{
			name: "headline.tsx",
			code: 'import { Typewriter } from "@/components/ui/typewriter";\n\nexport function Headline() {\n  return (\n    <h2>\n      Built for{" "}\n      <Typewriter\n        text={["macOS polish.", "accessible navigation.", "delightful springs."]}\n        speed={40}\n      />\n    </h2>\n  );\n}',
		},
	],
	"text-swap": [
		{
			name: "dynamic-tag.tsx",
			code: 'import { TextSwap } from "@/components/ui/text-swap";\n\nexport function DynamicTag() {\n  return (\n    <span className="font-medium">\n      Crafted with{" "}\n      <TextSwap items={["Next.js 16", "Tailwind CSS 4", "motion 14"]} direction="up" />\n    </span>\n  );\n}',
		},
	],
};
