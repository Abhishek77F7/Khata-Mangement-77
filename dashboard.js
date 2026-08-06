// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// GLOBAL CUSTOMER ARRAY
// ======================================

let customers = [];

// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        customers = [];

        const snapshot = await getDocs(
            collection(db, "customers")
        );

        let totalCustomers = 0;
        let totalLoan = 0;
        let totalPaid = 0;
        let totalBalance = 0;

        snapshot.forEach((docSnap) => {

            const customer = {

                firebaseID: docSnap.id,

                loans: [],

                payments: [],

                ...docSnap.data()

            };

            customers.push(customer);

            totalCustomers++;

            const loan = customer.loans.reduce(

                (sum, item) =>

                    sum + Number(item.total || 0),

                0

            );

            const paid = customer.payments.reduce(

                (sum, item) =>

                    sum + Number(item.amount || 0),

                0

            );

            const balance = Math.max(
                loan - paid,
                0
            );

            totalLoan += loan;

            totalPaid += paid;

            totalBalance += balance;

        });

        customers.reverse();

        if (document.getElementById("totalCustomers")) {

            document.getElementById(
                "totalCustomers"
            ).textContent = totalCustomers;

        }

        if (document.getElementById("totalLoan")) {

            document.getElementById(
                "totalLoan"
            ).textContent = "₹" + totalLoan;

        }

        if (document.getElementById("totalPaid")) {

            document.getElementById(
                "totalPaid"
            ).textContent = "₹" + totalPaid;

        }

        if (document.getElementById("remaining")) {

            document.getElementById(
                "remaining"
            ).textContent = "₹" + totalBalance;

        }

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        showToast(
            "Failed to load dashboard.",
            "error"
        );

    }

    finally {

        if (typeof hideLoader === "function") {

            hideLoader();

        }

    }

}

// ======================================
// LOAD RECENT CUSTOMERS
// ======================================

function loadRecentCustomers() {

    const recentBox =
        document.getElementById("recentCustomers");

    if (!recentBox) return;

    recentBox.innerHTML = "";

    if (customers.length === 0) {

        recentBox.innerHTML = `

        <div class="recent-card">

            <div class="recent-left">

                <div class="recent-avatar">?</div>

                <div class="recent-info">

                    <h3>No Customers</h3>

                    <p>Add your first customer</p>

                </div>

            </div>

        </div>

        `;

        return;

    }

    let html = "";

    customers
        .slice(0,5)
        .forEach((customer)=>{

            const initial =
                (customer.name || "?")
                .charAt(0)
                .toUpperCase();

            const loan =
                (customer.loans || []).reduce(
                    (sum,item)=>
                        sum + Number(item.total || 0),
                    0
                );

            const paid =
                (customer.payments || []).reduce(
                    (sum,item)=>
                        sum + Number(item.amount || 0),
                    0
                );

            const balance =
                Math.max(loan-paid,0);

            html += `

<div class="recent-card"

onclick="openCustomer('${customer.firebaseID}')">

    <div class="recent-left">

        <div class="recent-avatar">

            ${initial}

        </div>

        <div class="recent-info">

            <h3>${customer.name}</h3>

            <p>

                ${customer.mobile}

            </p>

        </div>

    </div>

    <div class="amount-badge">

        ₹${balance.toLocaleString()}

    </div>

</div>

`;

        });

    recentBox.innerHTML = html;

}

// ======================================
// SEARCH CUSTOMER
// ======================================

window.searchCustomer = function () {

    const text =
        document.getElementById("searchDashboard")
        ?.value
        .trim()
        .toLowerCase();

    const items =
document.querySelectorAll(
"#recentCustomers .recent-card"
);

    items.forEach((item) => {

        if (
            item.innerText
                .toLowerCase()
                .includes(text)
        ) {

            item.style.display = "flex";

        }

        else {

            item.style.display = "none";

        }

    });

};

// ======================================
// OPEN CUSTOMER DETAILS
// ======================================

window.openCustomer = function (firebaseID) {

    window.location.href =
        "customer-details.html?id=" +
        encodeURIComponent(firebaseID);

};

// ======================================
// AUTO LOAD DASHBOARD
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadDashboard();

    loadRecentCustomers();

});

// ======================================
// REFRESH DASHBOARD
// ======================================

window.refreshDashboard = async function () {

    await loadDashboard();

    loadRecentCustomers();

};

// ======================================
// FORMAT CURRENCY
// ======================================

function formatCurrency(amount) {

    return "₹" + Number(amount || 0).toLocaleString("en-IN");

}

// ======================================
// LOGOUT
// ======================================

window.logout = function () {

    if (confirm("Are you sure you want to logout?")) {

        localStorage.removeItem("adminLoggedIn");

        showToast(
            "Logged out successfully",
            "success"
        );

        setTimeout(() => {

            window.location.href = "admin-login.html";

        }, 700);

    }

};




function uploadAdminPhoto() {

    const input = document.getElementById("adminPhoto");

    if (!input.files.length) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {

        const photo = e.target.result;

        document.getElementById("adminProfile").src = photo;

        localStorage.setItem(
            "adminProfilePhoto",
            photo
        );

        showToast(
            "Profile photo updated successfully.",
            "success"
        );

    };

    reader.readAsDataURL(file);

}

document.addEventListener("DOMContentLoaded", () => {

    const saved =
        localStorage.getItem("adminProfilePhoto");

    if (saved) {

        document.getElementById("adminProfile").src = saved;

    }

});

window.uploadAdminPhoto = uploadAdminPhoto;
