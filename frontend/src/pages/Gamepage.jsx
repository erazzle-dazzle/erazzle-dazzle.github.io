import { useEffect, useState } from "react";
import { getGame, playMove, shuffle, delete_game } from "../api";
import Card from "../components/Card";
import CardBack from "../components/CardBack";
import Scoreboard from "../components/Scoreboard";
import GameResultPopup from "../components/GameResultPopup";
import TrickStack from "../components/TrickStack"
import { useNavigate } from "react-router-dom";
import MarriageButton from "../components/MarriageButton";

let prevTrickLength = 0;


export default function GamePage() {
  const navigate = useNavigate();

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null); // "win" | "lose"

  const [animatingCard, setAnimatingCard] = useState(null);
  const [resolving, setResolving] = useState(false);  

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
    const currentTrickLength = data.trick.length
    
    if (prevTrickLength === 1 && currentTrickLength !== 1) {
      // trick just got cleared → we capture it
      setResolving(true);
      setTimeout(() => {
        setResolving(false);
      }, 2000);
    }
    prevTrickLength = currentTrickLength;
    
    if (!game?.game_winner && data.game_winner) {
      // game just finished
      const didWin = data.game_winner === "you";

      setResult(didWin ? "win" : "lose");
      setShowResult(true);
    }
    setGame(data);
  };

  useEffect(() => {
  console.log("Game updated (GamePageNew):", game);
  }, [game]);

useEffect(() => {
  const interval = setInterval(() => {
    fetchGame()   // ✅ always uses latest version
  }, 2000)

  fetchGame() // initial call

  return () => clearInterval(interval)
}, [])

  if (!game) return <div>Loading...</div>;
  const trickToShow = resolving ? game.last_trick : game.trick ?? [];
  return (
  <div style={styles.page}>
    <button
          style={styles.homeButton}
          onClick={() => navigate("/")}
        >
          ⬅ Home
    </button>
  <div style={styles.table}>
    <div style={styles.Row}>
      <div style={styles.Cell}>
        <TrickStack
        position="top"
        firstTrick={game.opponent.first_taken_trick}
        trickCount={game.opponent.count_of_taken_tricks}
        />
      </div>
      <div style={styles.Cell}>
        <div style={styles.opponentHand}>
                  {Array(game.opponent.hand_size).fill(0).map((_, i) => (
                    <CardBack key={i} />
                  ))}
                </div>
      </div>
      <div style={styles.Cell}>
      </div>
    </div>
    <div style={styles.Row}>
      <div style={styles.Cell}>
        <div style={styles.Cell}>
      </div>
      <div style={styles.Cell}>
        <div style={styles.trick}>
          {trickToShow.map((c, i) => {
              const move = "none"
              return(
              <div
                key={i}
                style={{
                  transform: move,
                  transition: `transform 1s ease-in-out ${i * 0.1}s`,
                  zIndex: 0
                }}
              >
                <Card card={c} />
              </div>
            )
          })}
          
        </div>
      </div>
      <div style={styles.Cell}>
        {/* count badge */}
        {game.talon_size > 0 && (
          <div style={styles.talonCount}>
            {game.talon_size}
          </div>
        )}

        {/* trump card underneath */}
          <div style={styles.trump}>
            {game.bottom_card && !game.talon_closed && (
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
                  />)}
            </div>
            {/* talon stack above */}
              <div style={styles.stack}>
                {game.talon_size > 0 && Array({})
                  .fill(0)
                  .map((_, i) => (
                    <CardBack key={i} />
                  ))}
              </div>
              {/* closed talon card above */}
              {game.bottom_card && game.talon_closed && (
                <div style={styles.trump_closed}>
                  <CardBack />
                </div>
              )}
      </div>
      </div>
    </div>
    <div style={styles.Row}>
      <div style={styles.Cell}>
        <div style={styles.Cell}>
          {game.you.possible_marriages.map((suit, i) => {
            return(
              <MarriageButton 
                key = {i}
                suit = {suit}
                trump = {game.trump}
                onClick = {async () => {
                  await playMove(gameId, token, {type: "marriage", suit: suit});
                  fetchGame();
                }}
              />
          )
          })}
        </div>
      <div style={styles.Cell}>
        <div style={styles.playerHand}>
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
      <div style={styles.Cell}>
        <TrickStack
          position="bottom"
          firstTrick={game.you.first_taken_trick}
          trickCount={game.you.count_of_taken_tricks}
        />
      </div>
      </div>
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
            const res = await delete_game(gameId);
            navigate("/");
          }
          setShowResult(false);
        }}
        scoreYou = {game.you.game_points}
        scoreOpp = {game.opponent.game_points}
      />
    )}
  </div>
)}

const styles = {
  page: {
    display: "flex",
    width: "100%",
    height : "100%",
    justifyContent: "center",
    alignItems : "center",
    flexDirection : "column"
  },

  table: {
    display: "flex",
    flexDirection: "column",
    width: "1000%",
    maxWidth: "900px",
    aspectRatio: "3 / 2",
    justifyContent: "space-between",
    background: "radial-gradient(circle, #065f46, #022c22)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
  },

  opponentHand: {
    display: "flex",
    justifyContent: "center",
  },

  Row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    height : "33%",
  },

  Cell : {
    display : "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height : "100%",
    width : "33%"
  },

  trick: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    minHeight: "120px",
  },
  stack: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    zIndex: 2,          // stack on top
  },
  trump: {
    position: "relative",
    transform: "rotate(270deg)",
    zIndex: 1,          // underneath
  },
  trump_closed: {
    position: "absolute",
    transform: "rotate(270deg)",
    zIndex: 100,          // underneath
  },
  talonCount: {
    position : "relative",
    left : "23%",
    bottom : "45%",
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
    zIndex : 10
  },

  sideZone: {
    width: "80px",
    height: "120px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  playerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  playerHand: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "nowrap",
  },
  opponentTrick : {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "nowrap",
    transform: "rotate(120deg)"
  },
  playerTrick : {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "nowrap",
    transform: "rotate(300deg)"
  },
  tricksBottom: {
    minHeight: "60px",
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
  scoreboard: {
    position: "absolute",
    right: "100px",   // 👈 outside table
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 5,
  },
};
