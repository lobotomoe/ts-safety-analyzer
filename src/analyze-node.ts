import ts from "typescript";
import logError from "./log-error";
import getLineText from "./get-line-text";

const TS_IGNORE = "@ts-ignore";
const TS_EXPECT_ERROR = "@ts-expect-error";

function analyzeNode(node: ts.Node, checker: ts.TypeChecker): void {
  const sourceFile = node.getSourceFile();
  const nodeText = node.getFullText();
  const fileName = sourceFile.fileName;

  // Check for usage of 'any' type
  if (ts.isVariableDeclaration(node)) {
    if (node.type) {
      // Check for explicit 'any' type
      const type = checker.getTypeAtLocation(node.type);
      if (type.flags & ts.TypeFlags.Any) {
        const pos = node.type.getFullStart();
        const { line, character } =
          sourceFile.getLineAndCharacterOfPosition(pos);
        logError(
          fileName,
          line,
          character,
          getLineText(sourceFile, pos),
          `UNSAFE usage of 'any' type detected`
        );
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

  // Check for type assertion
  // Checking declarations like `(<any>mixedType).process();`
  if (ts.isTypeAssertionExpression(node)) {
    const type = checker.getTypeAtLocation(node.type);
    if (type.flags & ts.TypeFlags.Any) {
      const pos = node.type.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

      logError(
        fileName,
        line,
        character,
        getLineText(sourceFile, pos),
        `UNSAFE type assertion to 'any' detected`
      );
    }
  }

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
        logError(
          fileName,
          line,
          character,
          getLineText(sourceFile, pos),
          `UNSAFE type casting to 'any' detected`
        );
      } else if (type.flags & ts.TypeFlags.Unknown) {
        // Type casting to 'unknown' actually safe
        // But type casting to 'unknown' and then to another type is not safe
        // So we need to check if the inner type is 'unknown' as well
        if (ts.isAsExpression(node.expression)) {
          const innerAsExpression = node.expression;
          const innerType = checker.getTypeAtLocation(innerAsExpression.type);
          const innerTypeName = checker.typeToString(innerType);
          // const innerStart = innerAsExpression.type.getStart(sourceFile);

          logError(
            fileName,
            line,
            character,
            getLineText(sourceFile, pos),
            `UNSAFE type casting from 'unknown' to '${innerTypeName}' detected`
          );
        }
      } else {
        // Error for other type casting
        logError(
          fileName,
          line,
          character,
          getLineText(sourceFile, pos),
          `Type casting to '${typeName}' detected. ${
            isAssignable && !isExpressionAny
              ? `(SAFE ${expressionTypeName} is assignable to ${typeName})`
              : `(UNSAFE ${expressionTypeName} is not assignable to ${typeName})`
          }`
        );
      }
    }
  }

  // Check for non-null assertion
  if (ts.isNonNullExpression(node)) {
    const pos = node.expression.getFullStart();
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    logError(
      fileName,
      line,
      character,
      getLineText(sourceFile, pos),
      `Non-null assertion detected`
    );
  }

  const isChildrenCount = node.getChildCount();

  // Check for compiler directives
  // See only the leaf nodes
  if (isChildrenCount === 0) {
    if (nodeText.includes(TS_IGNORE)) {
      const pos = node.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
      logError(
        fileName,
        line,
        character,
        getLineText(sourceFile, node.getStart()),
        `Compiler directive '${TS_IGNORE}' detected`
      );
    }

    if (nodeText.includes(TS_EXPECT_ERROR)) {
      const pos = node.getFullStart();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
      logError(
        fileName,
        line,
        character,
        getLineText(sourceFile, node.getStart()),
        `Compiler directive '${TS_EXPECT_ERROR}' detected`
      );
    }
  }

  // Recursively visit all children of the current node
  ts.forEachChild(node, (child) => analyzeNode(child, checker));
}

export default analyzeNode;
