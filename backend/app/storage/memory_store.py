class MemoryStore:
    def __init__(self):
        self.games = {}

    def save(self, game_id, state):
        self.games[game_id] = state

    def get(self, game_id):
        return self.games.get(game_id)
    
    def delete(self, game_id) -> None:
        del self.games[game_id]