import { useState } from "react";
import { createGame } from "./api";
import GamePage from "./pages/Gamepage";

function App() {
  const [gameId, setGameId] = useState(null);

  const handleCreate = async () => {
    const res = await createGame();
    setGameId(res.game_id);
  };

  if (gameId) {
    return <GamePage gameId={gameId} />;
  }

  return (
    <div>
      <h1>Schnapsn</h1>
      <button onClick={handleCreate}>Create Game</button>
    </div>
  );
}

export default App;