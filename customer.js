import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


let customer = null;


/* =========================================================
   HELPERS
========================================================= */

function normalizeMobile(value) {

    return String(value ?? "")
        .replace(/\D/g, "")
        .slice(-10);

}


function getCustomerDocID() {

    return (
        localStorage.getItem("customerDocID") ||
        sessionStorage.getItem("customerFirebaseID") ||
        new URLSearchParams(location.search).get("id") ||
        ""
    );

}


function getCustomerCode(data) {

    return String(
        data?.customerCode ??
        data?.customerID ??
        data?.customerId ??
        data?.code ??
        data?.id ??
        ""
    )
        .trim()
        .toUpperCase();

}


function setText(id, text) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = text;
    }

}


function formatMoney(value) {

    const amount =
        Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;

}


function safeText(value, fallback = "-") {

    const text =
        String(value ?? "").trim();

    return text || fallback;

}


/*
 * Basic HTML escaping.
 * This prevents customer/product text stored in
 * Firestore from being interpreted as HTML.
 */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   CUSTOMER LOGIN
========================================================= */

async function loginCustomer() {

    const mobile =
        document.getElementById("mobile")
            ?.value
            .trim();

    const code =
        document.getElementById("customerCode")
            ?.value
            .trim()
            .toUpperCase();


    if (!mobile || !code) {

        showToast?.(
            "Enter Mobile Number and Customer ID",
            "warning"
        );

        return;
    }


    if (!/^\d{10}$/.test(mobile)) {

        showToast?.(
            "Enter valid mobile number",
            "warning"
        );

        return;
    }


    showLoader?.();


    try {

        const snapshot =
            await getDocs(
                collection(db, "customers")
            );


        let found = null;


        snapshot.forEach((customerDoc) => {

            const data =
                customerDoc.data();


            if (
                normalizeMobile(data.mobile) ===
                    normalizeMobile(mobile) &&

                getCustomerCode(data) === code
            ) {

                found = {
                    id: customerDoc.id,
                    ...data
                };

            }

        });


        if (!found) {

            showToast?.(
                "Invalid Mobile Number or Customer ID",
                "error"
            );

            return;
        }


        localStorage.setItem(
            "customerDocID",
            found.id
        );


        sessionStorage.setItem(
            "customerFirebaseID",
            found.id
        );


        sessionStorage.setItem(
            "customerCode",
            code
        );


        sessionStorage.setItem(
            "customerVerified",
            "true"
        );


        sessionStorage.setItem(
            "customerLoginMobile",
            mobile
        );


        showToast?.(
            "Login Successful",
            "success"
        );


        setTimeout(() => {

            location.href =
                "profile.html";

        }, 600);

    }

    catch (error) {

        console.error(
            "Customer Login Error:",
            error
        );


        showToast?.(
            "Login failed. Please try again.",
            "error"
        );

    }

    finally {

        hideLoader?.();

    }

}


window.loginCustomer =
    loginCustomer;


/* =========================================================
   LOAD CUSTOMER PROFILE
========================================================= */

