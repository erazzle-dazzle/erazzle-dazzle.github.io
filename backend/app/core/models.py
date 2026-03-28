from enum import Enum
from dataclasses import dataclass
from typing import List, Optional


class Suit(str, Enum):
    HEARTS = "hearts"
    DIAMONDS = "diamonds"
    CLUBS = "clubs"
    SPADES = "spades"


class Rank(str, Enum):
    ACE = "A"
    TEN = "10"
    KING = "K"
    QUEEN = "Q"
    JACK = "J"


@dataclass(frozen=True)
class Card:
    suit: Suit
    rank: Rank


@dataclass
class Player:
    id: str


@dataclass
class GameState:
    players: List[Player]
    hands: dict[str, List[Card]]
    playable : dict[str, List[Card]]
    bottom_card : Card
    talon: List[Card]
    talon_closed : bool
    trump: Suit
    current_player: str
    trick: List[Card]
    scores: dict[str, int]
    closed: bool = False