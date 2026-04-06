const APILINK = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=87e84ec355382f5b4c73b1213d70b7fe&page=1'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCHAPI = 'https://api.themoviedb.org/3/search/movie?api_key=87e84ec355382f5b4c73b1213d70b7fe&query='


const main = document.querySelector('.list')
const form = document.getElementById('form')
const search = document.getElementById('search-input')

returnMovies(APILINK)
function returnMovies(url){
    fetch(url).then(res => res.json())
    .then(function(data){
        console.log(data.results);
        main.innerHTML = '';

        const div_row = document.createElement('div');
        div_row.setAttribute('class', 'row');

        data.results.forEach(element => {
            const div_card = document.createElement('div');
            div_card.setAttribute('class', 'card');
            const div_column = document.createElement('div');
            div_column.setAttribute('class', 'column');

            

            const image = document.createElement('img');
            image.setAttribute('class', 'thumbnail');
            image.alt = element.title;
            const center = document.createElement('center');

            const title = document.createElement('h3');
            

            title.innerText = `${element.title}`;
            image.src = element.poster_path ? IMG_PATH + element.poster_path : '';

            center.appendChild(image);
            div_card.appendChild(center);
            div_card.appendChild(title);
            div_column.appendChild(div_card);
            div_row.appendChild(div_column);
        });

        main.appendChild(div_row);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value.trim();
    
    if(searchTerm){
        returnMovies(SEARCHAPI + encodeURIComponent(searchTerm));
        search.value = '';
    }
});
