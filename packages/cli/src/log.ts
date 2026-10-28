const color = (code: number) => (text: string) =>
	process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${code}m${text}\x1b[0m` : text;

export const dim = color(2);
export const green = color(32);
export const yellow = color(33);
export const red = color(31);
export const bold = color(1);

/** An expected failure: printed as one line, without a stack trace. */
export class CliError extends Error {}
