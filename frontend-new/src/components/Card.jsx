const suitMap = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColor = {
  hearts: "#dc2626",
  diamonds: "#dc2626",
  clubs: "#111827",
  spades: "#111827",
};

export default function Card({ card, onClick, disabled }) {
  const symbol = suitMap[card.suit];
  const color = suitColor[card.suit];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: "80px",
        height: "120px",
        borderRadius: "12px",
        background: "white",
        color: color,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "8px",
        margin: "0 -30px",
        boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
        cursor: disabled ? "default" : "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-15px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div>{card.rank}</div>

      <div style={{ fontSize: "26px", textAlign: "center" }}>
        {symbol}
      </div>

      <div style={{ alignSelf: "flex-end" }}>{card.rank}</div>
    </div>
  );
}