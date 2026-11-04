import { AccentPicker } from "@/components/ui/accent-picker";

export default function AccentProbe() {
	return (
		<main className="mx-auto grid max-w-xl gap-8 p-4">
			<h1>Accent probes</h1>

			<section data-probe="row" aria-label="Row">
				<AccentPicker />
			</section>

			<section data-probe="folded" aria-label="Folded" className="flex h-14 items-center gap-2">
				<button type="button">Before</button>

				<div className="ml-auto flex items-center gap-2">
					<AccentPicker folded />

					<button type="button">After</button>
				</div>
			</section>

			<p>Nothing to click here.</p>
		</main>
	);
}
