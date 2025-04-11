/* ----- Get projects data ----- */
async function getDataProjects() {
  const response = await fetch("http://localhost:5678/api/works");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des donnees");
  }
  return response.json();
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
function resetSelectedFilter() {
  const filters = document.querySelectorAll(".filter-item");
  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      filter.classList.remove("selected");
    }
  });
}

function sortProjects(projects, selectedFilter) {
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
      const sortedProjects = sortProjects(projectsData, selectedFilter);
      displayProjects(sortedProjects);
    }
  });

  if (gallery) {
    displayProjects(projectsData);
  }

  refreshUI();
}

main();
