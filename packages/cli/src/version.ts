import manifest from "../jsr.json" with { type: "json" };

/** This release, which also pins the bundled components. */
export const VERSION = manifest.version;
