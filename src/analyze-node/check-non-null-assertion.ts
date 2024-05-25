import ts from "typescript";
import getLineText from "../get-line-text";
import { Issue } from "../types";

export default function checkNonNullAssertion(
  node: ts.Node,
  sourceFile: ts.SourceFile
): Issue | null {
  const fileName = sourceFile.fileName;
  // Check for non-null assertion
  if (ts.isNonNullExpression(node)) {
    const pos = node.expression.getFullStart();
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

    return {
      type: "NON_NULL_ASSERTION",
      fileName,
      line,
      character,
      lineText: getLineText(sourceFile, pos),
      message: `Non-null assertion detected`,
    };
  }

  return null;
}
