from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from random import shuffle
import uuid


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

    def get_value(self) -> int:
        result = -1
        match self.rank:
            case Rank.ACE:
                result = 11
            case Rank.TEN:
                result = 10
            case Rank.KING:
                result = 4
            case Rank.QUEEN:
                result = 3
            case Rank.JACK:
                result = 2
        return result
    
    def serialize(self) -> Dict:
        return {"suit" : self.suit, "rank" : self.rank}
    

@dataclass
class Marriage:
    suit : Suit
    points : int
    pid : str

    def serialize(self) -> Dict:
        return {"suit" : self.suit, "points" : self.points, "player" : self.pid}

@dataclass
class Trick:
    cards : List[Card] = field(default_factory = list)
    winner : Optional[str] = None

    def serialize(self) -> List[Dict]:
        return [c.serialize() for c in self.cards]
    
    def get_value(self) -> int:
        return sum([card.get_value() for card in self.cards])


@dataclass
class GameState:
    players: List[str]
    player_tokens : Dict[str, str]
    starter : str
    current_player: str
    bottom_card : Optional[Card]
    trump: Suit
    talon: List[Card]
    game_points : Dict[str, int]
    hands : Dict[str, List[Card]]
    tricks : List[Trick] = field(default_factory = list)
    marriages : List[Marriage] = field(default_factory = list)
    talon_closed_by : Optional[str] = None
    talon_closed_points_opp : Optional[int] = None
    talon_closed_points_self : Optional[int] = None
    both_joined : bool = False
    active_marriage : Optional[Suit] = None

    def __init__(self) -> None:
        cards : List[Card] = []
        for suit in Suit:
            for rank in Rank:
                cards.append(Card(suit, rank))
        shuffle(cards)

        hand_p1 = [cards.pop(0) for i in range(5)]
        hand_p2 = [cards.pop(0) for i in range(5)]

        self.players = ["p1", "p2"]
        self.player_tokens = {str(uuid.uuid4()) : "p1", str(uuid.uuid4()) : "p2"}
        self.starter = "p1"
        self.current_player = "p1"
        self.bottom_card = cards.pop(0)
        self.trump = self.bottom_card.suit
        self.talon = cards
        self.hands = {"p1" : hand_p1, "p2" : hand_p2}
        self.game_points = {"p1" : 0, "p2" : 0}
        self.marriages = []
        self.tricks = [Trick()]

    def new_game(self) -> None:
        cards : List[Card] = []
        for suit in Suit:
            for rank in Rank:
                cards.append(Card(suit, rank))
        shuffle(cards)

        for pid in self.players:
            self.hands[pid] = [cards.pop(0) for i in range(5)]
        
        self.starter = "p1" if self.starter == "p2" else "p2"
        self.current_player = self.starter
        self.bottom_card = cards.pop(0)
        self.trump = self.bottom_card.suit
        self.talon = cards
        self.active_marriage = None
        self.marriages = []
        self.tricks = [Trick()]
        self.talon_closed_by = None
        self.talon_closed_points_opp = None
        self.talon_closed_points_self = None

    def other_player(self, pid : str) -> str:
        assert len(self.players) == 2, "Too many players"
        return self.players[0] if (self.players[1] == pid) else self.players[1]
    
    def _wins_trick(self, card : Card) -> bool:
        assert len(self.tricks[-1].cards) == 1, "Trick cannot be won, not exactly one card"
        played_card = self.tricks[-1].cards[0]
        result = False
        if played_card.suit == card.suit:
            result = (played_card.get_value() < card.get_value())
        elif card.suit == self.trump:
            result = True
        else:
            result = False
        return result
    
    def legal_cards(self, pid : str) -> List[Card]:
        result = []
        if self.current_player != pid:
            result = []
        elif self.active_marriage:
            suit = self.active_marriage
            assert Card(suit, Rank.KING) in self.hands[pid], f"{suit}-King not in hand of {pid} - There was some error"
            assert Card(suit, Rank.QUEEN) in self.hands[pid], f"{suit}-Queen not in hand of {pid} - There was some error"
            return [Card(suit, Rank.KING), Card(suit, Rank.QUEEN)]
        elif self.tricks[-1].cards == [] or len(self.tricks[-1].cards) == 2:
            result = self.hands[pid]
        elif self.talon_closed_by or self.talon == []:
            played_card : Card = self.tricks[-1].cards[0]
            winning_cards : List[Card] = [card for card in self.hands[pid] if self._wins_trick(card)]
            same_suit_cards : List[Card] = [card for card in self.hands[pid] if card.suit == played_card.suit]
            same_suit_winning_cards : List[Card] = [card for card in same_suit_cards if card in winning_cards]
            if same_suit_winning_cards != []:
                result = same_suit_winning_cards
            elif same_suit_cards != []:
                result = same_suit_cards
            elif winning_cards != []:
                result = winning_cards
            else:
                result = self.hands[pid]
        else:
            result = self.hands[pid]
        return result
    
    def get_score(self, pid : str) -> int:
        result = sum([trick.get_value() for trick in self.tricks if trick.winner == pid])
        result += sum([marriage.points for marriage in self.marriages if marriage.pid == pid]) if result > 0 else 0
        return result
    
    def sort_hands(self) -> None:
        def card_sorting_helper(card : Card):
            suit = card.suit
            offset = card.get_value()
            if suit == Suit.SPADES:
                return 0 + offset
            elif suit == Suit.HEARTS:
                return 11 + offset
            elif suit == Suit.CLUBS:
                return 22 + offset
            else: # -> suit == Suit.DIAMONDS
                return 33 + offset
        for pid in self.players:
            self.hands[pid].sort(key = lambda x : card_sorting_helper(x))
    
    def determine_winner(self) -> Optional[str]:
        # assert len(self.tricks[-1].cards) != 0, "The current trick is still open, there is no winner yet"
        turns_left = len(self.hands[list(self.hands.keys())[0]]) >= 1 or len(self.hands[list(self.hands.keys())[1]]) >= 1
        for pid in self.players:
            if pid == self.current_player and self.get_score(pid) >= 66:
                return pid
        if self.talon_closed_by and not turns_left:
            return self.talon_closed_by if self.get_score(self.talon_closed_by) >= 66 else self.other_player(self.talon_closed_by)
        elif not turns_left:
            return self.tricks[-1].winner
    
    def determine_points_for_game(self) -> Optional[int]:
        winner = self.determine_winner()
        assert winner, "There is no winner, calling this function does not make any sense"
        loser = self.other_player(winner)
        if self.talon_closed_by == winner:
            return self.talon_closed_points_self
        elif self.talon_closed_by == loser:
            return self.talon_closed_points_opp
        else:
            loser_points = self.get_score(loser)
            return 3 if loser_points == 0 else (2 if loser_points < 33 else 1)

    def get_possible_marriages(self, pid : str) -> List[Suit]:
        result = []
        if self.current_player != pid or self.tricks[-1].cards != []:
            return result
        hand = self.hands[pid]
        for suit in Suit:
            if suit in [m.suit for m in self.marriages if m.pid == pid]:
                continue
            result += [suit] if Card(suit, Rank.KING) in hand and Card(suit, Rank.QUEEN) in hand else []
        return result
    
    def drop_card(self, pid : str, card : Card) -> None:
        assert card in self.hands[pid], f"Card {card} not in hand of {pid}"
        self.hands[pid] = [c for c in self.hands[pid] if c != card]
    
    def draw_cards(self) -> None:
        assert len(self.talon) >= 1 and self.bottom_card, "No cards left"
        assert not self.talon_closed_by, "Talon has already been closed"
        p1 = self.current_player
        p2 = self.other_player(p1)
        self.hands[p1].append(self.talon.pop(0))
        if self.talon:
            self.hands[p2].append(self.talon.pop(0))
        else:
            self.hands[p2].append(self.bottom_card)
            self.bottom_card = None
    
    def apply_move(self, pid : str, move : Dict) -> None:
        opp = self.other_player(pid)
        move_type = move["type"]
        assert self.current_player == pid, f"It is not the turn of {pid}"
        assert move_type in ["close_talon", "swap_trump", "marriage", "play_card"], "Invalid move-type"
        match move_type:
            case "close_talon":
                assert len(self.tricks[-1].cards) == 0, "Talon cannot be closed right now" 
                self.talon_closed_by = pid
                self.talon_closed_points_self = 3 if self.get_score(opp) else (2 if self.get_score(opp) < 33 else 1)
                self.talon_closed_points_opp = 3 if self.get_score(pid) == 0 else 2
                self.active_marriage = None
            case "swap_trump":
                assert len(self.tricks[-1].cards) == 0, "Trump Card cannot be swapped right now"
                assert not self.talon_closed_by, "The Talon has already been closed"
                assert self.bottom_card, "There is no Trump Card at the current state of the game"
                assert Card(self.trump, Rank.JACK) in self.hands[pid], f"The {self.trump}-Jack is not in the hand of {pid}"
                self.hands[pid].append(self.bottom_card)
                self.hands[pid] = [card for card in self.hands[pid] if card.suit != self.trump or card.rank != Rank.JACK]
                self.bottom_card = Card(self.trump, Rank.JACK)
                self.active_marriage = None
            case "marriage":
                suit = move["suit"]
                assert Card(suit, Rank.KING) in self.hands[pid], f"{suit}-King is not in the hand of {pid}"
                assert Card(suit, Rank.QUEEN) in self.hands[pid], f"{suit}-Queen is not in the hand of {pid}"
                assert len(self.tricks[-1].cards) == 0, "This is not the first move of the Trick - no marriage can be played"
                self.marriages.append(Marriage(suit, 40 if suit == self.trump else 20, pid))
                self.active_marriage = suit
            case "play_card":
                card = Card(move["card"]["suit"], move["card"]["rank"])
                opp = self.other_player(pid)
                assert card in self.legal_cards(pid), f"Card {card} is an illegal Move"
                self.hands[pid] = [c for c in self.hands[pid] if c != card] 
                if len(self.tricks[-1].cards) == 0:
                    self.tricks[-1].cards.append(card)
                    self.current_player = opp
                else:
                    trick_winner = pid if self._wins_trick(card) else opp
                    self.tricks[-1].cards.append(card)
                    self.tricks[-1].winner = trick_winner
                    self.current_player = trick_winner
                    game_winner = self.determine_winner()
                    if game_winner:
                        self.game_points[game_winner] += self.determine_points_for_game() # type: ignore
                        return
                    else:
                        if self.talon and not self.talon_closed_by:
                            self.draw_cards()
                        turns_left = len(self.hands[list(self.hands.keys())[0]]) >= 1
                        if turns_left:
                            self.tricks.append(Trick())
                self.active_marriage = None

        
        
        