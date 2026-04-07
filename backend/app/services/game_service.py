import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Card, Suit, Rank
from app.core.deck import Deck 
from typing import List
from random import sample


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        invite_token = str(uuid.uuid4())
        game_id = str(uuid.uuid4())
        state = GameState()

        random_index = sample([0,1], 1)[0]
        player_token = list(state.player_tokens.keys())[random_index]
        other_token = list(state.player_tokens.keys())[1 - random_index]

        self.store.save_game(game_id, state)
        self.store.save_join_data(invite_token, {"game_id" : game_id, "player_token" : other_token})
        return {
            "game_id": game_id,
            "player_token": player_token,
            "invite_token": invite_token,
        }
    
    def join(self, token : str):
        result = self.store.join_game(token)
        game_id = result["game_id"]
        game = self.store.get_game(game_id)
        assert game
        game.both_joined = True
        self.store.save_game(game_id, game)
        return result

    def get_game(self, game_id: str, player_token : str):
        game = self.store.get_game(game_id)
        assert game
        assert player_token in game.player_tokens.keys(), "Invalid Player Token"
        return self.produce_message(game, player_token)

    def play_move(self, game_id: str, player_token : str, move : dict):
        state = self.store.get_game(game_id)
        assert state
        pid = state.player_tokens[player_token]
        state.apply_move(pid, move)
        self.store.save_game(game_id, state)
        return self.produce_message(state, player_token)
    
    def shuffle(self, game_id : str):
        state = self.store.get_game(game_id)
        assert state
        if not state.determine_winner():
            return {
            "game_id": game_id
        }
        state.new_game()
        self.store.save_game(game_id, state)
        return {
            "game_id": game_id
        }
    
    def delete(self, game_id : str):
        self.store.delete(game_id)
        return {
            "game_id": game_id
        }

    
    def produce_message(self, state : GameState, token : str):
        state.sort_hands()

        you = state.player_tokens[token]

        opp = state.other_player(you)

        last_trick = state.tricks[-2].serialize() if len(state.tricks) >= 2 else None

        first_trick_you = [trick for trick in state.tricks if trick.winner == you][0] if [trick for trick in state.tricks if trick.winner == you] else None
        first_trick_opp = [trick for trick in state.tricks if trick.winner == opp][0] if [trick for trick in state.tricks if trick.winner == opp] else None

        result = {
            "you" : {
                "hand" : state.hands[you],
                "playable_cards" : state.legal_cards(you),
                "first_taken_trick" : first_trick_you.serialize() if first_trick_you else None,
                "score" : state.get_score(you),
                "can_close_talon" : (len(state.tricks[-1].cards) == 0 and state.current_player == you),
                "game_points" : state.game_points[you],
                "marriages" : [marriage.serialize() for marriage in state.marriages if marriage.pid == you]
            },
            "opponent" : {
                "hand_size" : len(state.hands[opp]),
                "game_points" : state.game_points[opp],
                "first_taken_trick" : first_trick_opp.serialize() if first_trick_opp else None,
                "marriages" : [marriage.serialize() for marriage in state.marriages if marriage.pid == opp]
            },
            "bottom_card" : state.bottom_card,
            "talon_size" : len(state.talon),
            "talon_closed" : bool(state.talon_closed_by),
            "current_player": state.current_player,
            "trick": state.tricks[-1].serialize(),
            "last_trick" : last_trick,
            "game_winner" : "you" if (state.determine_winner() == you) else ("opponent" if state.determine_winner() else None),
            "both_joined" : state.both_joined,
            "bummerl_winner" : "you" if (state.game_points[you] >= 9) else ("opponent" if state.game_points[opp] >= 9 else None),
            "marriages" : [marriage.serialize() for marriage in state.marriages]
        }
        return result