import { SourceFile } from "typescript";

export default function getLineText(
  sourceFile: SourceFile,
  pos: number
): string {
  const sourceText = sourceFile.text;
  const { line } = sourceFile.getLineAndCharacterOfPosition(pos);
  const lineStart = sourceFile.getPositionOfLineAndCharacter(line, 0);
  const lineEnd = sourceText.indexOf("\n", lineStart);
  return sourceText.slice(
    lineStart,
    lineEnd !== -1 ? lineEnd : sourceText.length
  );
}
