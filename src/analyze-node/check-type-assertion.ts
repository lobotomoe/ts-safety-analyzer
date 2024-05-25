import ts from "typescript";
import getLineText from "../get-line-text";
import { Issue } from "../types";

export default function checkTypeAssertion(
  node: ts.Node,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Issue | null {
  const fileName = sourceFile.fileName;
  // Check for type assertion
  // Checking declarations like `(<any>mixedType).process();`
  if (ts.isTypeAssertionExpression(node)) {
    const type = checker.getTypeAtLocation(node.type);
    if (type.flags & ts.TypeFlags.Any) {
      const pos = node.type.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

      return {
        type: "TYPE_ASSERTION",
        fileName,
        line,
        character,
        lineText: getLineText(sourceFile, pos),
        message: `UNSAFE type assertion to 'any' detected`,
      };
    }
  }

  return null;
}
