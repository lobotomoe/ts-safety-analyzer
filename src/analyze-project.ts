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
  const absoluteTSConfigPath = path.resolve(absoluteProjectDir, configPath);

  const tsConfig = ts.readConfigFile(absoluteTSConfigPath, ts.sys.readFile);
  if (tsConfig.error) {
    throw new Error(`Failed to read tsconfig: ${tsConfig.error.messageText}`);
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
    const messages = errors.map((error) => error.messageText);
    throw new Error(`Failed to parse tsconfig: ${messages.join("\n")}`);
  }

  if (fileNames.length === 0) {
    throw new Error("No files to analyze");
  }

  // Already here we can do some basic analysis of the project
  // 1. Is `strict` enabled?
  // 2. Is `noImplicitAny` enabled?
  // 3. Is `strictNullChecks` enabled?
  // 4. Is JS allowed in the project?

  const isStrictEnabled = options.strict ?? false;
  const isNoImplicitAnyEnabled =
    options.noImplicitAny ?? isStrictEnabled ?? false;
  const isStrictNullChecksEnabled =
    options.strictNullChecks ?? isStrictEnabled ?? false;

  const isJSAllowed = options.allowJs ?? false;
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
    absoluteProjectDir,
    absoluteTSConfigPath,
    compiler: {
      isStrictEnabled,
      isNoImplicitAnyEnabled,
      isStrictNullChecksEnabled,
      isJSAllowed,
    },
    totalLines,
    issues,
    skippedFiles,
    score,
  };
}
