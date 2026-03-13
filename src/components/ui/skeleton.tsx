import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded-lg motion-reduce:animate-none",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
