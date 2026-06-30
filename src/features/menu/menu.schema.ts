import { z } from "zod";

export const modifierOptionSchema = z.object({
  name: z.string().min(1, "Nama opsi tidak boleh kosong"),
  price: z.number().nonnegative("Harga tidak boleh negatif"),
});

export const modifierGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama variasi tidak boleh kosong"),
  required: z.boolean().default(false),
  minSelection: z.number().default(0),
  maxSelection: z.number().default(1),
  options: z.array(modifierOptionSchema).min(1, "Setidaknya harus ada satu opsi"),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  imageUrl: z.string().optional().nullable(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  modifiers: z.array(modifierGroupSchema).optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional().nullable(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  modifiers: z.array(modifierGroupSchema).optional(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
