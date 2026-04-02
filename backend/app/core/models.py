from enum import Enum
from dataclasses import dataclass
from typing import List, Optional


class Suit(str, Enum):
    SPADES = "spades"
    HEARTS = "hearts"
    CLUBS = "clubs"
    DIAMONDS = "diamonds"


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
class Marriage:
    suit : Suit
    points : int

@dataclass
class PlayerInfo:
    hand : List[Card]
    playable : List[Card]
    taken_tricks : List[Card]
    extra_points : int
    score : int
    marriages : List[Marriage]
    game_points : int


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
    talon_closed_points_opp : Optional[int]
    talon_closed_points_self : Optional[int]
    bummerl_winner : Optional[str]
    starter : str