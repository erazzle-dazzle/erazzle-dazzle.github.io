from app.core.models import GameState
from typing import Dict

class MemoryStore:
    def __init__(self):
        self.games : Dict[str, GameState] = {}
        self.join_dict = {}

    def save_game(self, game_id : str, state : GameState) -> None:
        self.games[game_id] = state

    def get_game(self, game_id) -> GameState:
        return self.games.get(game_id)
    
    def save_join_data(self, join_code, info):
        self.join_dict[join_code] = info
    
    def join_game(self, join_code):
        result = self.join_dict[join_code]
        del self.join_dict[join_code]
        return result
    
    def delete(self, game_id) -> None:
        del self.games[game_id]