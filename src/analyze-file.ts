import ts from "typescript";
import analyzeNode from "./analyze-node";

export default function analyzeFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): void {
  // Recursively visit all children of the current node
  ts.forEachChild(sourceFile, (node) => {
    analyzeNode(node, checker);
  });
}
