import { WS_URL } from '../utils/config.js';

let socket;

export function connectChat(onMsg) {
  socket = new WebSocket(`${WS_URL}/ws/chat`);
  socket.onmessage = (e) => onMsg(e.data);
}

export function sendChat(msg) {
  socket.send(msg);
}
