/* =========================================================
   KHATA MANAGEMENT — PWA INSTALL
   Modern browser-style install banner
========================================================= */

let deferredInstallPrompt = null;

const appName =
    localStorage.getItem("shopName")?.trim() ||
    "Khata Management";


/* =========================================================
   CHECK STANDALONE
========================================================= */

function isStandalone() {

    return (
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true
    );

}


/* =========================================================
   CREATE INSTALL BANNER
========================================================= */

function createInstallBanner() {

    if (
        document.getElementById(
            "pwaInstallBanner"
        )
    ) {
        return;
    }


    const banner =
        document.createElement("div");


    banner.id =
        "pwaInstallBanner";


    banner.innerHTML = `

        <div class="pwa-install-content">

            <div class="pwa-install-icon">

                <span class="material-symbols-outlined">
                    menu_book
                </span>

            </div>


            <div class="pwa-install-info">

                <strong id="pwaInstallName">
                    ${escapeHTML(appName)}
                </strong>

                <span id="pwaInstallDomain">
                    ${escapeHTML(
                        location.hostname ||
                        "Khata Management"
                    )}
                </span>

            </div>


            <button
                type="button"
                id="pwaInstallButton"
                class="pwa-install-button">

                Install

            </button>


            <button
                type="button"
                id="pwaInstallClose"
                class="pwa-install-close"
                aria-label="Close">

                <span class="material-symbols-outlined">
                    close
                </span>

            </button>

        </div>

    `;


    document.body.appendChild(
        banner
    );


    injectInstallStyles();


    document
        .getElementById(
            "pwaInstallButton"
        )
        ?.addEventListener(
            "click",
            installPWA
        );


    document
        .getElementById(
            "pwaInstallClose"
        )
        ?.addEventListener(
            "click",
            hideInstallBanner
        );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SHOW BANNER
========================================================= */

function showInstallBanner() {

    if (isStandalone()) {
        return;
    }


    createInstallBanner();


    const banner =
        document.getElementById(
            "pwaInstallBanner"
        );


    if (!banner) {
        return;
    }


    const name =
        document.getElementById(
            "pwaInstallName"
        );


    const domain =
        document.getElementById(
            "pwaInstallDomain"
        );


    if (name) {

        name.textContent =
            appName;

    }


    if (domain) {

        domain.textContent =
            location.hostname ||
            "Khata Management";

    }


    requestAnimationFrame(() => {

        banner.classList.add(
            "show"
        );

    });

}


/* =========================================================
   HIDE BANNER
========================================================= */

function hideInstallBanner() {

    const banner =
        document.getElementById(
            "pwaInstallBanner"
        );


    if (!banner) {
        return;
    }


    banner.classList.remove(
        "show"
    );


    setTimeout(() => {

        banner.remove();

    }, 350);

}


/* =========================================================
   INSTALL PWA
========================================================= */

async function installPWA() {

    if (!deferredInstallPrompt) {

        showToast?.(
            "Open your browser menu and choose Install App.",
            "info"
        );

        return;

    }


    try {

        deferredInstallPrompt.prompt();


        const result =
            await deferredInstallPrompt.userChoice;


        console.log(
            "PWA install result:",
            result.outcome
        );


        if (
            result.outcome ===
            "accepted"
        ) {

            console.log(
                "PWA installation accepted."
            );

        }


    }

    catch (error) {

        console.error(
            "PWA install error:",
            error
        );

    }


    deferredInstallPrompt =
        null;


    hideInstallBanner();

}


/* =========================================================
   CAPTURE INSTALL PROMPT
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        /*
         * Stop browser's default mini prompt.
         */

        event.preventDefault();


        deferredInstallPrompt =
            event;


        /*
         * Show custom browser-style banner.
         */

        showInstallBanner();

    }
);


/* =========================================================
   APP INSTALLED
========================================================= */

window.addEventListener(
    "appinstalled",
    () => {

        deferredInstallPrompt =
            null;


        hideInstallBanner();


        showToast?.(
            `${appName} installed successfully!`,
            "success"
        );

    }
);


/* =========================================================
   INSTALL BANNER CSS
========================================================= */

