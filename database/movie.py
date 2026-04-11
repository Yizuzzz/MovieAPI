from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database.database import Base

class Movie(Base):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    overview = Column(String, nullable=False)
    poster_path = Column(String, nullable=False)
    release_date = Column(String, nullable=False)

    favorites = relationship("Favorite", back_populates="movie")
    watchlists = relationship("Watchlist", back_populates="movie")