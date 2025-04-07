/* ----- Get projects data ----- */
async function getDataProjects() {
  const response = await fetch("http://localhost:5678/api/works");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des donnees");
  }
  const data = await response.json();
  return await data;
}

/* ----- Display the projects ----- */
const gallery = document.querySelector(".gallery");

async function displayProjects(projects) {
  projects.forEach((project) => {
    const figure = document.createElement("figure");

    figure.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.title}" />
      <figcaption>${project.title}</figcaption>`;

    gallery.appendChild(figure);
  });
}

/* ----- Sort projects by filter ----- */
const filters = document.querySelectorAll(".filter-item");
let selectedFilter = "Tous";

function resetSelectedFilter() {
  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      filter.classList.remove("selected");
    }
  });
}

async function sortProjects(projects) {
  return projects.filter((project) => project.category.name === selectedFilter);
}

/* ---------- Refresh UI when logged ---------- */
const navLogin = document.querySelector(".nav-login");
const filtersSection = document.querySelector(".filters");
const openModalBtn = document.querySelector(".modal-open-btn");

function refreshUI() {
  const token = localStorage.getItem("userToken");
  navLogin.innerHTML = "";

  if (!token) {
    navLogin.textContent = "login";
    filtersSection.style.display = "flex";
    openModalBtn.style.display = "none";
  } else {
    navLogin.textContent = "logout";
    filtersSection.style.display = "none";
    openModalBtn.style.display = "flex";
  }
}

/* ---------- Log out ---------- */
navLogin.addEventListener("click", () => {
  if (navLogin.textContent === "logout") {
    localStorage.removeItem("userToken");
  }
});

/* ==================== main function for the Home page ============================== */
async function main() {
  const projectsData = await getDataProjects();

  // filter selection and update projects display
  filters.forEach((filter) => {
    filter.addEventListener("click", async () => {
      resetSelectedFilter();
      filter.classList.add("selected");
      selectedFilter = filter.textContent;

      if (selectedFilter === "Tous") {
        gallery.innerHTML = "";
        displayProjects(projectsData);
      } else {
        gallery.innerHTML = "";
        const sortedProjects = await sortProjects(projectsData);
        displayProjects(sortedProjects);
      }
    });
  });

  if (gallery) {
    displayProjects(projectsData);
  }
  refreshUI();
}

main();

/* ==================== login submit function ======================================== */
const loginForm = document.querySelector(".login-form");
const errorMessage = document.querySelector(".login-error-message");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector(".login-email").value;
    const password = document.querySelector(".login-password").value;

    const userLogin = { email: email, password: password };

    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userLogin),
    });

    // display error message if incorrect
    if (!response.ok) {
      errorMessage.style.display = "block";
      throw new Error("Erreur dans l’identifiant ou le mot de passe.");
    }

    const data = await response.json();
    const token = data.token;

    // store the token and redirect to the Home page
    localStorage.setItem("userToken", token);
    window.location.href = "index.html";
  });
}

/* ==================== modal functions ======================================== */
// openModalBtn declared in Refresh UI section
const closeModalBtn = document.querySelectorAll(".modal-close-icon");
const modal = document.querySelector("#modal");
const modalWrarpper = document.querySelectorAll(".modal-wrapper");

function openModal() {
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", true);
  modal.style.display = "flex";

  displayProjectsInModal();
}

function closeModal() {
  if (modal === null) return;
  modal.setAttribute("aria-hidden", true);
  modal.removeAttribute("aria-modal");
  modal.style.display = "none";

  modalProjects.innerHTML = "";

  modalAdd.style.display = "none";
  modalDeletePage.style.display = "block";
}
// Open modal on click
openModalBtn.addEventListener("click", openModal);

// close modal on click, "escape" key or clicking outside the modal
closeModalBtn.forEach((item) => item.addEventListener("click", closeModal));
modal.addEventListener("click", closeModal);
modalWrarpper.forEach((item) =>
  item.addEventListener("click", stopPropagation)
);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal();
  }
});
// stop propagation not to close the modal when clicking on it
function stopPropagation(e) {
  e.stopPropagation();
}

// display projects in the modal
const modalProjects = document.querySelector(".modal-projects");

async function displayProjectsInModal() {
  const projectsData = await getDataProjects();

  projectsData.forEach((item) => {
    const modalItem = document.createElement("div");
    modalItem.classList.add("modal-project-item");

    modalItem.innerHTML = `
    <img
      class="modal-delete-icon"
      src="./assets/icons/delete-icon.svg"
      alt="Supprimer projet"
    />
    <img
      class="modal-project-img"
      src="${item.imageUrl}"
      alt="Photo projet"
    />
    `;

    modalProjects.appendChild(modalItem);
  });
}

/* ----- 2nd page modal function */
const modalDeletePage = document.querySelector(".modal-delete");
const modalAdd = document.querySelector(".modal-add");
const modalOpenAddBtn = document.querySelector(".modal-add-open-btn");
const modalBackbtn = document.querySelector(".modal-back-icon");
const categoriesSelect = document.querySelector(".modal-add-categories");

async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");

  if (!response.ok) {
    throw new Error("Error to get categories.");
  }
  const categories = await response.json();
  return categories;
}

async function displayCategories() {
  const categories = await getCategories();
  console.log(categories);
  categories.forEach((item) => {
    const option = document.createElement("option");
    option.innerHTML = item.name;

    categoriesSelect.appendChild(option);
  });
}

async function displayModalAdd() {
  modalAdd.style.display = "block";
  modalDeletePage.style.display = "none";
  displayCategories();
}

function hideModalAdd() {
  modalAdd.style.display = "none";
  modalDeletePage.style.display = "block";

  categoriesSelect.innerHTML = "";
}

modalOpenAddBtn.addEventListener("click", async () => {
  displayModalAdd();
});

modalBackbtn.addEventListener("click", hideModalAdd);
