import { Issue } from "./types";

export default function hashIssue(issue: Issue) {
  return `${issue.fileName}:${issue.line}:${issue.character}:${issue.type}`;
}
