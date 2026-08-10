// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ======================================
// AVATAR COLORS
// ======================================

const colors = [

"#2563EB", // Blue
"#3B82F6", // Sky Blue
"#1D4ED8", // Royal Blue
"#6366F1", // Indigo
"#7C3AED", // Purple
"#9333EA", // Violet
"#A855F7", // Bright Purple
"#EC4899", // Pink
"#DB2777", // Dark Pink
"#E11D48", // Rose
"#EF4444", // Red
"#DC2626", // Dark Red
"#F97316", // Orange
"#EA580C", // Deep Orange
"#F59E0B", // Amber
"#D97706", // Gold
"#0EA5E9", // Light Blue
"#0284C7", // Ocean Blue
"#4F46E5", // Deep Indigo
"#8B5CF6", // Lavender Purple
"#C026D3", // Magenta
"#BE123C", // Crimson
"#B91C1C", // Wine Red
"#334155", // Slate
"#475569", // Steel Gray
"#6B7280", // Gray
"#0F172A", // Navy Black
"#7C2D12", // Brown
"#9A3412", // Burnt Orange
"#581C87"  // Dark Violet

];


// ======================================
// AVATAR COLOR
// ======================================

function getAvatarColor(name) {

    if (!name) {
        return colors[0];
    }

    let total = 0;

    for (let i = 0; i < name.length; i++) {

        total += name.charCodeAt(i);

    }

    return colors[total % colors.length];

}


// ======================================
// GET INITIAL
// ======================================

function getInitial(name) {

    if (!name) {
        return "?";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


// ======================================
// FORMAT MONEY
// ======================================

function formatMoney(amount) {

    return "₹" + Number(amount || 0).toLocaleString("en-IN");

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(value) {

    if (!value) {
        return "Recently";
    }

    let date;

    // Firestore Timestamp
    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        date = value.toDate();

    }

    // JavaScript Date
    else if (value instanceof Date) {

        date = value;

    }

    // Number timestamp
    else if (typeof value === "number") {

        date = new Date(value);

    }

    // String
    else if (typeof value === "string") {

        date = new Date(value);

        // Handle DD/MM/YYYY style dates
        if (isNaN(date.getTime())) {

            const parts = value.split(/[\/\-]/);

            if (parts.length >= 3) {

                const day = Number(parts[0]);
                const month = Number(parts[1]) - 1;
                const year = Number(parts[2]);

                date = new Date(
                    year,
                    month,
                    day
                );

            }

        }

    }

    if (!date || isNaN(date.getTime())) {

        return "Recently";

    }

    return date.toLocaleString("en-IN", {

        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"

    });

}


// ======================================
// GET DATE OBJECT
// ======================================

function getDateObject(value) {

    if (!value) {
        return new Date(0);
    }

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        return value.toDate();

    }

    if (value instanceof Date) {

        return value;

    }

    if (typeof value === "number") {

        return new Date(value);

    }

    if (typeof value === "string") {

        const date = new Date(value);

        if (!isNaN(date.getTime())) {

            return date;

        }

        const parts = value.split(/[\/\-]/);

        if (parts.length >= 3) {

            const day = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const year = Number(parts[2]);

            return new Date(
                year,
                month,
                day
            );

        }

    }

    return new Date(0);

}


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    try {

        if (typeof showLoader === "function") {
            showLoader();
        }

        const snapshot = await getDocs(
            collection(db, "customers")
        );

        const customers = [];

        let totalLoan = 0;
        let totalPaid = 0;

        // ==================================
        // READ CUSTOMERS
        // ==================================

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            data.id = docSnap.id;

            data.loans = data.loans || [];
            data.payments = data.payments || [];

            // Calculate loan
            const loan = data.loans.reduce(
                (sum, item) =>
                    sum + Number(item.total || 0),
                0
            );

            // Calculate paid
            const paid = data.payments.reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );

            data.calculatedLoan = loan;
            data.calculatedPaid = paid;
            data.calculatedBalance =
                Math.max(loan - paid, 0);

            totalLoan += loan;
            totalPaid += paid;

            customers.push(data);

        });


        // ==================================
        // UPDATE SUMMARY
        // ==================================

        const totalLoanElement =
            document.getElementById("totalLoan");

        const totalPaidElement =
            document.getElementById("totalPaid");

        const remainingElement =
            document.getElementById("remaining");

        const totalCustomersElement =
            document.getElementById("totalCustomers");


        if (totalLoanElement) {

            totalLoanElement.textContent =
                formatMoney(totalLoan);

        }


        if (totalPaidElement) {

            totalPaidElement.textContent =
                formatMoney(totalPaid);

        }


        if (remainingElement) {

            remainingElement.textContent =
                formatMoney(
                    Math.max(
                        totalLoan - totalPaid,
                        0
                    )
                );

        }


        if (totalCustomersElement) {

            totalCustomersElement.textContent =
                customers.length;

        }


        // ==================================
        // SHOW RECENT ACTIVITIES
        // ==================================

        showRecentActivities(customers);

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        if (typeof showToast === "function") {

            showToast(
                "Failed to load dashboard.",
                "error"
            );

        }

    }

    finally {

        if (typeof hideLoader === "function") {

            hideLoader();

        }

    }

}


