from app.core.models import GameState, Player, Card, Suit, Player, Rank
from typing import List

def beats(card1 : Card, card2 : Card, trump : Suit):
    if card1.suit == card2.suit:
        return card1.rank > card2.rank
    else:
        return card1.suit == trump

def other_player(players : List[Player], player : str) -> str:
    return players[1].id if players[0].id == player else players[0].id

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

def points_of_trick(trick : List[Card]) -> int:
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
    if state.trick == []:
        result = state.hands[player_id]
    elif state.talon_closed or state.talon == []:
        played_card : Card = state.trick[0]
        beating : List[Card] = [card for card in state.hands[player_id] if beats(card, played_card, state.trump)]
        beating_same_suit = [card for card in beating if card.suit == played_card.suit]
        result = beating if beating_same_suit == [] else beating_same_suit
    else:
        result = state.hands[player_id]
    print(result)
    return result


def apply_move(state: GameState, player_id: str, card) -> GameState:
    card = Card(card["suit"], card["rank"])
    assert is_legal(card, state, player_id), "Illegal move"
    # Copy state (important!)
    new_state = state  # later: deep copy

    # Remove card
    new_state.hands[player_id].remove(card)

    # Add to trick
    new_state.trick.append(card)

    if len(new_state.trick) == 1:
        new_state.current_player = other_player(state.players, new_state.current_player)
    else:
        winner = player_id if beats(new_state.trick[1], new_state.trick[0], new_state.trump) else other_player(new_state.players, player_id)
        loser = other_player(new_state.players, winner)
        new_state.scores[winner] += points_of_trick(new_state.trick)
        new_state.trick = []
        new_state.hands[winner].append(new_state.talon.pop(0))
        if new_state.talon == []:
            new_state.hands[loser].append(new_state.bottom_card)
        else:
            new_state.hands[loser].append(new_state.talon.pop(0))
        new_state.current_player = winner
    # TODO:
    # - resolve trick
    # - draw from talon
    # - update scores

    return new_state