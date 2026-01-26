const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const message = document.getElementById("message");
const kitten = document.getElementById("kitten");
const heartsContainer = document.getElementById("hearts");
const meow = document.getElementById("meow");

const noTexts = [
    "No 😶",
    "Are you sure?",
    "Really??",
    "Think again 😏",
    "Bad choice",
    "Try harder",
    "Almost clicked yes",
    "Nope 🙃"
];

let noCounter = 0;
let noScale = 1;
let yesScale = 1;

function chaosMove() {
    const maxX = window.innerWidth - 140;
    const maxY = 160;

    noBtn.style.left = Math.random() * maxX + "px";
    noBtn.style.top = Math.random() * maxY + "px";
    noBtn.style.transform = `rotate(${Math.random() * 30 - 15}deg) scale(${noScale})`;

    noBtn.textContent = noTexts[noCounter % noTexts.length];

    noScale *= 0.88;
    yesScale *= 1.07;
    yesBtn.style.transform = `scale(${yesScale})`;

    noCounter++;

    meow.currentTime = 0;
    meow.play();

    // NO button gives up eventually
    if (noScale < 0.25) {
        noBtn.style.display = "none";
        message.textContent = "The 'No' option has left the chat.";
    }
}

// Desktop
noBtn.addEventListener("mouseenter", chaosMove);

// Mobile
noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    chaosMove();
});

// YES
yesBtn.addEventListener("click", () => {
    message.textContent = "YAAAAAY 💖🐱 Best Valentine ever!";
    kitten.src = "https://placekitten.com/401/301";
    kitten.classList.add("zoom");
    noBtn.style.display = "none";
    startHearts();
});

// Hearts
function startHearts() {
    setInterval(() => {
        const heart = document.createElement("div");
        heart.className = "heart";
        heart.textContent = "💖";

        heart.style.left = Math.random() * window.innerWidth + "px";
        heart.style.animationDuration = (2 + Math.random() * 3) + "s";

        heartsContainer.appendChild(heart);

        setTimeout(() => heart.remove(), 5000);
    }, 180);
}
