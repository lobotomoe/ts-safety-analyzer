export default function logError(
  fileName: string,
  line: number,
  character: number,
  lineText: string,
  message: string
): void {
  console.error(`[Error] ${message}`);
  console.error(`File: ${fileName}:${line + 1}:${character + 1}`);
  console.error(`Line content: ${lineText.trim()}`);
  console.error(`\n`);
}
