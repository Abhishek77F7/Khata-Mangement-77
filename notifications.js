// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    deleteDoc,
    writeBatch,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================================
// LOGIN CHECK
// ======================================

const isAdmin =
    sessionStorage.getItem("adminLoggedIn") === "true";

const customerDocID =
    localStorage.getItem("customerDocID");

// ======================================
// VARIABLES
// ======================================

let notifications = [];

let deleteNotificationIndex = null;

let clearAllMode = false;

// ======================================
// LOGIN VALIDATION
// ======================================

if (isAdmin) {

    if (typeof checkAdminLogin === "function") {
        checkAdminLogin();
    }

} else if (!customerDocID) {

    window.location.href = "customer-login.html";

}

// ======================================
// DELETE POPUP ELEMENTS
// ======================================

const deletePopup =
    document.getElementById("deleteConfirmPopup");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

// ======================================
// COUNTERS
// ======================================

const notificationCount =
    document.getElementById("notificationCount");

const unreadCount =
    document.getElementById("unreadCount");

const importantCount =
    document.getElementById("importantCount");

const otherCount =
    document.getElementById("otherCount");
    
// ======================================
// POPUP FUNCTIONS
// ======================================

function showDeletePopup(index, clearMode = false) {

    deleteNotificationIndex = index;
    clearAllMode = clearMode;

    const title =
        document.querySelector("#deleteConfirmPopup h2");

    const message =
        document.querySelector("#deleteConfirmPopup p");

    if (clearMode) {

        title.textContent =
            "Clear All Notifications?";

        message.textContent =
            "All notifications will be permanently deleted.";

    } else {

        title.textContent =
            "Delete Notification?";

        message.textContent =
            "This notification will be permanently deleted.";

    }

    deletePopup.style.display = "flex";

}

// ======================================
// CANCEL BUTTON
// ======================================

cancelDeleteBtn.onclick = () => {

    deletePopup.style.display = "none";

    deleteNotificationIndex = null;

    clearAllMode = false;

};

// ======================================
// DELETE BUTTON
// ======================================

confirmDeleteBtn.onclick = async () => {

    deletePopup.style.display = "none";

    try {

        // ==========================
        // CLEAR ALL
        // ==========================

        if (clearAllMode) {

            if (isAdmin) {

                const batch = writeBatch(db);

                notifications.forEach(item => {

                    batch.delete(
                        doc(
                            db,
                            "adminNotifications",
                            item.id
                        )
                    );

                });

                await batch.commit();

            } else {

                await updateDoc(

                    doc(
                        db,
                        "customers",
                        customerDocID
                    ),

                    {
                        notifications: []
                    }

                );

            }

            notifications = [];

            showToast(
                "All notifications cleared.",
                "success"
            );

            loadNotifications();

            clearAllMode = false;

            return;

        }

        // ==========================
        // DELETE SINGLE
        // ==========================

        if (deleteNotificationIndex === null)
            return;

        if (isAdmin) {

            await deleteDoc(

                doc(
                    db,
                    "adminNotifications",
                    notifications[deleteNotificationIndex].id
                )

            );

        } else {

            const ref = doc(
                db,
                "customers",
                customerDocID
            );

            const snap = await getDoc(ref);

            if (!snap.exists()) return;

            const customer = snap.data();

            customer.notifications =
                customer.notifications || [];

            customer.notifications.splice(
                deleteNotificationIndex,
                1
            );

            await updateDoc(ref, {

                notifications:
                    customer.notifications

            });

        }

        showToast(
            "Notification deleted.",
            "success"
        );

        deleteNotificationIndex = null;

        loadNotifications();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Failed to complete action.",
            "error"
        );

    }

};

// ======================================
// CLOSE POPUP
// ======================================

deletePopup.onclick = (e) => {

    if (e.target === deletePopup) {

        deletePopup.style.display = "none";

        deleteNotificationIndex = null;

        clearAllMode = false;

    }

};

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        deletePopup.style.display = "none";

        deleteNotificationIndex = null;

        clearAllMode = false;

    }

});


// ======================================
// DELETE NOTIFICATION
// ======================================

window.deleteNotification = function(index){

    showDeletePopup(index,false);

};

// ======================================
// CLEAR ALL NOTIFICATIONS
// ======================================

window.clearAllNotifications = function(){

    if(notifications.length===0){

        showToast(
            "No notifications.",
            "warning"
        );

        return;

    }

    showDeletePopup(null,true);

};

// ======================================
// UPDATE COUNTERS
// ======================================

