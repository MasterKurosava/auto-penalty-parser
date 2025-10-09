import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Логин должен содержать минимум 3 символа')
    .max(50, 'Логин слишком длинный')
    .regex(/^[a-zA-Z0-9_]+$/, 'Логин может содержать только буквы, цифры и подчеркивание')
    .trim(),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль слишком длинный'),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Логин обязателен')
    .trim(),
  password: z.string().min(1, 'Пароль обязателен'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const ecpAuthSchema = z.object({
  label: z.string().max(255).optional().nullable(),
  iinBin: z.string().min(12).max(12),
  authToken: z.string().min(1),
  refreshToken: z.string().optional(),
  uuid: z.string().min(1),
  psapId: z.string().min(1),
})

export type EcpAuthInput = z.infer<typeof ecpAuthSchema>

export const ecpUpdateSchema = z.object({
  label: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
})

export type EcpUpdateInput = z.infer<typeof ecpUpdateSchema>

export const fineFilterSchema = z.object({
  ecpAuthId: z.string().uuid().optional(),
  status: z.string().optional(),
  vehicleNumber: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().min(1).max(10000).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortField: z.enum(['commitDate', 'decisionDate', 'amountTotal', 'status', 'fullName', 'vehicleNumber', 'articleCode']).default('commitDate'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

export type FineFilterInput = z.infer<typeof fineFilterSchema>
