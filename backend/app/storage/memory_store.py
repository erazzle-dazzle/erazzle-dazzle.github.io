from app.core.models import GameState
from typing import Dict, Optional

class MemoryStore:
    def __init__(self):
        self.games : Dict[str, GameState] = {}
        self.join_dict : Dict[str, Dict] = {}

    def save_game(self, game_id : str, state : GameState) -> None:
        self.games[game_id] = state

    def get_game(self, game_id : str) -> Optional[GameState]:
        assert game_id in self.games.keys(), "Invalid Game-ID"
        return self.games.get(game_id)
    
    def save_join_data(self, join_code : str, info : Dict) -> None:
        self.join_dict[join_code] = info
    
    def join_game(self, join_code : str) -> Dict:
        result = self.join_dict[join_code]
        del self.join_dict[join_code]
        return result
    
    def delete(self, game_id : str) -> None:
        del self.games[game_id]