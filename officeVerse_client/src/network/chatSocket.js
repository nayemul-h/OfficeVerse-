
let socket;

export function connectChat(onMsg) {
  let wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  if (location.protocol === 'https:' && wsUrl.startsWith('ws://')) wsUrl = 'wss://' + wsUrl.slice(5);
  socket = new WebSocket(`${wsUrl}/ws/chat`);
  socket.onmessage = (e) => onMsg(e.data);
}

export function sendChat(msg) {
  socket.send(msg);
}
