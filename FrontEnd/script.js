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

/* ========== main function for the Home page ========== */
async function main() {
  const projectsData = await getDataProjects();

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

  displayProjects(projectsData);
}

main();

/* ----- login function ----- */
const loginForm = document.querySelector(".login-form");
const errorMessage = document.querySelector(".login-error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector(".login-email").value;
  const password = document.querySelector(".login-password").value;

  const userLogin = { email: email, password: password };
  console.log(JSON.stringify(userLogin));

  const response = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userLogin),
  });

  if (!response.ok) {
    errorMessage.style.display = "block";
    throw new Error("Erreur dans l’identifiant ou le mot de passe.");
  }

  const data = await response.json();
  const token = data.token;

  localStorage.setItem("userToken", token);

  window.location.href = "index.html";
});
