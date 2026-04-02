from fastapi import APIRouter, Query
from app.services.game_service import GameService

router = APIRouter()
service = GameService()

@router.post("/game")
def create_game():
    return service.create_game()

@router.get("/game/{game_id}")
def get_game(game_id: str, token: str = Query(...)):
    return service.get_game(game_id, token)

@router.post("/game/{game_id}/shuffle")
def shuffle(game_id: str):
    return service.shuffle(game_id)

@router.post("/game/{game_id}/delete")
def delete(game_id: str):
    return service.delete(game_id)

@router.post("/join/{token}")
def join_game(token :  str):
    return service.join(token)

@router.post("/game/{game_id}/move")
def play_move(game_id: str, payload: dict):
    return service.play_move(
        game_id,
        payload["player_token"],
        payload["move"]
    )