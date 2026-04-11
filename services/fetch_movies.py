from fastapi import APIRouter
import os
import httpx

def fetch_movies_from_tmdb(query: str):
    '''headers = {
        'Authorization': f'Bearer {os.getenv("TMDB_APIKEY")}',
    }
    '''
    params = {
        'query': query,
        'api_key': os.getenv("TMDB_APIKEY"),
    }

    with httpx.Client() as client:
        r = client.get('https://api.themoviedb.org/3/search/movie', params=params)
        if r.status_code != 200:
            return []
        data = r.json()
        if not data.get("results", []):
            return {"message": "No movies found"}
        movies = []
        for movie in data.get("results", [])[:10]:
            movies.append({
                "id": movie['id'],
                "title": movie['title'],
                'overview': movie['overview'],
                'poster_path': movie['poster_path'],
                'release_date': movie['release_date']
                })
    return movies