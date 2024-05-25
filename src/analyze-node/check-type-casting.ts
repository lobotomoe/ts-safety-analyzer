import ts from "typescript";
import getLineText from "../get-line-text";
import { Issue } from "../types";

export default function checkTypeCasting(
  node: ts.Node,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Issue | null {
  const fileName = sourceFile.fileName;
  // Check for type casting
  // Checking declarations like `someType as any`
  // Checking declarations like `someType as string`
  if (ts.isAsExpression(node)) {
    const sourceFile = node.getSourceFile();

    const type = checker.getTypeAtLocation(node.type);
    const typeName = checker.typeToString(type); // Getting string representation of the type

    const expressionType = checker.getTypeAtLocation(node.expression);
    const expressionTypeName = checker.typeToString(expressionType);

    const isExpressionAny = expressionType.flags & ts.TypeFlags.Any;

    const isAssignable = checker.isTypeAssignableTo(expressionType, type);

    // Exclude "as const" and "<const>" from the check
    if (
      node.type.kind !== ts.SyntaxKind.TypeReference ||
      node.type.getText() !== "const"
    ) {
      const pos = node.type.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

      if (type.flags & ts.TypeFlags.Any) {
        // Error for type casting to 'any'

        return {
          type: "TYPE_CASTING",
          fileName,
          line,
          character,
          lineText: getLineText(sourceFile, pos),
          message: `UNSAFE type casting to 'any' detected`,
        };
      } else if (type.flags & ts.TypeFlags.Unknown) {
        // Type casting to 'unknown' actually safe
        // But type casting to 'unknown' and then to another type is not safe
        // So we need to check if the inner type is 'unknown' as well
        if (ts.isAsExpression(node.expression)) {
          const innerAsExpression = node.expression;
          const innerType = checker.getTypeAtLocation(innerAsExpression.type);
          const innerTypeName = checker.typeToString(innerType);
          // const innerStart = innerAsExpression.type.getStart(sourceFile);

          return {
            type: "TYPE_CASTING",
            fileName,
            line,
            character,
            lineText: getLineText(sourceFile, pos),
            message: `UNSAFE type casting from 'unknown' to '${innerTypeName}' detected`,
          };
        }
      } else {
        // Error for other type casting

        return {
          type: "TYPE_CASTING",
          fileName,
          line,
          character,
          lineText: getLineText(sourceFile, pos),
          message: `Type casting to '${typeName}' detected. ${
            isAssignable && !isExpressionAny
              ? `(SAFE ${expressionTypeName} is assignable to ${typeName})`
              : `(UNSAFE ${expressionTypeName} is not assignable to ${typeName})`
          }`,
        };
      }
    }
  }

  return null;
}
