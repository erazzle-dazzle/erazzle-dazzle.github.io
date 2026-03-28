import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Player, Card, Suit, Rank
from app.core.rules import apply_move
from app.core.deck import Deck 
from typing import List


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        game_id = str(uuid.uuid4())
        deck : Deck = Deck()
        cards_player1 : List[Card] = deck.draw_multiple(5)
        cards_player2 : List[Card] = deck.draw_multiple(5)
        bottom_card : Card = deck.draw_card()

        state = GameState(
            players=[Player(id="p1"), Player(id="p2")],
            hands={
                "p1": cards_player1,
                "p2": cards_player2,
            },
            playable={
                "p1" : cards_player1,
                "p2" : []
            },
            bottom_card = bottom_card,
            talon=deck.cards,
            talon_closed = False,
            trump=bottom_card.suit,
            current_player="p1",
            trick=[],
            scores={"p1": 0, "p2": 0},
        )

        self.store.save(game_id, state)
        return {"game_id": game_id}

    def get_game(self, game_id: str):
        return self.serialize(self.store.get(game_id))

    def play_move(self, game_id: str, move: dict):
        state = self.store.get(game_id)
        new_state = apply_move(state, move["player_id"], move["card"])
        self.store.save(game_id, new_state)
        return self.serialize(new_state)
    
    def serialize(self, state : GameState):
        return {
            "players": [p.id for p in state.players],
            "hands": {
                pid: [{"suit": c.suit, "rank": c.rank} for c in cards]
                for pid, cards in state.hands.items()
            },
            "playable" : {
                pid: [{"suit": c.suit, "rank": c.rank} for c in cards]
                for pid, cards in state.playable.items()
            },
            "bottom_card" : state.bottom_card,
            "talon" : [{"suit": c.suit, "rank": c.rank} for c in state.talon],
            "talon_closed" : state.talon_closed,
            "trump": state.trump,
            "current_player": state.current_player,
            "trick": [{"suit": c.suit, "rank": c.rank} for c in state.trick],
            "scores": state.scores,
        }