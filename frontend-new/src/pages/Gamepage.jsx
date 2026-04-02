import { useEffect, useState } from "react";
import { getGame, playMove, shuffle } from "../api";
import Card from "../components/Card";
import CardBack from "../components/CardBack";
import Scoreboard from "../components/Scoreboard";
import GameResultPopup from "../components/GameResultPopup";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";


export default function GamePage() {
  const navigate = useNavigate();

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null); // "win" | "lose"

  const [animatingCard, setAnimatingCard] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [lastTrick, setLastTrick] = useState([]);
  const playedCardRef = useRef(null);
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
    const played = playedCardRef.current;

    if (game?.trick?.length === 1 && data.trick.length === 0) {
      // trick just got cleared → we capture it
      setLastTrick(prev => [...game.trick, played]);
      console.log(lastTrick)
      setResolving(true);

      setWinner(data.you.won_last_trick ? "you" : "opponent");

      console.log("Stored Winner of last trick")

      setTimeout(() => {
        setResolving(false);
        setLastTrick([]);
      }, 1000);
    }

    if (!game?.winner && data.winner) {
      // game just finished
      const didWin = data.winner === "you";

      setResult(didWin ? "win" : "lose");
      setShowResult(true);
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
        {/* Home Button */}
        <button
          style={styles.homeButton}
          onClick={() => navigate("/")}
        >
          ⬅ Home
        </button>
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
                ? "translate(260px, 180px) rotate(15deg)"
                : resolving && winner === "opponent"
                ? "translate(260px, -180px) rotate(-15deg)"
                : "translate(0,0)";
              return(
              <div
                key={i}
                style={{
                  transform: move,
                  transition: `transform 1s ease-in-out ${i * 0.3}s`,
                }}
              >
                <Card card={c} />
              </div>
            )
          })}
          
        </div>

        {/* Talon */}
        <div style={styles.talonContainer}>
            {/* count badge */}
            {game.talon_size > 0 && (
              <div style={styles.talonCount}>
                {game.talon_size}
              </div>
            )}

          {/* trump card underneath */}
          {game.bottom_card && !game.talon_closed_by && (
            <div style={styles.trump}>
              <Card card={game.bottom_card}
                    disabled={!game.you.can_close_talon}
                    onClick={async () => {
                      if (!game.bottom_card) return;

                      const hasTrumpJack = game.you.hand.some(
                        (c) =>
                          c.rank === "J" &&
                          c.suit === game.bottom_card.suit
                      );

                      if (hasTrumpJack) {
                        await playMove(gameId, token, {
                          type: "swap_trump",
                        });
                      } else if (game.you.can_close_talon) {
                        await playMove(gameId, token, {
                          type: "close_talon",
                        });
                      }

                      fetchGame();
                    }}
                    />
            </div>
          )}

          {/* talon stack above */}
          <div style={styles.stack}>
            {game.talon_size > 0 && Array({})
              .fill(0)
              .map((_, i) => (
                <CardBack key={i} />
              ))}
          </div>
          {/* closed talon card above */}
          {game.bottom_card && game.talon_closed_by && (
            <div style={styles.trump_closed}>
              <CardBack />
            </div>
          )}
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
                      playedCardRef.current = c;  
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
        <div style={styles.scoreboard}>
          <Scoreboard game={game} />
        </div>
        {showResult && (
          <GameResultPopup
            result={result}
            onClose={async () => {
              if (!game.bummerl_winner){
                const res = await shuffle(gameId);
              } else {
                const res = await delete(gameId);
                navigate("/");
              }
              setShowResult(false);
            }}
            scoreYou = {game.you.game_points}
            scoreOpp = {game.opponent.game_points}
          />
        )}
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
    right: "40px",
    transform: "rotate(270deg)",
    zIndex: 1,          // underneath
  },
    trump_closed: {
      position: "absolute",
      top: "0px",
      right: "40px",
      transform: "rotate(270deg)",
      zIndex: 100,          // underneath
    },

  scoreboard: {
    position: "absolute",
    right: "100px",   // 👈 outside table
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 5,
  },

  talonCount: {
    position: "absolute",
    top: "-40px",
    right: "-10px",
    background: "#1e293b",
    color: "white",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
  },
  homeButton: {
    position: "fixed",
    top: "20px",
    left: "20px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(15, 23, 42, 0.85)",
    color: "white",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
    zIndex: 20,
    transition: "0.2s",
  },
};