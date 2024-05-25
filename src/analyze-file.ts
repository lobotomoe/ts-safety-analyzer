import ts from "typescript";
import analyzeNode from "./analyze-node";
import { Issue } from "./types";

export default function analyzeFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Issue[] {
  // Recursively visit all children of the current node

  let issues: Issue[] = [];

  ts.forEachChild(sourceFile, (node) => {
    const nodeIssues = analyzeNode(node, sourceFile, checker);
    issues = issues.concat(nodeIssues);
  });

  return issues;
}
