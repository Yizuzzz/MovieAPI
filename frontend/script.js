const ruta = "http://127.0.0.1:8000/movies/";

function searchMovies() {
    document.getElementById("favorites").innerHTML = "";
    const query = document.getElementById("movie-name").value;
    fetch(`${ruta}search?q=` + query)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";
            data.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("movie-result");
                const title = document.createElement("h3");
                title.textContent = movie.title;

                const overview = document.createElement("p");
                overview.textContent = movie.overview;

                const release = document.createElement("p");
                release.textContent = "Release Date: " + movie.release_date;

                const img = document.createElement("img");
                img.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
                img.alt = movie.title + " poster";

                movieDiv.appendChild(title);
                movieDiv.appendChild(overview);
                movieDiv.appendChild(release);
                movieDiv.appendChild(img);
                const saveButton = document.createElement("button");
                saveButton.textContent = "⭐ Guardar";

                saveButton.addEventListener("click", () => {
                    console.log("CLICK:", movie.title);
                    saveButton.disabled = true;
                    saveFavorite(movie);
                }, { once: true });
                movieDiv.appendChild(saveButton);
                resultsDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching movies:", error));
}

let isSaving = false;

function saveFavorite(movie) {
    console.log(movie);
    if (isSaving) return;
    isSaving = true;

    console.log("CLICK:", movie.title);

    fetch(`${ruta}favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            },
        body: JSON.stringify({
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            rating: 5
        })
    })
    .then(response => response.json())
    .then(data => {
        alert("Película guardada ⭐");
        isSaving = false;
        console.log("Pelicula guardada:", movie.title);
    })
    .catch(error => {
        console.error("Error saving favorite:", error);
        alert("Error al guardar la película. Inténtalo de nuevo.");
        isSaving = false;
    });
}

function getFavorites() {
    document.getElementById("results").innerHTML = "";
    fetch(`${ruta}favorites`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then(response => response.json())
    .then(data => {
        const favoritesDiv = document.getElementById("favorites");
        favoritesDiv.innerHTML = "";
        data.forEach(movie => {
            const movieDiv = document.createElement("div");
            movieDiv.classList.add("favorite-movie");
            movieDiv.innerHTML = `
                <h3>${movie.title}</h3>
                <p>${movie.overview}</p>
                <p>Release Date: ${movie.release_date}</p>
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">
                <p>Rating: ${movie.rating}</p>
            `;
            const updateButton = document.createElement("button");
            updateButton.textContent = "⭐ Actualizar Rating";
            updateButton.addEventListener("click", () => {
                newRatingValue(movie.id);
            });
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Eliminar";
            deleteButton.addEventListener("click", () => {
                deleteFavorite(movie.id);
            });
            //favoritesDiv.appendChild(updateButton);
            movieDiv.appendChild(updateButton);
            movieDiv.appendChild(deleteButton);
            favoritesDiv.appendChild(movieDiv);
        });
    })
}

function newRatingValue(movieId) {
    const newRating = prompt("Ingrese el nuevo rating (1-5):");
    if (newRating !== null) {
        const ratingValue = parseInt(newRating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            alert("Por favor, ingrese un número válido entre 1 y 5.");
            return;
        }
        updateButton(movieId, ratingValue);
    }
}

function updateButton(movieId, newRating) {
    fetch(`${ruta}favorites/${movieId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rating: newRating
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        alert(`Película ${data.title} actualizada ⭐`);
        getFavorites(); // Refresh the favorites list
    })
}

function deleteFavorite(movieId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta película de tus favoritos?")) {
        fetch(`${ruta}favorites/${movieId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            getFavorites(); // Refresh the favorites list
        })
        .catch(error => {
            console.error("Error deleting favorite:", error);
            alert("Error al eliminar la película. Inténtalo de nuevo.");
        });
    }
}
