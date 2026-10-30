"use client";

import { type ReactNode, useState } from "react";
import { FileDropzone } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rating } from "@/components/ui/rating";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Stepper, StepperFooter, StepperStep } from "@/components/ui/stepper";
import { TagInput } from "@/components/ui/tag-input";

const options = [
	{ value: "alpha", label: "Alpha" },
	{ value: "beta", label: "Beta" },
];

const entries = (form: HTMLFormElement) =>
	JSON.stringify(
		[...new FormData(form)].map(([key, value]) => [
			key,
			typeof value === "string" ? value : value.name,
		]),
	);

function Probe({ id, children }: { id: string; children: ReactNode }) {
	const [sent, setSent] = useState("");
	const [count, setCount] = useState(0);

	return (
		<form
			id={id}
			aria-label={id}
			onSubmit={(event) => {
				event.preventDefault();
				setSent(entries(event.currentTarget));
				setCount((total) => total + 1);
			}}
			className="grid gap-3 rounded-xl border bg-card p-4"
		>
			{children}

			<button type="submit">Submit</button>

			<output data-count={count}>{sent}</output>
		</form>
	);
}

export default function FormsProbe() {
	return (
		<main className="mx-auto grid max-w-xl gap-4 p-4">
			<h1>Form probes</h1>

			<Probe id="tags-required">
				<TagInput name="tags" required aria-label="Tags" />
			</Probe>

			<Probe id="tags-validate">
				<TagInput validate={(tag) => tag.length <= 5} aria-label="Short tags" />
			</Probe>

			<Probe id="button-loading">
				<Input name="query" aria-label="Query" />

				<Button type="submit" loading>
					Send
				</Button>
			</Probe>

			<Probe id="button-pending">
				<Button type="submit" onClick={() => new Promise((done) => setTimeout(done, 1000))}>
					Send
				</Button>
			</Probe>

			<Probe id="combobox-multiple">
				<Combobox name="many" multiple options={options} aria-label="Channels" />
			</Probe>

			<Probe id="tags-disabled">
				<TagInput name="tags" defaultValue={["alpha"]} disabled aria-label="Tags" />
			</Probe>

			<Probe id="rating-required">
				<Rating name="rating" required />
			</Probe>

			<Probe id="rating-disabled">
				<Rating name="rating" defaultValue={3} disabled />
			</Probe>

			<Probe id="slider">
				<Slider name="volume" defaultValue={[30]} labels={["Volume"]} />

				<Slider name="price" defaultValue={[10, 90]} />
			</Probe>

			<Probe id="slider-disabled">
				<Slider name="volume" defaultValue={[30]} labels={["Volume"]} disabled />
			</Probe>

			<Probe id="otp-required">
				<InputOTP name="code" required aria-label="Code" />
			</Probe>

			<Probe id="otp-disabled">
				<InputOTP name="code" defaultValue="123456" disabled aria-label="Code" />
			</Probe>

			<Probe id="file-required">
				<FileDropzone name="file" required />
			</Probe>

			<Probe id="file-disabled">
				<FileDropzone name="file" disabled />
			</Probe>

			<Probe id="radio-required">
				<RadioGroup legend="Plan" name="plan" required>
					<RadioGroupItem value="free">Free</RadioGroupItem>

					<RadioGroupItem value="pro">Pro</RadioGroupItem>
				</RadioGroup>
			</Probe>

			<Probe id="pickers-disabled">
				<Select name="select" options={options} defaultValue="alpha" disabled aria-label="Select" />

				<Combobox
					name="combobox"
					options={options}
					defaultValue="alpha"
					disabled
					aria-label="Combobox"
				/>

				<Combobox
					name="many"
					multiple
					options={options}
					defaultValue={["alpha", "beta"]}
					disabled
					aria-label="Many"
				/>

				<DatePicker name="date" defaultValue={new Date(2026, 9, 21)} disabled aria-label="Date" />
			</Probe>

			<StepperProbe />

			<Stepper
				id="stepper-guard"
				aria-label="stepper-guard"
				steps={[
					{ value: "check", title: "Check" },
					{ value: "done", title: "Done" },
				]}
			>
				<StepperStep
					value="check"
					onNext={() => new Promise((done) => setTimeout(() => done(false), 300))}
				>
					<input name="guarded" aria-label="Guarded" />
				</StepperStep>

				<StepperStep value="done">
					<input name="after" aria-label="After" />
				</StepperStep>

				<StepperFooter />
			</Stepper>
		</main>
	);
}

function StepperProbe() {
	const [sent, setSent] = useState("");

	return (
		<Stepper
			id="stepper"
			aria-label="stepper"
			steps={[
				{ value: "account", title: "Account" },
				{ value: "plan", title: "Plan" },
			]}
			onSubmit={(event) => {
				event.preventDefault();
				setSent(entries(event.currentTarget));
			}}
		>
			<StepperStep value="account">
				<input name="email" type="email" required aria-label="Email" />
			</StepperStep>

			<StepperStep value="plan">
				<Select name="plan" options={options} required aria-label="Plan" />
			</StepperStep>

			<StepperFooter />

			<output>{sent}</output>
		</Stepper>
	);
}
