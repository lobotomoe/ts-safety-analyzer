import ts from "typescript";
import getLineText from "../get-line-text";
import { Issue } from "../types";

const TS_IGNORE = "@ts-ignore";
const TS_EXPECT_ERROR = "@ts-expect-error";

export default function checkCompilerDirectives(
  node: ts.Node,
  sourceFile: ts.SourceFile
): Issue | null {
  const isChildrenCount = node.getChildCount();

  // Check for compiler directives
  // See only the leaf nodes
  if (isChildrenCount === 0) {
    const nodeText = node.getFullText();
    const fileName = sourceFile.fileName;

    if (nodeText.includes(TS_IGNORE)) {
      const pos = node.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

      return {
        type: "COMPILER_DIRECTIVE",
        fileName,
        line,
        character,
        lineText: getLineText(sourceFile, pos),
        message: `Compiler directive '${TS_IGNORE}' detected`,
      };
    }

    if (nodeText.includes(TS_EXPECT_ERROR)) {
      const pos = node.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

      return {
        type: "COMPILER_DIRECTIVE",
        fileName,
        line,
        character,
        lineText: getLineText(sourceFile, pos),
        message: `Compiler directive '${TS_EXPECT_ERROR}' detected`,
      };
    }
  }

  return null;
}
