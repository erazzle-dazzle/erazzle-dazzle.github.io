export default function GameResultPopup({ result, onClose, scoreYou, scoreOpp}) {
  const isWin = result === "win";

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.popup,
          background: isWin
            ? "linear-gradient(135deg, #16a34a, #22c55e)"
            : "linear-gradient(135deg, #b91c1c, #ef4444)",
        }}
      >
        <h1>{isWin ? "You Win! 🎉" : "You Lose 😢"}</h1>
        <h2>{`Game-Score : ${scoreYou} - ${scoreOpp}`}</h2>

        <button onClick={onClose} style={styles.button}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  popup: {
    padding: "40px",
    borderRadius: "20px",
    color: "white",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    animation: "scaleIn 0.3s ease",
  },

  button: {
    marginTop: "20px",
  },
};