function injectInstallStyles() {

    if (
        document.getElementById(
            "pwa-install-styles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "pwa-install-styles";


    style.textContent = `

        /* =========================================
           PWA INSTALL BANNER
        ========================================= */

        #pwaInstallBanner {

            position: fixed;

            top: 14px;
            left: 50%;

            width: min(
                calc(100% - 24px),
                520px
            );

            transform:
                translate(-50%, -140px);

            opacity: 0;

            z-index: 999999;

            pointer-events: none;

            transition:
                transform .38s cubic-bezier(
                    .22,
                    1,
                    .36,
                    1
                ),
                opacity .25s ease;

            font-family:
                Arial,
                sans-serif;

        }


        #pwaInstallBanner.show {

            transform:
                translate(-50%, 0);

            opacity: 1;

            pointer-events:
                auto;

        }


        .pwa-install-content {

            position: relative;

            display: flex;

            align-items: center;

            gap: 13px;

            padding: 12px 12px 12px 13px;

            border-radius: 20px;

            background:
                rgba(32, 33, 36, .97);

            color: #ffffff;

            box-shadow:
                0 12px 35px
                rgba(0,0,0,.30),

                0 2px 8px
                rgba(0,0,0,.20);

            backdrop-filter:
                blur(18px);

            -webkit-backdrop-filter:
                blur(18px);

        }


        /* APP ICON */

        .pwa-install-icon {

            width: 54px;
            height: 54px;

            flex: 0 0 54px;

            border-radius: 15px;

            display: grid;

            place-items: center;

            background:
                linear-gradient(
                    135deg,
                    #16a34a,
                    #22c55e
                );

            color: #ffffff;

            box-shadow:
                0 4px 12px
                rgba(34,197,94,.30);

        }


        .pwa-install-icon
        .material-symbols-outlined {

            font-size: 30px;

            font-variation-settings:
                'FILL' 1,
                'wght' 500;

        }


        /* TEXT */

        .pwa-install-info {

            min-width: 0;

            flex: 1;

            display: flex;

            flex-direction: column;

            gap: 3px;

        }


        .pwa-install-info strong {

            font-size: 16px;

            line-height: 1.2;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

        }


        .pwa-install-info span {

            font-size: 13px;

            color: #b9bcc3;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

        }


        /* INSTALL */

        .pwa-install-button {

            border: 0;

            outline: 0;

            cursor: pointer;

            background: transparent;

            color: #a8c7fa;

            font-size: 15px;

            font-weight: 700;

            padding: 12px 8px;

            border-radius: 10px;

            transition:
                background .2s ease,
                transform .15s ease;

        }


        .pwa-install-button:hover {

            background:
                rgba(255,255,255,.08);

        }


        .pwa-install-button:active {

            transform:
                scale(.94);

        }


        /* CLOSE */

        .pwa-install-close {

            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            border: 0;

            outline: 0;

            cursor: pointer;

            border-radius: 50%;

            display: grid;

            place-items: center;

            background:
                rgba(255,255,255,.07);

            color: #d5d7dc;

            transition:
                background .2s ease,
                transform .15s ease;

        }


        .pwa-install-close:hover {

            background:
                rgba(255,255,255,.13);

        }


        .pwa-install-close:active {

            transform:
                scale(.9);

        }


        .pwa-install-close
        .material-symbols-outlined {

            font-size: 20px;

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media(max-width:520px) {

            #pwaInstallBanner {

                top:
                    env(
                        safe-area-inset-top,
                        10px
                    );

                width:
                    calc(100% - 20px);

            }


            .pwa-install-content {

                gap: 10px;

                padding: 10px;

                border-radius: 18px;

            }


            .pwa-install-icon {

                width: 50px;
                height: 50px;

                flex-basis: 50px;

                border-radius: 14px;

            }


            .pwa-install-info strong {

                font-size: 14px;

            }


            .pwa-install-info span {

                font-size: 12px;

            }


            .pwa-install-button {

                font-size: 14px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Do not show install UI when
         * already running as an installed app.
         */

        if (isStandalone()) {

            return;

        }


        /*
         * Android / Chrome / Edge /
         * supported browsers will trigger
         * beforeinstallprompt when ready.
         */

        console.log(
            "Khata PWA install system ready."
        );

    }
);
