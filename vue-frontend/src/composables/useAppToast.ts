import { useToast } from 'vue-toast-notification'

export function useAppToast() {
  const toast = useToast()

  return {
    success: (msg: string) => toast.success(msg, { duration: 3000 }),
    error: (msg: string) => toast.error(msg, { duration: 6000 }),
    info: (msg: string) => toast.info(msg, { duration: 3000 }),
    warning: (msg: string) => toast.warning(msg, { duration: 6000 }),
  }
}
