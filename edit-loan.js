// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// GET URL PARAMETERS
// ======================================

const params = new URLSearchParams(window.location.search);

const customerId = params.get("id");
const loanIndex = Number(params.get("loan"));

let customer = {};
let loans = [];

// ======================================
// LOAD LOAN
// ======================================

async function loadLoan() {

    if (!customerId || isNaN(loanIndex)) {

        showToast("Invalid loan.", "error");

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
        loans = customer.loans || [];

        const loan = loans[loanIndex];

        if (!loan) {

            showToast("Borrowed product not found.", "error");

            setTimeout(() => {
                window.location.href =
                    "customer-details.html?id=" + customerId;
            }, 1200);

            return;

        }

        const customerName = document.getElementById("customerName");
const product = document.getElementById("product");
const qty = document.getElementById("qty");
const price = document.getElementById("price");
const total = document.getElementById("total");
const date = document.getElementById("dateTime");
const backBtn = document.getElementById("backBtn");

if (customerName) customerName.textContent = customer.name || "";
if (product) product.value = loan.product || "";
if (qty) qty.value = loan.qty || "";
if (price) price.value = loan.price || "";
if (total) total.value = loan.total || "";
if (date) {

    if (loan.date) {

        const d = new Date(loan.date);

        if (!isNaN(d)) {

            date.value =
                d.toISOString().slice(0, 16);

        }

    }

}
if (backBtn) backBtn.href = "customer-details.html?id=" + customerId;

    }

    catch (error) {

        console.error("Load Loan Error:", error);

        showToast("Failed to load loan.", "error");

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

}

// ======================================
// AUTO CALCULATE TOTAL
// ======================================

function calculate() {

    const qty =
        Number(document.getElementById("qty").value) || 0;

    const price =
        Number(document.getElementById("price").value) || 0;

    document.getElementById("total").value =
        qty * price;

}

// ======================================
// UPDATE LOAN
// ======================================

async function updateLoan() {

    const product =
        document.getElementById("product").value.trim();

    const qty =
        Number(document.getElementById("qty").value);

    const price =
        Number(document.getElementById("price").value);

    const total = qty * price;

const inputDate =
    document.getElementById("dateTime").value;

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

    if (!product) {

        showToast(
            "Please enter product name.",
            "warning"
        );

        return;

    }

    if (qty <= 0 || price <= 0) {

        showToast(
            "Enter valid quantity and price.",
            "warning"
        );

        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        loans[loanIndex] = {

            product,

            qty,

            price,

            total,

            date

        };
        
        customer.notifications =
    customer.notifications || [];

customer.notifications.push({

    icon: "✏️",

    title: "Loan Updated",

    message: `${product} updated (₹${total})`,

    date: new Date().toLocaleString("en-IN")

});

        customer.loan = loans.reduce((sum, item) => {

            return sum + Number(item.total || 0);

        }, 0);

        customer.paid = (customer.payments || []).reduce((sum, item) => {

            return sum + Number(item.amount || 0);

        }, 0);

        customer.balance = Math.max(
            customer.loan - customer.paid,
            0
        );

        await updateDoc(

    doc(db, "customers", customerId),

    {

        loans,

        loan: customer.loan,

        paid: customer.paid,

        balance: customer.balance,

        notifications: customer.notifications,

        updatedAt: serverTimestamp()

    }

);

        showToast(
            "Borrowed product updated successfully.",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "customer-details.html?id=" + customerId;

        }, 700);

    }

    catch (error) {

        console.error("Update Loan Error:", error);

        showToast(
            "Failed to update borrowed product.",
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

    const qty = document.getElementById("qty");
    const price = document.getElementById("price");
    const updateBtn = document.getElementById("updateBtn");

    if (qty) qty.addEventListener("input", calculate);

    if (price) price.addEventListener("input", calculate);

    if (updateBtn) {
        updateBtn.addEventListener("click", updateLoan);
    }

    loadLoan();

});