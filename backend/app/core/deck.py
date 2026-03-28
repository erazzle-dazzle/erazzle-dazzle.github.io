from app.core.models import Suit, Rank, Card
from random import shuffle
from typing import List

class Deck:
    def __init__(self) -> None:
        self.cards : List[Card] = []
        for suit in Suit:
            for rank in Rank:
                self.cards.append(Card(suit, rank))
        self.shuffle()
    
    def shuffle(self) -> None:
        shuffle(self.cards)
    
    def draw_card(self) -> Card:
        return self.cards.pop(0)
    
    def draw_multiple(self, k : int) -> List[Card]:
        result : List[Card] = []
        for i in range(k):
            result.append(self.draw_card())
        return result