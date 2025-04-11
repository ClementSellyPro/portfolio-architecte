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

// close the modal and reset all change
function closeModal() {
  if (modal === null) return;
  modal.setAttribute("aria-hidden", true);
  modal.removeAttribute("aria-modal");
  modal.style.display = "none";

  modalProjects.innerHTML = "";

  modalAdd.style.display = "none";
  modalDeletePage.style.display = "block";
  errorMessageAddProject.style.display = "none";

  resetImageVisualizer();
  resetAddForm();
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

/* ---------- 2nd page modal function ---------- */
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
  categoriesSelect.innerHTML = `<option value=""></option>`;
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

function backToModalFirstPage() {
  modalAdd.style.display = "none";
  modalDeletePage.style.display = "block";

  categoriesSelect.innerHTML = "";
}

modalOpenAddBtn.addEventListener("click", async () => {
  displayModalAdd();
});
// button click to go back to the first modal page
modalBackbtn.addEventListener("click", backToModalFirstPage);

/* ----- Add a new project ----- */
const formAdd = document.querySelector(".form-add-project");
const fileInput = document.querySelector(".input-file");
const titleInput = document.querySelector(".title-add");
const categoryInput = document.querySelector("#category-add");
const addBtn = document.querySelector(".modal-add-btn");
const errorMessageAddProject = document.querySelector(".modal-add-error-msg");
// image visualization variables
const imagePlaceholder = document.querySelector(".modal-add-image");
const imageVisualizer = document.querySelector(".modal-image-visual");

// add the uploaded image to the visualizer
fileInput.addEventListener("change", () => {
  const image = fileInput.files[0];

  if (image) {
    const imageVisualized = document.querySelector("img");
    imageVisualized.setAttribute("class", "image-visual");
    imageVisualized.src = URL.createObjectURL(image);
    imageVisualized.alt = "Nouveau projet";

    imageVisualizer.appendChild(imageVisualized);

    imagePlaceholder.style.display = "none";
    imageVisualizer.style.display = "flex";
  }
});

function resetImageVisualizer() {
  imagePlaceholder.style.display = "flex";
  imageVisualizer.style.display = "none";
  imageVisualizer.innerHTML = "";
}

// get the category id for the selected category
async function getSelectedCategory() {
  const categories = await getCategories();
  const selectedCategory = categories.filter(
    (item) => item.name === categoryInput.value
  );
  if (!selectedCategory[0]) {
    return;
  }
  return selectedCategory[0].id;
}

// keep disabled the button to add, until every fields are filled
addBtn.disabled = true;

function checkFormInputs() {
  if (
    fileInput.files.length > 0 &&
    titleInput.value !== "" &&
    categoryInput.value !== ""
  ) {
    addBtn.disabled = false;
  }
}

function resetAddForm() {
  fileInput.value = "";
  titleInput.value = "";
  categoryInput.value = "";

  addBtn.disabled = true;
}

fileInput.addEventListener("change", checkFormInputs);
titleInput.addEventListener("input", checkFormInputs);
categoryInput.addEventListener("change", checkFormInputs);

formAdd.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = localStorage.getItem("userToken");

  const newImage = fileInput.files[0];
  const newTitle = titleInput.value;
  const newCategory = await getSelectedCategory();

  if (!fileInput || !titleInput || !newCategory) {
    errorMessageAddProject.style.display = "block";
    return;
  }

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

    const addedData = await response.json();
    console.log("Projet ajouté : ", addedData);

    // reset the fields
    formAdd.reset();
    closeModal();
    resetImageVisualizer();

    // refresh the gallery
    const projects = await getDataProjects();
    displayProjects(projects);
  }
});
