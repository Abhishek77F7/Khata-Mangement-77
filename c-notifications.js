// ======================================
// FIREBASE
// ======================================

import { db } from "./firebase.js";

import {
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// ======================================
// GLOBALS
// ======================================

let customer = null;

let notifications = [];

let activeFilter = "all";

let notificationToDelete = null;



// ======================================
// CONSTANTS
// ======================================

const STORAGE_PREFIX =
    "customerNotifications_";

const DUE_REMINDER_KEY =
    "lastDueReminder_";



// ======================================
// GET CUSTOMER DOCUMENT ID
// ======================================

function getCustomerDocID(){

    return (
        localStorage.getItem("customerDocID") ||

        sessionStorage.getItem(
            "customerFirebaseID"
        ) ||

        new URLSearchParams(
            window.location.search
        ).get("id") ||

        ""
    );

}



// ======================================
// NORMALIZE MOBILE
// ======================================

function normalizeMobile(value){

    return String(value ?? "")
        .replace(/\D/g,"")
        .slice(-10);

}



// ======================================
// STORAGE KEY
// ======================================

function getStorageKey(){

    const id =
        getCustomerDocID();

    return STORAGE_PREFIX + id;

}



// ======================================
// LOAD SAVED NOTIFICATION STATE
// ======================================

function loadSavedNotifications(){

    try{

        const saved =
            localStorage.getItem(
                getStorageKey()
            );

        if(!saved){

            return [];

        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch(error){

        console.error(
            "Notification storage error:",
            error
        );

        return [];

    }

}



// ======================================
// SAVE NOTIFICATIONS
// ======================================

function saveNotifications(){

    try{

        localStorage.setItem(

            getStorageKey(),

            JSON.stringify(
                notifications
            )

        );

    }

    catch(error){

        console.error(
            "Unable to save notifications:",
            error
        );

    }

}



// ======================================
// CREATE NOTIFICATION ID
// ======================================

function createID(
    type,
    index,
    item
){

    return [

        type,

        index,

        item?.date || "",

        item?.product || "",

        item?.amount || "",

        item?.total || ""

    ]
    .join("_")
    .replace(/\s+/g,"-")
    .toLowerCase();

}



// ======================================
// FORMAT DATE
// ======================================

function formatDate(value){

    if(!value){

        return "Recently";

    }


    const date =
        new Date(value);


    if(
        !Number.isNaN(
            date.getTime()
        )
    ){

        return date.toLocaleDateString(
            "en-IN",
            {
                day:"numeric",
                month:"short",
                year:"numeric"
            }
        );

    }


    return String(value);

}



// ======================================
// FORMAT TIME
// ======================================

function formatTime(value){

    if(!value){

        return "Recently";

    }


    const date =
        new Date(value);


    if(
        !Number.isNaN(
            date.getTime()
        )
    ){

        return date.toLocaleString(
            "en-IN",
            {
                day:"numeric",
                month:"short",
                hour:"numeric",
                minute:"2-digit"
            }
        );

    }


    return String(value);

}



// ======================================
// ADD NOTIFICATION
// ======================================

function addNotification(
    list,
    notification
){

    const exists =
        list.some(
            item =>
                item.id ===
                notification.id
        );


    if(!exists){

        list.push(
            notification
        );

    }

}



// ======================================
// GENERATE NOTIFICATIONS
// ======================================

function generateNotifications(){

    if(!customer){

        return [];

    }


    const generated = [];



    // ==================================
    // BORROWED PRODUCTS
    // ==================================

    if(
        Array.isArray(
            customer.loans
        )
    ){

        customer.loans.forEach(
            (loan,index) => {

                const product =
                    loan.product ||
                    "Product";


                const total =
                    Number(
                        loan.total || 0
                    );


                const date =
                    loan.date ||
                    "";


                addNotification(
                    generated,
                    {

                        id:
                            createID(
                                "product",
                                index,
                                loan
                            ),

                        type:
                            "product",

                        title:
                            "Product Added",

                        message:
                            `${product} was added to your Khata account for ₹${total.toLocaleString("en-IN")}.`,

                        date:
                            date,

                        timestamp:
                            new Date(
                                date || Date.now()
                            ).getTime(),

                        unread:
                            true

                    }
                );

            }
        );

    }



    // ==================================
    // PAYMENTS
    // ==================================

    if(
        Array.isArray(
            customer.payments
        )
    ){

        customer.payments.forEach(
            (payment,index) => {

                const amount =
                    Number(
                        payment.amount || 0
                    );


                const date =
                    payment.date ||
                    "";


                addNotification(
                    generated,
                    {

                        id:
                            createID(
                                "payment",
                                index,
                                payment
                            ),

                        type:
                            "payment",

                        title:
                            "Payment Received",

                        message:
                            `Your payment of ₹${amount.toLocaleString("en-IN")} has been recorded successfully.`,

                        date:
                            date,

                        timestamp:
                            new Date(
                                date || Date.now()
                            ).getTime(),

                        unread:
                            true

                    }
                );

            }
        );

    }



    // ==================================
    // DUE BALANCE
    // ==================================

    const balance =
        Number(
            customer.balance || 0
        );


    if(balance > 0){

        maybeCreateDueReminder(
            generated,
            balance
        );

    }


    return generated;

}



// ======================================
// DUE REMINDER - ONCE EVERY 7 DAYS
// ======================================

function maybeCreateDueReminder(
    generated,
    balance
){

    const customerID =
        getCustomerDocID();


    if(!customerID){

        return;

    }


    const key =
        DUE_REMINDER_KEY +
        customerID;


    const lastReminder =
        Number(
            localStorage.getItem(key) || 0
        );


    const now =
        Date.now();


    const sevenDays =
        7 * 24 * 60 * 60 * 1000;


    if(
        now - lastReminder <
        sevenDays
    ){

        return;

    }


    const reminderID =
        "due_reminder_" +
        Math.floor(
            now / sevenDays
        );


    addNotification(
        generated,
        {

            id:
                reminderID,

            type:
                "due",

            title:
                "Payment Due",

            message:
                `Your remaining Khata balance is ₹${balance.toLocaleString("en-IN")}. Please pay your balance when convenient.`,

            date:
                new Date().toISOString(),

            timestamp:
                now,

            unread:
                true,

            recurring:
                true

        }
    );


    localStorage.setItem(
        key,
        String(now)
    );

}



// ======================================
// MERGE WITH SAVED STATE
// ======================================

function mergeNotifications(
    generated,
    saved
){

    const deleted =
        new Set(
            saved
                .filter(
                    item =>
                        item.deleted === true
                )
                .map(
                    item =>
                        item.id
                )
        );


    const savedMap =
        new Map(
            saved.map(
                item =>
                    [item.id,item]
            )
        );


    const result = [];


    generated.forEach(
        item => {

            if(
                deleted.has(
                    item.id
                )
            ){

                return;

            }


            const old =
                savedMap.get(
                    item.id
                );


            if(old){

                result.push({

                    ...item,

                    unread:
                        old.unread === true

                });

            }

            else{

                result.push(
                    item
                );

            }

        }
    );


    return result;

}



// ======================================
// LOAD CUSTOMER
// ======================================

async function loadCustomer(){

    const docID =
        getCustomerDocID();


    if(!docID){

        window.location.href =
            "customer-login.html";

        return false;

    }


    if(
        typeof showLoader ===
        "function"
    ){

        showLoader();

    }


    try{

        const snap =
            await getDoc(
                doc(
                    db,
                    "customers",
                    docID
                )
            );


        if(
            !snap.exists()
        ){

            localStorage.removeItem(
                "customerDocID"
            );

            sessionStorage.removeItem(
                "customerFirebaseID"
            );


            showToast?.(
                "Customer not found.",
                "error"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "customer-login.html";

                },
                700
            );


            return false;

        }


        customer = {

            id:
                snap.id,

            ...snap.data()

        };


        customer.loans =
            Array.isArray(
                customer.loans
            )
            ? customer.loans
            : [];


        customer.payments =
            Array.isArray(
                customer.payments
            )
            ? customer.payments
            : [];


        customer.loan =
            customer.loans.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.total || 0
                    ),
                0
            );


        customer.paid =
            customer.payments.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );


        customer.balance =
            customer.balance !==
            undefined

                ? Number(
                    customer.balance || 0
                  )

                : customer.loan -
                  customer.paid;



        return true;

    }

    catch(error){

        console.error(
            "Customer notification error:",
            error
        );


        showToast?.(
            "Unable to load notifications.",
            "error"
        );


        return false;

    }

    finally{

        if(
            typeof hideLoader ===
            "function"
        ){

            hideLoader();

        }

    }

}



