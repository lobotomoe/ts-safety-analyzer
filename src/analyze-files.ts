import ts from "typescript";
import analyzeFile from "./analyze-file";
import { Issue } from "./types";
import logError from "./log-error";

function isNonProjectFile(
  sourceFile: ts.SourceFile,
  program: ts.Program
): boolean {
  return (
    sourceFile.isDeclarationFile ||
    program.isSourceFileFromExternalLibrary(sourceFile)
  );
}

async function analyzeFiles(
  files: string[],
  tsConfigPath: string,
  isLogEnabled: boolean
): Promise<void> {
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

  if (isLogEnabled) {
    issues.forEach((issue) => {
      logError(issue);
    });
  }

  console.log(`Total lines: ${totalLines}`);
  console.log(`Total issues: ${issues.length}`);
  console.log(`Skipped files: ${skippedFiles}`);
}

export default analyzeFiles;
