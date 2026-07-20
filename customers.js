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
   doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// CUSTOMER ARRAY
// ======================================

let customers = [];

// ======================================
// GENERATE CUSTOMER ID
// ======================================

async function generateCustomerID() {

    try {

        const snapshot = await getDocs(
            collection(db, "customers")
        );

        let highestNumber = 0;

        snapshot.forEach((docSnap) => {

            const id = docSnap.data().id || "";

            const match = id.match(/^ABHI(\d{5})$/);

            if (match) {

                const number = Number(match[1]);

                if (number > highestNumber) {
                    highestNumber = number;
                }

            }

        });

        const nextNumber = highestNumber + 1;

        return "ABHI" + String(nextNumber).padStart(5, "0");

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to generate Customer ID.",
            "error"
        );

        return null;

    }

}

// ======================================
// SAVE CUSTOMER
// ======================================

async function saveCustomer() {

    const name =
        document.getElementById("name").value.trim();

    const mobile =
        document.getElementById("mobile").value.trim();

    const address =
        document.getElementById("address").value.trim();

    // Validation

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

    const exists = customers.find(
        c => c.mobile === mobile
    );

    if (exists) {

        showToast(
            "Customer already exists.",
            "warning"
        );

        return;

    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const customerID =
            await generateCustomerID();

        if (!customerID) {

            if (typeof hideLoader === "function") {
                hideLoader();
            }

            return;

        }

        await addDoc(
            collection(db, "customers"),
            {

                id: customerID,

                name,

                mobile,

                address,

                loan: 0,

                paid: 0,

                balance: 0,

                loans: [],

                payments: [],

                createdAt: serverTimestamp()

            }
        );

        showToast(
            `Customer Saved Successfully\nCustomer ID: ${customerID}`,
            "success"
        );

        document.getElementById("name").value = "";

        document.getElementById("mobile").value = "";

        document.getElementById("address").value = "";

        await loadCustomers();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to save customer.",
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
// LOAD CUSTOMERS
// ======================================

async function loadCustomers() {

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const list = document.getElementById("customerList");

        if (!list) return;

        list.innerHTML = "";

        customers = [];

        const q = query(
    collection(db, "customers"),
    orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            customers.push({

                firebaseID: docSnap.id,

                id: data.id || "",

                name: data.name || "",

                mobile: data.mobile || "",

                address: data.address || "",

                loan: data.loan || 0,

                paid: data.paid || 0,

                balance: data.balance || 0,

                loans: data.loans || [],

                payments: data.payments || []

            });

        });

        
        if (customers.length === 0) {

            list.innerHTML = `
                <div class="empty-state">
                    <h3>No Customers Found</h3>
                </div>
            `;

            return;

        }

        let html = "";

customers.forEach((customer, index) => {

    const avatar =
        customer.name
        ? customer.name.charAt(0).toUpperCase()
        : "?";

    html += `

<div class="customer-card">

    <div class="card-header">

        <div class="customer-info">

            <div class="avatar">
                ${avatar}
            </div>

            <div>

                <h2 class="customer-name">
                    ${customer.name}
                </h2>

                <div class="customer-id">
                    🆔 ${customer.id}
                </div>

                <div class="customer-mobile">
                    📞 ${customer.mobile}
                </div>

            </div>

        </div>

        <button
            class="edit-btn"
            onclick="editCustomer('${customer.firebaseID}')"
            title="Edit Customer">

            🖋️

        </button>

    </div>

    <div class="customer-summary">

        <div class="summary-row">
            <span>💰 Loan</span>
            <strong>₹${Number(customer.loan).toLocaleString()}</strong>
        </div>

        <div class="summary-row">
            <span>✅ Paid</span>
            <strong>₹${Number(customer.paid).toLocaleString()}</strong>
        </div>

        <div class="summary-row">
            <span>🔴 Balance</span>
            <strong>₹${Number(customer.balance).toLocaleString()}</strong>
        </div>

    </div>

    <div class="customer-footer">


        <div class="card-actions">

            <button
                class="view-btn"
                onclick="viewCustomer(${index})">

                ️ VIEW

            </button>

            <button
                class="delete-btn"
                onclick="deleteCustomer(${index})">

                ️ DELETE

            </button>

        </div>

    </div>

</div>

`;

});

        list.innerHTML = html;

    }

    catch (error) {

        console.error("Load Customers Error:", error);

        showToast(
            "Failed to load customers.",
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
// DELETE CUSTOMER
// ======================================

async function deleteCustomer(index) {

    if (!confirm("Delete this customer?")) {
        return;
    }

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        await deleteDoc(
            doc(db, "customers", customers[index].firebaseID)
        );

        showToast("Customer deleted successfully.", "success");

        await loadCustomers();

    }

    catch (error) {

        console.error("Delete Error:", error);

        showToast("Failed to delete customer.", "error");

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

}

// ======================================
// VIEW CUSTOMER
// ======================================

function viewCustomer(index) {

    const firebaseID = customers[index]?.firebaseID;

    if (!firebaseID) {

        showToast("Customer document ID missing.", "error");

        return;

    }

    window.location.href =
        "customer-details.html?id=" +
        encodeURIComponent(firebaseID);

}

// ======================================
// SEARCH CUSTOMER
// ======================================

function searchCustomer() {

    const searchBox = document.getElementById("search");

    if (!searchBox) return;

    const text = searchBox.value.trim().toLowerCase();

    const cards = document.getElementsByClassName("customer-card");

    for (let i = 0; i < cards.length; i++) {

        const customer = customers[i];

        const name = (customer.name || "").toLowerCase();
        const mobile = String(customer.mobile || "").toLowerCase();
        const id = (customer.id || "").toLowerCase();

        if (
            name.includes(text) ||
            mobile.includes(text) ||
            id.includes(text)
        ) {

            cards[i].style.display = "block";

        } else {

            cards[i].style.display = "none";

        }

    }

}

// ======================================
// EDIT CUSTOMER
// ======================================

function editCustomer(firebaseID) {

    if (!firebaseID) {

        showToast("Customer document ID missing.", "error");

        return;

    }

    window.location.href =
        "edit-customer.html?id=" +
        encodeURIComponent(firebaseID);

}

// ======================================
// START
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadCustomers();

});

// ======================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================

window.saveCustomer = saveCustomer;
window.deleteCustomer = deleteCustomer;
window.viewCustomer = viewCustomer;
window.searchCustomer = searchCustomer;
window.editCustomer = editCustomer;