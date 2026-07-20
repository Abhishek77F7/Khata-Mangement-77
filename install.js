let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    const popup = document.getElementById("installPopup");

    if (popup) {
        popup.style.display = "flex";
    }

});

const installBtn = document.getElementById("installBtn");

if (installBtn) {

    installBtn.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        document.getElementById("installPopup").style.display = "none";

    });

}

const closeBtn = document.getElementById("closeInstall");

if (closeBtn) {

    closeBtn.addEventListener("click", () => {

        document.getElementById("installPopup").style.display = "none";

    });

}