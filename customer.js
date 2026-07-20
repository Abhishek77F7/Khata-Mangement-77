// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// ======================================
// CUSTOMER LOGIN
// Mobile Number + Customer ID
// ======================================

async function loginCustomer() {


    const mobile =
        document.getElementById("mobile")
        .value
        .trim();


    const code =
        document.getElementById("customerCode")
        .value
        .trim()
        .toUpperCase();



    if (mobile === "" || code === "") {

        showToast(
            "Enter Mobile Number and Customer ID",
            "warning"
        );

        return;

    }



    if (!/^\d{10}$/.test(mobile)) {

        showToast(
            "Enter valid mobile number",
            "warning"
        );

        return;

    }



    if (typeof showLoader === "function") {

        showLoader();

    }



    try {


        const snapshot = await getDocs(
            collection(db, "customers")
        );



        let found = false;

        let customerDocID = "";



        snapshot.forEach((docSnap) => {


            const customer =
                docSnap.data();



            if (

                String(customer.mobile) === mobile &&

                String(customer.id)
                .toUpperCase() === code

            ) {


                found = true;


                customerDocID =
                    docSnap.id;



                localStorage.setItem(
                    "customerDocID",
                    docSnap.id
                );


            }


        });



        if (!found) {


            showToast(
                "Invalid Mobile Number or Customer ID",
                "error"
            );


            return;


        }



        showToast(
            "Login Successful",
            "success"
        );



        setTimeout(() => {


            window.location.href = "profile.html";
            



        },700);



    }


    catch(error){


        console.error(
            "Login Error:",
            error
        );


        showToast(
            "Login failed",
            "error"
        );


    }



    finally{


        if(typeof hideLoader === "function"){

            hideLoader();

        }


    }


}

window.loginCustomer =
loginCustomer;

// ======================================
// LOAD CUSTOMER PROFILE
// ======================================

async function loadCustomerProfile() {


    const docID =
        localStorage.getItem(
            "customerDocID"
        );



    if (!docID) {


        window.location.href =
        "customer-login.html";


        return;


    }



    if(typeof showLoader === "function"){

        showLoader();

    }



    try {


        const snap = await getDoc(
            doc(db, "customers", docID)
        );



        if(!snap.exists()){


            showToast(
                "Customer not found",
                "error"
            );



            localStorage.removeItem(
                "customerDocID"
            );



            window.location.href =
            "customer-login.html";



            return;


        }



        window.customer =
        snap.data();



        customer.loans =
        customer.loans || [];



        customer.payments =
        customer.payments || [];




        // Calculate Total Loan

        customer.loan =

        customer.loans.reduce(

            (sum,item)=>{

                return sum +
                Number(item.total || 0);

            },

            0

        );




        // Calculate Total Paid

        customer.paid =

        customer.payments.reduce(

            (sum,item)=>{

                return sum +
                Number(item.amount || 0);

            },

            0

        );



        // Remaining Balance

const totalProducts =
    document.getElementById("totalProducts");

if (totalProducts) {

    totalProducts.textContent =
        customer.loans.length;

}



        // Display Customer Details


        if(document.getElementById("customerName")){

            document.getElementById(
                "customerName"
            ).textContent =
            customer.name || "Customer";


        }



        if(document.getElementById("customerID")){

            document.getElementById(
                "customerID"
            ).textContent =
            "🆔 " + customer.id;


        }


        if(document.getElementById("customerMobile")){

            document.getElementById(
                "customerMobile"
            ).textContent =
            "📞 " + customer.mobile;

        }


        if(document.getElementById("customerAddress")){

            document.getElementById(
                "customerAddress"
            ).textContent =
            "📍 " +
            (customer.address || "No Address");

        }



        if(document.getElementById("loan")){

            document.getElementById(
                "loan"
            ).textContent =
            "₹" + customer.loan;


        }


        if(document.getElementById("paid")){

            document.getElementById(
                "paid"
            ).textContent =
            "₹" + customer.paid;

        }


        if(document.getElementById("balance")){

            document.getElementById(
                "balance"
            ).textContent =
            "₹" + customer.balance;


        }


    }


    catch(error){


        console.error(
            "Profile Error:",
            error
        );


        showToast(
            "Failed to load profile",
            "error"
        );


    }

    finally{


        if(typeof hideLoader === "function"){

            hideLoader();

        }

    }

}


// ======================================
// RECENT ACTIVITY
// ======================================

function loadRecentActivity(){

    const latestLoan =
    document.getElementById("latestLoan");

    const latestPayment =
    document.getElementById("latestPayment");


    if(!customer) return;
    
    if (latestLoan) {
    latestLoan.textContent = "No borrowed products";
}

if (latestPayment) {
    latestPayment.textContent = "No payments";
}


    // Latest Borrowed Product

    if(
        latestLoan &&
        customer.loans &&
        customer.loans.length > 0
    ){

        const loan =
        customer.loans[
            customer.loans.length - 1
        ];


        latestLoan.textContent =
        ` ${loan.product} - ₹${loan.total}`;

    }



    // Latest Payment

    if(
        latestPayment &&
        customer.payments &&
        customer.payments.length > 0
    ){

        const payment =
        customer.payments[
            customer.payments.length - 1
        ];


        latestPayment.textContent =
        `₹${payment.amount} Paid`;

    }

}


