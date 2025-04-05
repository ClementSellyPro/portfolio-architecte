/* -- Get projects data -- */
async function getDataProjects() {
  const response = await fetch("http://localhost:5678/api/works");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des donnees");
  }
  const data = await response.json();
  return await data;
}

/* -- Display the projects -- */
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

/* -- Filter projects -- */
// const filters = querySelector(".filter-item");

// async function filterProjects(projects) {}

async function main() {
  const projectsData = await getDataProjects();
  displayProjects(projectsData);
}

main();