// ======================================
// CREATE ACTIVITIES
// ======================================

function createActivities(customers) {

    const activities = [];


    customers.forEach(customer => {

        const customerName =
            customer.name || "Unknown Customer";


        // ==================================
        // CUSTOMER CREATED
        // ==================================

        if (customer.createdAt) {

            activities.push({

                type: "customer",

                icon: "👤",

                title: "New Customer",

                message:
                    `${customerName} was added`,

                amount: null,

                date: getDateObject(
                    customer.createdAt
                ),

                customer

            });

        }


        // ==================================
        // LOAN ACTIVITIES
        // ==================================

        customer.loans.forEach(loan => {

            const loanDate =
                loan.date ||
                loan.createdAt ||
                loan.dateTime;

            activities.push({

                type: "loan",

                icon: "🛒",

                title: "Product Borrowed",

                message:
                    `${customerName} borrowed ${
                        loan.product || "a product"
                    }`,

                amount:
                    Number(loan.total || 0),

                date:
                    getDateObject(loanDate),

                customer

            });

        });


        // ==================================
        // PAYMENT ACTIVITIES
        // ==================================

        customer.payments.forEach(payment => {

            const paymentDate =
                payment.date ||
                payment.createdAt;

            activities.push({

                type: "payment",

                icon: "💰",

                title: "Payment Received",

                message:
                    `${customerName} made a payment`,

                amount:
                    Number(payment.amount || 0),

                date:
                    getDateObject(paymentDate),

                customer

            });

        });

    });


    return activities;

}


// ======================================
// SHOW TOP 5 ACTIVITIES
// ======================================

function showRecentActivities(customers) {

    const container =
        document.getElementById(
            "recentCustomers"
        );

    if (!container) return;


    const activities =
        createActivities(customers);


    // ==================================
    // SORT NEWEST FIRST
    // ==================================

    activities.sort(
        (a, b) =>
            b.date.getTime() -
            a.date.getTime()
    );


    // ==================================
    // TOP 5 ONLY
    // ==================================

    const recent =
        activities.slice(0, 5);


    // ==================================
    // EMPTY STATE
    // ==================================

    if (recent.length === 0) {

        container.innerHTML = `

            <div class="empty-activities">

                <div class="empty-icon">
                    📋
                </div>

                <h3>No Recent Activities</h3>

                <p>
                    Customer activities will
                    appear here.
                </p>

            </div>

        `;

        return;

    }


    // ==================================
    // RENDER
    // ==================================

    let html = "";


    recent.forEach(activity => {

        const customer =
            activity.customer;

        const name =
            customer.name ||
            "Unknown Customer";

        const color =
            getAvatarColor(name);

        const initial =
            getInitial(name);


        // Activity color class
        let typeClass = "customer";

        if (activity.type === "payment") {
            typeClass = "payment";
        }

        else if (activity.type === "loan") {
            typeClass = "loan";
        }


        html += `

            <div
                class="activity-card"
                onclick="openCustomer('${customer.id}')">

                <div
                    class="activity-avatar"
                    style="background:${color}">

                    ${initial}

                </div>


                <div class="activity-content">

                    <div class="activity-main">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <span
                            class="activity-type ${typeClass}">

                            ${activity.icon}
                            ${activity.title}

                        </span>

                    </div>


                    <p class="activity-message">

                        ${escapeHTML(
                            activity.message
                        )}

                    </p>


                    <p class="activity-date">

                        🕒
                        ${formatDate(
                            activity.date
                        )}

                    </p>

                </div>


                ${
                    activity.amount !== null

                    ?

                    `

                    <div
                        class="
                            activity-amount
                            ${typeClass}
                        ">

                        ${
                            activity.type ===
                            "payment"

                            ? "+"

                            : ""
                        }

                        ${formatMoney(
                            activity.amount
                        )}

                    </div>

                    `

                    :

                    ""

                }

            </div>

        `;

    });


    container.innerHTML = html;

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// OPEN CUSTOMER
// ======================================

window.openCustomer = function(id) {

    if (!id) return;

    window.location.href =
        "customer-details.html?id=" +
        encodeURIComponent(id);

};


// ======================================
// ADMIN PROFILE PHOTO
// ======================================

window.uploadAdminPhoto =
function uploadAdminPhoto() {

    const input =
        document.getElementById(
            "adminPhoto"
        );

    if (!input || !input.files.length) {
        return;
    }

    const file =
        input.files[0];

    const reader =
        new FileReader();

    reader.onload = function(event) {

        const photo =
            event.target.result;

        const image =
            document.getElementById(
                "adminProfile"
            );

        if (image) {

            image.src = photo;

        }

        localStorage.setItem(
            "adminProfilePhoto",
            photo
        );

    };

    reader.readAsDataURL(file);

};


// ======================================
// LOAD ADMIN PHOTO
// ======================================

function loadAdminPhoto() {

    const savedPhoto =
        localStorage.getItem(
            "adminProfilePhoto"
        );

    const image =
        document.getElementById(
            "adminProfile"
        );

    if (
        savedPhoto &&
        image
    ) {

        image.src = savedPhoto;

    }

}


// ======================================
// START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdminPhoto();

        loadDashboard();

    }
);
