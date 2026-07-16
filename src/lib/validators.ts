import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  name: z.string().min(1).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  rollNo: z.string().optional().or(z.literal("")),
  className: z.string().optional().or(z.literal("")),
});

export const testSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MOCK"),
    subject: z.string().min(1),
    title: z.string().min(1),
    date: z.string().min(1),
    maxObjective: z.coerce.number().positive(),
    maxTheory: z.coerce.number().positive(),
    className: z.string().optional().or(z.literal("")),
  }),
  z.object({
    type: z.enum(["WEEKLY", "AFTER_CLASS"]),
    subject: z.string().min(1),
    title: z.string().min(1),
    date: z.string().min(1),
    maxScore: z.coerce.number().positive(),
    className: z.string().optional().or(z.literal("")),
  }),
]);

export const importRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  rollNo: z.string().optional(),
  className: z.string().optional(),
});
