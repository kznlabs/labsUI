import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button-variants";
import { demoPath, site } from "@/site/config";
import { CommunityGoal, GoalTeaser, RecentPurchases, ServerStatus, TopBuyers } from "./community";
import { CosmeticBrowser } from "./cosmetics";
import { OrderPanel } from "./order";
import { RankShop } from "./ranks";
import { server } from "./store";

const description =
	"A reference build of the game item shop recipe: ranks by duration, cosmetics by category, a nickname check, payment options, server status, a community goal and top buyers.";
const url = `${site.url}${demoPath("game-shop")}`;

export const metadata: Metadata = {
	title: "Game item shop demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Game item shop demo · ${site.name}`, description },
};

function SectionHeading({ id, title, children }: { id: string; title: string; children: string }) {
	return (
		<div className="mb-6 max-w-2xl">
			<h2 id={id} className="font-semibold text-2xl tracking-tight">
				{title}
			</h2>

			<p className="mt-2 text-muted-foreground">{children}</p>
		</div>
	);
}

export default function GameShopDemo() {
	return (
		<>
			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<header className="max-w-2xl lg:py-6">
					<p className="font-medium text-muted-foreground text-sm">{server.name} store</p>

					<h1 className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-5xl">
						Look the part. Keep the lights on.
					</h1>

					<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
						Ranks and cosmetics for {server.name}, a survival server run by players. Everything here
						is for looks or comfort; nothing sold changes a fight. Items arrive on your next login.
					</p>

					<div className="mt-6 flex flex-wrap gap-3">
						<a href="#ranks" className={buttonVariants({ size: "lg" })}>
							See ranks
						</a>

						<a href="#cosmetics" className={buttonVariants({ variant: "outline", size: "lg" })}>
							Browse cosmetics
						</a>
					</div>

					<GoalTeaser />
				</header>

				<section id="status" aria-label="Server" className="scroll-mt-32">
					<ServerStatus />
				</section>
			</div>

			<div className="mt-16 grid scroll-mt-32 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="flex min-w-0 flex-col gap-20">
					<section aria-labelledby="ranks" className="scroll-mt-32">
						<SectionHeading id="ranks" title="Ranks">
							Pick a rank for 30 days, 90 days or for good. The longer, the less per day.
						</SectionHeading>

						<RankShop />
					</section>

					<section aria-labelledby="cosmetics" className="scroll-mt-32">
						<SectionHeading id="cosmetics" title="Cosmetics">
							Trails, pets, hats and emotes. Look-only: they never change gameplay.
						</SectionHeading>

						<CosmeticBrowser />
					</section>

					<section aria-labelledby="community" className="scroll-mt-32">
						<SectionHeading id="community" title="Community">
							Every order counts towards the season's goal. Place an order and watch the bar move.
						</SectionHeading>

						<div className="flex flex-col gap-5">
							<CommunityGoal />

							<div id="top-buyers" className="grid scroll-mt-32 gap-5 xl:grid-cols-2">
								<TopBuyers />

								<RecentPurchases />
							</div>
						</div>
					</section>
				</div>

				<OrderPanel />
			</div>
		</>
	);
}
