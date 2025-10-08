import { z } from 'zod'

// Схема для входа в систему
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Логин обязателен')
    .max(50, 'Логин не должен превышать 50 символов')
    .trim(),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .max(100, 'Пароль не должен превышать 100 символов'),
})

// Схема для фильтров штрафов
export const finesFilterSchema = z.object({
  dateFrom: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Неверный формат даты'),
  dateTo: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Неверный формат даты'),
  limit: z
    .string()
    .min(1, 'Лимит обязателен')
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num > 0 && num <= 1000
    }, 'Лимит должен быть числом от 1 до 1000')
    .transform((val) => parseInt(val)),
  grnzFilter: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return val.length <= 20
    }, 'Госномер не должен превышать 20 символов'),
})

// Схема для валидации дат
export const dateRangeSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).refine((data) => {
  if (!data.dateFrom || !data.dateTo) return true
  return new Date(data.dateFrom) <= new Date(data.dateTo)
}, {
  message: 'Дата "от" не может быть позже даты "до"',
  path: ['dateFrom'],
})

// Типы для TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
export type FinesFilterData = z.infer<typeof finesFilterSchema>
export type DateRangeData = z.infer<typeof dateRangeSchema>

// Утилиты для валидации
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const result = schema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors: Record<string, string[]> = {}
      result.error.errors.forEach((error) => {
        const path = error.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(error.message)
      })
      return { success: false, errors }
    }
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Произошла ошибка валидации'] }
    }
  }
}

// Валидация в реальном времени
export function createFieldValidator<T>(
  schema: z.ZodSchema<T>,
  fieldName: keyof T
) {
  return (value: unknown) => {
    try {
      const fieldSchema = schema.shape[fieldName as string]
      if (!fieldSchema) return null

      const result = fieldSchema.safeParse(value)
      return result.success ? null : result.error.errors[0]?.message || 'Неверное значение'
    } catch {
      return 'Ошибка валидации'
    }
  }
}
