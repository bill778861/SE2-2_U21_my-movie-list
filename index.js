// 變數：API來源
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 變數：放置電影API Index資料
const movies = []
// 變數：放置電影的搜尋結果
let moviesSearchAnswer = []
// 變數：節點
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
// 變數：分頁器每頁顯示筆數
const MOVIES_PER_PAGE = 12



// 向API提出請求：將電影資料渲染進首頁
axios.get(INDEX_URL)
  .then(resopnse => {
    // 方法一：藉由迴圈將資料一筆一筆放入陣列中
    // for (const movie of resopnse.data.results) {
    //   movies.push(movie)
    // }
    // 方法二：使用展開運算子
    movies.push(...resopnse.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => {
    console.log(error)
  })
  .then(() => {

  })


  // 事件監聽：More按鍵觸發Modal; +按鍵將電影加入favorite
  dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
      showMovieModal(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addToFavorite(Number(event.target.dataset.id))
    }
  })


// 事件監聽：Search Bar 提交
searchForm.addEventListener('submit',function onSearchFormSubmitted(event) {
  // 預防瀏覽器執行"submit"事件的預設行為(當沒有設定 form 標籤的 action 屬性時，發生 submit 會重新導向當前頁面)
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  // 若 keyword 為空字串，則跳出對話視窗
  // if (!keyword.length) {
  //   return alert('請輸入有效字串!')
  // }

  // 篩選出標題包含 keyword 的電影
  // 方法一： forEach()
  // const filteredMovies = []
  // movies.forEach(movie => {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // })
  // 方法二： filter()
  const filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  // 若沒有符合 keyword 的電影，則跳出對話視窗，且不進行渲染電影資料
  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  // 先確定 filteredMovies 不是空陣列後，再指派給全域變數 moviesSearchAnswer，
  // 以防使用者輸入的關鍵字無找到符合條件的電影後，又再去按分頁器，
  // 導致畫面顯示的是 movies的分頁資料，而非上次 moviesSearchAnswer的分頁資料。
  moviesSearchAnswer = filteredMovies

  // 渲染分頁器頁碼
  renderPaginator(moviesSearchAnswer.length)

  // 渲染電影資料
  renderMovieList(getMoviesByPage(1))
})


// 事件監聽：分頁器按下頁碼後，渲染部分電影資料
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 當發生點擊事件的元素，其HTML標籤名稱不是"A"時，跳出事件處理程序
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
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
              <button type="button" class="btn btn-info btn-add-favorite" data-id="${element.id}">+</button>
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

// 函式：將電影加入favorite清單中
function addToFavorite(id) {
  // 從 localStorage 中取出收藏清單資料
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 符號 || 會判斷兩邊為true者指派給變數；若兩邊皆為true，則左邊優先。
  const movie = movies.find(movie => movie.id === id)

  // 先確認按下+鍵的電影，尚未在收藏清單中
  if (list.some(movie => movie.id === id)) {
    return alert(`電影 ${movie.title} 已經在收藏清單中！`)
  }

  // 將電影加入收藏清單
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  alert(`你成功地將電影 ${movie.title} 加入收藏清單中。`)
}

// 函式： 渲染分頁器頁碼
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ``
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 函式：依照頁碼回傳部分電影資料
function getMoviesByPage(page) {
  // 三元運算子： 條件式 ? A : B (當條件式為true，則回傳A；為false，則回傳B)
  const moviesData = moviesSearchAnswer.length ? moviesSearchAnswer : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return moviesData.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
