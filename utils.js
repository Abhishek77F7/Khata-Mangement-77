// ======================================
// SETTINGS & UTILITIES
// ======================================

// Save Shop Name
function saveShopName() {

    const input = document.getElementById("shopName");

    if (!input) return;

    const shopName = input.value.trim();

    if (shopName === "") {
        showToast("Please enter shop name.", "warning");
        input.focus();
        return;
    }

    localStorage.setItem("shopName", shopName);

    showToast("Shop name updated successfully!", "success");
}

// ======================================
// CHANGE ADMIN PASSWORD
// ======================================

function changePassword() {

    const input = document.getElementById("newPassword");

    if (!input) return;

    const password = input.value.trim();

    if (password.length < 4) {
        showToast("Password must be at least 4 characters.", "warning");
        input.focus();
        return;
    }

    localStorage.setItem("adminPassword", password);

    input.value = "";

    showToast("Password changed successfully!", "success");
}

// ======================================
// CHANGE THEME
// ======================================

function toggleTheme() {

    document.body.classList.toggle("dark-theme");

    const theme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";

    localStorage.setItem("theme", theme);
}

// ======================================
// LOAD SETTINGS
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    // Load Theme
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    }

    // Load Shop Name
    const shopInput = document.getElementById("shopName");

    if (shopInput) {
        const savedShopName = localStorage.getItem("shopName");

        if (savedShopName) {
            shopInput.value = savedShopName;
        }
    }

});