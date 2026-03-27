from pydantic import BaseModel

class MovieCreate(BaseModel):
    title: str
    overview: str | None
    release_date: str | None
    poster_path: str
    rating: int

class MovieResponse(BaseModel):
    id: int
    title: str
    overview: str
    release_date: str
    poster_path: str
    rating: int