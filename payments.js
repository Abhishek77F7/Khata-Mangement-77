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
// GET CUSTOMER ID FROM URL
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

        const ref = doc(db, "customers", customerId);

        const snap = await getDoc(ref);

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

        const customerName =
            document.getElementById("customerName");

        const customerMobile =
            document.getElementById("customerMobile");

        const backBtn =
            document.getElementById("backBtn");

        if (customerName) {
            customerName.textContent = customer.name || "";
        }

        if (customerMobile) {
            customerMobile.textContent =
                "📞 " + (customer.mobile || "");
        }

        if (backBtn) {
            backBtn.href =
                "customer-details.html?id=" + customerId;
        }

    }

    catch (error) {

        console.error("Load Customer Error:", error);

        showToast(
            "Failed to load customer.",
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
// RECEIVE PAYMENT
// ======================================

async function receivePayment() {

    const amountInput =
        document.getElementById("amount");

    const amount =
        Number(amountInput?.value);

    if (isNaN(amount) || amount <= 0) {

        showToast(
            "Enter a valid payment amount.",
            "warning"
        );

        return;

    }

    if (amount > customer.balance) {

        showToast(
            "Payment cannot be greater than remaining balance.",
            "warning"
        );

        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        customer.payments.push({

            amount,

            date: new Date().toLocaleString("en-IN", {

                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"

            })

        });
        
        customer.notifications =
    customer.notifications || [];

customer.notifications.push({

    icon: "💰",

    title: "Payment Paid",

    message: `₹${amount} Paid`,

    date: new Date().toLocaleString("en-IN")

});

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

        balance: customer.balance,

        notifications: customer.notifications

    }

);

        showToast(

            "Payment received successfully.",

            "success"

        );

        if (amountInput) {
            amountInput.value = "";
        }

        setTimeout(() => {

            window.location.href =
                "customer-details.html?id=" + customerId;

        }, 600);

    }

    catch (error) {

        console.error("Payment Error:", error);

        showToast(

            "Failed to save payment.",

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

    loadCustomer();

});

// ======================================
// MAKE FUNCTION AVAILABLE TO HTML
// ======================================

window.receivePayment = receivePayment;

console.log("payments.js loaded successfully");
console.log(window.receivePayment);