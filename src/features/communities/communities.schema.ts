// Zod schema for the one /communities mutation boundary (Join). See
// src/features/forum/forum.schema.ts for the sibling forum schemas and the
// rationale for keeping schemas in the feature folder for this wave.
import { z } from "zod";

export const joinCommunityInputSchema = z.object({
  idempotencyKey: z.string().min(1),
  communityId: z.string().min(1),
});
export type JoinCommunityInput = z.infer<typeof joinCommunityInputSchema>;

export const requestCommunityInputSchema = z.object({
  idempotencyKey: z.string().min(1),
  name: z.string().trim().min(3, { message: "Name must be at least 3 characters." }).max(120),
  region: z.string().trim().min(2, { message: "Tell us the region or city." }).max(120),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(2000),
});
export type RequestCommunityInput = z.infer<typeof requestCommunityInputSchema>;
