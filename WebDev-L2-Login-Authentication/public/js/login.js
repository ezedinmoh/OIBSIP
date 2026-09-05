const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");

const formMessage = document.querySelector("#form-message");
const loginButton = document.querySelector("#login-button");

function setFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input, errorElement) {
  errorElement.textContent = "";
  input.removeAttribute("aria-invalid");
}

function setFormMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.classList.toggle("success", type === "success");
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.classList.remove("success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  let isValid = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  clearFieldError(emailInput, emailError);
  clearFieldError(passwordInput, passwordError);
  clearFormMessage();

  if (!email) {
    setFieldError(emailInput, emailError, "Please enter your email address.");

    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError(
      emailInput,
      emailError,
      "Please enter a valid email address.",
    );

    isValid = false;
  }

  if (!password) {
    setFieldError(passwordInput, passwordError, "Please enter your password.");

    isValid = false;
  }

  return isValid;
}

function setLoading(isLoading) {
  loginButton.disabled = isLoading;

  loginButton.textContent = isLoading ? "Signing in..." : "Sign In";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setFormMessage(
        data.message || "Unable to sign in. Please check your details.",
      );

      return;
    }

    setFormMessage(data.message || "Login successful.", "success");

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login request failed:", error);

    setFormMessage("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
});

emailInput.addEventListener("input", () => {
  clearFieldError(emailInput, emailError);
  clearFormMessage();
});

passwordInput.addEventListener("input", () => {
  clearFieldError(passwordInput, passwordError);
  clearFormMessage();
});
