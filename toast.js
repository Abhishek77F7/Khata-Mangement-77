// ======================================
// ANDROID MATERIAL TOAST
// ======================================

(function () {

    function showToast(message, type = "success") {

        const oldToast = document.getElementById("toast");

        if (oldToast) {
            oldToast.remove();
        }

        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️"
        };

        const toast = document.createElement("div");

        toast.id = "toast";
        toast.className = "toast " + type;

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || "🔔"}</span>
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {

                toast.remove();

            }, 250);

        }, 2500);

    }

    window.showToast = showToast;

})();