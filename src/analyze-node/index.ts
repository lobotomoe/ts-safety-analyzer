import ts from "typescript";
import checkAny from "./check-any";
import checkTypeAssertion from "./check-type-assertion";
import checkTypeCasting from "./check-type-casting";
import checkNonNullAssertion from "./check-non-null-assertion";
import checkCompilerDirectives from "./check-compiler-directives";
import { Issue } from "../types";
import hashIssue from "../hash-issue";

function analyzeNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Map<string, Issue> {
  const issues = new Map<string, Issue>();

  const checkAnyResult = checkAny(node, checker, sourceFile);
  if (checkAnyResult) {
    const hash = hashIssue(checkAnyResult);
    issues.set(hash, checkAnyResult);
  }
  const checkTypeAssertionResult = checkTypeAssertion(
    node,
    checker,
    sourceFile
  );
  if (checkTypeAssertionResult) {
    const hash = hashIssue(checkTypeAssertionResult);
    issues.set(hash, checkTypeAssertionResult);
  }
  const checkTypeCastingResult = checkTypeCasting(node, checker, sourceFile);
  if (checkTypeCastingResult) {
    const hash = hashIssue(checkTypeCastingResult);
    issues.set(hash, checkTypeCastingResult);
  }
  const checkNonNullAssertionResult = checkNonNullAssertion(node, sourceFile);
  if (checkNonNullAssertionResult) {
    const hash = hashIssue(checkNonNullAssertionResult);
    issues.set(hash, checkNonNullAssertionResult);
  }
  const checkCompilerDirectivesResult = checkCompilerDirectives(
    node,
    sourceFile
  );
  if (checkCompilerDirectivesResult) {
    const hash = hashIssue(checkCompilerDirectivesResult);
    issues.set(hash, checkCompilerDirectivesResult);
  }

  ts.forEachChild(node, (child) => {
    const childIssues = analyzeNode(child, sourceFile, checker);
    childIssues.forEach((childIssue) => {
      const hash = hashIssue(childIssue);
      issues.set(hash, childIssue);
    });
  });

  return issues;
}

export default analyzeNode;
