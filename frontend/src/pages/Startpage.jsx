import { useState } from "react";
import { createGame, getGame, joinGame } from "../api";
import { useNavigate } from "react-router-dom";

function StartPage() {
  const [joinCode, setJoinCode] = useState("");
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    var res = await createGame();
    const gameId = res.game_id;
    const token = res.player_token;
    setInviteLink(res.invite_token); // send this to opponent
    localStorage.setItem("token", token);
    localStorage.setItem("gameId", gameId);
    while(true) {
      await new Promise(r => setTimeout(r, 2000));
      res = await getGame(gameId, token);
      console.log(res)
      var both_joined = res.both_joined;
      // change this, when joining works
      if (both_joined){
        break;
      }

    }
    navigate("/game/" + gameId +"?token=" + token);
  };

  const handleJoin = async () => {
    if (!joinCode) return;

    // simple redirect (you’ll refine later)
    var res = await joinGame(joinCode);
    const gameId = res.game_id;
    const token = res.player_token;
    localStorage.setItem("token", token);
    localStorage.setItem("gameId", gameId);

    navigate("/game/" + gameId +"?token=" + token);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Schnapsn</h1>

        <input
          style={styles.input}
          placeholder="Enter game code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
                    onKeyDown={(e) => {
            if (e.key === "Enter") handleJoin();
          }}
        />

        <div style={styles.buttonRow}>
          <button style={styles.secondary} onClick={handleJoin}>
            Join Game
          </button>

          <button style={styles.primary} onClick={handleCreate}>
            New Game
          </button>
        </div>
        {inviteLink && (
          <div style={styles.inviteBox}>
            <input
              style={styles.input}
              value={inviteLink}
              readOnly
            />

            <button
              style={styles.primary}
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied! ✅" : "Copy Token"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle, #065f46, #022c22)",
  },

  card: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    width: "320px",
  },

  title: {
    fontSize: "36px",
    marginBottom: "10px",
    color : "white"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    background: "#1e293b",
    color: "white",
    textAlign: "center",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4)",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    width: "100%",
  },

  primary: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    cursor: "pointer",
    transition: "0.2s",
  },

  secondary: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    transition: "0.2s",
  },
  inviteBox: {
  marginTop: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
},
};

export default StartPage