/** Usage snippets shown in the showcase. CodePanel runs Prettier on them at display time. */
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
			code: 'import { Avatar } from "@/components/ui/avatar";\nimport { Quote } from "@/components/ui/quote";\nexport function Testimonial() {\n  return (\n    <Quote\n      variant="card"\n      author="Adam Mickiewicz"\n      subtitle="Pan Tadeusz \u00B7 tr. G. R. Noyes"\n      avatar={<Avatar size="sm" alt="Adam Mickiewicz" />}\n      typewriter\n    >\n      Lithuania, my country, thou art like health; how much thou shouldst be prized only he can learn who has lost thee.\n    </Quote>\n  );\n}',
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
	collapsible: [
		{
			name: "starred.tsx",
			code: 'import {\n  Collapsible,\n  CollapsibleContent,\n  CollapsibleTrigger,\n} from "@/components/ui/collapsible";\n\nexport function Starred({ repos }: { repos: string[] }) {\n  return (\n    <Collapsible>\n      <CollapsibleTrigger>Starred {repos.length} repositories</CollapsibleTrigger>\n      <CollapsibleContent className="grid gap-2">\n        {repos.map((r) => (\n          <div key={r}>{r}</div>\n        ))}\n      </CollapsibleContent>\n    </Collapsible>\n  );\n}',
		},
	],
	pagination: [
		{
			name: "posts-pager.tsx",
			// biome-ignore lint/suspicious/noTemplateCurlyInString: snippet source contains template literals
			code: 'import {\n  Pagination,\n  PaginationContent,\n  PaginationEllipsis,\n  PaginationItem,\n  PaginationLink,\n  PaginationNext,\n  PaginationPrevious,\n  pageRange,\n} from "@/components/ui/pagination";\n\nexport function PostsPager({ page, total }: { page: number; total: number }) {\n  return (\n    <Pagination>\n      <PaginationContent>\n        <PaginationItem>\n          <PaginationPrevious href={`?page=${page - 1}`} />\n        </PaginationItem>\n        {pageRange(page, total).map((p, i) => (\n          <PaginationItem key={`slot-${i}`}>\n            {p === "…" ? (\n              <PaginationEllipsis />\n            ) : (\n              <PaginationLink href={`?page=${p}`} isActive={p === page}>\n                {p}\n              </PaginationLink>\n            )}\n          </PaginationItem>\n        ))}\n        <PaginationItem>\n          <PaginationNext href={`?page=${page + 1}`} />\n        </PaginationItem>\n      </PaginationContent>\n    </Pagination>\n  );\n}',
		},
	],
	sidebar: [
		{
			name: "admin-layout.tsx",
			code: 'import { Home, Inbox, Settings } from "lucide-react";\nimport {\n  Sidebar,\n  SidebarContent,\n  SidebarFooter,\n  SidebarGroup,\n  SidebarGroupLabel,\n  SidebarMenu,\n  SidebarMenuButton,\n  SidebarMenuItem,\n  SidebarProvider,\n  SidebarTrigger,\n} from "@/components/ui/sidebar";\n\nexport function AdminLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <SidebarProvider className="h-dvh">\n      <Sidebar label="Admin">\n        <SidebarContent>\n          <SidebarGroup>\n            <SidebarGroupLabel>Server</SidebarGroupLabel>\n            <SidebarMenu>\n              <SidebarMenuItem>\n                <SidebarMenuButton href="/" icon={<Home />} isActive>Overview</SidebarMenuButton>\n              </SidebarMenuItem>\n              <SidebarMenuItem>\n                <SidebarMenuButton href="/inbox" icon={<Inbox />} badge={12}>Inbox</SidebarMenuButton>\n              </SidebarMenuItem>\n            </SidebarMenu>\n          </SidebarGroup>\n        </SidebarContent>\n        <SidebarFooter>\n          <SidebarMenu>\n            <SidebarMenuItem>\n              <SidebarMenuButton href="/settings" icon={<Settings />}>Settings</SidebarMenuButton>\n            </SidebarMenuItem>\n          </SidebarMenu>\n        </SidebarFooter>\n      </Sidebar>\n      <main className="min-w-0 flex-1">\n        <SidebarTrigger />\n        {children}\n      </main>\n    </SidebarProvider>\n  );\n}',
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
	"search-input": [
		{
			name: "member-search.tsx",
			code: `"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export function MemberSearch({ members }: { members: string[] }) {
  const [query, setQuery] = useState("");
  const found = members.filter((m) => m.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <SearchInput value={query} onValueChange={setQuery} shortcut="mod+f" label="Search members" placeholder="Search members…" />
      <ul>
        {found.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </>
  );
}`,
		},
	],
	field: [
		{
			name: "signup-form.tsx",
			code: `"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const [error, setError] = useState<string>();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email"));
        setError(email.includes("@") ? undefined : "Enter a valid email address.");
      }}
    >
      <Field label="Email" description="We never share it." error={error} required>
        <Input name="email" type="email" />
      </Field>
      <Button type="submit">Create account</Button>
    </form>
  );
}`,
		},
	],
	"input-group": [
		{
			name: "site-address.tsx",
			code: `import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";

export function SiteAddress() {
  return (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <Input aria-label="Site address" placeholder="labsui" className="px-0" />
      <InputGroupAddon align="end">.dev</InputGroupAddon>
    </InputGroup>
  );
}`,
		},
	],
	checkbox: [
		{
			name: "select-all.tsx",
			code: `"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function SelectAll({ items }: { items: string[] }) {
  const [on, setOn] = useState<string[]>([]);
  const all = on.length === items.length;
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id="all" checked={all} indeterminate={on.length > 0 && !all} onCheckedChange={() => setOn(all ? [] : items)} />
      <Label htmlFor="all">Select all</Label>
    </div>
  );
}`,
		},
	],
	"radio-group": [
		{
			name: "plan-picker.tsx",
			code: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PlanPicker() {
  return (
    <RadioGroup legend="Plan" name="plan" defaultValue="pro">
      <RadioGroupItem value="free" description="1 server, 50 clips a month.">Free</RadioGroupItem>
      <RadioGroupItem value="pro" description="10 servers, unlimited clips.">Pro</RadioGroupItem>
    </RadioGroup>
  );
}`,
		},
	],
	slider: [
		{
			name: "price-filter.tsx",
			code: `"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";

export function PriceFilter() {
  const [price, setPrice] = useState([40, 180]);
  return (
    <Field label="Price" description={\`$\${price[0]} – $\${price[1]}\`}>
      <Slider value={price} onValueChange={setPrice} min={0} max={250} step={5} name="price" />
    </Field>
  );
}`,
		},
	],
	"toggle-group": [
		{
			name: "view-switch.tsx",
			code: `"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ViewSwitch() {
  const [view, setView] = useState("grid");
  return (
    <ToggleGroup aria-label="View" value={view} onValueChange={setView}>
      <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid /></ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view"><List /></ToggleGroupItem>
    </ToggleGroup>
  );
}`,
		},
	],
	"native-select": [
		{
			name: "timezone-field.tsx",
			code: `import { Field } from "@/components/ui/field";
import { NativeSelect, NativeSelectGroup, NativeSelectOption } from "@/components/ui/native-select";

export function TimezoneField() {
  return (
    <Field label="Timezone" required>
      <NativeSelect name="zone" defaultValue="">
        <NativeSelectOption value="" disabled>Pick a timezone</NativeSelectOption>
        <NativeSelectGroup label="Europe">
          <NativeSelectOption value="Europe/Warsaw">Warsaw (CET)</NativeSelectOption>
          <NativeSelectOption value="Europe/London">London (GMT)</NativeSelectOption>
        </NativeSelectGroup>
      </NativeSelect>
    </Field>
  );
}`,
		},
	],
	"number-input": [
		{
			name: "cart-quantity.tsx",
			code: `"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";

export function CartQuantity() {
  const [qty, setQty] = useState(1);
  return (
    <Field label="Quantity">
      <NumberInput value={qty} onValueChange={setQty} min={1} max={10} name="qty" />
    </Field>
  );
}`,
		},
	],
	meter: [
		{
			name: "storage.tsx",
			code: `import { Meter } from "@/components/ui/meter";

export function Storage() {
  return (
    <Meter
      label="Clip storage"
      valueText="71 GB of 100 GB"
      segments={[
        { label: "Clips", value: 48 },
        { label: "Thumbnails", value: 9 },
        { label: "Backups", value: 14 },
      ]}
    />
  );
}`,
		},
	],
	rating: [
		{
			name: "product-rating.tsx",
			code: `import { Rating } from "@/components/ui/rating";

export function ProductRating({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Rating readOnly value={average} size="sm" />
      <span className="font-medium">{average}</span>
      <span className="text-muted-foreground">· {count} reviews</span>
    </div>
  );
}`,
		},
	],
	"relative-time": [
		{
			name: "mod-log-entry.tsx",
			code: `import { RelativeTime } from "@/components/ui/relative-time";

export function ModLogEntry({ text, at }: { text: string; at: Date }) {
  return (
    <li className="flex justify-between gap-3 text-sm">
      {text}
      <RelativeTime date={at} className="text-muted-foreground text-xs" />
    </li>
  );
}`,
		},
	],
	select: [
		{
			name: "role-picker.tsx",
			code: `"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "member", label: "Member" },
];

export function RolePicker() {
  const [role, setRole] = useState("member");
  return (
    <Field label="Role">
      <Select name="role" options={roles} value={role} onValueChange={setRole} />
    </Field>
  );
}`,
		},
	],
	popover: [
		{
			name: "clip-filters.tsx",
			code: `import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ClipFilters() {
  return (
    <Popover>
      <PopoverTrigger variant="outline">Filters</PopoverTrigger>
      <PopoverContent align="start" className="grid gap-3">
        <p className="font-medium text-sm">Filter clips</p>
        <Button size="sm">Apply</Button>
      </PopoverContent>
    </Popover>
  );
}`,
		},
	],
	tooltip: [
		{
			name: "format-toolbar.tsx",
			code: `import { Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function FormatToolbar() {
  return (
    <div className="flex gap-1">
      <Tooltip content="Bold ⌘B">
        <Button variant="ghost" size="icon" aria-label="Bold"><Bold /></Button>
      </Tooltip>
      <Tooltip content="Italic ⌘I">
        <Button variant="ghost" size="icon" aria-label="Italic"><Italic /></Button>
      </Tooltip>
    </div>
  );
}`,
		},
	],
	"hover-card": [
		{
			name: "user-mention.tsx",
			code: `import { Avatar } from "@/components/ui/avatar";
import { HoverCard } from "@/components/ui/hover-card";

export function UserMention({ name, handle }: { name: string; handle: string }) {
  return (
    <HoverCard
      content={
        <div className="flex items-center gap-3">
          <Avatar alt={name} />
          <div className="grid">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-muted-foreground text-xs">@{handle}</span>
          </div>
        </div>
      }
    >
      <a href={"/u/" + handle}>@{handle}</a>
    </HoverCard>
  );
}`,
		},
	],
	"context-menu": [
		{
			name: "clip-card.tsx",
			code: `import { Copy, Play, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function ClipCard({ title, onDelete }: { title: string; onDelete: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label={title}>{title}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem><Play />Play</ContextMenuItem>
        <ContextMenuItem shortcut="⌘C"><Copy />Copy link</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={onDelete}><Trash2 />Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}`,
		},
	],
	alert: [
		{
			name: "token-warning.tsx",
			code: `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function TokenWarning() {
  return (
    <Alert variant="warning" action={<Button size="sm" variant="outline">Renew</Button>}>
      <AlertTitle>Token expires in 2 days</AlertTitle>
      <AlertDescription>Renew it to keep the dashboard in sync.</AlertDescription>
    </Alert>
  );
}`,
		},
	],
	progress: [
		{
			name: "upload-progress.tsx",
			code: `import { Progress } from "@/components/ui/progress";

export function UploadProgress({ percent }: { percent?: number }) {
  // Pass no value while the size is unknown: the bar sweeps instead.
  return <Progress label="Uploading clip.mp4" value={percent} showValue />;
}`,
		},
	],
	empty: [
		{
			name: "no-clips.tsx",
			code: `import { Film, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

export function NoClips() {
  return (
    <Empty bordered icon={<Film />} title="No clips yet" description="Upload a video from your computer.">
      <Button size="sm"><Upload />Upload clip</Button>
    </Empty>
  );
}`,
		},
	],
	"dropdown-menu": [
		{
			name: "clip-actions.tsx",
			code: `"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClipActions({ onDelete }: { onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger variant="ghost" size="icon" aria-label="Clip actions">
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><Pencil />Rename</DropdownMenuItem>
        <DropdownMenuItem shortcut="⌘C"><Copy />Copy link</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`,
		},
	],
	drawer: [
		{
			name: "cart-drawer.tsx",
			code: `import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function CartDrawer({ items }: { items: string[] }) {
  return (
    <Drawer>
      <DrawerTrigger variant="outline">Cart</DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Your cart</DrawerTitle>
          <DrawerDescription>{items.length} items</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Keep shopping</DrawerClose>
          <DrawerClose variant="default">Checkout</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}`,
		},
	],
	command: [
		{
			name: "site-palette.tsx",
			code: `"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const pages = [
  { href: "/", title: "Home" },
  { href: "/blog", title: "Blog" },
  { href: "/clips", title: "Clips" },
];

export function SitePalette() {
  const router = useRouter();
  return (
    <CommandDialog shortcut="mod+k">
      <CommandInput placeholder="Search pages…" />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.href} onSelect={() => router.push(p.href)}><FileText />{p.title}</CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}`,
		},
	],
	tabs: [
		{
			name: "settings-tabs.tsx",
			code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account" variant="underline">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
    </Tabs>
  );
}`,
		},
	],
	kbd: [
		{
			name: "shortcut-hint.tsx",
			code: `import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function ShortcutHint() {
  return (
    <p>
      Press <KbdGroup keys={["⌘", "K"]} /> to search, <Kbd>Esc</Kbd> to close.
    </p>
  );
}`,
		},
	],
	separator: [
		{
			name: "profile-links.tsx",
			code: `import { Separator } from "@/components/ui/separator";

export function ProfileLinks() {
  return (
    <div>
      <div className="flex h-5 items-center gap-3 text-sm">
        <a href="/docs">Docs</a>
        <Separator orientation="vertical" />
        <a href="/blog">Blog</a>
      </div>
      <Separator label="or" className="my-4" />
    </div>
  );
}`,
		},
	],
	skeleton: [
		{
			name: "profile-skeleton.tsx",
			code: `import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <SkeletonGroup label="Loading profile" className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </SkeletonGroup>
  );
}`,
		},
	],
	table: [
		{
			name: "members-table.tsx",
			code: `"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Member = { name: string; messages: number };

export function MembersTable({ members }: { members: Member[] }) {
  const [dir, setDir] = useState<"ascending" | "descending">("descending");
  const rows = [...members].sort((a, b) =>
    dir === "ascending" ? a.messages - b.messages : b.messages - a.messages,
  );
  return (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead
            className="text-right"
            sort={dir}
            onSort={() => setDir(dir === "ascending" ? "descending" : "ascending")}
          >
            Messages
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m) => (
          <TableRow key={m.name}>
            <TableCell className="font-medium">{m.name}</TableCell>
            <TableCell className="text-right tabular-nums">{m.messages}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`,
		},
	],
	"data-table": [
		{
			name: "members-data-table.tsx",
			code: `"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type DataTableColumn, DataTable } from "@/components/ui/data-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Member = { id: string; name: string; messages: number };

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Member", accessor: (m) => m.name, sortable: true },
  {
    id: "messages",
    header: "Messages",
    accessor: (m) => m.messages,
    sortable: true,
    className: "text-right tabular-nums",
  },
];

export function MembersDataTable({
  members,
  onKick,
}: {
  members: Member[];
  onKick: (ids: string[]) => void;
}) {
  return (
    <DataTable
      label="Members"
      data={members}
      columns={columns}
      getRowId={(m) => m.id}
      rowLabel={(m) => m.name}
      defaultSort={{ id: "messages", dir: "descending" }}
      selectable
      toolbar={(selected) =>
        selected.length > 0 && (
          <Button size="sm" variant="destructive" onClick={() => onKick(selected.map((m) => m.id))}>
            Kick {selected.length}
          </Button>
        )
      }
      rowActions={(m) => (
        <DropdownMenuItem variant="destructive" onSelect={() => onKick([m.id])}>
          <Trash2 />
          Kick
        </DropdownMenuItem>
      )}
    />
  );
}`,
		},
	],
	menubar: [
		{
			name: "editor-menubar.tsx",
			code: `"use client";

import { useState } from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function EditorMenubar({ onNew, onExport }: { onNew: () => void; onExport: () => void }) {
  const [sidebar, setSidebar] = useState(true);
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="⌘N" onSelect={onNew}>New clip</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="⌘E" onSelect={onExport}>Export</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
            Show sidebar
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}`,
		},
	],
	attachment: [
		{
			name: "clip-upload.tsx",
			code: `import { FileDropzone } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { uploadClips } from "./actions"; // "use server": (formData) => formData.getAll("clips")

// Picked and dropped files both land in the input, so the Server Action gets them.
export function ClipUpload() {
  return (
    <form action={uploadClips} className="grid gap-3">
      <FileDropzone name="clips" multiple accept="video/*" maxSize={500 * 1024 * 1024} required />
      <Button type="submit">Upload</Button>
    </form>
  );
}`,
		},
		{
			name: "attachments.tsx",
			code: `"use client";

import { Attachment, AttachmentList } from "@/components/ui/attachment";

type File = { id: string; name: string; size: number; type: string; progress?: number };

export function Attachments({ files, onRemove }: { files: File[]; onRemove: (id: string) => void }) {
  return (
    <AttachmentList aria-label="Attachments">
      {files.map((f) => (
        <Attachment
          key={f.id}
          name={f.name}
          size={f.size}
          type={f.type}
          progress={f.progress}
          onRemove={() => onRemove(f.id)}
        />
      ))}
    </AttachmentList>
  );
}`,
		},
	],
	stepper: [
		{
			name: "setup-wizard.tsx",
			code: `import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Stepper, StepperFooter, StepperList, StepperStep } from "@/components/ui/stepper";
import { createBot } from "./actions"; // "use server"

const steps = [
  { value: "server", title: "Server", description: "Where the bot will live." },
  { value: "bot", title: "Bot", description: "How members will see it." },
];

// Server page: steps are plain data and the form posts to a Server Action.
export default function SetupPage() {
  return (
    <Stepper steps={steps} action={createBot}>
      <StepperList />
      <StepperStep value="server">
        <Field label="Server ID" required>
          <Input name="serverId" pattern="[0-9]{17,20}" />
        </Field>
      </StepperStep>
      <StepperStep value="bot">
        <Field label="Display name" required>
          <Input name="botName" maxLength={32} />
        </Field>
      </StepperStep>
      <StepperFooter submitLabel="Create bot" />
    </Stepper>
  );
}`,
		},
	],
	calendar: [
		{
			name: "booking-calendar.tsx",
			code: `"use client";

import { useState } from "react";
import { Calendar, type DateRange } from "@/components/ui/calendar";

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export function BookingCalendar() {
  const [stay, setStay] = useState<DateRange>({});
  return <Calendar mode="range" value={stay} onValueChange={setStay} isDisabled={weekend} />;
}`,
		},
	],
	"date-picker": [
		{
			name: "report-filters.tsx",
			code: `"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";

const today = new Date();
const ago = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);

// Submits period=2026-10-03/2026-10-09 with the form.
export function ReportFilters() {
  return (
    <Field label="Report period">
      <DatePicker
        mode="range"
        name="period"
        max={today}
        presets={[
          { label: "Last 7 days", value: { from: ago(6), to: today } },
          { label: "Last 30 days", value: { from: ago(29), to: today } },
        ]}
      />
    </Field>
  );
}`,
		},
	],
	confirm: [
		{
			name: "delete-project.tsx",
			code: `"use client";

import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export function DeleteProject({ onDelete }: { onDelete: () => Promise<void> }) {
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        const ok = await confirm({
          title: "Delete project?",
          description: "All clips are removed. This cannot be undone.",
          destructive: true,
        });
        if (ok) toast.promise(onDelete(), { loading: "Deleting…", success: "Deleted", error: "Failed" });
      }}
    >
      Delete project
    </Button>
  );
}`,
		},
		{
			name: "use-disclosure.tsx",
			code: `"use client";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useDisclosure } from "@/lib/use-disclosure";

