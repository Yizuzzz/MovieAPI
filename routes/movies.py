from dotenv import load_dotenv
load_dotenv()

import os
import httpx
from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException


from database.database import get_db
from database.models import FavoriteMovie
from schemas.movie import MovieCreate, MovieResponse, MovieUpdate
from services.fetch_movies import fetch_movies_from_tmdb

router = APIRouter(prefix="/movies")

@router.get("/search")
async def get_movies(q: str):
    movies = fetch_movies_from_tmdb(q)

    return movies

    
@router.post("/favorites")
async def add_favorite(movie: MovieCreate, db: Session = Depends(get_db)):
    new_favorite = FavoriteMovie(
        title=movie.title,
        overview=movie.overview,
        release_date=movie.release_date,
        poster_path=movie.poster_path,
        rating=movie.rating
    )
    print("guardando:", new_favorite.title, new_favorite.rating)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return {"Pelicula agregada: ": new_favorite.title,
            "Rating: ": new_favorite.rating,
    }


@router.get("/favorites", response_model=list[MovieResponse])
async def get_favorites(db:Session = Depends(get_db), rating : int | None = None, page: int = 1, page_size: int = 1000):
    favorites = db.query(FavoriteMovie).all()
    if rating is not None:
        favorites = [favorite for favorite in favorites if favorite.rating == rating]
    # Implement pagination
    start = (page - 1) * page_size
    end = start + page_size
    favorites = favorites[start:end]
    return favorites

@router.delete("/favorites/{movie_id}")
async def delete_favorite(movie_id: int, db: Session = Depends(get_db)):
    favorite = db.query(FavoriteMovie).filter(FavoriteMovie.id == movie_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite movie not found")
    db.delete(favorite)
    db.commit()
    return {"message": "Favorite movie deleted successfully"}

@router.patch("/favorites/{movie_id}")
async def update_favorite(movie_id: int, movie: MovieUpdate, db: Session = Depends(get_db)):
    favorite = db.query(FavoriteMovie).filter(FavoriteMovie.id == movie_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite movie not found")
    for key, value in movie.dict(exclude_unset=True, exclude_none=True).items():
        setattr(favorite, key, value)
    db.commit()
    db.refresh(favorite)
    return {"message": "Favorite movie updated successfully",
            "id": favorite.id,
            "title": favorite.title,
            "rating": favorite.rating,
            }