import * as React from "react"

// Types needed by use-toast.ts
export type ToastActionElement = React.ReactElement<any>

export interface ToastProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
