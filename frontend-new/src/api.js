const BASE = "http://localhost:8000";

export async function createGame() {
  const res = await fetch(`${BASE}/game`, { method: "POST" });
  return res.json();
}

export async function getGame(gameId, token) {
  const res = await fetch(`${BASE}/game/${gameId}?token=${token}`);
  return res.json();
}

export async function joinGame(token) {
  const res = await fetch(`${BASE}/join/${token}`, { method: "POST" });
  return res.json();
}

export async function shuffle(gameId) {
  const res = await fetch(`${BASE}/game/${gameId}/shuffle`, { method: "POST" });
  return res.json();
}

export async function delete_game(gameId) {
  const res = await fetch(`${BASE}/game/${gameId}/delete`, { method: "POST" });
  return res.json();
}

export async function playMove(gameId, token, move) {

  const res = await fetch(`${BASE}/game/${gameId}/move`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      player_token: token,
      move : move,
    }),
  });

  return res.json();
}