// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let deletedCustomers = [];


// ======================================
// AVATAR COLOR - SAME AS CUSTOMERS LIST
// ======================================

function getAvatarColor(name){

    const colors = [

        "#2563EB",
        "#3B82F6",
        "#1D4ED8",
        "#6366F1",
        "#7C3AED",
        "#9333EA",
        "#A855F7",
        "#EC4899",
        "#DB2777",
        "#E11D48",
        "#EF4444",
        "#DC2626",
        "#F97316",
        "#EA580C",
        "#F59E0B",
        "#D97706",
        "#0EA5E9",
        "#0284C7",
        "#4F46E5",
        "#8B5CF6",
        "#C026D3",
        "#BE123C",
        "#B91C1C",
        "#334155",
        "#475569",
        "#6B7280",
        "#0F172A",
        "#7C2D12",
        "#9A3412",
        "#581C87"

    ];

    let hash = 0;

    for(let i = 0; i < name.length; i++){

        hash += name.charCodeAt(i);

    }

    return colors[hash % colors.length];

}

// ======================================
// LOAD DELETED CUSTOMERS
// ======================================

async function loadDeletedCustomers() {

    if (typeof showLoader === "function") showLoader();

    try {

        const list = document.getElementById("deletedCustomerList");

        list.innerHTML = "";

        deletedCustomers = [];

        const snapshot = await getDocs(
            collection(db, "deletedCustomers")
        );

        snapshot.forEach(docSnap => {

            deletedCustomers.push({

                firebaseID: docSnap.id,

                ...docSnap.data()

            });

        });

        if (deletedCustomers.length === 0) {

            list.innerHTML = `
            <div class="empty-state">
                <h2>️ Recycle Bin Empty</h2>
                <p>No deleted customers found.</p>
            </div>
            `;

            return;

        }

        let html = "";

        deletedCustomers.forEach((customer,index)=>{

            const avatar =
    customer.name
    ? customer.name.charAt(0).toUpperCase()
    : "?";

const avatarColor =
    getAvatarColor(customer.name || "");

            html += `

<div class="customer-card">

    <button
    class="restore-btn"
    onclick="restoreCustomer(${index})">
    ♻️
</button>

<div class="customer-info">

    <div
    class="avatar"
    style="background:${avatarColor};">

    ${avatar}

</div>

    <div class="customer-text">

        <h2 class="customer-name">
            ${customer.name}
        </h2>

        <p class="customer-id">
            🆔 ${customer.id}
        </p>

        <p class="customer-mobile">
            📞 ${customer.mobile}
        </p>

    </div>

</div>

    <div class="customer-summary">

        <div class="summary-row">
            <span>Loan</span>
            <strong>₹${customer.loan || 0}</strong>
        </div>

        <div class="summary-row">
            <span>Balance</span>
            <strong>₹${customer.balance || 0}</strong>
        </div>

    </div>

    <button
        class="delete-btn"
        onclick="deleteForever(${index})">

         Delete Forever

    </button>

</div>

`;

        });

        list.innerHTML = html;

    }

    finally{

        if(typeof hideLoader==="function")
            hideLoader();

    }

}

// ======================================
// RESTORE CUSTOMER
// ======================================

async function restoreCustomer(index){

    if(typeof showLoader==="function"){
        showLoader();
    }

    try{

        const customer = deletedCustomers[index];

        // Copy customer back using the SAME document ID
        await setDoc(
            doc(db,"customers",customer.firebaseID),
            {
                id: customer.id,
                name: customer.name,
                mobile: customer.mobile,
                address: customer.address,
                loan: customer.loan || 0,
                paid: customer.paid || 0,
                balance: customer.balance || 0,
                loans: customer.loans || [],
                payments: customer.payments || [],
                createdAt: customer.createdAt || serverTimestamp()
            }
        );
         
         await addDoc(
    collection(db, "adminNotifications"),
    {

        icon: "♻️",

        title: "Customer Restored",

        message: `${customer.name} was restored successfully.`,

        customerID: customer.id,

        customerName: customer.name,

        createdAt: serverTimestamp()

    }
);
         
        // Remove from recycle bin
        await deleteDoc(
            doc(db,"deletedCustomers",customer.firebaseID)
        );

        showToast(
            "Customer Restored Successfully",
            "success"
        );

        loadDeletedCustomers();

    }

    catch(error){

        console.error(error);

        showToast(
            "Failed to restore customer.",
            "error"
        );

    }

    finally{

        if(typeof hideLoader==="function"){
            hideLoader();
        }

    }

}

// ======================================
// DELETE FOREVER
// ======================================

async function deleteForever(index){

    if(!confirm("Delete forever?")) return;

    await deleteDoc(
        doc(db,"deletedCustomers",
        deletedCustomers[index].firebaseID)
    );

    showToast("Deleted Permanently","success");

    loadDeletedCustomers();

}

loadDeletedCustomers();

window.restoreCustomer=restoreCustomer;
window.deleteForever=deleteForever;
