import { useEffect, useState } from "react";
import { getGame, playMove } from "../api";
import Card from "../components/Card"

export default function GamePage() {
  const [game, setGame] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");
  const gameIdFromUrl = urlParams.get("gameId");

  const token = tokenFromUrl || localStorage.getItem("token");
  const gameId = gameIdFromUrl || localStorage.getItem("gameId");

  // update localStorage if URL params are used
  if (tokenFromUrl) localStorage.setItem("token", tokenFromUrl);
  if (gameIdFromUrl) localStorage.setItem("gameId", gameIdFromUrl);

  // guard
  if (!token || !gameId) {
      return <div>Error: missing game session</div>;
  }

  const fetchGame = async () => {
    try {
      const data = await getGame(gameId, token);
      setGame(data);
      console.log(data)
    } catch (err) {
        console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!game) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Schnapsn</h2>

      {/* Opponent */}
      <div>
        <h3>Opponent</h3>
        <div style={{ display: "flex" }}>
          {Array(game.player_info.opponent.hand_size)
            .fill(0)
            .map((_, i) => (
              <div key={i} style={{ width: "60px", height: "90px", background: "#444", margin: "5px" }} />
            ))}
        </div>
      </div>

      {/* Trick */}
      <div>
        <h3>Trick</h3>
        <div style={{ display: "flex" }}>
          {game.trick.map((c, i) => (
            <Card key={i} card={c} />
          ))}
        </div>
      </div>

      {/* Your hand */}
      <div>
        <h3>Your Hand</h3>
        <div style={{ display: "flex" }}>
          {game.player_info.you.hand.map((c, i) => (
            <Card
              key={i}
              card={c}
              disabled={!game.player_info.you.playable_cards.some(
                (pc) => pc.rank === c.rank && pc.suit === c.suit
              )}
              onClick={() =>
                playMove(gameId, token, { type: "play_card", card: c },
                ).then(fetchGame)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}