from fastapi import APIRouter
from app.services.game_service import GameService

router = APIRouter()
service = GameService()

@router.post("/game")
def create_game():
    return service.create_game()

@router.get("/game/{game_id}")
def get_game(game_id: str):
    return service.get_game(game_id)

@router.post("/game/{game_id}/move")
def play_move(game_id: str, move: dict):
    return service.play_move(game_id, move)