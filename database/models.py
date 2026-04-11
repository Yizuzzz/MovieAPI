'''from sqlalchemy import Column, Integer, String
from database.database import Base, engine

class FavoriteMovie(Base):
    __tablename__ = 'favorite_movies'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    overview = Column(String, nullable=False)
    release_date = Column(String, nullable=False)
    poster_path = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
Base.metadata.create_all(engine)'''