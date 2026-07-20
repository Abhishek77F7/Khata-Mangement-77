// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// GET CUSTOMER ID
// ======================================

const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

let customer = {};

// ======================================
// LOAD CUSTOMER
// ======================================

async function loadCustomer() {

    if (!customerId) {

        showToast("Customer not found.", "error");

        setTimeout(() => {
            window.location.href = "customers.html";
        }, 1200);

        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const snap = await getDoc(
            doc(db, "customers", customerId)
        );

        if (!snap.exists()) {

            showToast("Customer not found.", "error");

            setTimeout(() => {
                window.location.href = "customers.html";
            }, 1200);

            return;

        }

        customer = snap.data();

        customer.loans = customer.loans || [];
        customer.payments = customer.payments || [];

        customer.loan = customer.loans.reduce(
            (sum, item) => sum + Number(item.total || 0),
            0
        );

        customer.paid = customer.payments.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        customer.balance = Math.max(
            customer.loan - customer.paid,
            0
        );

        const customerName =
            document.getElementById("customerName");

        const customerMobile =
            document.getElementById("customerMobile");

        const totalPaid =
            document.getElementById("totalPaid");

        const backBtn =
            document.getElementById("backBtn");

        if (customerName)
            customerName.textContent = customer.name || "";

        if (customerMobile)
            customerMobile.textContent =
                "📞 " + (customer.mobile || "");

        if (totalPaid)
            totalPaid.textContent =
                "₹" + customer.paid;

        if (backBtn)
            backBtn.href =
                "customer-details.html?id=" + customerId;

        showPayments();

    }

    catch (error) {

        console.error("Load Payment History Error:", error);

        showToast(
            "Failed to load payment history.",
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
// SHOW PAYMENTS
// ======================================

function showPayments() {

    const history =
        document.getElementById("paymentHistory");

    if (!history) return;

    history.innerHTML = "";

    if (customer.payments.length === 0) {

        history.innerHTML = `

        <div class="history-card">

            <h3>No Payment History</h3>

            <p>No payments available.</p>

        </div>

        `;

        return;

    }

    let html = "";

    [...customer.payments].reverse().forEach((payment, i) => {

        const originalIndex =
            customer.payments.length - 1 - i;

        html += `

        <div class="history-card">

            <div class="card-top">

                <h2> ₹${payment.amount}</h2>

                <button
                    class="edit-btn"
                    onclick="editPayment(${originalIndex})">

                    ✏️

                </button>

            </div>

            <hr>

            <p><strong>Date :</strong> ${payment.date}</p>

            <div class="card-bottom">

                <span></span>

                <button
                    class="delete-btn"
                    onclick="deletePayment(${originalIndex})">

                    🗑️ DELETE

                </button>

            </div>

        </div>

        `;

    });

    history.innerHTML = html;

}

// ======================================
// EDIT PAYMENT
// ======================================

window.editPayment = function (index) {

    window.location.href =
        "edit-payment.html?id=" +
        encodeURIComponent(customerId) +
        "&payment=" +
        index;

};

// ======================================
// DELETE PAYMENT
// ======================================

window.deletePayment = async function (index) {

    if (!confirm("Delete this payment?")) {
        return;
    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        customer.payments.splice(index, 1);

        customer.paid = customer.payments.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        customer.balance = Math.max(
            customer.loan - customer.paid,
            0
        );

        await updateDoc(
            doc(db, "customers", customerId),
            {
                payments: customer.payments,
                paid: customer.paid,
                balance: customer.balance
            }
        );

        showToast(
            "Payment deleted successfully.",
            "success"
        );

        await loadCustomer();

    }

    catch (error) {

        console.error("Delete Payment Error:", error);

        showToast(
            "Failed to delete payment.",
            "error"
        );

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

};

// ======================================
// START
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadCustomer();

});