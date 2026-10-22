# CLAUDE.md

labsUI: shadcn-style primitives + macOS polish. Next 16 App Router · React 19 · Tailwind v4 · motion 14 · lucide-react 1.x. **Bun only.**

## Commands

- `bun dev` · `bun run build` · `bun run typecheck`
- `bun run lint` (Biome) · `bun run format` (Biome autofix)
- `bun run check-dead-code` (Knip). lint + typecheck + knip must pass.

## Rules

- Compose from `@/components/ui/<file>`; never restyle primitives inline when a variant/prop exists. New primitive → `src/components/ui/<kebab>.tsx`, named export, add to `src/lib/registry.ts` + this file.
- `cn()` from `@/lib/utils` for all class merging. Accept `className`, spread rest props.
- Motion: `import … from "motion/react"` only. Use `spring` from `@/lib/utils` (`{type:"spring",stiffness:400,damping:30}`); no duration tweens (except infinite loaders). `<MotionProvider>` (layout) sets default spring + reduced-motion.
- Tokens (shadcn): `background foreground card popover primary secondary muted accent destructive success border input ring` (+`-foreground`), `mac-red|yellow|green`. Radii `rounded-lg/xl/2xl`. Shadows `shadow-xs|sm|md`. No gradients/glows.
- Focus: `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- Dark: `.dark` on `<html>` → `dark:`. `setTheme()` in `@/lib/theme`.
- Server pages: only pass serializable props to client components (icons as elements `<Mail />`). Server-callable helper: `buttonVariants` from `button-variants.ts`.
- `<Toaster />` + `<MotionProvider>` are already mounted in `src/app/layout.tsx`.
- SEO/GEO: semantic tags, one `h1`, `section[aria-labelledby]`→`h2`; registry feeds JSON-LD (`<StructuredData />`) and `/llms.txt`.
- Knip fails on unused exports: don't export internals.

## Registry (`@/components/ui/*`)

```tsx
<Button variant="default|secondary|outline|ghost|destructive" size="sm|default|lg|icon" loading status="idle|loading|success" successLabel="Created!" confirmLabel="Yes, delete" swap="up|down|left|right">Save</Button>
buttonVariants({ variant, size, className })            // button-variants.ts: style <a> etc.
<Badge variant="default|secondary|outline|destructive|success" shape="badge|pill" dot pulse>Live</Badge>
<Input id="e" type="email" aria-invalid={err} />         // input.tsx
<Textarea className="max-h-40" />                         // auto-grows
<Label htmlFor="e">Email</Label>
<Switch checked={on} onCheckedChange={setOn} />           // or defaultChecked
<Card glass?><CardHeader><CardTitle/><CardDescription/></CardHeader><CardContent/><CardFooter/></Card>
<Avatar src={url} alt="Jane Doe" fallback={<Bot />} status="online|away|busy|offline" size="sm|default|lg" />
<Accordion type="single|multiple" collapsible defaultValue="a"><AccordionItem value="a"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>
<MessageBubble from="user|assistant" avatar={<Avatar …/>} name time streaming><p>…</p><Code code={s} language="tsx" /></MessageBubble>
<Dialog open? onOpenChange?><DialogTrigger variant="outline">Open</DialogTrigger><DialogContent showClose?><DialogHeader><DialogTitle/><DialogDescription/></DialogHeader>…<DialogFooter><DialogClose>Cancel</DialogClose></DialogFooter></DialogContent></Dialog>
toast("Title", { description, action: { label, onClick }, duration }); toast.success|error|info(…); toast.dismiss(id?)
<MacWindow title="App" header={<nav/>} actions={<Button/>} onClose onMinimize onMaximize glass bodyClassName="p-5">…</MacWindow>
<ThemeToggle />
{enabled && <CustomCursor />}                             // opt-in; auto-off on touch/reduced-motion
<CountTo to={48290} prefix="$" />                       // springs up once in view
<Reveal delay={0.1}><Card>…</Card></Reveal>               // fades + rises on scroll
<AvatarGroup users={team} max={4} size="lg" />               // overlapping, +N chip, hover spring
<Quote variant="card" author="Jane Doe" subtitle="Design lead" avatar={<Avatar … />} typewriter textSwap={[…]}>…</Quote>
<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Page</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
<ButtonGroup orientation="horizontal|vertical" attached><Button>A</Button><Button>B</Button></ButtonGroup>
<Typewriter text={["Hello", "World"]} speed={40} deleteSpeed={24} loop cursor />
<TextSwap items={["Phrase 1", "Phrase 2"]} interval={3000} direction="up|down|fade" />
<StructuredData />                                         // @/components/seo/structured-data
```
