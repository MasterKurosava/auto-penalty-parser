'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FinesAnalyticsSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-18" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Violations */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-36 mb-1" />
              <Skeleton className="h-3 w-44" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Stats */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-3 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-18" />
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Chart */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
