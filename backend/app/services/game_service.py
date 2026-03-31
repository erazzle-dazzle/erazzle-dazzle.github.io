import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Player, Card, Suit, Rank, PlayerInfo
from app.core.rules import apply_move, other_player
from app.core.deck import Deck 
from typing import List


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        p1_token = str(uuid.uuid4())
        p2_token = str(uuid.uuid4())

        game_id = str(uuid.uuid4())
        deck : Deck = Deck()
        cards_player1 : List[Card] = deck.draw_multiple(5)
        cards_player2 : List[Card] = deck.draw_multiple(5)
        bottom_card : Card = deck.draw_card()

        info_player1 = PlayerInfo(
            hand = cards_player1,
            playable= cards_player1,
            taken_tricks=[],
            extra_points=0,
            score=0,
            marriages=[]
        )

        info_player2 = PlayerInfo(
            hand = cards_player2,
            playable= [],
            taken_tricks=[],
            extra_points=0,
            score=0,
            marriages=[]
        )

        state = GameState(
            players=[Player(id="p1"), Player(id="p2")],
            player_info={
                "p1" : info_player1,
                "p2" : info_player2
            },
            player_token={
                p1_token : "p1",
                p2_token : "p2"
            },
            bottom_card = bottom_card,
            talon=deck.cards,
            talon_closed_by = None,
            trump=bottom_card.suit,
            current_player="p1",
            trick=[],
            winner = None,
            both_joined=False,
            last_trick_winner= None
        )

        self.store.save(game_id, state)
        return {
            "game_id": game_id,
            "player_token": p1_token,
            "invite_url": f"/game/{game_id}?token={p2_token}",
        }

    def get_game(self, game_id: str, player_token : str):
        return self.serialize(self.store.get(game_id), player_token)

    def play_move(self, game_id: str, player_token : str, move : dict):
        state : GameState = self.store.get(game_id)
        player_id = state.player_token[player_token]
        new_state = apply_move(state, player_id, move)
        self.store.save(game_id, new_state)
        return self.serialize(new_state, player_token)
    
    def serialize(self, state : GameState, token : str):
        pid = state.player_token[token]
        opponent = other_player(state.players, pid)
        result = {
            "players": [p.id for p in state.players],
            "you" : {
                    "hand" : state.player_info[pid].hand,
                    "playable_cards" : state.player_info[pid].playable,
                    "taken_tricks" : state.player_info[pid].taken_tricks,
                    "extra_points" : state.player_info[pid].extra_points,
                    "score" : state.player_info[pid].score,
                    "won_last_trick" : (state.last_trick_winner == pid),
                    "marriages" : [{"suit" : m.suit, "points" : m.points} for m in state.player_info[pid].marriages]
                },
            "opponent" : {
                "hand_size": len(state.player_info[opponent].hand),
                "marriages" : [{"suit" : m.suit, "points" : m.points} for m in state.player_info[opponent].marriages]
            },
            "bottom_card" : state.bottom_card,
            "talon" : [{"suit": c.suit, "rank": c.rank} for c in state.talon],
            "talon_closed_by" : state.talon_closed_by,
            "trump": state.trump,
            "current_player": state.current_player,
            "trick": [{"suit": c.suit, "rank": c.rank} for c in state.trick],
            "winner" : None,
            "both_joined" : state.both_joined
        }
        return result