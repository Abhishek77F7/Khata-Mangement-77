// ======================================
// LOADER
// ======================================

window.showLoader = function () {

    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.style.display = "flex";

};

window.hideLoader = function () {

    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.style.display = "none";

};

// ======================================
// AUTO HIDE ON PAGE LOAD
// ======================================

window.addEventListener("load", () => {

    window.hideLoader();

});