// ======================================
// INITIALIZE NOTIFICATIONS
// ======================================

function initializeNotifications(){

    const saved =
        loadSavedNotifications();


    const generated =
        generateNotifications();


    notifications =
        mergeNotifications(
            generated,
            saved
        );


    saveNotifications();

    renderNotifications();

}



// ======================================
// GET FILTERED NOTIFICATIONS
// ======================================

function getFilteredNotifications(){

    if(
        activeFilter ===
        "all"
    ){

        return notifications;

    }


    if(
        activeFilter ===
        "unread"
    ){

        return notifications.filter(
            item =>
                item.unread === true
        );

    }


    return notifications.filter(
        item =>
            item.type ===
            activeFilter
    );

}



// ======================================
// RENDER
// ======================================

function renderNotifications(){

    const list =
        document.getElementById(
            "notificationList"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    if(!list){

        return;

    }


    const filtered =
        getFilteredNotifications();


    list.innerHTML = "";


    if(!filtered.length){

        empty?.classList.add(
            "show"
        );

        updateCounts();

        return;

    }


    empty?.classList.remove(
        "show"
    );


    filtered
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.timestamp || 0
                ) -
                Number(
                    a.timestamp || 0
                )
        )
        .forEach(
            notification => {

                list.appendChild(
                    createNotificationElement(
                        notification
                    )
                );

            }
        );


    updateCounts();

}



