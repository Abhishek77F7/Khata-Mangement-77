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
   setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// CUSTOMER ARRAY
// ======================================

let customers = [];
let deleteIndex = null;

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
// AVATAR COLOR
// ======================================

function getAvatarColor(name){

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

    let hash = 0;

    for(let i = 0; i < name.length; i++){

        hash += name.charCodeAt(i);

    }

    return colors[hash % colors.length];

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

        await addDoc(
    collection(db, "adminNotifications"),
    {

        icon: "👤",

        title: "New Customer Added",

        message: `${name} was added successfully.`,

        customerID: customerID,

        customerName: name,

        createdAt: serverTimestamp()

    }
);

        showToast(
            `Customer Saved Successfully: ${customerID}`,
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

        let sortValue = "latest";

const sortSelect = document.getElementById("sortCustomer");

if (sortSelect) {
    sortValue = sortSelect.value;
}

let q;

if (sortValue === "oldest") {

    q = query(
        collection(db, "customers"),
        orderBy("createdAt", "asc")
    );

} else {

    q = query(
        collection(db, "customers"),
        orderBy("createdAt", "desc")
    );

}

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
        
        if (sortValue === "name") {

    customers.sort((a, b) =>
        a.name.localeCompare(b.name)
    );

}

        
        if (customers.length === 0) {

            list.innerHTML = `
<div class="empty-state">

    <div class="empty-box">

        <div class="empty-icon">👥</div>

        <h2>No Customers Found</h2>

        <p>Add your first customer to get started.</p>

    </div>

</div>
`;

            return;

        }

let html = "";

customers.forEach((customer, index) => {

    const avatar = customer.name
        ? customer.name.charAt(0).toUpperCase()
        : "?";
    const avatarColor = getAvatarColor(customer.name || "");

    html += `

<div class="customer-card"
     onmousedown="startHold(${index})"
     onmouseup="cancelHold()"
     onmouseleave="cancelHold()"
     ontouchstart="startHold(${index})"
     ontouchend="cancelHold()"
     onclick="viewCustomer(${index})">

    <button
        class="edit-btn"
        onclick="event.stopPropagation(); editCustomer('${customer.firebaseID}')">
        ✏️
    </button>

    <div
        class="customer-content"
        onclick="viewCustomer(${index})">

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
                <span>Total Loan</span>
                <strong>₹${Number(customer.loan).toLocaleString()}</strong>
            </div>

            <div class="summary-row">
                <span>Paid</span>
                <strong>₹${Number(customer.paid).toLocaleString()}</strong>
            </div>

            <div class="summary-row">
                <span>Balance</span>
                <strong>₹${Number(customer.balance).toLocaleString()}</strong>
            </div>

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

// Opens the delete popup
async function deleteCustomer(index){

    deleteIndex = index;

    document.getElementById("deletePopup").style.display = "flex";

}

// Moves customer to Recycle Bin
async function moveCustomerToRecycleBin(index){

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const customer = customers[index];

        await setDoc(
    doc(db, "deletedCustomers", customer.firebaseID),
    {
        ...customer,
        deletedAt: serverTimestamp()
    }
);

// Create admin notification

await addDoc(
    collection(db, "adminNotifications"),
    {

        icon: "🗑️",

        title: "Customer Deleted",

        message: `${customer.name} was moved to Recycle Bin.`,

        customerID: customer.id,

        customerName: customer.name,

        createdAt: serverTimestamp()

    }
);


        await deleteDoc(
            doc(db, "customers", customer.firebaseID)
        );

        showToast(
            "Customer moved to Recycle Bin.",
            "success"
        );

        await loadCustomers();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to move customer.",
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

    const sort = document.getElementById("sortCustomer");

    if (sort) {

        sort.addEventListener("change", () => {

            loadCustomers();

        });

    }

});

let holdTimer;

function startHold(index){

    holdTimer = setTimeout(() => {

        deleteIndex = index;

        document.getElementById("deletePopup").style.display = "flex";

    }, 1000);

}

function cancelHold(){

    clearTimeout(holdTimer);

}

// ======================================
// DELETE POPUP
// ======================================

const deletePopup = document.getElementById("deletePopup");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

if (deletePopup && cancelDelete && confirmDelete) {

    cancelDelete.onclick = () => {

        deleteIndex = null;
        deletePopup.style.display = "none";

    };

confirmDelete.onclick = async () => {

    deletePopup.style.display = "none";

    const index = deleteIndex;

    deleteIndex = null;

    if(index !== null){

        await moveCustomerToRecycleBin(index);

    }

};

    deletePopup.addEventListener("click", (e) => {

        if (e.target === deletePopup) {

            deleteIndex = null;

            deletePopup.style.display = "none";

        }

    });

}


// ======================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================

window.saveCustomer = saveCustomer;
window.deleteCustomer = deleteCustomer;
window.viewCustomer = viewCustomer;
window.searchCustomer = searchCustomer;
window.editCustomer = editCustomer;
window.startHold = startHold;
window.cancelHold = cancelHold;
