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
// GET CUSTOMER ID
// ======================================

const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

// ======================================
// LOAD CUSTOMER
// ======================================

async function loadCustomer() {

    if (!customerId) {

        showToast("Customer ID missing.", "error");

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

        const data = snap.data();

        document.getElementById("name").value =
            data.name || "";

        document.getElementById("mobile").value =
            data.mobile || "";

        document.getElementById("address").value =
            data.address || "";

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
// UPDATE CUSTOMER
// ======================================

async function updateCustomer() {

    const name =
        document.getElementById("name").value.trim();

    const mobile =
        document.getElementById("mobile").value.trim();

    const address =
        document.getElementById("address").value.trim();

    if (name === "" || mobile === "") {

        showToast(
            "Please fill all required fields.",
            "warning"
        );

        return;

    }

    if (!/^\d{10}$/.test(mobile)) {

        showToast(
            "Enter a valid 10-digit mobile number.",
            "warning"
        );

        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        await updateDoc(
            doc(db, "customers", customerId),
            {

                name,

                mobile,

                address,

                updatedAt: serverTimestamp()

            }
        );

        showToast(
            "Customer updated successfully.",
            "success"
        );

        setTimeout(() => {

            window.location.href = "customers.html";

        }, 700);

    }

    catch (error) {

        console.error("Update Error:", error);

        showToast(
            "Failed to update customer.",
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

    const updateBtn =
        document.getElementById("updateBtn");

    if (updateBtn) {

        updateBtn.addEventListener(
            "click",
            updateCustomer
        );

    }

});