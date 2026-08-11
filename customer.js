// ======================================
// FIREBASE
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ======================================
// GLOBAL CUSTOMER
// ======================================

let customer = null;


// ======================================
// HELPERS
// ======================================

function normalizeMobile(value){

    return String(value ?? "")
        .replace(/\D/g, "")
        .slice(-10);

}


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


function getCustomerCode(data){

    return String(

        data?.customerCode ??

        data?.customerID ??

        data?.customerId ??

        data?.id ??

        data?.code ??

        ""

    )
    .trim()
    .toUpperCase();

}


function setText(id, text){

    const element =
        document.getElementById(id);

    if(element){

        element.textContent = text;

    }

}


function formatMoney(value){

    return "₹" +
        Number(value || 0)
            .toLocaleString("en-IN");

}


// ======================================
// CUSTOMER LOGIN
// ======================================

async function loginCustomer(){

    const mobile =
        document
            .getElementById("mobile")
            ?.value
            .trim();


    const code =
        document
            .getElementById("customerCode")
            ?.value
            .trim()
            .toUpperCase();


    if(!mobile || !code){

        showToast?.(
            "Enter Mobile Number and Customer ID",
            "warning"
        );

        return;

    }


    if(!/^\d{10}$/.test(mobile)){

        showToast?.(
            "Enter valid mobile number",
            "warning"
        );

        return;

    }


    showLoader?.();


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "customers"
                )
            );


        let found = null;


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const storedMobile =
                    normalizeMobile(
                        data.mobile
                    );


                const storedCode =
                    getCustomerCode(
                        data
                    );


                if(

                    storedMobile ===
                    normalizeMobile(mobile)

                    &&

                    storedCode === code

                ){

                    found = {

                        id: docSnap.id,

                        ...data

                    };

                }

            }
        );


        if(!found){

            showToast?.(
                "Invalid Mobile Number or Customer ID",
                "error"
            );

            return;

        }


        localStorage.setItem(
            "customerDocID",
            found.id
        );


        sessionStorage.setItem(
            "customerFirebaseID",
            found.id
        );


        sessionStorage.setItem(
            "customerCode",
            code
        );


        sessionStorage.setItem(
            "customerVerified",
            "true"
        );


        showToast?.(
            "Login Successful",
            "success"
        );


        setTimeout(
            () => {

                window.location.href =
                    "profile.html";

            },
            600
        );

    }


    catch(error){

        console.error(
            "Login Error:",
            error
        );


        showToast?.(
            "Login failed",
            "error"
        );

    }


    finally{

        hideLoader?.();

    }

}


window.loginCustomer =
    loginCustomer;


// ======================================
// LOAD CUSTOMER PROFILE
// ======================================

