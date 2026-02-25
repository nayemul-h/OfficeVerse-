let socket;
let scene;
export function connectMovement(gameScene, onMessage) {
  scene = gameScene;
  let wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  if (location.protocol === 'https:' && wsUrl.startsWith('ws://')) wsUrl = 'wss://' + wsUrl.slice(5);
  socket = new WebSocket(`${wsUrl}/movement`);
  socket.onmessage = (e) => {
    if (onMessage) onMessage(e.data);
  };
  socket.onopen = () => {
    console.log("Movement Socket Connected");
    if (gameScene.debugText) gameScene.debugText.setText("Connected! ID: " + (gameScene.myPlayerId || '?'));
  };
}
export function sendMovement(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}