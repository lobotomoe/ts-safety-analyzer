const a: any = "any"; // Any type
let b: any; // Any type

const c = a + b; // Inferred any
const d = 5 as any; // Type casting

const e = {} as unknown as { cool: string }; // Type assertion

const f: string | null = "hello";
const g = f!; // Non-null assertion

// @ts-expect-error Compiler error
const h: string = { a: "hello" };

// @ts-ignore Ignore error
const i: number = { a: "hello" };
