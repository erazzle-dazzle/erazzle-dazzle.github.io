const BASE = "http://localhost:8000";

export async function createGame() {
  const res = await fetch(`${BASE}/game`, { method: "POST" });
  return res.json();
}

export async function getGame(gameId) {
  const res = await fetch(`${BASE}/game/${gameId}`);
  return res.json();
}

export async function playMove(gameId, move) {
  const res = await fetch(`${BASE}/game/${gameId}/move`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(move),
  });
  return res.json();
}