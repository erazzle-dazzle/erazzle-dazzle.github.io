import {playMove} from "../api";

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


export default function MarriageButton({ suit, trump, onClick }) {
  const symbol = suitMap[suit];
  const color = suitColor[suit];

  const displayText =  suit === trump ? symbol + " 40" : symbol + " 20";

    return(
        <button
        style = {{
            position : "relative",
            width : "40%",
            height : "40%", 
            fontSize : "150%",
            fontWeight : "bold",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            borderTop: "50px",
            borderColor: "white",
            background: color,
            color: "white",
            cursor: "pointer",
        }}
        onClick = {onClick}>
         {displayText}
        </button>
  );
}