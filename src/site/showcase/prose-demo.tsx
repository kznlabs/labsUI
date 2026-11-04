"use client";

import type { MouseEvent } from "react";
import { Prose } from "@/components/ui/prose";
import { toast } from "@/components/ui/toast";
import { withBase } from "@/site/config";

const stub = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
	event.preventDefault();
	toast(`Demo mode: would open ${href}`);
};

export function ProseDemo() {
	return (
		<Prose as="article" className="w-full">
			<h2>Keeping clips after a match</h2>

			<p>
				Acme records the last two minutes of every match, then uploads in the background. Read the{" "}
				<a href="/docs/recording" onClick={stub("/docs/recording")}>
					recording guide
				</a>{" "}
				first, or set <code>retention</code> and move on. <strong>Clips stay on your server</strong>{" "}
				until you <mark>delete them yourself</mark>.
			</p>

			<h3>Before you start</h3>

			<ul>
				<li>A server with 20 GB free</li>

				<li>
					A bot token, with these scopes:
					<ul>
						<li>
							<code>clips.write</code>
						</li>

						<li>
							<code>members.read</code>
						</li>
					</ul>
				</li>

				<li>Ten minutes</li>
			</ul>

			<h3>Start recording</h3>

			<ol>
				<li>Install the agent on the machine that hosts the match.</li>

				<li>Run the command below, with your own server name.</li>

				<li>Play one round, then open the clips page.</li>
			</ol>

			<pre>
				<code>
					acme clips record --server eu-central-tournament-01 --bitrate 8000 --retention 30d
					--output ./clips/tournament
				</code>
			</pre>

			<blockquote>
				<p>We stopped asking who saved the replay. Everybody has it by the time the round ends.</p>
			</blockquote>

			<h3>Retention by region</h3>

			<table>
				<caption>Sample limits for each region</caption>

				<thead>
					<tr>
						<th scope="col">Region</th>

						<th scope="col">Latency</th>

						<th scope="col">Bitrate</th>

						<th scope="col">Retention</th>

						<th scope="col">Clips per match</th>

						<th scope="col">Upload window</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						<td>Central Europe</td>

						<td>18 ms</td>

						<td>8000 kbps</td>

						<td>30 days</td>

						<td>12</td>

						<td>During the match</td>
					</tr>

					<tr>
						<td>North America East</td>

						<td>31 ms</td>

						<td>6000 kbps</td>

						<td>14 days</td>

						<td>8</td>

						<td>After the match</td>
					</tr>
				</tbody>
			</table>

			<hr />

			<figure>
				{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
				<img
					src={withBase("/og.png")}
					alt="The labsUI link preview card"
					width={1200}
					height={630}
				/>

				<figcaption>Images and captions fit the column.</figcaption>
			</figure>
		</Prose>
	);
}
