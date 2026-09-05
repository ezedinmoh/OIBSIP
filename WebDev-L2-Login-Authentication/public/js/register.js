const registerForm = document.querySelector("#register-form");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");

const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");
const confirmPasswordError = document.querySelector("#confirm-password-error");

const formMessage = document.querySelector("#form-message");
const registerButton = document.querySelector("#register-button");

const MIN_PASSWORD_LENGTH = 8;

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

function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 8 characters.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  return "";
}

function validateForm() {
  let isValid = true;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  clearFieldError(nameInput, nameError);
  clearFieldError(emailInput, emailError);
  clearFieldError(passwordInput, passwordError);
  clearFieldError(confirmPasswordInput, confirmPasswordError);
  clearFormMessage();

  if (!name) {
    setFieldError(nameInput, nameError, "Please enter your full name.");

    isValid = false;
  } else if (name.length < 2) {
    setFieldError(
      nameInput,
      nameError,
      "Name must contain at least 2 characters.",
    );

    isValid = false;
  }

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

  const passwordErrorMessage = validatePassword(password);

  if (!password) {
    setFieldError(passwordInput, passwordError, "Please create a password.");

    isValid = false;
  } else if (passwordErrorMessage) {
    setFieldError(passwordInput, passwordError, passwordErrorMessage);

    isValid = false;
  }

  if (!confirmPassword) {
    setFieldError(
      confirmPasswordInput,
      confirmPasswordError,
      "Please confirm your password.",
    );

    isValid = false;
  } else if (password !== confirmPassword) {
    setFieldError(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match.",
    );

    isValid = false;
  }

  return isValid;
}

function setLoading(isLoading) {
  registerButton.disabled = isLoading;

  registerButton.textContent = isLoading
    ? "Creating account..."
    : "Create Account";
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setFormMessage(
        data.message || "Unable to create your account. Please try again.",
      );

      return;
    }

    setFormMessage(data.message || "Account created successfully.", "success");

    window.setTimeout(() => {
      window.location.href = "/";
    }, 700);
  } catch (error) {
    console.error("Registration request failed:", error);

    setFormMessage("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
});

nameInput.addEventListener("input", () => {
  clearFieldError(nameInput, nameError);
  clearFormMessage();
});

emailInput.addEventListener("input", () => {
  clearFieldError(emailInput, emailError);
  clearFormMessage();
});

passwordInput.addEventListener("input", () => {
  clearFieldError(passwordInput, passwordError);
  clearFormMessage();

  if (confirmPasswordInput.value) {
    clearFieldError(confirmPasswordInput, confirmPasswordError);
  }
});

confirmPasswordInput.addEventListener("input", () => {
  clearFieldError(confirmPasswordInput, confirmPasswordError);
  clearFormMessage();
});
