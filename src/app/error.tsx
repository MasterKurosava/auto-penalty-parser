'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">Ошибка</h1>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-left bg-muted p-4 rounded overflow-auto">
            {error.message}
          </pre>
        )}
        <Button onClick={reset}>Попробовать снова</Button>
      </div>
    </div>
  )
}

