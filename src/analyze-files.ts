import ts from "typescript";
import analyzeFile from "./analyze-file";
import { Issue } from "./types";
import logError from "./log-error";

async function analyzeFiles(
  files: string[],
  tsConfigPath: string,
  isLogEnabled = false
): Promise<void> {
  const program = ts.createProgram(files, { configFilePath: tsConfigPath });
  const checker = program.getTypeChecker();

  let totalLines = 0;
  const issues: Issue[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    const fileIssues = analyzeFile(sourceFile, checker);
    totalLines += sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line;
    issues.push(...fileIssues);
  }

  if (isLogEnabled) {
    issues.forEach((issue) => {
      logError(issue);
    });
  }

  console.log(`Total lines: ${totalLines}`);
  console.log(`Total issues: ${issues.length}`);
}

export default analyzeFiles;
