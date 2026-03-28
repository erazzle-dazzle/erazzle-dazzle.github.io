import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Player, Card, Suit, Rank
from app.core.rules import apply_move


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        game_id = str(uuid.uuid4())

        state = GameState(
            players=[Player(id="p1"), Player(id="p2")],
            hands={
                "p1": [Card(Suit.HEARTS, Rank.ACE)],
                "p2": [Card(Suit.SPADES, Rank.KING)],
            },
            talon=[],
            trump=Suit.HEARTS,
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
    
    def serialize(self, state):
        return {
            "players": [p.id for p in state.players],
            "hands": {
                pid: [{"suit": c.suit, "rank": c.rank} for c in cards]
                for pid, cards in state.hands.items()
            },
            "trump": state.trump,
            "current_player": state.current_player,
            "trick": [{"suit": c.suit, "rank": c.rank} for c in state.trick],
            "scores": state.scores,
        }