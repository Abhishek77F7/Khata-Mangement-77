// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// GET CUSTOMER ID
// ======================================

const params = new URLSearchParams(window.location.search);

const customerId = params.get("id");

if (!customerId) {

    showToast("Customer not found.", "error");

    setTimeout(() => {

        window.location.href = "customers.html";

    }, 1200);

}

let customer = {};

// ======================================
// LOAD CUSTOMER
// ======================================

async function loadCustomer() {

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

        // Quick Action Buttons

        const addLoanBtn = document.getElementById("addLoanBtn");
        const paymentBtn = document.getElementById("paymentBtn");
        const historyBtn = document.getElementById("historyBtn");

        if (addLoanBtn) {
            addLoanBtn.href = "add-loan.html?id=" + customerId;
        }

        if (paymentBtn) {
            paymentBtn.href = "payments.html?id=" + customerId;
        }

        if (historyBtn) {
            historyBtn.href = "payment-history.html?id=" + customerId;
        }

        // Calculate Totals

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

        showCustomer();

        showLoans();

        showPayments();

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
// PART 1 END
// ======================================

// ======================================
// SHOW CUSTOMER
// ======================================

function showCustomer() {

    const customerAvatar =
        document.getElementById("customerAvatar");

    const customerName =
        document.getElementById("customerName");

    const customerID =
        document.getElementById("customerID");

    const customerMobile =
        document.getElementById("customerMobile");

    const customerAddress =
        document.getElementById("customerAddress");

    const loan =
        document.getElementById("loan");

    const paid =
        document.getElementById("paid");

    const balance =
        document.getElementById("balance");
        
        const totalProducts =
    document.getElementById("totalProducts");

    if (customerAvatar)
        customerAvatar.textContent =
            customer.name
                ? customer.name.charAt(0).toUpperCase()
                : "?";

    if (customerName)
        customerName.textContent =
            customer.name || "No Name";

    if (customerID)
        customerID.textContent =
            "🆔 " + (customer.id || "No ID");

    if (customerMobile)
        customerMobile.textContent =
            "📞 " + (customer.mobile || "No Mobile");

    if (customerAddress)
        customerAddress.textContent =
            "📍 " + (customer.address || "No Address");

    if (loan)
        loan.textContent =
            "₹" + Number(customer.loan || 0);

    if (paid)
        paid.textContent =
            "₹" + Number(customer.paid || 0);

    if (balance)
        balance.textContent =
            "₹" + Number(customer.balance || 0);
            
    if (totalProducts)
    totalProducts.textContent =
        customer.loans ? customer.loans.length : 0;

}

// ======================================
// BORROWED PRODUCTS
// ======================================

function showLoans() {

    const loanHistory = document.getElementById("loanHistory");

    if (!loanHistory) return;

    loanHistory.innerHTML = "";

    if (!customer.loans || customer.loans.length === 0) {

        loanHistory.innerHTML = `

        <div class="history-card">

            <h3>No Borrowed Products</h3>

            <p>No loan records available.</p>

        </div>

        `;

        return;

    }

    let html = "";

    [...customer.loans].reverse().forEach((loan, i) => {

        const originalIndex =
            customer.loans.length - 1 - i;

        html += `

        <div class="history-card">

            <div class="card-top">

                <h3>🛒 ${loan.product || "Unknown Product"}</h3>

                <button
                    class="edit-btn"
                    onclick="editLoan(${originalIndex})">

                    ✏️

                </button>

            </div>

            <hr>

            <p><strong>Quantity :</strong> ${loan.qty || 0}</p>

            <p><strong>Price :</strong> ₹${loan.price || 0}</p>

            <p><strong>Total :</strong> ₹${loan.total || 0}</p>

            <p><strong>Date :</strong> ${loan.date || "-"}</p>

            <div class="card-bottom">

                <span></span>

                <button
                    class="delete-btn"
                    onclick="deleteLoan(${originalIndex})">

                    🗑️ DELETE

                </button>

            </div>

        </div>

        `;

    });

    loanHistory.innerHTML = html;

}

// ======================================
// PART 2 END
// ======================================

// ======================================
// PAYMENT HISTORY
// ======================================

function showPayments() {

    // Payment History page handles payment display.
    // This function is reserved for future dashboard preview.

    console.log("Payments:", customer.payments);

}

// ======================================
// EDIT LOAN
// ======================================

window.editLoan = function (index) {

    window.location.href =
        "edit-loan.html?id=" +
        encodeURIComponent(customerId) +
        "&loan=" +
        index;

};

// ======================================
// DELETE LOAN
// ======================================

window.deleteLoan = async function (index) {

    const ok = confirm("Delete this borrowed product?");

    if (!ok) return;

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {
      
        const deletedLoan = customer.loans[index];
 
        customer.loans.splice(index, 1);

        customer.loan = customer.loans.reduce((sum, item) => {

            return sum + Number(item.total || 0);

        }, 0);

        customer.balance = Math.max(
            customer.loan - customer.paid,
            0
        );

        await updateDoc(
    doc(db, "customers", customerId),
    {
        loans: customer.loans,
        loan: customer.loan,
        balance: customer.balance,

        notifications: [

            ...(customer.notifications || []),

            {

                icon: "❌",

                title: "Loan Deleted",

                message:
                    `${deletedLoan.product} - ₹${deletedLoan.total} removed`,

                date: new Date().toLocaleString()

            }

        ]

    }
);

        showToast(
            "Borrowed product deleted successfully.",
            "success"
        );

        await loadCustomer();

    }

    catch (error) {

        console.error("Delete Loan Error:", error);

        showToast(
            "Failed to delete borrowed product.",
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
// REFRESH CUSTOMER
// ======================================

window.refreshCustomer = function () {

    loadCustomer();

};

// ======================================
// BACK TO CUSTOMERS
// ======================================

window.backToCustomers = function () {

    window.location.href = "customers.html";

};

// ======================================
// START
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadCustomer();

});