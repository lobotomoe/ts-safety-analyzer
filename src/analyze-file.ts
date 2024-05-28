import ts from "typescript";
import analyzeNode from "./analyze-node";
import { Issue } from "./types";

export default function analyzeFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Issue[] {
  // Recursively visit all children of the current node

  const issues: Map<string, Issue> = new Map();

  ts.forEachChild(sourceFile, (node) => {
    const nodeIssues = analyzeNode(node, sourceFile, checker);
    nodeIssues.forEach((issue, hash) => {
      issues.set(hash, issue);
    });
  });

  const issuesArray = Array.from(issues.values());

  return issuesArray;
}
