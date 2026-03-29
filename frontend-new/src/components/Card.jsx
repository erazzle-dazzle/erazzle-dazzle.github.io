export default function Card({ card, onClick, disabled }) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: "60px",
        height: "90px",
        border: "1px solid black",
        borderRadius: "8px",
        margin: "5px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: disabled ? "#ccc" : "white",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {card.rank} <br /> {card.suit}
    </div>
  );
}