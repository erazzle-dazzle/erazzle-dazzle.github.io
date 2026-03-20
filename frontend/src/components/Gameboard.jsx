import { useEffect, useState } from "react";
import { getGame } from "../api";

export default function GamePage({ gameId }) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getGame(gameId);
      setGame(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h1>Schnapsn</h1>
      <pre>{JSON.stringify(game, null, 2)}</pre>
    </div>
  );
}