// ======================================
// CREATE NOTIFICATION ELEMENT
// ======================================

function createNotificationElement(
    notification
){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "notification-card" +
        (
            notification.unread
                ? " unread"
                : ""
        );


    const icon =
        getNotificationIcon(
            notification.type
        );


    card.innerHTML = `

        <div class="notification-icon ${notification.type}">

            <span class="material-symbols-outlined">

                ${icon}

            </span>

        </div>


        <div class="notification-content">

            <div class="notification-top">

                <strong class="notification-title">

                    ${escapeHTML(
                        notification.title
                    )}

                </strong>


                ${
                    notification.unread

                    ? `
                        <span
                            class="unread-dot"
                            title="Unread">
                        </span>
                      `

                    : ""
                }

            </div>


            <p class="notification-message">

                ${escapeHTML(
                    notification.message
                )}

            </p>


            <div class="notification-time">

                <span class="material-symbols-outlined">
                    schedule
                </span>

                ${escapeHTML(
                    formatTime(
                        notification.date
                    )
                )}

            </div>

        </div>


        <button
            type="button"
            class="notification-delete"
            aria-label="Delete notification"
            data-id="${escapeAttribute(
                notification.id
            )}">

            <span class="material-symbols-outlined">
                delete
            </span>

        </button>

    `;


    // Mark as read when clicked

    card.addEventListener(
        "click",
        event => {

            if(
                event.target.closest(
                    ".notification-delete"
                )
            ){

                return;

            }


            markAsRead(
                notification.id
            );

        }
    );


    const deleteButton =
        card.querySelector(
            ".notification-delete"
        );


    deleteButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openDeleteModal(
                notification.id
            );

        }
    );


    return card;

}



// ======================================
// ICON
// ======================================

function getNotificationIcon(
    type
){

    if(
        type === "product"
    ){

        return "shopping_bag";

    }


    if(
        type === "payment"
    ){

        return "payments";

    }


    if(
        type === "due"
    ){

        return "schedule";

    }


    return "notifications";

}



// ======================================
// MARK AS READ
// ======================================

function markAsRead(
    id
){

    const item =
        notifications.find(
            notification =>
                notification.id === id
        );


    if(!item){

        return;

    }


    item.unread = false;


    saveNotifications();

    renderNotifications();

}



// ======================================
// MARK ALL READ
// ======================================

function markAllRead(){

    notifications.forEach(
        item => {

            item.unread = false;

        }
    );


    saveNotifications();

    renderNotifications();


    showToast?.(
        "All notifications marked as read.",
        "success"
    );

}



// ======================================
// OPEN DELETE MODAL
// ======================================

function openDeleteModal(
    id
){

    notificationToDelete =
        id;


    const modal =
        document.getElementById(
            "deleteModal"
        );


    modal?.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}



// ======================================
// CLOSE DELETE MODAL
// ======================================

