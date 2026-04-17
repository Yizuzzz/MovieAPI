const ruta = "https://movieapi-mwc0.onrender.com/movies/";

let token = localStorage.getItem("token") || null;

let debounceTimer;
const DEBOUNCE_DELAY = 400;

let currentEditId = null;

let currentPage = 1;
const pageSize = 10;
let allFavorites = [];

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function clearSections() {
    document.getElementById("view-search").innerHTML = "";
    document.getElementById("view-favorites").innerHTML = "";
    document.getElementById("view-watchlist").innerHTML = "";
}

function showSkeleton(containerId, count = 8) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.classList.add("skeleton-card");

        div.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
        `;

        container.appendChild(div);
    }
}

function showLogin() {
    const container = document.getElementById("auth-container");

    container.classList.remove("hidden");

    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("register-form").classList.add("hidden");
    document.addEventListener("click", (e) => {
    const container = document.getElementById("auth-container");

    if (!container.contains(e.target) && !e.target.closest(".btn-auth")) {
        container.classList.add("hidden");
    }
});
}

function showRegister() {
    const container = document.getElementById("auth-container");

    container.classList.remove("hidden");

    document.getElementById("register-form").classList.remove("hidden");
    document.getElementById("login-form").classList.add("hidden");
    document.addEventListener("click", (e) => {
    const container = document.getElementById("auth-container");

    if (!container.contains(e.target) && !e.target.closest(".btn-auth")) {
        container.classList.add("hidden");
    }
});
}

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    fetch("https://movieapi-mwc0.onrender.com/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        token = data.access_token;
        localStorage.setItem("token", token);
        updateAuthUI();
        document.getElementById("login-email").value = "";
        document.getElementById("login-password").value = "";
        document.getElementById("auth-container").classList.add("hidden");
        showToast("Login exitoso 🔐");
    })
    .catch(() => showToast("Error en login"));
    clearSections();
}

function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    fetch("https://movieapi-mwc0.onrender.com/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(() => {
        showToast("Usuario creado 🎉");
        document.getElementById("register-username").value = "";
        document.getElementById("register-email").value = "";
        document.getElementById("register-password").value = "";
        document.getElementById("auth-container").classList.add("hidden");
        showLogin();
    })
    .catch(() => showToast("Error en registro"));
    clearSections();
}

function logout() {
    token = null;
    localStorage.removeItem("token");
    updateAuthUI();
    clearSections();
    showToast("Sesión cerrada");
}

function updateAuthUI() {
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const secondaryBtns = document.querySelectorAll(".btn-secondary");

    if (token) {
        loginBtn.classList.add("hidden");
        registerBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        secondaryBtns.forEach(btn => btn.classList.remove("hidden"));
    } else {
        loginBtn.classList.remove("hidden");
        registerBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
        secondaryBtns.forEach(btn => btn.classList.add("hidden"));
    }
}

updateAuthUI();

function searchMovies() {
    showView("search");

    const resultsDiv = document.getElementById("view-search");
    resultsDiv.innerHTML = "";


    document.getElementById("view-favorites").innerHTML = "";
    clearSections();

    const query = document.getElementById("movie-name").value;
    if (!query.trim()) return;

    showSkeleton("view-search");

    fetch(`${ruta}search?q=` + query)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("view-search");
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
                            <button class="watch-btn">📌 Watchlist</button>
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

                const watchBtn = movieDiv.querySelector(".watch-btn");

                watchBtn.addEventListener("click", () => {
                    addToWatchlist(movie);
                    showToast("Película agregada a watchlist 📌")
                ;});

                resultsDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching movies:", error));
}

let isSaving = false;

let lastQuery = "";

function handleSearchInput(event) {
    const query = event.target.value;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        if (query.trim() !== "" && query !== lastQuery) {
            lastQuery = query;
            searchMovies();
        }
    }, DEBOUNCE_DELAY);
}

function saveFavorite(movie) {
    if(!token) {
        showToast("⚠️ Debes iniciar sesión para guardar favoritos");
        return Promise.resolve(false);
    }

    const ratingInput = prompt("Califica la película (1-5):");
    if (ratingInput === null) return Promise.resolve(false);

    const rating = parseFloat(ratingInput);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Número inválido");
        return Promise.resolve(false);
    }

    const reviewInput = prompt("Escribe una reseña (opcional):");

    return fetch(`${ruta}favorites`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            rating: rating,
            review: reviewInput ? reviewInput.trim() : null
        })
    })
    .then(res => {
        if (!res.ok) {
            showToast("⚠️ Ya está en favoritos o no autorizado");
            return false;
        }
        return true;
    });
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

function showView(viewName) {
    document.querySelectorAll(".view").forEach(v => {
        v.classList.add("hidden");
    });

    document.getElementById(`view-${viewName}`).classList.remove("hidden");

    // 👇 ocultar buscador si no es search
    const searchBox = document.querySelector(".search-container");
    searchBox.style.display = viewName === "search" ? "block" : "none";
}

function loadFavorites() {
    showView("favorites");

    const favoritesDiv = document.getElementById("view-favorites");
    favoritesDiv.innerHTML = "";

    showSkeleton("view-favorites");

    fetch(`${ruta}favorites`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("view-favorites");
        container.innerHTML = "";

        /*if (!Array.isArray(data) || data.length === 0) {
            showEmptyState("view-favorites", "Sin favoritos⭐", "Agrega peliculas primero.");
            return;
        }*/

        data.forEach(fav => {
            const movieDiv = document.createElement("div");
                movieDiv.classList.add("favorite-movie");

                movieDiv.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w300${fav.movie.poster_path}" alt="${fav.movie.title}">
                        
                        <div class="overlay">
                            <h3>${fav.movie.title}</h3>
                            <p>⭐ Rating: ${fav.rating}</p>
                            <p>📝 ${fav.review ?? "Sin reseña"}</p>
                            <button class="update-btn">✏️ Editar</button>
                            <button class="delete-btn">🗑 Eliminar</button>
                        </div>
                    </div>
                `;

                movieDiv.querySelector(".update-btn")
                    .addEventListener("click", () => openEditModal(fav));

                movieDiv.querySelector(".delete-btn")
                    .addEventListener("click", () => openEditModal(fav));

                favoritesDiv.appendChild(movieDiv);
        });
    });
}

