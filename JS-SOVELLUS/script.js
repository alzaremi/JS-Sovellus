const apiKey = '7b4574943fa5a148b8c1c1c8dba5d38a'; 

//korvataan haut jqueryllä
const searchBtn = $('#searchBtn');
const moviesContainer = $('#movies-container');
const previousContainer = $('#previous-container');

// tehtiin taulukko
let previousSearches = [];

// korvattiin taas DOMscriptausta jqueryllä. katsotaan onko ocalstoragessa mitään tallessa
$(document).ready(function() {
    const savedSearches = localStorage.getItem('previousSearches');
    if(savedSearches) {
        previousSearches = JSON.parse(savedSearches);
        previousSearches.forEach(movie => createPreviousCard(movie));
    }
});

// tehiin kuuntelija
searchBtn.on('click', function() {

    
    const searchInput = $('#search').val().trim();

    
    moviesContainer.empty();
    //jos haku on tyhjä, ilmoitetaan siitä käyttäjälle
    if (!searchInput) {
        alert('Please enter a movie name!');
        return;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchInput)}`;

    // haetaan data
    axios.get(url)
        .then(res => {

            // palautetaan data
            const data = res.data;

            if (data.results.length === 0) {
                moviesContainer.html('<p>No movies found.</p>'); 
            }

            const movie = data.results[0];

            showMovieCard(movie);
            addToPreviousSearches(movie);
        })
        .catch(err => {
            moviesContainer.html(`<p style="color:red;">Error: ${err.message}</p>`);
            console.error('Virhe:', err);
        });
});

// haku voidaan tehdä myös enterillä
$('#search').on('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// rakennetaan overlaykortti
function showMovieCard(movie) {

   
    const overlay = $(`
        <div class="overlay" data-aos="zoom-in">   <!-- 🔥 Lisätty AOS-animaatio -->
            <div class="movie-card">
                <button class="close-btn">&times;</button>
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w400' + movie.poster_path : ''}" alt="${movie.title}">
                <div class="movie-info">
                    <h2>${movie.title}</h2>
                    <p><strong>Release date:</strong> ${movie.release_date || 'unknown'}</p>
                    <p>${movie.overview || 'no description available'} </p>
                </div>
            </div>
        </div>
    `);

    
    $('body').append(overlay);

    //lisätään kuuntelija
    overlay.find('.close-btn').on('click', () => overlay.remove());

    // suljetaan myös taustaa painamalla
    overlay.on('click', function(e) {
        if (e.target === this) overlay.remove();
    });
}

function addToPreviousSearches(movie) {

    if (previousSearches.find(m => m.id === movie.id)) return;

    previousSearches.push(movie);
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));

    createPreviousCard(movie);
}

//tehdään kortit edelllisislle hauille
function createPreviousCard(movie) {

    const card = $(`
        <div class="previous-card" data-aos="fade-up"> <!-- 🔥 AOS-animaatio -->
            ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">` : ''}
            <div class="movie-info">
                <h2>${movie.title}</h2>
            </div>
        </div>
    `);

    // sulkunappi
    const closeBtn = $('<button class="close-card-btn">&times;</button>');

  
    card.append(closeBtn);

    
    closeBtn.on('click', function(e) {
        e.stopPropagation();
        card.remove();

        previousSearches = previousSearches.filter(m => m.id !== movie.id);
        localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
    });

    //ovelayn saa auki painamalla
    card.on('click', () => showMovieCard(movie));

   
    previousContainer.append(card);
}
