const ruta = "https://movieapi-mwc0.onrender.com/movies/";

let currentPage = 1;
const pageSize = 10;
let allFavorites = [];

function searchMovies() {
    document.getElementById("favorites").innerHTML = "";

    const query = document.getElementById("movie-name").value;

    fetch(`${ruta}search?q=` + query)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";

                if (!Array.isArray(data)) {
                    console.error("Respuesta inesperada:", data);
                    return;
                }

                data.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("movie-result");

                // 🔥 Card estilo Netflix
                movieDiv.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                        
                        <div class="overlay">
                            <h3>${movie.title}</h3>
                            <p>${movie.overview}</p>
                            <p>📅 ${movie.release_date}</p>
                            <button class="save-btn">⭐ Guardar</button>
                        </div>
                    </div>
                `;

                // 🔥 Evento del botón dentro del overlay
                const saveBtn = movieDiv.querySelector(".save-btn");

                saveBtn.addEventListener("click", () => {
                    saveBtn.disabled = true;
                    const card = saveBtn.closest(".card");

                    saveFavorite(movie).then(success => {
                        if (success) {
                            saveBtn.textContent = "✔ Guardado";

                            card.classList.add("pop");
                            setTimeout(() => card.classList.remove("pop"), 300);

                            showToast("Película agregada a favoritos ⭐");
                        } else {
                            saveBtn.disabled = false;
                        }
                    });
                }, { once: true });

                resultsDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching movies:", error));
}

let isSaving = false;

function saveFavorite(movie) {
    const ratingInput = prompt("Califica la película (1-5):");

    if (ratingInput === null) return Promise.resolve(false);

    const rating = parseInt(ratingInput);

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Número inválido");
        return Promise.resolve(false);
    }

    return fetch(`${ruta}favorites`)
        .then(res => res.json())
        .then(favorites => {
            const exists = favorites.some(fav =>
                fav.title.toLowerCase() === movie.title.toLowerCase()
            );

            if (exists) {
                showToast("⚠️ Ya está en favoritos");
                return false;
            }

            return fetch(`${ruta}favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: movie.title,
                    overview: movie.overview,
                    release_date: movie.release_date,
                    poster_path: movie.poster_path,
                    rating: rating
                })
            })
            .then(() => true);
        });
        checkIfExistsAndSave(movie, rating);
}

function checkIfExistsAndSave(movie, rating) {
    fetch(`${ruta}favorites`)
        .then(res => res.json())
        .then(favorites => {

            const exists = favorites.some(fav => 
                fav.title.toLowerCase() === movie.title.toLowerCase()
            );

            if (exists) {
                alert("⚠️ Esta película ya está en favoritos");
                return;
            }

            // 👇 si no existe, guardar
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
                    rating: rating
                })
            })
            .then(res => res.json())
            .then(() => {
                alert("Película guardada ⭐");
            });

        });
}

function getFavorites() {
    document.getElementById("results").innerHTML = "";

    fetch(`${ruta}favorites`)
        .then(response => response.json())
        .then(data => {
            const favoritesDiv = document.getElementById("favorites");
            favoritesDiv.innerHTML = "";

            data.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("favorite-movie");

                movieDiv.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                        
                        <div class="overlay">
                            <h3>${movie.title}</h3>
                            <p>⭐ Rating: ${movie.rating}</p>

                            <button class="update-btn">✏️ Editar</button>
                            <button class="delete-btn">🗑 Eliminar</button>
                        </div>
                    </div>
                `;

                movieDiv.querySelector(".update-btn")
                    .addEventListener("click", () => newRatingValue(movie.id));

                movieDiv.querySelector(".delete-btn")
                    .addEventListener("click", () => deleteFavorite(movie.id));

                favoritesDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching favorites:", error));
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

function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;

    document.body.appendChild(toast);

    // activar animación
    setTimeout(() => toast.classList.add("show"), 10);

    // quitar después
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}