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
  gallery.innerHTML = "";
  projects.forEach((project) => {
    const figure = document.createElement("figure");

    figure.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.title}" />
      <figcaption>${project.title}</figcaption>`;

    gallery.appendChild(figure);
  });
}

/* ----- Display the filter items ----- */
const filtersSection = document.querySelector(".filters");

function addFilter(filterName, selected) {
  const filterItem = document.createElement("li");
  filterItem.classList.add(`filter-item`);
  if (selected !== "") {
    filterItem.classList.add(`${selected}`);
  }
  filterItem.innerHTML = filterName;
  filtersSection.appendChild(filterItem);
}

async function displayFilters() {
  filtersSection.innerHTML = "";
  addFilter("Tous", "selected");

  const categories = await getCategories();
  categories.forEach((item) => {
    addFilter(item.name, "");
  });
}

/* ----- Sort projects by filter ----- */
// const filters = document.querySelectorAll(".filter-item");
// let selectedFilter = "Tous";

function resetSelectedFilter() {
  const filters = document.querySelectorAll(".filter-item");
  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      filter.classList.remove("selected");
    }
  });
}

async function sortProjects(projects, selectedFilter) {
  return projects.filter((project) => project.category.name === selectedFilter);
}

/* ---------- Refresh UI when logged or when a filter is selected ---------- */
const navLogin = document.querySelector(".nav-login");
// filtersSection declared in in the Display the filer items section
const openModalBtn = document.querySelector(".modal-open-btn");

async function refreshUI() {
  const token = localStorage.getItem("userToken");
  navLogin.innerHTML = "";

  if (!token) {
    navLogin.textContent = "login";
    filtersSection.style.display = "flex";
    openModalBtn.style.display = "none";
    await displayFilters();
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

  await displayFilters();

  filtersSection.addEventListener("click", async (e) => {
    const clicked = e.target.closest(".filter-item");
    if (!clicked) return;

    resetSelectedFilter();
    clicked.classList.add("selected");

    const selectedFilter = clicked.textContent;

    if (selectedFilter === "Tous") {
      displayProjects(projectsData);
    } else {
      const sortedProjects = await sortProjects(projectsData, selectedFilter);
      displayProjects(sortedProjects);
    }
  });

  if (gallery) {
    displayProjects(projectsData);
  }

  refreshUI();
}

main();

/* ==================== modal functions ======================================== */
// openModalBtn declared in Refresh UI section
const closeModalBtn = document.querySelectorAll(".modal-close-icon");
const modal = document.querySelector("#modal");
const modalWrarpper = document.querySelectorAll(".modal-wrapper");

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
      data-id="${item.id}"
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

// delete a project from the modal list
async function deleteProject(id) {
  const token = localStorage.getItem("userToken");

  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Error to delete the project.");
  }

  // refresh the gallery
  const projects = await getDataProjects();
  displayProjects(projects);
}

// open the modal
async function openModal() {
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", true);
  modal.style.display = "flex";

  await displayProjectsInModal();

  // get all delete icon
  getAllDeleteIcon();
}

// delete a project from ID in the list, clicking on a delete icon
async function getAllDeleteIcon() {
  const deleteIcons = document.querySelectorAll(".modal-delete-icon");
  deleteIcons.forEach((item) => {
    item.addEventListener("click", async (e) => {
      const itemId = e.target.dataset.id;
      await deleteProject(itemId);

      // reset and refresh projects list after deleting one
      modalProjects.innerHTML = "";
      await displayProjectsInModal();
      getAllDeleteIcon();
    });
  });
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
if (openModalBtn) {
  openModalBtn.addEventListener("click", openModal);
}

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
  categoriesSelect.innerHTML = "";
  const categories = await getCategories();

  categories.forEach((item) => {
    const option = document.createElement("option");
    option.setAttribute("value", item.name);
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
// button click to go back to the first modal page
modalBackbtn.addEventListener("click", hideModalAdd);

/* ----- Add a new project ----- */
const formAdd = document.querySelector(".form-add-project");
const fileInput = document.querySelector(".input-file");
const titleInput = document.querySelector(".title-add");
const categoryInput = document.querySelector("#category-add");
const addBtn = document.querySelector(".modal-add-btn");
const errorMessageAddProject = document.querySelector(".modal-add-error-msg");

// the the category id
async function getSelectedCategory() {
  const categories = await getCategories();
  const selectedCategory = categories.filter(
    (item) => item.name === categoryInput.value
  );
  return selectedCategory[0].id;
}

formAdd.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = localStorage.getItem("userToken");

  const newImage = fileInput.files[0];
  const newTitle = titleInput.value;
  const newCategory = await getSelectedCategory();

  const formData = new FormData();
  formData.append("image", newImage);
  formData.append("title", newTitle);
  formData.append("category", newCategory);

  if (formAdd) {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      errorMessageAddProject.style.display = "block";
      throw new Error("Erreur lors de l'ajout du nouveau projet.");
    }

    // reset the fields
    formAdd.reset();
    closeModal();

    // refresh the gallery
    const projects = await getDataProjects();
    displayProjects(projects);
  }
});
