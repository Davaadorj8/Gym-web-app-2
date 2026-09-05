import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface ActionResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (data: TInput) => Promise<TOutput>,
  revalidateTarget?: string
) {
  return async (input: unknown): Promise<ActionResponse<TOutput>> => {
    try {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? "Invalid input parameters";
        return {
          success: false,
          error: firstError,
        };
      }

      const result = await handler(parsed.data);
      if (revalidateTarget) {
        revalidatePath(revalidateTarget);
      }
      return {
        success: true,
        data: result,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        Sentry.captureException(err);
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : "An unexpected server error occurred.",
      };
    }
  };
}
