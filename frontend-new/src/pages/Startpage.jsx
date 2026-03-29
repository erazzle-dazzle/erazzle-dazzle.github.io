import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api";

function StartPage() {
  const [gameId, setGameId] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  const handleCreate = async () => {
    const res = await createGame();
    const gameId = res.game_id;
    const token = res.player_token;
    localStorage.setItem("token", token);
    localStorage.setItem("gameId", gameId);
    navigate("/game");
  };

  return (
    <div>
      <h1>Schnapsn</h1>
      <button onClick={handleCreate}>Create Game</button>
    </div>
  );
}

export default StartPage;