async function loadCustomerProfile() {

    const docID =
        getCustomerDocID();


    if (!docID) {

        location.href =
            "customer-login.html";

        return false;
    }


    localStorage.setItem(
        "customerDocID",
        docID
    );


    sessionStorage.setItem(
        "customerFirebaseID",
        docID
    );


    showLoader?.();


    try {

        const customerSnapshot =
            await getDoc(
                doc(
                    db,
                    "customers",
                    docID
                )
            );


        if (!customerSnapshot.exists()) {

            localStorage.removeItem(
                "customerDocID"
            );


            sessionStorage.removeItem(
                "customerFirebaseID"
            );


            showToast?.(
                "Customer not found.",
                "error"
            );


            setTimeout(() => {

                location.href =
                    "customer-login.html";

            }, 700);


            return false;
        }


        customer = {
            id: customerSnapshot.id,
            ...customerSnapshot.data()
        };


        /*
         * Make sure these are always arrays.
         */

        customer.loans =
            Array.isArray(customer.loans)
                ? customer.loans
                : [];


        customer.payments =
            Array.isArray(customer.payments)
                ? customer.payments
                : [];


        /*
         * Calculate total borrowed amount.
         */

        customer.loan =
            customer.loans.reduce(
                (sum, item) => {

                    return sum +
                        Number(item.total || 0);

                },
                0
            );


        /*
         * Calculate total payments.
         */

        customer.paid =
            customer.payments.reduce(
                (sum, item) => {

                    return sum +
                        Number(item.amount || 0);

                },
                0
            );


        /*
         * Calculate balance.
         *
         * If Firestore already contains a balance,
         * use that value.
         *
         * Otherwise calculate:
         *
         * Total Loan - Total Paid
         */

        customer.balance = Math.max(
    0,
    customer.loan - customer.paid
);


        /*
         * Additional useful statistics.
         */

        customer.totalProducts =
            customer.loans.length;


        customer.totalPayments =
            customer.payments.length;


        renderCustomer();


        return true;

    }

    catch (error) {

        console.error(
            "Profile Error:",
            error
        );


        showToast?.(
            "Failed to load customer profile.",
            "error"
        );


        return false;

    }

    finally {

        hideLoader?.();

    }

}


/* =========================================================
   RENDER CUSTOMER PROFILE
========================================================= */

