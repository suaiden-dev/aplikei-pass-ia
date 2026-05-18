import type { ZodSchema } from "zod";

export function zodValidate<T>(schema: ZodSchema<T>) {
  return (values: T): Partial<Record<keyof T, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    return result.error.issues.reduce(
      (acc, issue) => {
        const key = issue.path[0] as keyof T;
        if (key !== undefined && !acc[key]) {
          acc[key] = issue.message;
        }
        return acc;
      },
      {} as Partial<Record<keyof T, string>>,
    );
  };
}
