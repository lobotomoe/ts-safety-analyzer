type IssueType =
  | "ANY_TYPE"
  | "TYPE_ASSERTION"
  | "TYPE_CASTING"
  | "NON_NULL_ASSERTION"
  | "COMPILER_DIRECTIVE";

export type Issue = {
  type: IssueType;
  fileName: string;
  line: number;
  character: number;
  lineText: string;
  message: string;
};
