import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["Planning", "In Progress", "Completed"]).default("Planning"),
})

export type CreateProjectInput = z.input<typeof createProjectSchema>