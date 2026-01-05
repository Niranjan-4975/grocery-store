import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning', // 'success' ya 'error'
    timeout: 3500,

    confirmShow: false,
    confirmTitle: '',
    confirmMessage: '',
    resolvePromise: null as ((value: boolean) => void) | null,
  }),
  actions: {
    showToast(msg: string, type: 'success' | 'error' | 'warning' = 'success') {
      this.message = msg;
      this.type = type;
      this.show = true;
    },

    confirm(title: string, message: string): Promise<boolean> {
      this.confirmTitle = title;
      this.confirmMessage = message;
      this.confirmShow = true;

      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },

    handleConfirm(result: boolean) {
      if (this.resolvePromise) this.resolvePromise(result);
      this.confirmShow = false;
    },
  }
});