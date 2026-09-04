import * as React from "react"
import { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number | string
    label: string
    positive?: boolean
  }
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.positive === true && "text-emerald-500",
                  trend.positive === false && "text-rose-500"
                )}
              >
                {trend.value}
              </span>
            )}
            {trend ? trend.label : description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
