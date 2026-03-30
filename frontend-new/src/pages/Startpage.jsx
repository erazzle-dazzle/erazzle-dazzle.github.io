import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, getGame } from "../api";

function StartPage() {
  const [joinLink, setJoinLink] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    var res = await createGame();
    const gameId = res.game_id;
    const token = res.player_token;
    setJoinLink(res.invite_url); // send this to opponent
    localStorage.setItem("token", token);
    localStorage.setItem("gameId", gameId);
    while(true) {
      await new Promise(r => setTimeout(r, 2000));
      res = await getGame(gameId, token);
      console.log(res)
      var both_joined = res.both_joined;
      // change this, when joining works
      if (!both_joined){
        break;
      }

    }
    navigate("/game/" + gameId +"?token=" + token);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Schnapsn</h1>

      {!joinLink ? (
        <div style={styles.card}>
          <button onClick={handleCreate}>Create Game</button>
          <button style={{ marginTop: 10 }}>Join Game</button>
        </div>
      ) : (
        <div style={styles.card}>
          <p>Send this link to your opponent:</p>
          <div style={styles.linkBox}>{joinLink}</div>
          <button onClick={copyLink}>Copy Link</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "48px",
    marginBottom: "30px",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  linkBox: {
    background: "#334155",
    padding: "10px",
    borderRadius: "8px",
    wordBreak: "break-all",
  },
};

export default StartPage