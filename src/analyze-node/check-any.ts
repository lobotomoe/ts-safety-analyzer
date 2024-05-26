import ts from "typescript";
import getLineText from "../get-line-text";
import { Issue } from "../types";

// Check for usage of 'any' type
export default function checkAny(
  node: ts.Node,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Issue | null {
  const fileName = sourceFile.fileName;

  if (ts.isVariableDeclaration(node)) {
    if (node.type) {
      // Check for explicit 'any' type
      const type = checker.getTypeAtLocation(node.type);
      if (type.flags & ts.TypeFlags.Any) {
        const pos = node.type.getFullStart();
        const { line, character } =
          sourceFile.getLineAndCharacterOfPosition(pos);
        return {
          type: "ANY_TYPE",
          fileName,
          line,
          character,
          lineText: getLineText(sourceFile, pos),
          message: `Usage of 'any' type detected`,
        };
      }
    } else {
      // Check for inferred 'any' type
      // const type = checker.getTypeAtLocation(node.name);
      // if (type.flags & ts.TypeFlags.Any) {
      //   const pos = node.name.getFullStart();
      //   const { line, character } =
      //     sourceFile.getLineAndCharacterOfPosition(pos);
      //   logError(
      //     fileName,
      //     line,
      //     character,
      //     getLineText(sourceFile, pos),
      //     `Inferred 'any' type detected`
      //   );
      // }
    }
  }

  return null;
}
