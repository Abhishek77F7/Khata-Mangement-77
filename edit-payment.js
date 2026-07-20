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
// URL PARAMETERS
// ======================================

const params = new URLSearchParams(window.location.search);

const customerId = params.get("id");
const paymentIndex = Number(params.get("payment"));

let customer = {};

// ======================================
// LOAD PAYMENT
// ======================================

async function loadPayment() {

    if (!customerId || isNaN(paymentIndex)) {

        showToast("Invalid payment.", "error");

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

        const payment = customer.payments[paymentIndex];

        if (!payment) {

            showToast("Payment not found.", "error");

            setTimeout(() => {
                window.location.href =
                    "payment-history.html?id=" + customerId;
            }, 1200);

            return;

        }

        document.getElementById("amount").value =
            payment.amount || "";

        const dateInput = document.getElementById("date");

if (dateInput && payment.date) {

    const d = new Date(payment.date);

    if (!isNaN(d)) {

        dateInput.value =
            d.toISOString().slice(0, 16);

    }

}

        const backBtn = document.getElementById("backBtn");

        if (backBtn) {

            backBtn.href =
                "payment-history.html?id=" + customerId;

        }

    }

    catch (error) {

        console.error("Load Payment Error:", error);

        showToast("Failed to load payment.", "error");

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

}

// ======================================
// UPDATE PAYMENT
// ======================================

async function updatePayment() {

    const amount = Number(
        document.getElementById("amount").value
    );

    const inputDate =
    document.getElementById("date").value;

let date;

if (inputDate) {

    date = new Date(inputDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

} else {

    date = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

}

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        customer.payments[paymentIndex] = {

            amount,
            date

        };

        // ======================================
        // RECALCULATE TOTALS
        // ======================================

        customer.loan = customer.loans.reduce((sum, item) => {

            return sum + Number(item.total || 0);

        }, 0);

        customer.paid = customer.payments.reduce((sum, item) => {

            return sum + Number(item.amount || 0);

        }, 0);

        customer.balance = Math.max(
            customer.loan - customer.paid,
            0
        );

        await updateDoc(

            doc(db, "customers", customerId),

            {

                payments: customer.payments,
                loan: customer.loan,
                paid: customer.paid,
                balance: customer.balance

            }

        );

        showToast(
            "Payment updated successfully.",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "payment-history.html?id=" + customerId;

        }, 600);

    }

    catch (error) {

        console.error("Update Payment Error:", error);

        showToast(
            "Update failed.",
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
// START
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadPayment();

    const updateBtn =
        document.getElementById("updateBtn");

    if (updateBtn) {

        updateBtn.addEventListener(
            "click",
            updatePayment
        );

    }

});