import ts from "typescript";
import checkAny from "./check-any";
import checkTypeAssertion from "./check-type-assertion";
import checkTypeCasting from "./check-type-casting";
import checkNonNullAssertion from "./check-non-null-assertion";
import checkCompilerDirectives from "./check-compiler-directives";
import { Issue } from "../types";

function analyzeNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Issue[] {
  const issues: Issue[] = [];

  const checkAnyResult = checkAny(node, checker, sourceFile);
  if (checkAnyResult) {
    issues.push(checkAnyResult);
  }
  const checkTypeAssertionResult = checkTypeAssertion(
    node,
    checker,
    sourceFile
  );
  if (checkTypeAssertionResult) {
    issues.push(checkTypeAssertionResult);
  }
  const checkTypeCastingResult = checkTypeCasting(node, checker, sourceFile);
  if (checkTypeCastingResult) {
    issues.push(checkTypeCastingResult);
  }
  const checkNonNullAssertionResult = checkNonNullAssertion(node, sourceFile);
  if (checkNonNullAssertionResult) {
    issues.push(checkNonNullAssertionResult);
  }
  const checkCompilerDirectivesResult = checkCompilerDirectives(
    node,
    sourceFile
  );
  if (checkCompilerDirectivesResult) {
    issues.push(checkCompilerDirectivesResult);
  }

  let childrenIssues: Issue[] = [];

  ts.forEachChild(node, (child) => {
    const childIssues = analyzeNode(child, sourceFile, checker);
    childrenIssues = issues.concat(childIssues);
  });

  issues.push(...childrenIssues);

  return issues;
}

export default analyzeNode;
