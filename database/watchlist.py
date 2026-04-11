from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime

class Watchlist(Base):
    __tablename__ = 'watchlists'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="watchlists")
    movie = relationship("Movie", back_populates="watchlists")

    __table_args__ = (
        UniqueConstraint('user_id', 'movie_id', name='unique_watchlist_entry'),
    )