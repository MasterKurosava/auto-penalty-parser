export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    public response?: any
  ) {
    super(message, 'API_ERROR', statusCode)
    this.name = 'ApiError'
  }
}

// Утилиты для обработки ошибок
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла неизвестная ошибка'
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code
  }

  return 'UNKNOWN_ERROR'
}

export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }

  return 500
}

// Логирование ошибок
export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    statusCode: getErrorStatusCode(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  }

  // В development режиме выводим в консоль
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorInfo)
  }

  // В production можно отправить в сервис мониторинга
  // например, Sentry.captureException(error, { extra: context })

  return errorInfo
}

// Обработка ошибок API
export function handleApiError(error: unknown): never {
  if (error instanceof Response) {
    throw new ApiError(
      `HTTP ${error.status}: ${error.statusText}`,
      error.status,
      error
    )
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new NetworkError('Ошибка сети. Проверьте подключение к интернету.')
  }

  throw new AppError(
    getErrorMessage(error),
    getErrorCode(error),
    getErrorStatusCode(error)
  )
}

// Валидация с пользовательскими ошибками
export function validateWithError<T>(
  value: unknown,
  validator: (val: unknown) => val is T,
  errorMessage: string
): T {
  if (!validator(value)) {
    throw new ValidationError(errorMessage)
  }
  return value
}
