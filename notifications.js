// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// LOGIN CHECK
// ======================================

const isAdmin =
    localStorage.getItem("adminLoggedIn") === "true";

const customerDocID =
    localStorage.getItem("customerDocID");

    let notifications = [];

if (isAdmin) {

    if (typeof checkAdminLogin === "function") {
        checkAdminLogin();
    }

}

if (!isAdmin && !customerDocID) {

    window.location.href = "customer-login.html";

}


// ======================================
// DELETE NOTIFICATION
// ======================================

window.deleteNotification = async function(index){

    if(!customerDocID){

        notifications.splice(index,1);

        loadNotifications();

        return;

    }

    const ok = confirm("Delete this notification?");

    if(!ok) return;

    try{

        const ref = doc(db,"customers",customerDocID);

        const snap = await getDoc(ref);

        if(!snap.exists()) return;

        const customer = snap.data();

        customer.notifications =
        customer.notifications || [];

        customer.notifications.splice(index,1);

        await updateDoc(ref,{

            notifications:
            customer.notifications

        });

        showToast(
            "Notification deleted.",
            "success"
        );

        loadNotifications();

    }

    catch(error){

        console.error(error);

        showToast(
            "Failed to delete notification.",
            "error"
        );

    }

};

// ======================================
// CLEAR ALL NOTIFICATIONS
// ======================================

window.clearAllNotifications = async function(){

    if(!customerDocID){

        notifications=[];

        loadNotifications();

        return;

    }

    if(notifications.length===0){

        showToast(
            "No notifications.",
            "warning"
        );

        return;

    }

    const ok = confirm(
        "Clear all notifications?"
    );

    if(!ok) return;

    try{

        await updateDoc(

            doc(db,"customers",customerDocID),

            {

                notifications:[]

            }

        );

        notifications=[];

        showToast(
            "All notifications cleared.",
            "success"
        );

        loadNotifications();

    }

    catch(error){

        console.error(error);

        showToast(
            "Failed to clear notifications.",
            "error"
        );

    }

};

// ======================================
// LOAD NOTIFICATIONS
// ======================================

async function loadNotifications() {

    if (typeof showLoader === "function") {
        showLoader();
    }

    const notificationList =
        document.getElementById("notificationList");

    const notificationCount =
        document.getElementById("notificationCount");

notificationList.innerHTML = "";

notifications = [];

let count = 0;

try {

    // ===========================
    // CUSTOMER NOTIFICATIONS
    // ===========================

    if (!isAdmin) {

        const snap = await getDoc(
    doc(db, "customers", customerDocID)
);


        if (!snap.exists()) {

            notificationList.innerHTML = `
                <div class="notification-card">
                    <h3>Customer Not Found</h3>
                </div>
            `;

            return;

        }

        const customer = snap.data();

        customer.notifications =
            customer.notifications || [];

customer.notifications.reverse().forEach((item) => {

    count++;

    notifications.push(item);

    notificationList.innerHTML += `

    <div class="notification-card">

        <button
        class="delete-notification"
        onclick="deleteNotification(${notifications.length - 1})">

        🗑️

        </button>

        <h3>${item.icon} ${item.title}</h3>

        <p>${item.message}</p>

        <p> ${item.date}</p>

    </div>

    `;

});

        if (count === 0) {

            notificationList.innerHTML = `

            <div class="notification-card">

                <h3>🔔 No Notifications</h3>

                <p>No new updates.</p>

            </div>

            `;

        }

        notificationCount.textContent = count;

        document.getElementById("backButton").href =
            "profile.html";

        return;

    }

    // ===========================
    // ADMIN NOTIFICATIONS
    // ===========================

    const snapshot = await getDocs(
        collection(db, "customers")
    );

        const today = new Date();

        snapshot.forEach((docSnap) => {

            const customer = docSnap.data();

            customer.loans = customer.loans || [];
            customer.payments = customer.payments || [];

            const loan = customer.loans.reduce((sum, item) => {

                return sum + Number(item.total || 0);

            }, 0);

            const paid = customer.payments.reduce((sum, item) => {

                return sum + Number(item.amount || 0);

            }, 0);

            const balance = Math.max(loan - paid, 0);

            if (
                balance <= 0 ||
                customer.loans.length === 0
            ) {
                return;
            }

            const lastLoan =
                customer.loans[customer.loans.length - 1];

            const loanDate = new Date(lastLoan.date);

            if (isNaN(loanDate)) return;

            const diffDays = Math.floor(
                (today - loanDate) /
                (1000 * 60 * 60 * 24)
            );

            if (diffDays >= 7) {

                count++;
                
                notifications.push({
    customer: customer.name,
    balance: balance,
    days: diffDays
});

notificationList.innerHTML += `

<div class="notification-card">

<button
class="delete-notification"
onclick="deleteNotification(${notifications.length-1})">

🗑️

</button>

<h3>

⚠️ ${customer.name}

</h3>

<p>

🆔 ${customer.id}

</p>

<p>

📞 ${customer.mobile}

</p>

<p>

💰 Pending Balance :
<b>₹${balance}</b>

</p>

<p>

📅 Pending Since :
${diffDays} Days

</p>

</div>

`;

            }

        });

        if (count === 0) {

            notificationList.innerHTML = `

            <div class="notification-card">

                <h3>✅ No Pending Notifications</h3>

                <p>All customers are up to date.</p>

            </div>

            `;

        }

        if (notificationCount) {
            notificationCount.textContent = count;
        }

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to load notifications.",
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

loadNotifications();