async function loadCustomerProfile(){

    const docID =
        getCustomerDocID();


    if(!docID){

        window.location.href =
            "customer-login.html";

        return false;

    }


    localStorage.setItem(
        "customerDocID",
        docID
    );


    sessionStorage.setItem(
        "customerFirebaseID",
        docID
    );


    showLoader?.();


    try{

        const snap =
            await getDoc(
                doc(
                    db,
                    "customers",
                    docID
                )
            );


        if(!snap.exists()){

            localStorage.removeItem(
                "customerDocID"
            );


            sessionStorage.removeItem(
                "customerFirebaseID"
            );


            showToast?.(
                "Customer not found",
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

            id: snap.id,

            ...snap.data()

        };


        // --------------------------------
        // LOANS
        // --------------------------------

        customer.loans =
            Array.isArray(
                customer.loans
            )
                ? customer.loans
                : [];


        // --------------------------------
        // PAYMENTS
        // --------------------------------

        customer.payments =
            Array.isArray(
                customer.payments
            )
                ? customer.payments
                : [];


        // --------------------------------
        // TOTAL LOAN
        // --------------------------------

        customer.loan =
            customer.loans.reduce(
                (
                    total,
                    item
                ) => {

                    return total +
                        Number(
                            item.total || 0
                        );

                },
                0
            );


        // --------------------------------
        // TOTAL PAID
        // --------------------------------

        customer.paid =
            customer.payments.reduce(
                (
                    total,
                    item
                ) => {

                    return total +
                        Number(
                            item.amount || 0
                        );

                },
                0
            );


        // --------------------------------
        // BALANCE
        // --------------------------------

        if(
            customer.balance !==
            undefined
        ){

            customer.balance =
                Number(
                    customer.balance || 0
                );

        }
        else{

            customer.balance =
                customer.loan -
                customer.paid;

        }


        renderCustomer();


        return true;

    }


    catch(error){

        console.error(
            "Profile Error:",
            error
        );


        showToast?.(
            "Failed to load profile",
            "error"
        );


        return false;

    }


    finally{

        hideLoader?.();

    }

}


// ======================================
// RENDER CUSTOMER
// ======================================

function renderCustomer(){

    if(!customer){

        return;

    }


    const code =
        getCustomerCode(
            customer
        ) || customer.id;


    const mobile =
        normalizeMobile(
            customer.mobile
        );


    setText(
        "customerName",
        customer.name ||
        "Customer"
    );


    setText(
        "customerID",
        "ID: " + code
    );


    setText(
        "customerMobile",

        mobile

            ? "+91 " +
              mobile.slice(0,5) +
              " " +
              mobile.slice(5)

            : "Mobile Number"
    );


    setText(
        "customerAddress",

        customer.address ||
        "No address added"
    );


    setText(
        "loan",
        formatMoney(
            customer.loan
        )
    );


    setText(
        "paid",
        formatMoney(
            customer.paid
        )
    );


    setText(
        "balance",
        formatMoney(
            customer.balance
        )
    );


    loadRecentActivity();

}


// ======================================
// RECENT ACTIVITY
// ======================================

function loadRecentActivity(){

    if(!customer){

        return;

    }


    const latestLoan =
        document.getElementById(
            "latestLoan"
        );


    const latestPayment =
        document.getElementById(
            "latestPayment"
        );


    // --------------------------------
    // PURCHASE
    // --------------------------------

    if(latestLoan){

        latestLoan.textContent =
            "No borrowed products yet.";


        if(customer.loans.length){

            const item =
                customer.loans[
                    customer.loans.length - 1
                ];


            const product =
                item.product ||
                "Product";


            const amount =
                Number(
                    item.total || 0
                );


            const date =
                item.date ||
                "";


            latestLoan.textContent =
                product +
                " · " +
                formatMoney(amount) +
                (date
                    ? " · " + date
                    : "");

        }

    }


    // --------------------------------
    // PAYMENT
    // --------------------------------

    if(latestPayment){

        latestPayment.textContent =
            "No payments yet.";


        if(customer.payments.length){

            const item =
                customer.payments[
                    customer.payments.length - 1
                ];


            const amount =
                Number(
                    item.amount || 0
                );


            const date =
                item.date ||
                "";


            latestPayment.textContent =
                formatMoney(amount) +
                " paid" +
                (date
                    ? " · " + date
                    : "");

        }

    }

}


// ======================================
// LOAN HISTORY
// ======================================

function loadLoanHistory(){

    const history =
        document.getElementById(
            "loanHistory"
        );


    if(
        !history ||
        !customer
    ){

        return;

    }


    if(!customer.loans.length){

        history.innerHTML = `

            <div class="history-card">

                <h3>
                    No Borrowed Products
                </h3>

                <p>
                    No products found.
                </p>

            </div>

        `;

        return;

    }


    history.innerHTML =
        [...customer.loans]
            .reverse()
            .map(
                (item) => `

                    <div class="history-card">

                        <h3>
                            ${item.product || "Product"}
                        </h3>

                        <p>
                            <strong>
                                Quantity:
                            </strong>
                            ${item.qty || 0}
                        </p>

                        <p>
                            <strong>
                                Price:
                            </strong>
                            ${formatMoney(
                                item.price || 0
                            )}
                        </p>

                        <p>
                            <strong>
                                Total:
                            </strong>
                            ${formatMoney(
                                item.total || 0
                            )}
                        </p>

                        <p>
                            <strong>
                                Date:
                            </strong>
                            ${item.date || "-"}
                        </p>

                    </div>

                `
            )
            .join("");

}


// ======================================
// PAYMENT HISTORY
// ======================================

function loadPaymentHistory(){

    const history =
        document.getElementById(
            "paymentHistory"
        );


    if(
        !history ||
        !customer
    ){

        return;

    }


    const totalPaid =
        document.getElementById(
            "totalPaid"
        );


    if(totalPaid){

        totalPaid.textContent =
            formatMoney(
                customer.paid
            );

    }


    if(!customer.payments.length){

        history.innerHTML = `

            <div class="history-card">

                <h3>
                    No Payment History
                </h3>

                <p>
                    No payments found.
                </p>

            </div>

        `;

        return;

    }


    history.innerHTML =
        [...customer.payments]
            .reverse()
            .map(
                (item) => `

                    <div class="history-card">

                        <h3>
                            ${formatMoney(
                                item.amount || 0
                            )}
                        </h3>

                        <p>
                            <strong>
                                Date:
                            </strong>
                            ${item.date || "-"}
                        </p>

                    </div>

                `
            )
            .join("");

}


// ======================================
// PROFILE PHOTO
// ======================================

function uploadPhoto(){

    const file =
        document
            .getElementById("photo")
            ?.files?.[0];


    if(!file){

        return;

    }


    if(
        !file.type.startsWith(
            "image/"
        )
    ){

        showToast?.(
            "Please select an image file.",
            "warning"
        );

        return;

    }


    if(
        file.size >
        5 * 1024 * 1024
    ){

        showToast?.(
            "Image must be smaller than 5 MB.",
            "warning"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event){

            const image =
                event.target.result;


            const docID =
                getCustomerDocID();


            const img =
                document.getElementById(
                    "profilePhoto"
                );


            if(img){

                img.src =
                    image;

            }


            localStorage.setItem(
                "photo_" + docID,
                image
            );


            showToast?.(
                "Profile photo updated successfully.",
                "success"
            );

        };


    reader.readAsDataURL(
        file
    );

}


window.uploadPhoto =
    uploadPhoto;


// ======================================
// LOGOUT
// ======================================

function customerLogout(){

    const docID =
        getCustomerDocID();


    if(docID){

        localStorage.removeItem(
            "photo_" + docID
        );

    }


    localStorage.removeItem(
        "customerDocID"
    );


    sessionStorage.removeItem(
        "customerFirebaseID"
    );

    sessionStorage.removeItem(
        "customerCode"
    );

    sessionStorage.removeItem(
        "customerVerified"
    );

    sessionStorage.removeItem(
        "customerMobileVerified"
    );

    sessionStorage.removeItem(
        "customerLoginMobile"
    );

    sessionStorage.removeItem(
        "customerDemoOTP"
    );


    showToast?.(
        "Logged out successfully",
        "success"
    );


    setTimeout(
        () => {

            window.location.href =
                "customer-login.html";

        },
        600
    );

}


window.customerLogout =
    customerLogout;


// ======================================
// LIGHT THEME
// ======================================

function setLightTheme(){

    localStorage.setItem(
        "theme",
        "light"
    );


    document.body.classList.remove(
        "dark-theme"
    );


    window.closeSettings?.();

}


window.setLightTheme =
    setLightTheme;


// ======================================
// DARK THEME
// ======================================

function setDarkTheme(){

    localStorage.setItem(
        "theme",
        "dark"
    );


    document.body.classList.add(
        "dark-theme"
    );


    window.closeSettings?.();

}


window.setDarkTheme =
    setDarkTheme;


// ======================================
// APPLY SAVED THEME
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
// PAGE AUTO LOAD
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const path =
            window.location.pathname;


        // --------------------------------
        // PROFILE
        // --------------------------------

        if(
            path.includes(
                "profile.html"
            )
            ||
            path.includes(
                "customer-profile.html"
            )
        ){

            const loaded =
                await loadCustomerProfile();


            if(loaded){

                const docID =
                    getCustomerDocID();


                const savedPhoto =
                    localStorage.getItem(
                        "photo_" + docID
                    );


                const img =
                    document.getElementById(
                        "profilePhoto"
                    );


                if(
                    savedPhoto &&
                    img
                ){

                    img.src =
                        savedPhoto;

                }

            }

        }


        // --------------------------------
        // LOANS
        // --------------------------------

        if(
            path.includes(
                "my-loans.html"
            )
        ){

            const loaded =
                await loadCustomerProfile();


            if(loaded){

                loadLoanHistory();

            }

        }


        // --------------------------------
        // PAYMENTS
        // --------------------------------

        if(
            path.includes(
                "my-payment-history.html"
            )
        ){

            const loaded =
                await loadCustomerProfile();


            if(loaded){

                loadPaymentHistory();

            }

        }

    }
);
