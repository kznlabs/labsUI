import { llmsIndex, plainText } from "@/site/llms";

export const dynamic = "force-static";

export function GET() {
	return plainText(llmsIndex());
}
