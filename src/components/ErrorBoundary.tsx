'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { AppError, logError } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Логируем ошибку
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    })

    // Вызываем пользовательский обработчик
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Если есть пользовательский fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Стандартный UI для ошибок
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Произошла ошибка</CardTitle>
              </div>
              <CardDescription>
                Что-то пошло не так. Попробуйте обновить страницу.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-muted-foreground">
                  <details className="space-y-2">
                    <summary className="cursor-pointer hover:text-foreground">
                      Детали ошибки
                    </summary>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {this.state.error.message}
                      {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                        <>
                          {'\n\n'}
                          {this.state.error.stack}
                        </>
                      )}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Попробовать снова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Обновить страницу
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Хук для обработки ошибок в функциональных компонентах
export function useErrorHandler() {
  return (error: Error, context?: Record<string, any>) => {
    logError(error, context)

    // Можно добавить toast уведомление
    if (typeof window !== 'undefined') {
      // toast.error(getErrorMessage(error))
    }
  }
}

// Компонент для отображения ошибок с возможностью повтора
interface ErrorDisplayProps {
  error: Error
  onRetry?: () => void
  context?: Record<string, any>
}

export function ErrorDisplay({ error, onRetry, context }: ErrorDisplayProps) {
  const isAppError = error instanceof AppError

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="font-medium text-destructive">
            {isAppError ? error.message : 'Произошла ошибка'}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                Детали ошибки
              </summary>
              <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto">
                {error.stack}
                {context && (
                  <>
                    {'\n\nКонтекст:\n'}
                    {JSON.stringify(context, null, 2)}
                  </>
                )}
              </pre>
            </details>
          )}

          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Попробовать снова
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
