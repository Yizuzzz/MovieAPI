from dotenv import load_dotenv
load_dotenv()
import os
import httpx
from fastapi import APIRouter

from sqlalchemy.orm import Session
from database.database import get_db
from database.models import FavoriteMovie
from fastapi import Depends
from schemas.movie import MovieCreate, MovieResponse

router = APIRouter(prefix="/movies")

def fetch_movies_from_tmdb(query: str):
    headers = {
        'Authorization': f'Bearer {os.getenv("TMDB_APIKEY")}',
    }

    params = {
        'query': query,
    }

    with httpx.Client() as client:
        r = client.get('https://api.themoviedb.org/3/search/movie', headers=headers, params=params)
        if r.status_code != 200:
            return {"message": "Error fetching data from TMDB API"}
        data = r.json()
        if not data.get("results", []):
            return {"message": "No movies found"}
        movies = []
        for movie in data.get("results", [])[:5]:
            movies.append({"title": movie['title'], 'overview': movie['overview'], 'release_date': movie['release_date'], 'poster_path': movie['poster_path']})
    return movies

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
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return {"Pelicula agregada: ": new_favorite.title,
            "Rating: ": new_favorite.rating,
            }


@router.get("/favorites", response_model=list[MovieResponse])
async def get_favorites(db:Session = Depends(get_db)):
    favorites = db.query(FavoriteMovie).all()
    return favorites