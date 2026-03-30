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
class PlayerInfo:
    hand : List[Card]
    playable : List[Card]
    taken_tricks : List[Card]
    extra_points : int
    score : int


@dataclass
class GameState:
    players: List[Player]
    player_info : dict[str, PlayerInfo] 
    player_token : dict [str, str]
    bottom_card : Optional[Card]
    trump: Suit
    talon: List[Card]
    talon_closed_by : Optional[str]
    current_player: Optional[str]
    trick: List[Card]
    winner : Optional[str]
    both_joined : bool
    last_trick_winner : Optional[str]