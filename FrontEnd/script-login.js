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
