// 變數：API來源
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 變數：放置 local storage 裡的電影收藏清單
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
// 變數：節點
const dataPanel = document.querySelector('#data-panel')



// 渲染電影收藏清單
renderMovieList(movies)


// 事件監聽：More按鍵觸發Modal; X按鍵將電影從favorite中移除
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})





// 函式：渲染電影資料
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(element => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + element.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${element.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${element.id}">More</button>
              <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${element.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 函式：將電影資料置入modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `
        <img src="${POSTER_URL + data.image}" alt="Movie Poster" class="img-fluid">
      `
      modalDate.innerText = `release date: ${data.release_date}`
      modalDescription.innerText = data.description
    })
    .catch(error => {
      console.log(error)
    })
    .then(() => {

    })
}

// 函式：將電影自favorite清單中移除
function removeFromFavorite(id) {
  // 當 movies 不存在，或為空陣列時，跳出函式
  if (!movies || !movies.length) return

  const movieIndex = movies.findIndex(movie => movie.id === id)

  // 當 movies 中未找到欲刪除的電影 id 時，跳出函式
  if (movieIndex === -1) return

  // 將電影資料從收藏清單中移除，移除的元素指派給 removedMovie
  const removedMovie = movies.splice(movieIndex, 1)[0]
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
  alert(`你成功地將電影 ${removedMovie.title} 移除於收藏清單中。`)
}
