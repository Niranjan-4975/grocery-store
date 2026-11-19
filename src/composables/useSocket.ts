import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Ye variables file ke bahar hain taaki poori app mein ek hi rahein
let stompClient: any = null;
const stockListeners = new Set<(data: any) => void>();

export function useSocket() {
  function connect() {
    if (stompClient && stompClient.connected) return;

    const envURL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080/api';
    const socket = new SockJS(`${envURL.replace('/api', '')}/ws-grocery`);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};
    stompClient.connect({}, () => {
      console.log('🚀 Global WebSocket Connected');
      
      stompClient.subscribe('/topic/stock', (message: any) => {
        const updates = JSON.parse(message.body);
        stockListeners.forEach(callback => callback(updates));
      });
    }, (err: any) => {
      console.error("Socket Error:", err);
      setTimeout(connect, 5000); // Reconnect logic
    });
  }

  function onStockUpdate(callback: (data: any) => void) {
    stockListeners.add(callback);
    return () => stockListeners.delete(callback);
  }

  function disconnect() {
    if (stompClient) {
      stompClient.disconnect();
      stompClient = null;
    }
  }

  return { connect, disconnect, onStockUpdate };
}