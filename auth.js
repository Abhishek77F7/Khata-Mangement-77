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

        if (typeof showToast === "function") {
            showToast(
                "Please enter username and password.",
                "warning"
            );
        }

        return;
    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const savedUsername =
            localStorage.getItem("adminUsername") ||
            DEFAULT_USERNAME;

        const savedPassword =
            localStorage.getItem("adminPassword") ||
            DEFAULT_PASSWORD;

        if (
            username === savedUsername &&
            password === savedPassword
        ) {

            sessionStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            showToast(
                "Login Successful",
                "success"
            );

            setTimeout(() => {

                window.location.replace(
                    "dashboard.html"
                );

            }, 600);

        }

        else {

            showToast(
                "Invalid Username or Password",
                "error"
            );

        }

    }

    catch (error) {

        console.error(
            "Admin Login Error:",
            error
        );

        if (typeof showToast === "function") {
            showToast(
                "Login failed. Please try again.",
                "error"
            );
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

    const isLoggedIn =
        sessionStorage.getItem(
            "adminLoggedIn"
        ) === "true";

    if (isLoggedIn) {
        return true;
    }

    if (typeof showToast === "function") {

        showToast(
            "Please login first.",
            "warning"
        );

    }

    setTimeout(() => {

        window.location.replace(
            "admin-login.html"
        );

    }, 800);

    return false;

};


// ======================================
// AUTO REDIRECT FROM LOGIN PAGE
// ======================================

if (
    window.location.pathname.includes(
        "admin-login.html"
    )
) {

    if (
        sessionStorage.getItem(
            "adminLoggedIn"
        ) === "true"
    ) {

        window.location.replace(
            "dashboard.html"
        );

    }

}


// ======================================
// CHANGE USERNAME
// ======================================

window.changeUsername = function () {

    const input =
        document.getElementById(
            "newUsername"
        );

    if (!input) return;

    const username =
        input.value.trim();

    if (username === "") {

        showToast(
            "Enter Username",
            "warning"
        );

        input.focus();

        return;
    }

    localStorage.setItem(
        "adminUsername",
        username
    );

    input.value = "";

    showToast(
        "Username Updated Successfully",
        "success"
    );

};


// ======================================
// CHANGE PASSWORD
// ======================================

window.changePassword = function () {

    const input =
        document.getElementById(
            "newPassword"
        );

    if (!input) return;

    const password =
        input.value.trim();

    if (password.length < 4) {

        showToast(
            "Password must be at least 4 characters.",
            "warning"
        );

        input.focus();

        return;
    }

    localStorage.setItem(
        "adminPassword",
        password
    );

    input.value = "";

    showToast(
        "Password Updated Successfully",
        "success"
    );

};


// ======================================
// LOGOUT POPUP
// ======================================

window.logout = function () {

    const modal =
        document.getElementById("logoutModal");

    if (!modal) {

        console.error(
            "Logout popup not found."
        );

        return;

    }

    modal.classList.add("show");

    document.body.classList.add(
        "logout-popup-open"
    );

};


// ======================================
// CLOSE LOGOUT POPUP
// ======================================

window.closeLogoutPopup = function () {

    const modal =
        document.getElementById("logoutModal");

    if (!modal) return;

    modal.classList.remove("show");

    document.body.classList.remove(
        "logout-popup-open"
    );

};


// ======================================
// CONFIRM LOGOUT
// ======================================

window.confirmLogout = function () {

    // Close popup first

    closeLogoutPopup();

    // Clear login session

    sessionStorage.removeItem(
        "adminLoggedIn"
    );

    // Stop automatic logout timer

    clearTimeout(logoutTimer);

    // Show success message

    if (typeof showToast === "function") {

        showToast(
            "Logged Out Successfully",
            "success"
        );

    }

    // Redirect

    setTimeout(() => {

        window.location.replace(
            "index.html"
        );

    }, 600);

};


// ======================================
// AUTO LOGOUT TIMER
// 5 MINUTES
// ======================================

let logoutTimer = null;


// ======================================
// START LOGOUT TIMER
// ======================================

function startLogoutTimer() {

    clearTimeout(logoutTimer);

    // Only run timer for logged-in admin
    if (
        sessionStorage.getItem(
            "adminLoggedIn"
        ) !== "true"
    ) {
        return;
    }

    logoutTimer = setTimeout(() => {

        sessionStorage.removeItem(
            "adminLoggedIn"
        );

        if (typeof showToast === "function") {

            showToast(
                "Session expired. Please login again.",
                "warning"
            );

        }

        setTimeout(() => {

            window.location.replace(
                "admin-login.html"
            );

        }, 1000);

    }, 5 * 60 * 1000);

}


// ======================================
// RESET TIMER WHEN ADMIN IS ACTIVE
// ======================================

[
    "click",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart"
].forEach(event => {

    document.addEventListener(
        event,
        () => {

            if (
                sessionStorage.getItem(
                    "adminLoggedIn"
                ) === "true"
            ) {

                startLogoutTimer();

            }

        }
    );

});


// ======================================
// START TIMER ON ADMIN PAGES
// ======================================

if (
    !window.location.pathname.includes(
        "admin-login.html"
    ) &&
    sessionStorage.getItem(
        "adminLoggedIn"
    ) === "true"
) {

    startLogoutTimer();

}


// ======================================
// SHOP NAME
// ======================================

window.saveShopName = function () {

    const input =
        document.getElementById(
            "shopName"
        );

    if (!input) return;

    const shopName =
        input.value.trim();

    if (shopName === "") {

        showToast(
            "Please enter shop name.",
            "warning"
        );

        input.focus();

        return;
    }

    localStorage.setItem(
        "shopName",
        shopName
    );

    showToast(
        "Shop Name Updated Successfully",
        "success"
    );

};


// ======================================
// AUTO LOAD SHOP NAME
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "shopName"
            );

        if (input) {

            input.value =
                localStorage.getItem(
                    "shopName"
                ) ||
                "Khata Management";

        }

    }
);


// ======================================
// MASTER PASSWORD
// ======================================

const MASTER_PASSWORD =
    "ABHISUDHI";


// ======================================
// RESET ADMIN PASSWORD
// ======================================

window.resetAdminPassword = function () {

    const masterInput =
        document.getElementById(
            "masterPassword"
        );

    const usernameInput =
        document.getElementById(
            "newUsername"
        );

    const passwordInput =
        document.getElementById(
            "newPassword"
        );

    const confirmInput =
        document.getElementById(
            "confirmPassword"
        );


    const master =
        masterInput?.value.trim();

    const username =
        usernameInput?.value.trim();

    const password =
        passwordInput?.value.trim();

    const confirm =
        confirmInput?.value.trim();


    // ======================================
    // VALIDATE FIELDS
    // ======================================

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


    // ======================================
    // CHECK MASTER PASSWORD
    // ======================================

    if (
        master !== MASTER_PASSWORD
    ) {

        showToast(
            "Invalid Master Password",
            "error"
        );

        return;
    }


    // ======================================
    // PASSWORD LENGTH
    // ======================================

    if (
        password.length < 4
    ) {

        showToast(
            "Password must be at least 4 characters.",
            "warning"
        );

        return;
    }


    // ======================================
    // CONFIRM PASSWORD
    // ======================================

    if (
        password !== confirm
    ) {

        showToast(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    // ======================================
    // SAVE CREDENTIALS
    // ======================================

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


    // ======================================
    // RETURN TO LOGIN
    // ======================================

    setTimeout(() => {

        window.location.replace(
            "admin-login.html"
        );

    }, 1000);

};
