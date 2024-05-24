import analyzeProject from "./analyze-project";

async function main() {
  const projectDir = process.argv[2] ?? process.cwd();
  await analyzeProject(projectDir);
}

main().catch((err) => {
  console.error("Error during analysis:", err);
  process.exit(1);
});