function renderCustomer() {

    if (!customer) {
        return;
    }


    const code =
        getCustomerCode(customer) ||
        customer.id;


    const mobile =
        normalizeMobile(customer.mobile);


    setText(
        "customerName",
        safeText(
            customer.name,
            "Customer"
        )
    );


    setText(
        "customerID",
        `ID: ${code}`
    );


    setText(
        "customerMobile",
        mobile
            ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
            : "Mobile Number"
    );


    setText(
        "customerAddress",
        safeText(
            customer.address,
            "No address added"
        )
    );


    setText(
        "loan",
        formatMoney(customer.loan)
    );


    setText(
        "paid",
        formatMoney(customer.paid)
    );


    setText(
        "balance",
        formatMoney(customer.balance)
    );


    loadRecentActivity();

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function loadRecentActivity() {

    if (!customer) {
        return;
    }


    const latestLoan =
        document.getElementById(
            "latestLoan"
        );


    const latestPayment =
        document.getElementById(
            "latestPayment"
        );


    /*
     * Latest borrowed product
     */

    if (latestLoan) {

        latestLoan.textContent =
            "No borrowed products yet.";


        if (customer.loans.length > 0) {

            const item =
                customer.loans[
                    customer.loans.length - 1
                ];


            latestLoan.textContent =
                `${safeText(item.product, "Product")} · ${formatMoney(item.total)}`;

        }

    }


    /*
     * Latest payment
     */

    if (latestPayment) {

        latestPayment.textContent =
            "No payments yet.";


        if (customer.payments.length > 0) {

            const payment =
                customer.payments[
                    customer.payments.length - 1
                ];


            latestPayment.textContent =
                `${formatMoney(payment.amount)} paid · ${safeText(
                    payment.date,
                    "Date unavailable"
                )}`;

        }

    }

}


/* =========================================================
   BORROWED PRODUCTS
========================================================= */

function loadLoanHistory() {

    const history =
        document.getElementById(
            "loanHistory"
        );


    if (!history || !customer) {
        return;
    }


    /*
     * Statistics
     */

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalBorrowed =
        document.getElementById(
            "totalBorrowed"
        );


    const productCount =
        document.getElementById(
            "productCount"
        );


    if (totalProducts) {

        totalProducts.textContent =
            customer.loans.length;

    }


    if (totalBorrowed) {

        totalBorrowed.textContent =
            formatMoney(customer.loan);

    }


    if (productCount) {

        productCount.textContent =
            customer.loans.length;

    }


    /*
     * Empty state
     */

    if (customer.loans.length === 0) {

        history.innerHTML = `

            <div class="history-card loan-empty">

                <div class="empty-icon">

                    <span class="material-symbols-outlined">
                        shopping_bag
                    </span>

                </div>

                <h3>
                    No Borrowed Products
                </h3>

                <p>
                    You currently have no borrowed products.
                </p>

                <a
                    href="profile.html"
                    class="empty-action">

                    Back to My Account

                </a>

            </div>

        `;

        return;
    }


    /*
     * Render products.
     *
     * Reverse order so newest products appear first.
     */

    history.innerHTML =
        [...customer.loans]
            .reverse()
            .map((item, index) => {

                const product =
                    escapeHTML(
                        safeText(
                            item.product,
                            "Product"
                        )
                    );


                const quantity =
                    Number(
                        item.qty || 0
                    );


                const price =
                    Number(
                        item.price || 0
                    );


                const total =
                    Number(
                        item.total || 0
                    );


                const date =
                    escapeHTML(
                        safeText(
                            item.date,
                            "Date unavailable"
                        )
                    );


                return `

                    <article
                        class="history-card loan-card"
                        data-search="
                            ${product.toLowerCase()}
                            ${date.toLowerCase()}
                            ${quantity}
                            ${price}
                            ${total}
                        ">

                        <div class="loan-card-top">

                            <div class="loan-product-icon">

                                <span class="material-symbols-outlined">
                                    shopping_bag
                                </span>

                            </div>


                            <div class="loan-product-info">

                                <span class="loan-label">
                                    Borrowed Product
                                </span>

                                <h3>
                                    ${product}
                                </h3>

                            </div>


                            <span class="loan-status">

                                <span class="material-symbols-outlined">
                                    check_circle
                                </span>

                                Added

                            </span>

                        </div>


                        <div class="loan-details">

                            <div class="loan-detail">

                                <span>
                                    Quantity
                                </span>

                                <strong>
                                    ${quantity}
                                </strong>

                            </div>


                            <div class="loan-detail">

                                <span>
                                    Unit Price
                                </span>

                                <strong>
                                    ${formatMoney(price)}
                                </strong>

                            </div>


                            <div class="loan-detail total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ${formatMoney(total)}
                                </strong>

                            </div>

                        </div>


                        <div class="loan-footer">

                            <div>

                                <span class="material-symbols-outlined">
                                    calendar_month
                                </span>

                                <span>
                                    ${date}
                                </span>

                            </div>


                            <span class="material-symbols-outlined">
                                chevron_right
                            </span>

                        </div>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   BORROWED PRODUCT SEARCH
========================================================= */

function setupLoanSearch() {

    const search =
        document.getElementById(
            "loanSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            const cards =
                document.querySelectorAll(
                    "#loanHistory .loan-card"
                );


            let visibleCount = 0;


            cards.forEach((card) => {

                const text =
                    card.textContent
                        .toLowerCase();


                const matches =
                    text.includes(query);


                card.style.display =
                    matches
                        ? ""
                        : "none";


                if (matches) {
                    visibleCount++;
                }

            });


            const badge =
                document.getElementById(
                    "loanCountBadge"
                );


            if (badge) {

                badge.textContent =
                    `${visibleCount} ${
                        visibleCount === 1
                            ? "Product"
                            : "Products"
                    }`;

            }

        }
    );

}


/* =========================================================
   PAYMENT HISTORY
========================================================= */

function loadPaymentHistory() {

    const history =
        document.getElementById(
            "paymentHistory"
        );


    if (!history || !customer) {
        return;
    }


    const totalPaid =
        document.getElementById(
            "totalPaid"
        );

    const currentBalance =
    document.getElementById(
        "currentBalance"
    );


    const paymentCount =
        document.getElementById(
            "paymentCount"
        );


    const paymentCountBadge =
        document.getElementById(
            "paymentCountBadge"
        );


    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        );


    /*
     * Total paid
     */

    if (totalPaid) {

        totalPaid.textContent =
            formatMoney(
                customer.paid
            );

    }


      /*
 * Current balance
 */

if (currentBalance) {

    currentBalance.textContent =
        formatMoney(customer.balance);

}


    /*
     * Payment count
     */

    if (paymentCount) {

        paymentCount.textContent =
            customer.payments.length;

    }


    if (paymentCountBadge) {

        paymentCountBadge.textContent =
            `${customer.payments.length} ${
                customer.payments.length === 1
                    ? "Payment"
                    : "Payments"
            }`;

    }


    /*
     * Payment status
     */

    if (paymentStatus) {

        if (customer.balance <= 0) {

            paymentStatus.textContent =
                "Paid";

        }

        else {

            paymentStatus.textContent =
                "Balance Due";

        }

    }


    /*
     * Empty state
     */

    if (customer.payments.length === 0) {

        history.innerHTML = `

            <div class="payment-empty">

                <div class="payment-empty-icon">

                    <span class="material-symbols-outlined">
                        payments
                    </span>

                </div>

                <h3>
                    No Payment History
                </h3>

                <p>
                    No payments have been recorded yet.
                </p>

            </div>

        `;

        return;
    }


    /*
     * Render payment cards.
     */

    history.innerHTML =
        [...customer.payments]
            .reverse()
            .map((payment) => {

                const amount =
                    Number(
                        payment.amount || 0
                    );


                const date =
                    safeText(
                        payment.date,
                        "Date unavailable"
                    );


                const searchData =
                    `${date} ${amount} payment received`
                        .toLowerCase();


                return `

                    <article
                        class="payment-card"
                        data-search="${escapeHTML(searchData)}">

                        <div class="payment-icon">

                            <span class="material-symbols-outlined">
                                payments
                            </span>

                        </div>


          <div class="payment-info">

                <strong>
                    Payment Paid
                            </strong>


                            <small>

            

                                ${escapeHTML(date)}

                            </small>

                        </div>


                        <div class="payment-amount">

                            <strong>
                                ${formatMoney(amount)}
                            </strong>


                            <span class="paid-badge">

                                <span class="material-symbols-outlined">
                                    check_circle
                                </span>

                                Paid

                            </span>

                        </div>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   PAYMENT SEARCH
========================================================= */

function setupPaymentSearch() {

    const search =
        document.getElementById(
            "paymentSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            const cards =
                document.querySelectorAll(
                    "#paymentHistory .payment-card"
                );


            let visibleCount = 0;


            cards.forEach((card) => {

                const text =
                    card.textContent
                        .toLowerCase();


                const searchData =
                    card.dataset.search || "";


                const matches =
                    text.includes(query) ||
                    searchData.includes(query);


                card.style.display =
                    matches
                        ? "flex"
                        : "none";


                if (matches) {
                    visibleCount++;
                }

            });


            const badge =
                document.getElementById(
                    "paymentCountBadge"
                );


            if (badge) {

                badge.textContent =
                    `${visibleCount} ${
                        visibleCount === 1
                            ? "Payment"
                            : "Payments"
                    }`;

            }

        }
    );

}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function uploadPhoto() {

    const file =
        document.getElementById(
            "photo"
        )?.files?.[0];


    if (!file) {
        return;
    }


    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        showToast?.(
            "Please select an image file.",
            "warning"
        );

        return;
    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        showToast?.(
        "Image must be smaller than 5 MB.",
            "warning"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = (event) => {

        const image =
            event.target.result;


        const docID =
            getCustomerDocID();


        if (!docID) {
            return;
        }


        const profileImage =
            document.getElementById(
                "profilePhoto"
            );


        if (profileImage) {

            profileImage.src =
                image;

        }


        localStorage.setItem(
            `photo_${docID}`,
            image
        );


        showToast?.(
            "Profile photo updated successfully.",
            "success"
        );

    };


    reader.onerror = () => {

        showToast?.(
            "Unable to read selected image.",
            "error"
        );

    };


    reader.readAsDataURL(file);

}


window.uploadPhoto =
    uploadPhoto;


/* =========================================================
   LOGOUT
========================================================= */

function customerLogout() {

    const id =
        getCustomerDocID();


    if (id) {

        localStorage.removeItem(
            `photo_${id}`
        );

    }


    localStorage.removeItem(
        "customerDocID"
    );


    const sessionKeys = [

        "customerFirebaseID",
        "customerCode",
        "customerVerified",
        "customerMobileVerified",
        "customerLoginMobile",
        "customerDemoOTP"

    ];


    sessionKeys.forEach((key) => {

        sessionStorage.removeItem(key);

    });


    showToast?.(
        "Logged out successfully.",
        "success"
    );


    setTimeout(() => {

        location.href =
            "customer-login.html";

    }, 600);

}


window.customerLogout =
    customerLogout;


/* =========================================================
   THEME
========================================================= */

function setLightTheme() {

    localStorage.setItem(
        "theme",
        "light"
    );


    document.body.classList.remove(
        "dark-theme"
    );


    window.closeSettings?.();

}


function setDarkTheme() {

    localStorage.setItem(
        "theme",
        "dark"
    );


    document.body.classList.add(
        "dark-theme"
    );


    window.closeSettings?.();

}


window.setLightTheme =
    setLightTheme;


window.setDarkTheme =
    setDarkTheme;


function applySavedTheme() {

    if (
        localStorage.getItem("theme") ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-theme"
        );

    }

    else {

        document.body.classList.remove(
            "dark-theme"
        );

    }

}


/* =========================================================
   PAYMENT / LOAN PAGE COUNTS
========================================================= */

function refreshPageCounts() {

    if (!customer) {
        return;
    }


    const loanBadge =
        document.getElementById(
            "loanCountBadge"
        );


    if (loanBadge) {

        loanBadge.textContent =
            `${customer.loans.length} ${
                customer.loans.length === 1
                    ? "Product"
                    : "Products"
            }`;

    }


    const paymentBadge =
        document.getElementById(
            "paymentCountBadge"
        );


    if (paymentBadge) {

        paymentBadge.textContent =
            `${customer.payments.length} ${
                customer.payments.length === 1
                    ? "Payment"
                    : "Payments"
            }`;

    }

}


/* =========================================================
   KEYBOARD HELP
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * Escape closes common modals.
             */

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-backdrop.show, .payment-modal.show"
                    )
                    .forEach((modal) => {

                        modal.classList.remove(
                            "show"
                        );

                    });


                document.body.classList.remove(
                    "modal-open"
                );

            }

        }
    );

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        applySavedTheme();

        setupKeyboardShortcuts();


        const path =
            location.pathname.toLowerCase();


        /* =================================================
           PROFILE PAGE
        ================================================= */

        if (
            path.includes("profile.html") ||
            path.includes("customer-profile.html")
        ) {

            const loaded =
                await loadCustomerProfile();


            if (loaded) {

                const savedPhoto =
                    localStorage.getItem(
                        `photo_${getCustomerDocID()}`
                    );


                const image =
                    document.getElementById(
                        "profilePhoto"
                    );


                if (
                    savedPhoto &&
                    image
                ) {

                    image.src =
                        savedPhoto;

                }

            }

        }


        /* =================================================
           BORROWED PRODUCTS PAGE
        ================================================= */

        if (
            path.includes("my-loans.html") ||
            path.includes("borrowed-products.html")
        ) {

            const loaded =
                await loadCustomerProfile();


            if (loaded) {

                loadLoanHistory();

                setupLoanSearch();

                refreshPageCounts();

            }

        }


        /* =================================================
           PAYMENT HISTORY PAGE
        ================================================= */

        if (
            path.includes(
                "my-payment-history.html"
            ) ||

            path.includes(
                "payments.html"
            )
        ) {

            const loaded =
                await loadCustomerProfile();


            if (loaded) {

                loadPaymentHistory();

                setupPaymentSearch();

                refreshPageCounts();

            }

        }

    }
);