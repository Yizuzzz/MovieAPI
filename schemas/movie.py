from pydantic import BaseModel, Field

class MovieCreate(BaseModel):
    title: str
    overview: str | None = None
    release_date: str | None = None
    poster_path: str
    rating: int = Field(..., ge=0, le=5)

class MovieResponse(BaseModel):
    id: int
    title: str
    overview: str
    release_date: str
    poster_path: str
    rating: int

    class Config:
        from_attributes = True

class MovieUpdate(BaseModel):
    title: str | None = None
    overview: str | None = None
    release_date: str | None = None
    poster_path: str | None = None
    rating: int | None = Field(default=None, ge=0, le=5)