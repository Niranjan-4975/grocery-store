import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Ye variables file ke bahar hain taaki poori app mein ek hi rahein
let stompClient: any = null;
const stockListeners = new Set<(data: any) => void>();

export function useSocket() {
  function connect() {
    if (stompClient && stompClient.connected) return;

    const envURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';
    const socket = new SockJS(`${envURL.replace('/api', '')}/ws-grocery`);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // Console clean rakhne ke liye

    stompClient.connect({}, () => {
      console.log('🚀 Global WebSocket Connected');
      
      stompClient.subscribe('/topic/stock', (message: any) => {
        const updates = JSON.parse(message.body);
        // ✅ Sabhi registered pages/components ko data bhej do
        stockListeners.forEach(callback => callback(updates));
      });
    }, (err: any) => {
      console.error("Socket Error:", err);
      setTimeout(connect, 5000); // Reconnect logic
    });
  }

  // ✅ Is function se koi bhi page update sun sakta hai
  function onStockUpdate(callback: (data: any) => void) {
    stockListeners.add(callback);
    // Cleanup function: Jab component unmount ho toh listener hata do
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