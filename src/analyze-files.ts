import ts from "typescript";
import analyzeFile from "./analyze-file";
import { Issue } from "./types";
import isNonProjectFile from "./is-non-project-file";

function analyzeFiles(files: string[], tsConfigPath: string) {
  const program = ts.createProgram(files, { configFilePath: tsConfigPath });
  const checker = program.getTypeChecker();

  let totalLines = 0;
  const issues: Issue[] = [];
  let skippedFiles = 0;

  for (const sourceFile of program.getSourceFiles()) {
    if (isNonProjectFile(sourceFile, program)) {
      // Skip declaration files and files from external libraries
      skippedFiles++;
      continue;
    }
    const fileIssues = analyzeFile(sourceFile, checker);
    totalLines += sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line;
    issues.push(...fileIssues);
  }

  return {
    totalLines,
    issues,
    skippedFiles,
  };
}

export default analyzeFiles;
