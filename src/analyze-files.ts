import ts from "typescript";
import analyzeFile from "./analyze-file";

async function analyzeFiles(
  files: string[],
  tsConfigPath: string
): Promise<void> {
  const program = ts.createProgram(files, { configFilePath: tsConfigPath });
  const checker = program.getTypeChecker();

  for (const sourceFile of program.getSourceFiles()) {
    analyzeFile(sourceFile, checker);
  }
}

export default analyzeFiles;
