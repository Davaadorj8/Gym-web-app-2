import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createSafeAction } from '@/server/actions/safeAction';

describe('createSafeAction Middleware & Error Boundary', () => {
  const TestSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 chars'),
    age: z.number().min(18, 'Must be at least 18'),
  });

  it('succeeds with valid input', async () => {
    const action = createSafeAction(TestSchema, async (data) => {
      return { welcome: `Hello ${data.username}` };
    });

    const result = await action({ username: 'batbayar', age: 25 });
    expect(result.success).toBe(true);
    expect(result.data?.welcome).toBe('Hello batbayar');
    expect(result.error).toBeUndefined();
  });

  it('catches and reports validation errors gracefully', async () => {
    const action = createSafeAction(TestSchema, async (data) => {
      return { welcome: `Hello ${data.username}` };
    });

    const result = await action({ username: 'ba', age: 16 });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});
