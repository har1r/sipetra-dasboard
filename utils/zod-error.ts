import { ZodError } from "zod";

export function formatZodError(
  error: ZodError
) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path}: ${issue.message}`;
  }).join("; ");
}