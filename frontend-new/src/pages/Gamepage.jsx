import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGame, playMove } from "../api";
import Card from "../components/Card";
import CardBack from "../components/CardBack";


export default function GamePage() {
  const [animatingCard, setAnimatingCard] = useState(null);
 const [resolving, setResolving] = useState(false);
  const [lastTrick, setLastTrick] = useState([]);
  const [winner, setWinner] = useState(null);

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
    const data = await getGame(gameId, token);
    if (game?.trick?.length === 2 && data.trick.length === 0) {
      // trick just got cleared → we capture it
      setLastTrick(game.trick);
      setResolving(true);

      setWinner(game.you.won_last_trick ? "you" : "opponent");

      console.log("Stored Winner of last trick")

      setTimeout(() => {
        setResolving(false);
        setLastTrick([]);
      }, 1000);
    }
    setGame(data);
  };

  useEffect(() => {
  console.log("Game updated:", game);
  }, [game]);

  useEffect(() => {
    fetchGame();
    const i = setInterval(fetchGame, 2000);
    return () => clearInterval(i);
  }, []);

  if (!game) return <div>Loading...</div>;

  const trickToShow = resolving ? lastTrick : game?.trick ?? [];
  return (
    <div style={styles.table}>
      <div style={styles.inner}>
        {/* Opponent hand */}
        <div style={styles.opponent}>
          {Array(game.opponent.hand_size).fill(0).map((_, i) => (
            <CardBack key={i} />
          ))}
        </div>

        {/* Trick (center) */}
        <div style={styles.trick}>
          {trickToShow.map((c, i) => {
              const move =
                resolving && winner === "you"
                ? "translate(120px, 180px) rotate(15deg)"
                : resolving && winner === "opponent"
                ? "translate(120px, -180px) rotate(-15deg)"
                : "translate(0,0)";
              <div
                key={i}
                style={{
                  transform: move,
                  transition: `transform 0.6s ease-in-out ${i * 0.1}s`,
                }}
              >
                <Card card={c} />
              </div>
          })}
          
        </div>

        {/* Talon */}
        <div style={styles.talonContainer}>
          {/* trump card underneath */}
          {game.bottom_card && (
            <div style={styles.trump}>
              <Card card={game.bottom_card} />
            </div>
          )}

          {/* talon stack above */}
          <div style={styles.stack}>
            {Array(game.talon_size)
              .fill(0)
              .map((_, i) => (
                <CardBack key={i} />
              ))}
          </div>
        </div>

        {/* Your hand */}
        <div style={styles.hand}>
          {game.you.hand.map((c, i) => {
            const angle = (i - game.you.hand.length / 2) * 20;
            const yOffset = -(20 + (game.you.hand.length -1)*10 - Math.abs(i - (game.you.hand.length -1) / 2)*10)
              const isAnimating =
              animatingCard &&
              animatingCard.rank === c.rank &&
              animatingCard.suit === c.suit;

            return (
              <div
                key={i}
                style={{
                  transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                }}
              >
                <div
                  style={{
                    transition: "all 0.4s ease",
                    transform: isAnimating
                      ? "translateY(-120px) scale(1.1)"
                      : "translateY(0)",
                    opacity: isAnimating ? 0.5 : 1,
                  }}
                >
                  <Card
                    card={c}
                    disabled={!game.you.playable_cards.some(
                      (pc) => pc.rank === c.rank && pc.suit === c.suit
                    )}
                    onClick={async () => {
                      setAnimatingCard(c);

                      // wait for animation
                      setTimeout(async () => {
                        await playMove(gameId, token, {
                          type: "play_card",
                          card: c,
                        });

                        setAnimatingCard(null);
                        fetchGame();
                      }, 300);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

const styles = {
  table: {
    position: "fixed",     // 👈 important
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "radial-gradient(circle, #065f46, #022c22)",
    overflow: "hidden",
  },
  
  inner: {
    position: "absolute",
    width: "900px",
    height: "600px",
    top : "50%",
    left : "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "20px",
    background: "radial-gradient(circle, #065f46, #022c22)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    overflow: "hidden"
  },

  opponent: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
  },

  center: {
    gridColumn: "1 / 2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  trick: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    gap: "20px",
  },

  talon: {
    position: "absolute",
    right: "40px",
    top: "50%",
    transform: "translateY(-50%)",
  },

  stack: {
    display: "flex",
    flexDirection: "column",
  },

  hand: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "flex-end",
  },
    talonContainer: {
    position: "absolute",
    right: "40px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
    stack: {
    display: "flex",
    flexDirection: "column",
    zIndex: 2,          // stack on top
  },
    trump: {
    position: "absolute",
    top: "0px",
    right: "80px",
    transform: "rotate(270deg)",
    zIndex: 1,          // underneath
  },
};