import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface FormErrorsProps {
  errors?: Record<string, string[]>
  className?: string
}

export function FormErrors({ errors, className }: FormErrorsProps) {
  if (!errors || Object.keys(errors).length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      {Object.entries(errors).map(([field, fieldErrors]) => (
        <FormError key={field} message={fieldErrors[0]} />
      ))}
    </div>
  )
}
