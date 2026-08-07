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

function getAvatarColor(name){

    if(!name) return colors[0];

    let hash = 0;

    for(let i=0;i<name.length;i++){

        hash = name.charCodeAt(i) + ((hash << 5) - hash);

    }

    return colors[Math.abs(hash) % colors.length];

}

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

        const customerAvatar =
    document.getElementById("customerAvatar");

const customerName =
    document.getElementById("customerName");

const customerMobile =
    document.getElementById("customerMobile");

const totalPaid =
    document.getElementById("totalPaid");

const balanceAmount =
    document.getElementById("balanceAmount");

const backBtn =
    document.getElementById("backBtn");

        if(customerAvatar){

    customerAvatar.textContent =
        customer.name
        ? customer.name.charAt(0).toUpperCase()
        : "?";

    customerAvatar.style.background =
        getAvatarColor(customer.name);

}

if(customerName){

    customerName.textContent =
        customer.name || "Customer";

}

if(customerMobile){

    customerMobile.textContent =
        "📞 " + (customer.mobile || "No Mobile");

}

if(totalPaid){

    totalPaid.textContent =
        "₹" + customer.paid;

}

if(balanceAmount){

    balanceAmount.textContent =
        "₹" + customer.balance;

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

    const amount =
        document.getElementById("amount");

    if(amount){

        setTimeout(()=>{

            amount.focus();

        },300);

    }

});

// ======================================
// QUICK AMOUNT BUTTONS
// ======================================

window.fillAmount = function(amount){

    const input =
        document.getElementById("amount");

    if(input){

        input.value = amount;

        input.focus();

    }

};

// ======================================
// MAKE FUNCTION AVAILABLE TO HTML
// ======================================

window.receivePayment = receivePayment;

console.log("payments.js loaded successfully");
console.log(window.receivePayment);
