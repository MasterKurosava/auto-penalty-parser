'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormError, FormErrors } from '@/components/ui/form-error'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { loginSchema, validateFormData, type LoginFormData } from '@/lib/validations'

export function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Очищаем ошибку для этого поля при изменении
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Валидация формы
    const validation = validateFormData(loginSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      })

      if (response.ok) {
        toast.success('Успешный вход')
        router.push('/dashboard')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Неверный логин или пароль')
      }
    } catch {
      toast.error('Ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход в систему</CardTitle>
        <CardDescription>
          Введите свои учетные данные для доступа
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              type="text"
              placeholder="Введите логин"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            <FormError
              message={errors.username?.[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <FormError
              message={errors.password?.[0]}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Войти
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

