import { Issue } from "./types";

export default function log({
  fileName,
  line,
  character,
  lineText,
  message,
}: Issue): void {
  console.error(`[UNSAFE] ${message}`);
  console.error(`File: ${fileName}:${line + 1}:${character + 1}`);
  console.error(`Line content: ${lineText.trim()}`);
  console.error(`\n`);
}
