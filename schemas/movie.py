from pydantic import BaseModel, Field

class MovieData(BaseModel):
    title: str
    overview: str
    poster_path: str
    release_date: str

class FavoriteCreate(BaseModel):
    tmdb_id: int
    title: str
    overview: str
    poster_path: str
    release_date: str
    rating: float = Field(..., ge=0, le=5)
    review: str | None = None

class FavoriteResponse(BaseModel):
    id: int
    rating: float
    review: str | None
    movie: MovieData

    class Config:
        from_attributes = True 


class MovieUpdate(BaseModel):
    rating: float | None = Field(default=None, ge=0, le=5)
    review: str | None = None

class WatchlistCreate(BaseModel):
    tmdb_id: int
    title: str
    overview: str
    poster_path: str
    release_date: str

class WatchlistResponse(BaseModel):
    id: int
    movie: MovieData

    class Config:
        from_attributes = True