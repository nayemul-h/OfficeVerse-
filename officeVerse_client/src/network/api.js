export async function registerPlayer(name, roomId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/register?name=${name}&roomId=${roomId}`,
    { method: "POST" }
  );
  return res.json();
}