// Open state for any overlay, opened from anywhere.
export function Cart() {
  const cart = useDisclosure();
  return (
    <>
      <Button onClick={cart.show}>Cart</Button>
      <Drawer {...cart.props}>
        <DrawerContent side="right">
          <DrawerTitle>Your cart</DrawerTitle>
        </DrawerContent>
      </Drawer>
    </>
  );
}`,
		},
	],
	chart: [
		{
			name: "revenue-chart.tsx",
			code: `import { Chart } from "@/components/ui/chart";

const revenue = [
  { month: "Jan", web: 4200, app: 2400 },
  { month: "Feb", web: 4600, app: 2900 },
  { month: "Mar", web: 5100, app: 3100 },
  { month: "Apr", web: 4800, app: 3600 },
];

// Server-safe to render: every prop is plain data.
export function RevenueChart() {
  return (
    <Chart
      type="bar"
      stacked
      label="Revenue by channel"
      data={revenue}
      index="month"
      series={[
        { key: "web", label: "Web" },
        { key: "app", label: "App" },
      ]}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
    />
  );
}`,
		},
	],
	carousel: [
		{
			name: "project-gallery.tsx",
			code: `import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Project = { slug: string; title: string; cover: string };

// Slides scroll natively (touch, trackpad, no JS); buttons, dots and drag spring.
export function ProjectGallery({ projects }: { projects: Project[] }) {
  return (
    <Carousel label="Projects">
      <CarouselContent className="sm:[--per-view:2] lg:[--per-view:3]">
        {projects.map((p) => (
          <CarouselItem key={p.slug}>
            <AspectRatio ratio={16 / 9} className="rounded-xl">
              <img src={p.cover} alt={p.title} />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}`,
		},
	],
	marker: [
		{
			name: "transcript-line.tsx",
			code: `import { Highlight, Marker } from "@/components/ui/marker";

export function Pitch() {
  return (
    <p>
      Clips that are <Marker draw>short</Marker> get shared{" "}
      <Marker draw delay={0.3} color="green">
        three times more
      </Marker>
      .
    </p>
  );
}

// Search hits in a transcript line; query can be one term or several.
export function TranscriptLine({ text, query }: { text: string; query: string }) {
  return <Highlight text={text} query={query} />;
}`,
		},
	],
	code: [
		{
			name: "server-snippet.tsx",
			code: `import { Code } from "@/components/ui/code";

const server = \`import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

new Elysia()
  .use(cors())
  .post("/clips", ({ body }) => body, {
    body: t.Object({ title: t.String() }),
  })
  .listen(3000);\`;

export function ServerSnippet() {
  return (
    <Code
      code={server}
      language="ts"
      lineNumbers
      highlight={[[6, 8]]}
      marks={["t.Object", { line: 9, start: 2, end: 15 }]}
      notes={{ 2: "Remember to add it: bun add @elysiajs/cors" }}
    />
  );
}`,
		},
		{
			name: "excerpt.tsx",
			code: `import { Code } from "@/components/ui/code";

// An excerpt from line 42 of a file: numbers, highlights and notes use the shown numbers.
export function Excerpt({ code }: { code: string }) {
  return <Code code={code} language="ts" lineNumbers={42} highlight={[44]} />;
}`,
		},
	],
	terminal: [
		{
			name: "install.tsx",
			code: `import { Terminal } from "@/components/ui/terminal";

// Server-safe props: the lines are plain data. Copy grabs just the commands.
export function Install() {
  return (
    <Terminal
      typing
      lines={[
        { kind: "command", text: "bun add motion lucide-react" },
        { kind: "success", text: "2 packages installed [612ms]" },
      ]}
    />
  );
}`,
		},
		{
			name: "bot-log.tsx",
			code: `"use client";

import { useEffect, useState } from "react";
import { type TerminalLine, Terminal } from "@/components/ui/terminal";

export function BotLog({ url }: { url: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  useEffect(() => {
    const source = new EventSource(url);
    source.onmessage = (e) => setLines((ls) => [...ls, JSON.parse(e.data)].slice(-500));
    return () => source.close();
  }, [url]);
  return <Terminal title="bot.log" log lines={lines} copyText={false} bodyClassName="h-80" />;
}`,
		},
	],
	timeline: [
		{
			name: "changelog.tsx",
			code: `import { GitMerge, Rocket } from "lucide-react";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export function Changelog() {
  return (
    <Timeline>
      <TimelineItem
        icon={<Rocket />}
        variant="active"
        time="Oct 21, 2026"
        dateTime="2026-10-21"
        title="v0.3 released"
      >
        Table, Input OTP, Timeline, Spinner and Aspect ratio.
      </TimelineItem>
      <TimelineItem icon={<GitMerge />} time="Oct 18, 2026" dateTime="2026-10-18" title="Merged #128" />
      <TimelineItem time="Sep 2, 2026" title="Project started" />
    </Timeline>
  );
}`,
		},
	],
	spinner: [
		{
			name: "syncing.tsx",
			code: `import { Spinner } from "@/components/ui/spinner";

export function Syncing() {
  // label="" silences the spinner; the text next to it is the status.
  return (
    <div className="flex items-center gap-2 text-sm">
      <Spinner label="" />
      <span role="status">Syncing 3 servers…</span>
    </div>
  );
}`,
		},
	],
	"input-otp": [
		{
			name: "two-factor.tsx",
			code: `"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { InputOTP } from "@/components/ui/input-otp";

export function TwoFactor({ verify }: { verify: (code: string) => Promise<boolean> }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  return (
    <Field label="Verification code" error={error}>
      <InputOTP
        name="code"
        groups={[3, 3]}
        value={code}
        onValueChange={setCode}
        onComplete={async (v) => {
          if (!(await verify(v))) setError("That code is not right.");
        }}
      />
    </Field>
  );
}`,
		},
	],
	"aspect-ratio": [
		{
			name: "clip-thumb.tsx",
			code: `import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ClipThumb({ src, title }: { src: string; title: string }) {
  return (
    <AspectRatio ratio={9 / 16} className="w-40 rounded-xl border">
      <img src={src} alt={title} />
    </AspectRatio>
  );
}`,
		},
	],
	combobox: [
		{
			name: "channel-picker.tsx",
			code: `"use client";

import { Hash } from "lucide-react";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";

export function ChannelPicker({ channels }: { channels: string[] }) {
  const [channel, setChannel] = useState("");
  return (
    <Field label="Post clips to">
      <Combobox
        name="channel"
        options={channels.map((c) => ({ value: c, label: c, icon: <Hash /> }))}
        value={channel}
        onValueChange={setChannel}
        placeholder="Pick a channel…"
      />
    </Field>
  );
}`,
		},
		{
			name: "role-picker.tsx",
			code: `"use client";

import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";

const roles = [
  { value: "admin", label: "Admin", keywords: ["owner"] },
  { value: "moderator", label: "Moderator", keywords: ["mod"] },
  { value: "member", label: "Member" },
];

export function RolePicker() {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <Combobox
      multiple
      aria-label="Roles"
      options={roles}
      value={picked}
      onValueChange={setPicked}
      placeholder="Add roles…"
    />
  );
}`,
		},
	],
	"tag-input": [
		{
			name: "clip-tags.tsx",
			code: `"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { TagInput } from "@/components/ui/tag-input";

export function ClipTags() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <Field label="Tags" description="Enter or comma to add.">
      <TagInput
        name="tags"
        value={tags}
        onValueChange={setTags}
        max={5}
        validate={(t) => t.length <= 24}
        placeholder="Add a tag…"
      />
    </Field>
  );
}`,
		},
	],
	"scroll-area": [
		{
			name: "mod-log.tsx",
			code: `import { ScrollArea } from "@/components/ui/scroll-area";

export function ModLog({ entries }: { entries: { id: string; text: string }[] }) {
  return (
    <ScrollArea aria-label="Moderation log" className="h-64 rounded-xl border bg-card">
      <ol className="divide-y px-4">
        {entries.map((e) => (
          <li key={e.id} className="py-2.5 text-sm">
            {e.text}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}`,
		},
	],
	resizable: [
		{
			name: "admin-layout.tsx",
			code: `import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function AdminLayout({ nav, log, children }: {
  nav: React.ReactNode;
  log: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ResizablePanelGroup
      className="h-dvh"
      onLayout={(sizes) => {
        document.cookie = \`layout=\${JSON.stringify(sizes)}; path=/\`;
      }}
    >
      <ResizablePanel defaultSize={22} minSize={15} maxSize={40} collapsible>
        {nav}
      </ResizablePanel>
      <ResizableHandle aria-label="Resize navigation" withHandle />
      <ResizablePanel>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>{children}</ResizablePanel>
          <ResizableHandle aria-label="Resize log" />
          <ResizablePanel minSize={15} collapsible>
            {log}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}`,
		},
	],
};
