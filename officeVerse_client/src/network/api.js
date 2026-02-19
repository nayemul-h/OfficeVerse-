import { API_URL } from '../utils/config.js';

export async function registerPlayer(name, roomId) {
  const res = await fetch(
    `${API_URL}/auth/register?name=${name}&roomId=${roomId}`,
    { method: "POST" }
  );
  return res.json();
}