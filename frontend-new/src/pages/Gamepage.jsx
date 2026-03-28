import { useEffect, useState } from "react";
import { getGame, playMove } from "../api";

export default function GamePage({ gameId }) {
  const [game, setGame] = useState(null);

  const fetchGame = async () => {
    const data = await getGame(gameId);
    setGame(data);
  };

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h2>Game ID: {gameId}</h2>
      <h3>Current Player: {game.current_player}</h3>

      <h3>Hands</h3>
      {Object.entries(game.hands).map(([player, cards]) => (
        <div key={player}>
          <strong>{player}</strong>:{" "}
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() =>
                playMove(gameId, { player_id: player, card: c }).then(fetchGame)
              }
            >
              {c.rank} of {c.suit}
            </button>
          ))}
        </div>
      ))}

      <h3>Trick</h3>
      {game.trick.map((c, i) => (
        <span key={i}>
          {c.rank} of {c.suit} |{" "}
        </span>
      ))}
    </div>
  );
}