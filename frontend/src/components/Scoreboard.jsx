const suitMap = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export default function Scoreboard({ game }) {
  const you = game.you || {};
  const opponent = game.opponent || {};

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scoreboard</h2>

      {/* Points */}
      <div style={styles.section}>
        <h3>Points</h3>
        <div style={styles.row}>
          <span>You</span>
          <span>{you.score ?? 0}</span>
        </div>
      </div>

      {/* Marriages */}
      <div style={styles.section}>
        <h3>Marriages</h3>
        <div style={styles.marriages}>
        <div style={styles.row}>
          <span>You</span>
        {(you.marriages ?? []).map((m, i) => (
            <span key={i} style={styles.marriage}>
              {suitMap[m.suit]} ({m.points})
            </span>
          ))}
          {(you.marriages ?? []).length === 0 && (
            <span style={{ opacity: 1 }}>None</span>
          )}
        </div>
        <div style={styles.row}>
          <span>Opponent</span>
        {(opponent.marriages ?? []).map((m, i) => (
            <span key={i} style={styles.marriage}>
              {suitMap[m.suit]} ({m.points})
            </span>
          ))}
          {(opponent.marriages ?? []).length === 0 && (
            <span style={{ opacity: 1 }}>None</span>
          )}
        </div>
      </div>
      </div>

      {/* Games won */}
      <div style={styles.section}>
        <h3>Game-Score</h3>
        <div style={styles.row}>
          <span>You</span>
          <span>{you.game_points ?? 0}</span>
        </div>
        <div style={styles.row}>
          <span>Opponent</span>
          <span>{opponent.game_points ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "16px",
    width: "220px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  title: {
    textAlign: "center",
    marginBottom: "15px",
    color : "white"
  },

  section: {
    marginBottom: "20px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
  },

  marriages: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  marriage: {
    background: "#334155",
    padding: "6px 10px",
    borderRadius: "8px",
    textAlign: "center",
  },
};