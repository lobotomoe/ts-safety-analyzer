# TS Safety Analyzer

> [!WARNING]
> This tool is still in development and may not work as expected !!!

## Installation

```bash
npm i -g tssa
```

## Usage

```bash
tssa
```

By default, the tool will analyze the current directory. You can also specify a directory to analyze:

```bash
tssa path/to/directory
```

### Enable logging:

```bash
tssa --log
```

### API

```typescript
import { analyzeProject, constants } from "tssa";

const { totalLines, issues, skippedFiles, score } =
  analyzeProject("path/to/directory");

console.log(`Total lines: ${totalLines}`);
console.log(`Total issues: ${issues.length}`);
console.log(`Skipped files: ${skippedFiles}`);
console.log(`Score: ${score.toFixed(2)} / ${constants.MAX_SCORE}`);
```
