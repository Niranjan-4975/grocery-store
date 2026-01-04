import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    type: 'success', // 'success' ya 'error'
    timeout: 3500
  }),
  actions: {
    showToast(msg: string, type: 'success' | 'error' = 'success') {
      this.message = msg;
      this.type = type;
      this.show = true;
    }
  }
});