// ======================================
// BORROWED PRODUCTS
// ======================================

function loadLoanHistory() {


    const history =
        document.getElementById(
            "loanHistory"
        );


    if (!history) return;



    history.innerHTML = "";



    if(
        !customer.loans ||
        customer.loans.length === 0
    ){


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


    let html = "";



    [...customer.loans]
    .reverse()
    .forEach((item)=>{


        html += `

        <div class="history-card">


            <h3>
            🛒 ${item.product || "Product"}
            </h3>


            <p>
            <strong>Quantity :</strong>
            ${item.qty || 0}
            </p>


            <p>
            <strong>Price :</strong>
            ₹${item.price || 0}
            </p>


            <p>
            <strong>Total :</strong>
            ₹${item.total || 0}
            </p>


            <p>
            <strong>Date :</strong>
            ${item.date || "-"}
            </p>


        </div>


        `;


    });



    history.innerHTML =
    html;


}


// ======================================
// PAYMENT HISTORY
// ======================================

function loadPaymentHistory(){

const totalPaid = document.getElementById("totalPaid");

if (totalPaid) {

    const total = customer.payments.reduce((sum, item) => {

        return sum + Number(item.amount || 0);

    }, 0);

    totalPaid.textContent = "₹" + total;

}

    const history =
        document.getElementById(
            "paymentHistory"
        );


    if(!history) return;
    
    const totalProducts =
    document.getElementById("totalProducts");

if (totalProducts) {

    totalProducts.textContent =
        customer.loans
            ? customer.loans.length
            : 0;

}
    
  
    history.innerHTML = "";



    if(

        !customer.payments ||

        customer.payments.length === 0

    ){


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


    let html = "";



    [...customer.payments]
    .reverse()
    .forEach((item)=>{


        html += `


        <div class="history-card">


            <h3>
             ₹${item.amount || 0}
            </h3>


            <p>
            <strong>Date :</strong>
            ${item.date || "-"}
            </p>


        </div>


        `;


    });



    history.innerHTML =
    html;


}

// ======================================
// AUTO LOAD HISTORY PAGES
// ======================================


if(
    window.location.pathname
    .includes("my-loans.html")
){


    loadCustomerProfile()
    .then(()=>{

        loadLoanHistory();

    });


}


if(
    window.location.pathname
    .includes("my-payment-history.html")
){


    loadCustomerProfile()
    .then(()=>{


        loadPaymentHistory();


    });


}

// ======================================
// PROFILE PHOTO UPLOAD
// ======================================

function uploadPhoto() {

    const file = document.getElementById("photo")?.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const image = e.target.result;

        const img = document.getElementById("profilePhoto");

if (img) {
    img.src = image;
}

        const docID = localStorage.getItem("customerDocID");

        localStorage.setItem("photo_" + docID, image);

        showToast(
            "Profile photo updated successfully.",
            "success"
        );

    };

    reader.readAsDataURL(file);

}

window.uploadPhoto = uploadPhoto;





// ======================================
// CUSTOMER LOGOUT
// ======================================

function customerLogout() {

    const docID = localStorage.getItem("customerDocID");

    if (docID) {
        localStorage.removeItem("photo_" + docID);
    }

    localStorage.removeItem("customerDocID");

    showToast(
        "Logged out successfully",
        "success"
    );

    setTimeout(() => {
        window.location.href = "customer-login.html";
    }, 600);
}



window.customerLogout =
customerLogout;





// ======================================
// SETTINGS POPUP
// ======================================

function openSettings(){


    const popup =
    document.getElementById(
        "settingsPopup"
    );



    if(popup){

        popup.style.display =
        "block";

    }


}



function closeSettings(){


    const popup =
    document.getElementById(
        "settingsPopup"
    );



    if(popup){

        popup.style.display =
        "none";

    }


}



window.openSettings =
openSettings;


window.closeSettings =
closeSettings;

// ======================================
// THEME
// ======================================

function setLightTheme(){


    localStorage.setItem(
        "theme",
        "light"
    );


    document.body.classList
    .remove(
        "dark-theme"
    );


    closeSettings();


}


function setDarkTheme(){


    localStorage.setItem(
        "theme",
        "dark"
    );


    document.body.classList
    .add(
        "dark-theme"
    );


    closeSettings();


}

window.setLightTheme =
setLightTheme;


window.setDarkTheme =
setDarkTheme;

// Apply saved theme

if(
    localStorage.getItem("theme")
    === "dark"
){


    document.body.classList
    .add(
        "dark-theme"
    );
    
}

// ======================================
// AUTO LOAD PROFILE PAGE
// ======================================

document.addEventListener(
"DOMContentLoaded",
async ()=>{


    if(
        window.location.pathname
        .includes("profile.html")
    ){


        await loadCustomerProfile();
        
        const docID = localStorage.getItem("customerDocID");
        

const savedPhoto = localStorage.getItem("photo_" + docID);

if (
    savedPhoto &&
    document.getElementById("profilePhoto")
) {
    document.getElementById("profilePhoto").src = savedPhoto;
}

        loadRecentActivity();


    }


});