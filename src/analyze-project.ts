import path from "path";
import ts from "typescript";
import analyzeFiles from "./analyze-files";
import log from "./log";
import { MAX_SCORE } from "./constants";

const DEFAULT_TS_CONFIG_NAME = "tsconfig.json";
const EXCLUDE_EXTENSIONS = [".d.ts", ".json", ".js", ".jsx", ".mjs", ".cjs"];
const TEST_FILE_SUFFIXES = [".test.ts", ".test-d.ts"];
const EXCLUDE_DIRS = ["tests", "examples"];
const EXCLUDE_FILES = [
  "webpack.config.js",
  "rollup.config.js",
  "jest.config.js",
];

export default function analyzeProject(
  projectDir: string,
  configPath = DEFAULT_TS_CONFIG_NAME,
  isLogEnabled = false
) {
  const absoluteProjectDir = path.resolve(projectDir);
  console.log(`Analyzing TypeScript project at ${absoluteProjectDir}`);
  const absoluteTSConfigPath = path.resolve(absoluteProjectDir, configPath);
  console.log(`Using tsconfig at ${absoluteTSConfigPath}`);

  const tsConfig = ts.readConfigFile(absoluteTSConfigPath, ts.sys.readFile);
  if (tsConfig.error) {
    console.error(`Failed to read tsconfig: ${tsConfig.error.messageText}`);
    return;
  }

  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true,
  };
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    tsConfig.config,
    parseConfigHost,
    absoluteProjectDir
  );

  const { fileNames, errors, options } = parsedCommandLine;

  if (errors.length > 0) {
    console.error("Failed to parse tsconfig:");
    errors.forEach((error) => {
      console.error(error.messageText);
    });
    return;
  }

  if (fileNames.length === 0) {
    console.log("No files to analyze");
    return;
  }

  // Already here we can do some basic analysis of the project
  // 1. Is `strict` enabled?
  // 2. Is `noImplicitAny` enabled?
  // 3. Is `strictNullChecks` enabled?
  // 4. Is JS allowed in the project?

  const isStrictEnabled = options.strict ?? false;
  if (!isStrictEnabled) {
    console.error(`!!! 'strict' is not enabled in tsconfig !!!`);
  }
  const isNoImplicitAnyEnabled =
    options.noImplicitAny ?? isStrictEnabled ?? false;
  if (!isNoImplicitAnyEnabled) {
    console.error(`!!! 'noImplicitAny' is not enabled in tsconfig !!!`);
  }
  const isStrictNullChecksEnabled =
    options.strictNullChecks ?? isStrictEnabled ?? false;
  if (!isStrictNullChecksEnabled) {
    console.error(`!!! 'strictNullChecks' is not enabled in tsconfig !!!`);
  }

  const isJSAllowed = options.allowJs ?? false;
  if (isJSAllowed) {
    console.error(`!!! 'allowJs' is enabled in tsconfig !!!`);
  }

  // Exclude test files and other unnecessary files from analysis
  const files = fileNames.filter((fileName) => {
    const ext = path.extname(fileName);
    if (EXCLUDE_EXTENSIONS.includes(ext)) {
      return false;
    }
    const isTestFile = TEST_FILE_SUFFIXES.some((suffix) =>
      fileName.endsWith(suffix)
    );
    if (isTestFile) {
      return false;
    }
    const isExcludedDir = EXCLUDE_DIRS.some((dir) =>
      fileName.split(path.sep).includes(dir)
    );
    if (isExcludedDir) {
      return false;
    }
    const isExcludedFile = EXCLUDE_FILES.some((file) =>
      fileName.endsWith(file)
    );
    return !isExcludedFile;
  });

  const { issues, skippedFiles, totalLines } = analyzeFiles(
    files,
    absoluteTSConfigPath
  );

  if (isLogEnabled) {
    issues.forEach((issue) => {
      log(issue);
    });
  }

  const score = Math.max(
    MAX_SCORE - (issues.length / totalLines) * MAX_SCORE,
    0
  );

  return {
    totalLines,
    issues,
    skippedFiles,
    score,
  };
}
