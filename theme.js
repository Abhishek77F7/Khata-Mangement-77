// ======================================
// THEME MANAGER
// ======================================

function applyTheme(theme) {

    document.body.classList.remove("dark-theme");

    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    }

}

// ======================================
// SETTINGS POPUP
// ======================================

function openSettings() {

    const popup = document.getElementById("settingsPopup");

    if (popup) {
        popup.style.display = "block";
    }

}

function closeSettings() {

    const popup = document.getElementById("settingsPopup");

    if (popup) {
        popup.style.display = "none";
    }

}

// ======================================
// CHANGE THEME
// ======================================

function setLightTheme() {

    localStorage.setItem("theme", "light");

    applyTheme("light");

    closeSettings();

}

function setDarkTheme() {

    localStorage.setItem("theme", "dark");

    applyTheme("dark");

    closeSettings();

}

function setSystemTheme() {

    localStorage.removeItem("theme");

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }

    closeSettings();

}

// ======================================
// LOAD THEME
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {

        applyTheme(savedTheme);

    } else {

        setSystemTheme();

    }

});

// ======================================
// SYSTEM THEME CHANGE
// ======================================

window.matchMedia("(prefers-color-scheme: dark)")
.addEventListener("change", () => {

    if (!localStorage.getItem("theme")) {

        setSystemTheme();

    }

});

// ======================================
// GLOBAL FUNCTIONS
// ======================================

window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.setLightTheme = setLightTheme;
window.setDarkTheme = setDarkTheme;
window.setSystemTheme = setSystemTheme;