function closeDeleteModal(){

    notificationToDelete =
        null;


    document
        .getElementById(
            "deleteModal"
        )
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );

}



// ======================================
// DELETE NOTIFICATION
// ======================================

function deleteNotification(){

    if(
        !notificationToDelete
    ){

        return;

    }


    const id =
        notificationToDelete;


    notifications =
        notifications.filter(
            item =>
                item.id !== id
        );


    saveNotifications();

    closeDeleteModal();

    renderNotifications();


    showToast?.(
        "Notification deleted.",
        "success"
    );

}



// ======================================
// OPEN CLEAR ALL
// ======================================

function openClearAllModal(){

    if(!notifications.length){

        showToast?.(
            "There are no notifications to clear.",
            "info"
        );

        return;

    }


    document
        .getElementById(
            "clearAllModal"
        )
        ?.classList.add(
            "show"
        );


    document.body.classList.add(
        "modal-open"
    );

}



// ======================================
// CLOSE CLEAR ALL
// ======================================

function closeClearAllModal(){

    document
        .getElementById(
            "clearAllModal"
        )
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );

}



// ======================================
// CLEAR ALL
// ======================================

function clearAllNotifications(){

    notifications = [];


    saveNotifications();

    closeClearAllModal();

    renderNotifications();


    showToast?.(
        "All notifications cleared.",
        "success"
    );

}



// ======================================
// COUNTS
// ======================================

function updateCounts(){

    const all =
        notifications.length;


    const unread =
        notifications.filter(
            item =>
                item.unread === true
        ).length;


    const products =
        notifications.filter(
            item =>
                item.type ===
                "product"
        ).length;


    const payments =
        notifications.filter(
            item =>
                item.type ===
                "payment"
        ).length;


    const due =
        notifications.filter(
            item =>
                item.type ===
                "due"
        ).length;



    setText(
        "allCount",
        all
    );


    setText(
        "unreadCount",
        unread
    );


    setText(
        "productCount",
        products
    );


    setText(
        "paymentCount",
        payments
    );


    setText(
        "dueCount",
        due
    );


    setText(
        "headerUnreadCount",
        unread
    );

}



// ======================================
// FILTER BUTTONS
// ======================================

function setupFilters(){

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".filter-button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        activeFilter =
                            button.dataset.filter ||
                            "all";


                        renderNotifications();

                    }
                );

            }
        );

}



// ======================================
// HELPERS
// ======================================

function setText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            String(value);

    }

}



function escapeHTML(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        character => ({

            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"

        })[character]
    );

}



function escapeAttribute(
    value
){

    return escapeHTML(
        value
    );

}



// ======================================
// MODAL EVENTS
// ======================================

function setupModals(){

    document
        .getElementById(
            "cancelDeleteBtn"
        )
        ?.addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById(
            "confirmDeleteBtn"
        )
        ?.addEventListener(
            "click",
            deleteNotification
        );


    document
        .getElementById(
            "cancelClearBtn"
        )
        ?.addEventListener(
            "click",
            closeClearAllModal
        );


    document
        .getElementById(
            "confirmClearBtn"
        )
        ?.addEventListener(
            "click",
            clearAllNotifications
        );


    document
        .getElementById(
            "clearAllBtn"
        )
        ?.addEventListener(
            "click",
            openClearAllModal
        );


    document
        .getElementById(
            "markAllReadBtn"
        )
        ?.addEventListener(
            "click",
            markAllRead
        );


    // Click outside delete modal

    document
        .getElementById(
            "deleteModal"
        )
        ?.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    event.currentTarget
                ){

                    closeDeleteModal();

                }

            }
        );


    // Click outside clear modal

    document
        .getElementById(
            "clearAllModal"
        )
        ?.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    event.currentTarget
                ){

                    closeClearAllModal();

                }

            }
        );

}



// ======================================
// ESCAPE KEY
// ======================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key ===
            "Escape"
        ){

            closeDeleteModal();

            closeClearAllModal();

        }

    }
);



// ======================================
// THEME
// ======================================

if(
    localStorage.getItem(
        "theme"
    ) === "dark"
){

    document.body.classList.add(
        "dark-theme"
    );

}



// ======================================
// START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupFilters();

        setupModals();


        const loaded =
            await loadCustomer();


        if(loaded){

            initializeNotifications();

        }

    }
);