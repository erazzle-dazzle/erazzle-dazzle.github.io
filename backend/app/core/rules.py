from app.core.models import GameState, Player, Card


def legal_moves(state: GameState, player_id: str):
    # TODO: implement Schnapsn rules
    return state.hands[player_id]


def apply_move(state: GameState, player_id: str, card: Card) -> GameState:
    # Copy state (important!)
    new_state = state  # later: deep copy

    # Remove card
    new_state.hands[player_id].remove(card)

    # Add to trick
    new_state.trick.append(card)

    # TODO:
    # - resolve trick
    # - draw from talon
    # - update scores

    return new_state