import type { ZodType } from 'zod';

export class SchemaValidationError extends Error {
  public constructor(context: string, issues: string) {
    super(`Response validation failed for ${context}:\n${issues}`);
    this.name = 'SchemaValidationError';
  }
}

export const validateResponse = <T>(schema: ZodType<T>, data: unknown, context: string): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map(issue => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new SchemaValidationError(context, issues);
  }

  return result.data;
};
