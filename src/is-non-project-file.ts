import ts from "typescript";

export default function isNonProjectFile(
  sourceFile: ts.SourceFile,
  program: ts.Program
): boolean {
  return (
    sourceFile.isDeclarationFile ||
    program.isSourceFileFromExternalLibrary(sourceFile)
  );
}
