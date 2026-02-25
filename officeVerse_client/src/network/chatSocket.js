
let socket;

export function connectChat(onMsg) {
  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  socket = new WebSocket(`${wsUrl}/ws/chat`);
  socket.onmessage = (e) => onMsg(e.data);
}

export function sendChat(msg) {
  socket.send(msg);
}
