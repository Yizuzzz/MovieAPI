from dotenv import load_dotenv
load_dotenv()
import os
import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/movies")

@router.get("/search")
async def get_movies(q: str):
    headers = {
        'Authorization': f'Bearer {os.getenv("TMDB_APIKEY")}',
    }

    params = {
        'query': q,
    }
    
    movies = []
    posters = []
    async with httpx.AsyncClient() as client:
        r = await client.get('https://api.themoviedb.org/3/search/movie', headers=headers, params=params)
        if r.status_code != 200:
            return {"message": "Error fetching data from TMDB API"}
        data = r.json()
        if not data.get("results", []):
            return {"message": "No movies found"}
        for movie in data.get("results", [])[:5]:
            movies.append({"title": movie['title'], 'overview': movie['overview'], 'release_date': movie['release_date'], 'poster_path': movie['poster_path']})
            posters.append({f"Poster de: {movie['title']}": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"})
    print("POSTERS", posters)
    return movies
    '''
    movie = data['results'][0]
    for movie in data['results'][:5]:
        content.append({"title": movie['title'], 'overview': movie['overview'], 'release_date': movie['release_date'], 'poster_path': movie['poster_path']})
    '''
    
    '''
    movies = q.split(",")

    content = []

    for movie in q: 
        params = {
            'query': movie,
        }
        
        with httpx.Client() as client:
            r = client.get('https://api.themoviedb.org/3/search/movie', headers=headers, params=params)

        data = r.json()
        content.append(data['results'][0]['title'], data['results'][0]['overview'], data['results'][0]['release_date'])
    return content


    content = []
    movies = ['Dune', 'The Matrix', 'Inception', 'Oppenheimer']

    headers = {
        'Authorization': f'Bearer {os.getenv("TMDB_APIKEY")}',
    }
    for movie in movies:
        params = {
            'query': movie,
        }
        print("Params", params)
        r = httpx.get('https://api.themoviedb.org/3/search/movie', headers=headers, params=params)
        data = r.json()
        content.append({"title": data['results'][0]['title'], 'overview': data['results'][0]['overview'], 'release_date': data['results'][0]['release_date']})

    return content
    '''