import React from "react"
import { useToast, setNotificationAdd } from "@/hooks/use-toast"
import { useNotification } from "@/contexts/NotificationContext"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const { addNotification } = useNotification()

  // Set the notificationAdd function for toast()
  React.useEffect(() => {
    setNotificationAdd((n) => {
      // Map the type property if needed, or cast as NotificationType
      addNotification({
        title: n.title,
        description: n.description,
        type: n.type as any, // Replace 'any' with 'NotificationType' if imported
      })
    })
  }, [addNotification])

  return (
    <ToastProvider swipeDirection="right" swipeThreshold={350}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
