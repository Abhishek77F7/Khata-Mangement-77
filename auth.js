// ======================================
// ADMIN AUTHENTICATION
// ======================================

const DEFAULT_USERNAME = "Abhi";
const DEFAULT_PASSWORD = "1234";

// ======================================
// ADMIN LOGIN
// ======================================

window.adminLogin = async function () {

    const username =
        document.getElementById("username")?.value.trim();

    const password =
        document.getElementById("password")?.value.trim();

    if (!username || !password) {

        showToast("Please enter username and password.", "warning");
        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const savedUsername =
            localStorage.getItem("adminUsername") || DEFAULT_USERNAME;

        const savedPassword =
            localStorage.getItem("adminPassword") || DEFAULT_PASSWORD;

        if (
            username === savedUsername &&
            password === savedPassword
        ) {

            sessionStorage.setItem("adminLoggedIn", "true");

            showToast("Login Successful", "success");

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 600);

        }

        else {

            showToast("Invalid Username or Password", "error");

        }

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

};

// ======================================
// CHECK ADMIN LOGIN
// ======================================

window.checkAdminLogin = function () {

    if (
        sessionStorage.getItem("adminLoggedIn") !== "true"
    ) {

        if (typeof showToast === "function") {
    showToast("Please login first.", "warning");
}

        setTimeout(() => {

            window.location.href =
                "admin-login.html";

        }, 800);

    }

};

// ======================================
// AUTO REDIRECT
// ======================================

if (
    window.location.pathname.includes("admin-login.html")
) {

    if (
        sessionStorage.getItem("adminLoggedIn") === "true"
    ) {

        window.location.href = "dashboard.html";

    }

}

// ======================================
// CHANGE USERNAME
// ======================================

window.changeUsername = function () {

    const input = document.getElementById("newUsername");

    if (!input) return;

    const username = input.value.trim();

    if (username === "") {

        showToast("Enter Username", "warning");
        input.focus();
        return;

    }

    localStorage.setItem("adminUsername", username);

    input.value = "";

    showToast("Username Updated Successfully", "success");

};

// ======================================
// CHANGE PASSWORD
// ======================================

window.changePassword = function () {

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

    showToast("Password Updated Successfully", "success");

};

// ======================================
// OGOUT
// ======================================

window.logout = function () {

    if (!confirm("Logout from Admin?")) return;

    sessionStorage.removeItem("adminLoggedIn");

    showToast("Logged Out Successfully", "success");

    setTimeout(() => {

        window.location.href = "admin-login.html";

    }, 600);

};

// ======================================
// AUTO LOGOUT (5 Minutes)
// ======================================

let logoutTimer;

function startLogoutTimer() {

    clearTimeout(logoutTimer);

    logoutTimer = setTimeout(() => {

        sessionStorage.removeItem("adminLoggedIn");

        showToast("Session expired. Please login again.", "warning");

        setTimeout(() => {

            window.location.href = "admin-login.html";

        }, 1000);

    }, 5 * 60 * 1000); // 5 Minutes

}

// Reset timer whenever user is active
[
    "click",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart"
].forEach(event => {

    document.addEventListener(event, startLogoutTimer);

});

// Start timer after login on admin pages
if (
    !window.location.pathname.includes("admin-login.html") &&
    sessionStorage.getItem("adminLoggedIn") === "true"
) {

    startLogoutTimer();

}


// ======================================
// SHOP NAME
// ======================================

window.saveShopName = function () {

    const input = document.getElementById("shopName");

    if (!input) return;

    const shopName = input.value.trim();

    if (shopName === "") {

        showToast("Please enter shop name.", "warning");
        return;

    }

    localStorage.setItem("shopName", shopName);

    showToast("Shop Name Updated Successfully", "success");

};

// ======================================
// AUTO LOAD SHOP NAME IN SETTINGS
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("shopName");

    if (input) {

        input.value =
            localStorage.getItem("shopName") ||
            "Khata Management";

    }

});


// ======================================
// MASTER PASSWORD RESET
// ======================================

const MASTER_PASSWORD = "ABHISUDHI";

window.resetAdminPassword = function () {

    const master =
        document.getElementById("masterPassword").value.trim();

    const username =
        document.getElementById("newUsername").value.trim();

    const password =
        document.getElementById("newPassword").value.trim();

    const confirm =
        document.getElementById("confirmPassword").value.trim();

    if (
        !master ||
        !username ||
        !password ||
        !confirm
    ) {

        showToast(
            "Please fill all fields.",
            "warning"
        );

        return;

    }

    if (master !== MASTER_PASSWORD) {

        showToast(
            "Invalid Master Password",
            "error"
        );

        return;

    }

    if (password.length < 4) {

        showToast(
            "Password must be at least 4 characters.",
            "warning"
        );

        return;

    }

    if (password !== confirm) {

        showToast(
            "Passwords do not match.",
            "error"
        );

        return;

    }

    localStorage.setItem(
        "adminUsername",
        username
    );

    localStorage.setItem(
        "adminPassword",
        password
    );

    showToast(
        "Username & Password Updated Successfully",
        "success"
    );

    setTimeout(() => {

        window.location.href =
            "admin-login.html";

    }, 1000);

};