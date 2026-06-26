import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  address: z.string().optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  theme_primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional().nullable(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
