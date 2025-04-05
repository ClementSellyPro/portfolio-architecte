/* -- Get projects data -- */
async function getDataWorks() {
  const response = await fetch("http://localhost:5678/api/works");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des donnees");
  }
  const data = await response.json();
  return await data;
}

/* -- Display the projects -- */
const gallery = document.querySelector(".gallery");

async function displayWorks(works) {
  works.forEach((work) => {
    const figure = document.createElement("figure");

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}" />
      <figcaption>${work.title}</figcaption>`;

    console.log(figure);
    gallery.appendChild(figure);
  });
}

async function main() {
  const worksData = await getDataWorks();
  displayWorks(worksData);
}

main();
