const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const USERS_URL = BASE_URL + "api/v1/users/";
const userList = document.querySelector("#user-list");
const paginator = document.querySelector("#paginator");
const searchBar = document.querySelector("#search-bar");
const searchInput = document.querySelector("#serach-input");
const genderSearch = document.querySelector("#gender-search");
const userModal = document.querySelector("#user-modal");

// ***** 測試用document *****
const modalHeader = document.querySelector(".modal-header");
const favoriteIcon = document.querySelector("#favorite-icon");
const favoriteUsers = JSON.parse(localStorage.getItem("favoriteUsers")) || []; //測試用 重複之後會刪除


const users = [];
const USERS_PAGE = 36;
let currentPage = 1;
let filteredUsers = [];
let filteredFemaleUsers = [];
let filteredMaleUsers = [];
let maleUsers = [];
let femaleUsers = [];

// *** icon & style
const favorite = "far fa-heart";
const addFavorite = "fas fa-heart";
const favoriteColor = "#ff3321";
const maleStyle = "fas fa-mars";
const maleColor = "#4169f6";
const femaleStyle = "fas fa-venus";
const femaleColor = "#ff6990";

// *** render users
function renderUsers(data) {
  let rawHTML = "";
  data.forEach((user) => {
    //     網頁刻板
    rawHTML += `<div class="col-12 col-sm-6 col-md-3 col-xl-2" >
      <img src="${user.avatar}" class="card-img-top rounded-3" alt="user-avatar" id="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
      <div class="card-body d-flex px-0  justify-content-between">
   <h6 class="card-title">${user.name} , ${user.age}</h6>`;
    if (addFavoriteStyle(user.id)) {
      rawHTML += `<div><i class="${addFavorite}" id="addfavorite-icon" style="color:red"  data-id="${user.id}"></i></div>`;
    } else {
      rawHTML += `<div><i class="${favorite}" id="favorite-icon" style="color:${favoriteColor}" data-id="${user.id}"></i></div>`;
    }
    rawHTML += `</div></div>`;
  });
  userList.innerHTML = rawHTML;
}

// ***favorite 名單渲染時添加樣式
function addFavoriteStyle(id) {
  if (favoriteUsers.some((user) => user.id === id)) return true;
  return false;
}

// *** user modal
function showUserModal(id) {
  const modalFavorite = document.querySelector("#favorite-icon");
  const modalTitle = document.querySelector(".user-modal-title");
  const modalAvatar = document.querySelector(".user-modal-avatar");
  const modalName = document.querySelector(".user-modal-name");
  const modalAge = document.querySelector(".user-modal-age");
  const modalRegion = document.querySelector(".user-modal-region");
  const modalEmail = document.querySelector(".user-modal-email");

  axios.get(USERS_URL + id).then((response) => {
    const userInfo = response.data;
    //     樣式設置
    const ganderStyle = userInfo.gender === "male" ? maleStyle : femaleStyle;
    const ganderColor = userInfo.gender === "male" ? maleColor : femaleColor;
    //     // modal 內容 ***無法使用 .setAttribute 產生data-id 先用文字刻板代替 ***
    //     modalFavorite.setAttribute("data-id", `${userInfo.id}`);
    //     modalTitle.innerHTML = `${userInfo.name} <i class="${ganderStyle}" style="color:${ganderColor}"></i>`;
    //     modalAvatar.innerHTML = `<img src="${userInfo.avatar}" alt="user-avatar" style="width:200px">`;
    //     modalName.innerHTML = `<b>Name：</b>${userInfo.name} ${userInfo.surname}`;
    //     modalAge.innerHTML = `<b>Age：</b>${userInfo.age} , ${userInfo.birthday}`;
    //     modalRegion.innerHTML = `<b>Region：</b> ${userInfo.region}`;
    //     modalEmail.innerHTML = `<a class="user-mail" href="mailto:${userInfo.email}">${userInfo.email}</a>`;

    let rawHTML = "";
    rawHTML += `<div class="modal-dialog modal-lg">
    <div class="modal-content" ">
    <div class="modal-header">
        <h5 class="user-modal-title" id="user-title">${userInfo.name} <i class="${ganderStyle}" style="color:${ganderColor}"></i></h5>
        <button type="button" class="btn">`;

    if (addFavoriteStyle(userInfo.id)) {
      rawHTML += `<i class="${addFavorite}" style="color:red" id="addfavorite-icon" data-id="${userInfo.id}"></i></div>`;
    } else {
      rawHTML += `<i class="${favorite}" style="color:red" id="favorite-icon" data-id="${userInfo.id}"></i></div>`;
    }

    rawHTML += `</button><div class="modal-body d-flex justify-content-around ">

        <div class="user-modal-avatar me-3">
          <img src="${userInfo.avatar}" alt="user-avatar" style="width:200px">
        </div>

        <div class="user-description">
          <p class="user-modal-name"><b>Name：</b>${userInfo.name} ${userInfo.surname}</p>
          <p class="user-modal-age"><b>Age：</b>${userInfo.age} , ${userInfo.birthday}</p>
          <p class="user-modal-region"><b>Region：</b> ${userInfo.region}</p>
          <p class="user-modal-email"><a class="user-mail" href="mailto:${userInfo.email}">${userInfo.email}</p>
        </div>
      </div>
      <div class="modal-footer">
      </div>`;
    userModal.innerHTML = rawHTML;
  });
}

