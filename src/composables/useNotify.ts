import { useToastStore} from '../stores/toastStore';

export function useNotify() {
  const toastStore = useToastStore();

  const notify = {
    success: (message: string) => toastStore.showToast(message, 'success'),
    error: (message: string) => toastStore.showToast(message, 'error'),
    warning: (message: string) => toastStore.showToast(message, 'warning'),

    confirm: (title: string, message: string) => toastStore.confirm(title, message),
  };
  return {notify};
}