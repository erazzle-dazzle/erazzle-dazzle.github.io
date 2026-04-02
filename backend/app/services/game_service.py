import uuid
from app.storage.memory_store import MemoryStore
from app.core.models import GameState, Player, Card, Suit, Rank, PlayerInfo
from app.core.rules import apply_move, other_player, card_value, legal_moves
from app.core.deck import Deck 
from typing import List

def card_sorting_helper(card : Card):
    suit = card.suit
    offset = card_value(card)
    if suit == Suit.SPADES:
        return 0 + offset
    elif suit == Suit.HEARTS:
        return 11 + offset
    elif suit == Suit.CLUBS:
        return 22 + offset
    else: # -> suit == Suit.DIAMONDS
        return 33 + offset


class GameService:
    def __init__(self):
        self.store = MemoryStore()

    def create_game(self):
        invite_token = str(uuid.uuid4())
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
            marriages=[],
            game_points=0
        )

        info_player2 = PlayerInfo(
            hand = cards_player2,
            playable= [],
            taken_tricks=[],
            extra_points=0,
            score=0,
            marriages=[],
            game_points=0
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
            last_trick_winner= None,
            talon_closed_points_opp=None,
            talon_closed_points_self=None,
            bummerl_winner=None,
            starter = "p1"
        )

        self.store.save_game(game_id, state)
        self.store.save_join_data(invite_token, {"game_id" : game_id, "player_token" : p2_token})
        return {
            "game_id": game_id,
            "player_token": p1_token,
            "invite_token": invite_token,
        }
    
    def join(self, token : str):
        result = self.store.join_game(token)
        game_id = result["game_id"]
        game : GameState = self.store.get_game(game_id)
        game.both_joined = True
        self.store.save_game(game_id, game)
        return result

    def get_game(self, game_id: str, player_token : str):
        return self.serialize(self.store.get_game(game_id), player_token)

    def play_move(self, game_id: str, player_token : str, move : dict):
        state : GameState = self.store.get_game(game_id)
        player_id = state.player_token[player_token]
        new_state = apply_move(state, player_id, move)
        self.store.save_game(game_id, new_state)
        return self.serialize(new_state, player_token)
    
    def shuffle(self, game_id : str):
        state : GameState = self.store.get_game(game_id)
        if not state.winner:
            return {
            "game_id": game_id
        }
        deck : Deck = Deck()
        cards_player1 : List[Card] = deck.draw_multiple(5)
        cards_player2 : List[Card] = deck.draw_multiple(5)
        bottom_card : Card = deck.draw_card()

        info_player1 = PlayerInfo(
            hand = cards_player1,
            playable= [],
            taken_tricks=[],
            extra_points=0,
            score=0,
            marriages=[],
            game_points=state.player_info["p1"].game_points
        )

        info_player2 = PlayerInfo(
            hand = cards_player2,
            playable= [],
            taken_tricks=[],
            extra_points=0,
            score=0,
            marriages=[],
            game_points=state.player_info["p2"].game_points
        )
        new_state = GameState(
            players=[Player(id="p1"), Player(id="p2")],
            player_info={
                "p1" : info_player1,
                "p2" : info_player2
            },
            player_token= state.player_token,
            bottom_card = bottom_card,
            talon=deck.cards,
            talon_closed_by = None,
            trump=bottom_card.suit,
            current_player=other_player(state.players, state.starter),
            trick=[],
            winner = None,
            both_joined=True,
            last_trick_winner= None,
            talon_closed_points_opp=None,
            talon_closed_points_self=None,
            bummerl_winner=state.bummerl_winner,
            starter = other_player(state.players, state.starter)
        )
        new_state.player_info["p1"].playable = legal_moves(new_state, "p1")
        new_state.player_info["p2"].playable = legal_moves(new_state, "p2")
        self.store.save_game(game_id, new_state)
        return {
            "game_id": game_id
        }
    
    def delete(self, game_id : str):
        self.store.delete(game_id)
        return {
            "game_id": game_id
        }

    
    def serialize(self, state : GameState, token : str):
        pid = state.player_token[token]
        opponent = other_player(state.players, pid)
        state.player_info[pid].hand.sort(key=lambda x : x.suit)
        state.player_info[opponent].hand.sort(key=lambda x : card_sorting_helper(x))
        result = {
            "players": [p.id for p in state.players],
            "you" : {
                    "hand" : state.player_info[pid].hand,
                    "playable_cards" : state.player_info[pid].playable,
                    "taken_tricks" : state.player_info[pid].taken_tricks,
                    "extra_points" : state.player_info[pid].extra_points,
                    "score" : state.player_info[pid].score,
                    "won_last_trick" : (state.last_trick_winner == pid),
                    "marriages" : [{"suit" : m.suit, "points" : m.points} for m in state.player_info[pid].marriages],
                    "can_close_talon" : (len(state.trick) == 0 and state.current_player == pid and not state.talon_closed_by),
                    "game_points" : state.player_info[pid].game_points
                },
            "opponent" : {
                "hand_size": len(state.player_info[opponent].hand),
                "marriages" : [{"suit" : m.suit, "points" : m.points} for m in state.player_info[opponent].marriages],
                "game_points" : state.player_info[opponent].game_points
            },
            "bottom_card" : state.bottom_card,
            "talon_size" : len(state.talon),
            "talon_closed_by" : state.talon_closed_by,
            "trump": state.trump,
            "current_player": state.current_player,
            "trick": [{"suit": c.suit, "rank": c.rank} for c in state.trick],
            "winner" : "you" if (state.winner == pid) else ("opponent" if state.winner else None),
            "both_joined" : state.both_joined,
            "bummerl_winner" : state.bummerl_winner
        }
        return result