// *** 一頁只秀出36個card
function getByPagi(page) {
  //   filteredUsers有內容時 data為filteredUsers
  const data = filteredUsers.length ? filteredUsers : users;
  const startIndex = (page - 1) * USERS_PAGE;
  return data.slice(startIndex, startIndex + USERS_PAGE);
}

// *** male users pagi
function getByMalePagi(page) {
  let data = "";
  if (filteredFemaleUsers.length) {
    data = filteredMaleUsers;
  } else {
    data = filteredMaleUsers.length ? filteredMaleUsers : maleUsers;
  }
  // 計算起始顯示人數
  const startIndex = (page - 1) * USERS_PAGE;
  // slice 擷取list人數
  return data.slice(startIndex, startIndex + USERS_PAGE);
}

// *** female users pagi
function getByFemalePagi(page) {
  let data = "";
  if (filteredMaleUsers.length) {
    data = filteredFemaleUsers;
  } else {
    data = filteredFemaleUsers.length ? filteredFemaleUsers : femaleUsers;
  }
  // 計算起始顯示人數
  const startIndex = (page - 1) * USERS_PAGE;
  // slice 擷取list人數
  return data.slice(startIndex, startIndex + USERS_PAGE);
}

// *** 產生對應數量的pagination
function renderPaginator(amount) {
  //  amount / USERS_PAGE = number Of Page
  let rawHTML = "";
  const numOfPage = Math.ceil(amount / USERS_PAGE);
  // 印出對應數量 pagination
  for (let num = 1; num <= numOfPage; num++) {
    if (num === currentPage) {
      rawHTML += `<li class="page-item active" ><a class="page-link" id="page-link" data-id="${num}" href="#">${num}</a></li>`;
    } else {
      rawHTML += `<li class="page-item" ><a class="page-link" id="page-link" data-id="${num}" href="#">${num}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

// *** 產生對應數量的 male paginator
function renderMalePaginator(amount) {
  //  amount / USERS_PAGE = number Of Page
  let rawHTML = "";
  const numOfPage = Math.ceil(amount / USERS_PAGE);
  // 印出對應數量 pagination
  for (let num = 1; num <= numOfPage; num++) {
    if (num === currentPage) {
      rawHTML += ` <li class="page-item active" > <a class="page-link" id="malepage-link" data-id="${num}" href="#">${num}</a></li>`;
    } else {
      rawHTML += ` <li class="page-item" > <a class="page-link" id="malepage-link" data-id="${num}" href="#">${num}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

// *** 產生對應數量的 female paginator
function renderFemalePaginator(amount) {
  //  amount / USERS_PAGE = number Of Page
  let rawHTML = "";
  const numOfPage = Math.ceil(amount / USERS_PAGE);
  // 印出對應數量 pagination
  for (let num = 1; num <= numOfPage; num++) {
    if (num === currentPage) {
      rawHTML += ` <li class="page-item active" > <a class="page-link" id="femalepage-link" data-id="${num}" href="#">${num}</a></li>`;
    } else {
      rawHTML += ` <li class="page-item" > <a class="page-link" id="femalepage-link" data-id="${num}" href="#">${num}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

// *** add favorite
function addFavoriteUser(id) {
  //   JOSN格式取出favoriteUsers若為空值 list = []
  //   find找尋users.id與點擊id相同的user
  const user = users.find((user) => user.id === id);
  //   如果list中已經有相同id的user跳出alert
  //   ***** 測試 更改class方式無效果 無法在點擊後更改樣式 *****
  // favoriteIcon.addClass = "fas fa-heart";
  // if (favoriteUsers.some((user) => user.id === id)) {
  //   return alert("已加入追蹤清單");
  // }
  //   把查詢到的相同id的user加入list清單
  favoriteUsers.push(user);
  //   將list轉為JSON格式存入favoriteUsers
  localStorage.setItem("favoriteUsers", JSON.stringify(favoriteUsers));
}

function deleteFavorite(id) {
  if (!favoriteUsers) return;
  const favoriteUsersIndex = favoriteUsers.findIndex((user) => user.id === id);
  if (!favoriteUsersIndex === -1) return;
  favoriteUsers.splice(favoriteUsersIndex, 1);
  localStorage.setItem("favoriteUsers", JSON.stringify(favoriteUsers));
}

//  *** filter male & female
function filteredGrend(data) {
  maleUsers = data.filter((user) => user.gender === "male");
  femaleUsers = data.filter((user) => user.gender === "female");
}

// *** render Users
axios
  .get(USERS_URL)
  .then((response) => {
    //   把user api丟進users 渲染頁面
    users.push(...response.data.results);
    filteredGrend(users);
    renderUsers(getByPagi(1));
    renderPaginator(users.length);
  })
  // 錯誤回報
  .catch((err) => console.log(err));

// *** modal & add favorite event
userList.addEventListener("click", function onUserListClicked(e) {
  const target = e.target;
  const targetId = Number(target.dataset.id);
  switch (target.id) {
    case 'user-avatar':
      showUserModal(targetId)
      break
    case 'favorite-icon':
      addFavoriteUser(targetId);
      changeFavoriteIcon(target);
      break
    case 'addfavorite-icon':
      deleteFavorite(targetId);
      changeFavoriteIcon(target);
      break
  }
  //   點擊頭像彈出詳細資料
  //   if (target.matches("#user-avatar")) {
  //     ;
  //     //     點擊小愛心 加入favorite
  //   } else if (target.matches("#favorite-icon")) {

  //   } else if (target.matches("#addfavorite-icon")) {

  //   }
})

// *** 顯示對應user card
paginator.addEventListener("click", function onPaginatorClicked(e) {
  //   點擊A標籤顯示渲染對應card
  if (e.target.tagName === "A") {
    let genderPaginator = e.target.id;
    currentPage = Number(e.target.dataset.id);
    // currentPage = Number(e.target.dataset.page);
    // 點擊不同性別的paginator，render對應性別的頁面
    switch (genderPaginator) {
      case "malepage-link":
        renderUsers(getByMalePagi(currentPage));
        renderMalePaginator(
          filteredMaleUsers.length ? filteredMaleUsers.length : maleUsers.length
        );

        break;
      case "femalepage-link":
        renderUsers(getByFemalePagi(currentPage));
        renderFemalePaginator(
          filteredFemaleUsers.length
            ? filteredFemaleUsers.length
            : femaleUsers.length
        );
        break;
      case "page-link":
        renderUsers(getByPagi(currentPage));
        renderPaginator(
          filteredUsers.length ? filteredUsers.length : users.length
        );
        break;
    }
  }
});

// *** search實作
searchBar.addEventListener("submit", function onSearchSubmited(e) {
  e.preventDefault();
  const search = searchInput.value.trim().toLowerCase();
  //   篩選 searchInput 的 user
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search)
  );
  filteredMaleUsers = maleUsers.filter((user) =>
    user.name.toLowerCase().includes(search)
  );
  filteredFemaleUsers = femaleUsers.filter((user) =>
    user.name.toLowerCase().includes(search)
  );
  //   查無 search內容 顯示無此用戶
  if (filteredUsers.length <= 0) {
    return alert(`沒有名字叫 ${search} 的用戶`);
  }
  //   重新渲染頁面
  renderUsers(getByPagi(1));
  renderPaginator(filteredUsers.length);
});

// ***性別顯示 event
genderSearch.addEventListener("click", function onGrendSearchClicked(e) {
  const target = e.target.id;
  currentPage = 1;
  switch (target) {
    case "gender-male":
      //       判斷是否有search
      if (filteredFemaleUsers.length) {
        renderUsers(getByMalePagi(1));
        renderMalePaginator(filteredMaleUsers.length);
      } else {
        const mUsers = filteredMaleUsers.length ? filteredMaleUsers : maleUsers;
        renderUsers(getByMalePagi(1));
        renderMalePaginator(mUsers.length);
      }
      break;
    case "gender-female":
      //       判斷是否有search
      if (filteredMaleUsers.length) {
        renderUsers(getByFemalePagi(1));
        renderFemalePaginator(filteredFemaleUsers.length);
      } else {
        const fUsers = filteredFemaleUsers.length
          ? filteredFemaleUsers
          : femaleUsers;
        renderUsers(getByFemalePagi(1));
        renderFemalePaginator(fUsers.length);
      }
      break;
    case "gender-all":
      const allUsers = filteredUsers.length ? filteredUsers : users;
      renderUsers(getByPagi(1));
      renderPaginator(allUsers.length);
      break;
  }
});

// 測試 及 延伸實作
// *** user modal內點擊愛心 加入favorite
userModal.addEventListener("click", (e) => {
  let target = e.target;
  let targetID = Number(e.target.dataset.id);
  if (target.matches("#favorite-icon")) {
    addFavoriteUser(targetID);
    changeFavoriteIcon(target);
  } else if (target.matches('#addfavorite-icon')) {
    deleteFavorite(targetID)
    changeFavoriteIcon(target)
    renderUsers(users)
  }
});

// ***點擊card favorite 更改愛心樣式
function changeFavoriteIcon(event) {
  if (event.id === "favorite-icon") {
    const parentEvent = event.parentElement;
    parentEvent.innerHTML = `<i class="${addFavorite}" style="color:red" id="addfavorite-icon" data-id="${event.dataset.id}"></i>`;
  } else if (event.id === "addfavorite-icon") {
    const parentEvent = event.parentElement;
    parentEvent.innerHTML = `<i class="${favorite}" style="color:red" id="favorite-icon" data-id="${event.dataset.id}"></i>`;
  }
}