function updateCounters(){

    let unread = 0;
    let important = 0;
    let others = 0;

    notifications.forEach(item=>{

        if(item.read !== true){
            unread++;
        }

        if(
            item.icon==="⚠️" ||
            item.icon==="🚨" ||
            item.icon==="⏰"
        ){

            important++;

        }else{

            others++;

        }

    });

    if(notificationCount)
        notificationCount.textContent =
        notifications.length;

    if(unreadCount)
        unreadCount.textContent =
        unread;

    if(importantCount)
        importantCount.textContent =
        important;

    if(otherCount)
        otherCount.textContent =
        others;

}

// ======================================
// CHECK LOAN REMINDERS
// ======================================

async function checkLoanReminders(
    customerDocID,
    customer
){

    const reminderDays =
    [7,14,21,30];

    let updated = false;

    const now = Date.now();

    customer.loans =
    customer.loans || [];

    for(const loan of customer.loans){

        if(!loan.createdAt)
            continue;

        loan.reminders =
        loan.reminders || [];

        const diffDays = Math.floor(

            (now-loan.createdAt)/
            (1000*60*60*24)

        );

        if(

            reminderDays.includes(diffDays) &&

            !loan.reminders.includes(diffDays)

        ){

            await addDoc(

                collection(
                    db,
                    "adminNotifications"
                ),

                {

                    icon:"⏰",

                    title:
                    `Loan Due ${diffDays} Days`,

                    message:
                    `${customer.name} has a pending balance for ${diffDays} days.`,

                    customerID:
                    customer.id,

                    customerName:
                    customer.name,

                    createdAt:
                    serverTimestamp()

                }

            );

            loan.reminders.push(diffDays);

            updated = true;

        }

    }

    if(updated){

        await updateDoc(

            doc(
                db,
                "customers",
                customerDocID
            ),

            {

                loans:
                customer.loans

            }

        );

    }

}

// ======================================
// LOAD NOTIFICATIONS
// ======================================

async function loadNotifications(){

    if(typeof showLoader==="function"){
        showLoader();
    }

    notificationList.innerHTML="";
    notifications=[];

    try{

        // ======================================
        // CUSTOMER
        // ======================================

        if(!isAdmin){

            const snap = await getDoc(
                doc(db,"customers",customerDocID)
            );

            if(!snap.exists()){

                notificationList.innerHTML = `
<div class="empty-wrapper">

    <div class="empty-text">

        No Notifications Found

    </div>

</div>
`;

                updateCounters();
                return;
            }

            const customer=snap.data();

            const list=
                customer.notifications || [];

            list.slice().reverse().forEach((item,index)=>{

                notifications.push(item);

                notificationList.innerHTML += `

<div class="notification-card">

    <div class="notification-icon">
        ${item.icon || "🔔"}
    </div>

    <div class="notification-info">

        <h3 class="notification-title">
            ${item.title}
        </h3>

        <p class="notification-message">
            ${item.message}
        </p>

        <p class="notification-time">
            ${item.date || ""}
        </p>

    </div>

    <button
        class="delete-notification"
        onclick="deleteNotification(${index})">
        🗑️
    </button>

</div>

`;

            });

        }

        // ======================================
        // ADMIN
        // ======================================

        else{

            const customers =
            await getDocs(
                collection(db,"customers")
            );

            for(const customerDoc of customers.docs){

                await checkLoanReminders(
                    customerDoc.id,
                    customerDoc.data()
                );

            }

            const q=query(

                collection(db,"adminNotifications"),

                orderBy("createdAt","desc")

            );

            const snapshot=await getDocs(q);

            snapshot.forEach((docSnap)=>{

                const item={

                    id:docSnap.id,

                    ...docSnap.data()

                };

                notifications.push(item);

                notificationList.innerHTML += `

<div class="notification-card">

    <div class="notification-icon">
        ${item.icon || "🔔"}
    </div>

    <div class="notification-info">

        <h3 class="notification-title">
            ${item.title}
        </h3>

        <p class="notification-message">
            ${item.message}
        </p>

    </div>

    <button
        class="delete-notification"
        onclick="deleteNotification(${notifications.length-1})">
        🗑️
    </button>

</div>

`;

            });

        }

        // ======================================
        // EMPTY
        // ======================================

        if(notifications.length===0){

            notificationList.innerHTML=`

            <div class="empty-text">

                No Notifications Found

            </div>

            `;

        }

        updateCounters();

    }

    catch(error){

        console.error(error);

        showToast(
            "Failed to load notifications.",
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
// START
// ======================================

loadNotifications();

// Auto refresh every 30 seconds

setInterval(loadNotifications,30000);
