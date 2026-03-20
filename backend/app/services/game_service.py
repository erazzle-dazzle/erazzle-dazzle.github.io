import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Player
from app.core.rules import apply_move


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        game_id = str(uuid.uuid4())

        state = GameState(
            players=[Player(id="p1"), Player(id="p2")],
            hands={"p1": [], "p2": []},
            talon=[],
            trump=None,
            current_player="p1",
            trick=[],
            scores={"p1": 0, "p2": 0},
        )

        self.store.save(game_id, state)
        return {"game_id": game_id}

    def get_game(self, game_id: str):
        return self.store.get(game_id)

    def play_move(self, game_id: str, move: dict):
        state = self.store.get(game_id)

        player_id = move["player_id"]
        card = move["card"]

        new_state = apply_move(state, player_id, card)

        self.store.save(game_id, new_state)
        return new_state