from dotenv import load_dotenv

from database.user import User
from services.jwt import get_current_user
load_dotenv()

import os
import httpx
from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from fastapi import Depends, HTTPException


from database.database import get_db
from database import Favorite, Movie, Watchlist
from schemas.movie import MovieUpdate, WatchlistCreate, WatchlistResponse, FavoriteCreate, FavoriteResponse
from services.fetch_movies import fetch_movies_from_tmdb

router = APIRouter(prefix="/movies")

def get_or_create_movie(db: Session, movie_data: FavoriteCreate | WatchlistCreate) -> Movie:
    movie = db.query(Movie).filter(Movie.tmdb_id == movie_data.tmdb_id).first()
    if not movie:
        movie = Movie(
            tmdb_id=movie_data.tmdb_id,
            title=movie_data.title,
            overview=movie_data.overview,
            poster_path=movie_data.poster_path,
            release_date=movie_data.release_date
        )
        db.add(movie)
        db.flush()  # Flush to get the movie ID for relationships
        db.refresh(movie)
    return movie

@router.get("/search")
async def get_movies(q: str):
    movies = fetch_movies_from_tmdb(q)

    return movies

@router.post("/favorites")
async def add_favorite(movie: FavoriteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movie_db = get_or_create_movie(db, movie)
    user_id = current_user.id

    existing = db.query(Favorite).filter(
        Favorite.user_id == user_id,  # Replace with actual user ID from authentication
        Favorite.movie_id == movie_db.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Movie already in favorites")
    else:
        favorite = Favorite(
            user_id=user_id,  # Replace with actual user ID from authentication
            movie_id=movie_db.id,
            rating=movie.rating,
            review=movie.review
        )
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
    return favorite

@router.get("/favorites", response_model=list[FavoriteResponse])
async def get_favorites(db:Session = Depends(get_db), rating : int | None = None, page: int = 1, page_size: int = 1000, current_user: User = Depends(get_current_user)):
    favorites = db.query(Favorite).options(
        joinedload(Favorite.movie)
    ).filter(
        Favorite.user_id == current_user.id
    )
    if rating is not None:
        favorites = favorites.filter(Favorite.rating == rating)
    favorites = favorites.order_by(Favorite.created_at.desc())\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    return favorites

@router.delete("/favorites/{favorite_id}")
async def delete_favorite(favorite_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorite = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == current_user.id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite movie not found")
    db.delete(favorite)
    db.commit()
    return {"message": "Favorite movie deleted successfully"}

@router.patch("/favorites/{favorite_id}")
async def update_favorite(favorite_id: int, movie: MovieUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorite = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == current_user.id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite movie not found")
    for key, value in movie.dict(exclude_unset=True, exclude_none=True).items():
        setattr(favorite, key, value)
    db.commit()
    db.refresh(favorite)
    return {"message": "Favorite movie updated successfully",
            "id": favorite.id,
            "title": favorite.movie.title,
            "rating": favorite.rating,
            "review": favorite.review
            }

@router.post("/watchlist")
async def add_to_watchlist(movie: WatchlistCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movie_db = get_or_create_movie(db, movie)
    user_id = current_user.id

    existing = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,  # Replace with actual user ID from authentication
        Watchlist.movie_id == movie_db.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Movie already in watchlist")
    else:
        watchlist = Watchlist(
            user_id=user_id,  # Replace with actual user ID from authentication
            movie_id=movie_db.id
        )
        db.add(watchlist)
        db.commit()
        db.refresh(watchlist)
    return {
        "message": "Movie added to watchlist successfully",
        "watchlist_id": watchlist.id
    }

@router.get("/watchlist", response_model=list[WatchlistResponse])
async def get_watchlist(db: Session = Depends(get_db), page: int = 1, page_size: int = 1000, current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    watchlist = db.query(Watchlist)\
    .options(joinedload(Watchlist.movie))\
    .filter(Watchlist.user_id == user_id)\
    .offset((page - 1) * page_size)\
    .limit(page_size)\
    .all()
    return watchlist

@router.delete("/watchlist/{watchlist_id}")
async def delete_from_watchlist(watchlist_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    watchlist_entry = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()
    if not watchlist_entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    db.delete(watchlist_entry)
    db.commit()
    return {"message": "Movie removed from watchlist successfully"}