function loadWatchlist() {
    showView("watchlist");

    const container = document.getElementById("view-watchlist");
    container.innerHTML = "";

    showSkeleton("view-watchlist");

    fetch(`${ruta}watchlist`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("view-watchlist");
        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("movie-result");

            div.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w300${item.movie.poster_path}">
                    <div class="overlay">
                        <h3>${item.movie.title}</h3>
                        <button onclick="deleteFromWatchlist(${item.id})">🗑 Eliminar</button>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    });
}

function getFavorites() {
    document.getElementById("view-search").innerHTML = "";
    clearSections();

    fetch(`${ruta}favorites`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            const favoritesDiv = document.getElementById("view-favorites");
            favoritesDiv.innerHTML = "";

            data.forEach(fav => {
                
            });
        })
        .catch(error => console.error("Error fetching favorites:", error));
}

function openEditModal(fav) {
    currentEditId = fav.id;

    document.getElementById("edit-rating").value = fav.rating || "";
    document.getElementById("edit-review").value = fav.review || "";

    document.getElementById("edit-modal").classList.remove("hidden");

    document.getElementById("edit-modal").addEventListener("click", (e) => {
        if (e.target.id === "edit-modal") {
            closeModal();
        }
    });
}

function closeModal() {
    document.getElementById("edit-modal").classList.add("hidden");
}

function submitEdit() {
    const rating = parseFloat(document.getElementById("edit-rating").value);
    const review = document.getElementById("edit-review").value;

    if (isNaN(rating) || rating < 0 || rating > 5) {
        alert("Rating inválido (0-5)");
        return;
    }

    fetch(`${ruta}favorites/${currentEditId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            rating: rating,
            review: review
        })
    })
    .then(res => res.json())
    .then(() => {
        closeModal();
        showToast("Película actualizada ✨");
        getFavorites();
    })
    .catch(err => {
        console.error(err);
        alert("Error al actualizar");
    });
}

/*function newRatingValue(movieId) {
    const newRating = prompt("Ingrese el nuevo rating (1-5):");
    if (newRating === null) return;

    const ratingValue = parseFloat(newRating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            alert("Por favor, ingrese un número válido entre 1 y 5.");
            return;
        }

    const newReview = prompt("Nuevo Review (opcional):")
    if (newReview == "")
        newReview = "Sin reseña.";

    updateButton(movieId, ratingValue, newReview)
}

function updateButton(movieId, newRating, newReview) {
    fetch(`${ruta}favorites/${movieId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            rating: newRating,
            review: newReview
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Película ${data.title} actualizada ⭐`);
        getFavorites(); // Refresh the favorites list
    })
}*/

function deleteFavorite(movieId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta película de tus favoritos?")) {
        fetch(`${ruta}favorites/${movieId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
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

function getWatchlist() {
    document.getElementById("view-search").innerHTML = "";
    document.getElementById("view-favorites").innerHTML = "";
    clearSections();

    fetch(`${ruta}watchlist`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("view-watchlist");
        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("movie-result");

            div.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w300${item.movie.poster_path}">
                    <div class="overlay">
                        <h3>${item.movie.title}</h3>
                        <button onclick="deleteFromWatchlist(${item.id})">🗑 Eliminar</button>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    });
}

function addToWatchlist(movie) {
    if(!token) {
        showToast("⚠️ Debes iniciar sesión para agregar a watchlist");
        return;
    } else {

    fetch(`${ruta}watchlist`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        })
    })
    .then(res => {
        if (!res.ok) {
            showToast("⚠️ Ya está en watchlist");
        } else {
            showToast("Agregado a watchlist 📌");
        }
    });
    }
}

function deleteFromWatchlist(id) {
    fetch(`${ruta}watchlist/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    })
    .then(() => getWatchlist());
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

document.getElementById("movie-name")
    .addEventListener("input", handleSearchInput);