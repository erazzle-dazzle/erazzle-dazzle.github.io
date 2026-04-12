import Card from "../components/Card";
import CardBack from "../components/CardBack";
import React from "react"

function TrickStack({ position, firstTrick, trickCount }) {
  if (!firstTrick && trickCount === 0) return null
  const isTop = position === "top"

  // --- styles ---
  const styles = {
    container: {
      position: "relative",
      width: "100%",
      height: "100%",
      transform: isTop ? "rotate(180deg) translateX(100px)" : "translateX(100px)"
    },

    hiddenStack: {
      position: "absolute",
      transform: `translateX(100px) translateY(40px) rotate(45deg)`,
    },

    hiddenCard: (i) => ({
      position: "absolute",
      transform: `translate(${i * 6}px, ${-i * 4}px)`,
      zIndex: 100+i,
    }),

    visibleTrick: {
      position: "absolute",
    },

    visibleCard: (i) => ({
      position: "absolute",
      transform: `translateX(${(i * 30)}px) rotate(${i === 0 ? (-75) : -35}deg)`,
      zIndex: 0,
    }),
  }

  return (
    <div style={styles.container}>
      
      {/* Visible trick */}
      {firstTrick && (
        <div style={styles.visibleTrick}>
          {firstTrick.map((card, i) => (
            <div key={i} style={styles.visibleCard(i)}>
              <Card card={card} />
            </div>
          ))}
        </div>
      )}

      {/* Hidden tricks */}
      {trickCount > 1 && (
        <div style={styles.hiddenStack}>
          {Array.from({ length: trickCount - 1 }).map((_, i) => (
            <div key={i} style={styles.hiddenCard(i)}>
              <CardBack />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrickStack