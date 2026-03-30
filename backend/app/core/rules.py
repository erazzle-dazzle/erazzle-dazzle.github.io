from app.core.models import GameState, Player, Card, Suit, Player, Rank
from typing import List, Optional

def card_value(card : Card):
    if card.rank == Rank.ACE:
        return 11
    elif card.rank == Rank.TEN:
        return 10
    elif card.rank == Rank.KING:
        return 4
    elif card.rank == Rank.QUEEN:
        return 3
    else: # --> card.rank == Rank.JACK:
        return 2
    
def has_marriage_in_suit(state : GameState, player_id : str, suit : Suit) -> bool:
    return Card(suit, Rank.KING) in state.player_info[player_id].hand and Card(suit, Rank.QUEEN) in state.player_info[player_id].hand
    
def beats(card1 : Card, card2 : Card, trump : Suit):
    if card1.suit == card2.suit:
        return card_value(card1) > card_value(card2)
    else:
        return card1.suit == trump

def other_player(players : List[Player], player : str) -> str:
    return players[1].id if players[0].id == player else players[0].id

def points_of_card_list(trick : List[Card]) -> int:
    result = 0
    for card in trick:
        result += card_value(card)
    return result

def is_legal(card : Card, state : GameState, player_id : str) -> bool:
    for legal_card in legal_moves(state, player_id):
        if card.suit == legal_card.suit and card.rank == legal_card.rank:
            return True
    return False

def legal_moves(state: GameState, player_id: str) -> List[Card]:
    # TODO: 20, 40, Zudrehen
    result = []
    if state.current_player != player_id:
        result = []
    elif state.trick == []:
        result = state.player_info[player_id].hand
    elif state.talon_closed_by or state.talon == []:
        played_card : Card = state.trick[0]
        beating : List[Card] = [card for card in state.player_info[player_id].hand if beats(card, played_card, state.trump)]
        beating_same_suit = [card for card in beating if card.suit == played_card.suit]
        result = beating if beating_same_suit == [] else beating_same_suit
    else:
        result = state.player_info[player_id].hand
    print(result)
    return result

def cards_left_in_hand(state : GameState) -> bool:
    result : bool = False
    for player, player_info in state.player_info.items():
        result = True if player_info.hand != [] else result
    return result

def determine_regular_winner(state : GameState) -> Optional[str]:
    if not state.talon_closed_by:
        for player, player_info in state.player_info.items():
            if player_info.score >= 66:
                return player
        return None
    else:
        if not cards_left_in_hand(state):
            return state.talon_closed_by if state.player_info[state.talon_closed_by].score >= 66 else other_player(state.players, state.talon_closed_by)

def apply_move(state: GameState, player_id: str, card) -> GameState:
    card = Card(card["suit"], card["rank"])
    assert is_legal(card, state, player_id), "Illegal move"
    # Copy state (important!)
    new_state = state  # later: deep copy

    # check for twenty or forty
    if state.trick == [] and has_marriage_in_suit(new_state, player_id, card.suit):
        state.player_info[player_id].extra_points += 40 if card.suit == state.trump else 20

    # Remove card
    new_state.player_info[player_id].hand.remove(card)

    # Add to trick
    new_state.trick.append(card)

    if len(new_state.trick) == 1:
        new_state.current_player = other_player(state.players, player_id)
        new_state.player_info[player_id].playable = []
        new_state.player_info[new_state.current_player].playable = legal_moves(new_state, new_state.current_player)
        # todo add extra points
    else:
        winner = player_id if beats(new_state.trick[1], new_state.trick[0], new_state.trump) else other_player(new_state.players, player_id)
        new_state.last_trick_winner = winner
        loser = other_player(new_state.players, winner)
        new_state.player_info[winner].taken_tricks += new_state.trick
        new_state.player_info[winner].score = points_of_card_list(new_state.player_info[winner].taken_tricks) + new_state.player_info[winner].extra_points
        new_state.trick = []
        if len(new_state.talon) == 0:
            game_winner = determine_regular_winner(state)
            if not game_winner:
                game_winner = winner
            new_state.winner = game_winner
            return new_state
        elif len(new_state.talon) == 1:
            new_state.player_info[winner].hand.append(new_state.talon.pop(0))
            new_state.player_info[loser].hand.append(new_state.bottom_card)
            new_state.bottom_card = None
        else:
            new_state.player_info[winner].hand.append(new_state.talon.pop(0))
            new_state.player_info[loser].hand.append(new_state.talon.pop(0))
        new_state.current_player = winner
        new_state.player_info[winner].playable = legal_moves(new_state, winner)
        new_state.player_info[loser].playable = legal_moves(new_state, loser)
    new_state.winner = determine_regular_winner(new_state)
    # TODO:
    # - resolve trick
    # - draw from talon
    # - update scores

    return new_state