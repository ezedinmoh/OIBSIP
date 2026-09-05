const dashboardMain = document.querySelector("#dashboard-main");
const dashboardLoading = document.querySelector("#dashboard-loading");

const dashboardUserName = document.querySelector("#dashboard-user-name");

const accountName = document.querySelector("#account-name");
const accountEmail = document.querySelector("#account-email");

const logoutButton = document.querySelector("#logout-button");

async function loadAuthenticatedUser() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      redirectToLogin();
      return;
    }

    const data = await response.json();

    if (!data.user) {
      redirectToLogin();
      return;
    }

    displayUser(data.user);

    dashboardLoading.hidden = true;
    dashboardMain.hidden = false;
  } catch (error) {
    console.error("Authentication check failed:", error);

    redirectToLogin();
  }
}

function displayUser(user) {
  const name = user.name || "User";
  const email = user.email || "";

  dashboardUserName.textContent = name;
  accountName.textContent = name;
  accountEmail.textContent = email;
}

function redirectToLogin() {
  window.location.replace("/");
}

function setLogoutLoading(isLoading) {
  logoutButton.disabled = isLoading;

  logoutButton.textContent = isLoading ? "Signing out..." : "Sign Out";
}

logoutButton.addEventListener("click", async () => {
  setLogoutLoading(true);

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    window.location.replace("/");
  } catch (error) {
    console.error("Logout request failed:", error);

    setLogoutLoading(false);

    window.alert("Unable to sign out right now. Please try again.");
  }
});

loadAuthenticatedUser();
