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

const params =
    new URLSearchParams(window.location.search);


const customerId =
    params.get("id");


let customer = {};


// ======================================
// LOAD CUSTOMER
// ======================================

async function loadCustomer(){

    if(!customerId){

        showToast(
            "Customer not found.",
            "error"
        );

        setTimeout(()=>{

            window.location.href =
            "customers.html";

        },1200);

        return;

    }


    if(typeof showLoader === "function"){

        showLoader();

    }


    try{


        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const snap =
            await getDoc(customerRef);



        if(!snap.exists()){


            showToast(
                "Customer not found.",
                "error"
            );


            setTimeout(()=>{

                window.location.href =
                "customers.html";

            },1200);


            return;

        }



        customer =
            snap.data();



        customer.loans =
            customer.loans || [];


        customer.payments =
            customer.payments || [];



        const customerName =
            document.getElementById(
                "customerName"
            );


        if(customerName){

            customerName.textContent =
            customer.name || "";

        }



        const customerMobile =
            document.getElementById(
                "customerMobile"
            );


        if(customerMobile){

            customerMobile.textContent =
            "📞 " +
            (customer.mobile || "");

        }



        const backBtn =
            document.getElementById(
                "backBtn"
            );


        if(backBtn){

            backBtn.href =
            "customer-details.html?id="
            + customerId;

        }


    }


    catch(error){


        console.error(
            "Load Customer Error:",
            error
        );


        showToast(
            "Failed to load customer.",
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
// AUTO CALCULATE TOTAL
// ======================================


function calculateTotal(){


    const qty =
    Number(
        document.getElementById("qty")?.value
    ) || 0;



    const price =
    Number(
        document.getElementById("price")?.value
    ) || 0;



    const total =
    document.getElementById("total");



    if(total){

        total.value =
        qty * price;

    }


}



document
.getElementById("qty")
?.addEventListener(
    "input",
    calculateTotal
);



document
.getElementById("price")
?.addEventListener(
    "input",
    calculateTotal
);

// ======================================
// SAVE LOAN
// ======================================

async function saveLoan(){


    const product =
    document
    .getElementById("product")
    .value
    .trim();



    const qty =
    Number(
        document.getElementById("qty").value
    );


    const price =
    Number(
        document.getElementById("price").value
    );


    const total =
    qty * price;



    if(product === ""){


        showToast(
            "Please enter product name.",
            "warning"
        );

        return;

    }



    if(qty <= 0 || price <= 0){


        showToast(
            "Enter valid quantity and price.",
            "warning"
        );

        return;

    }



    if(typeof showLoader === "function"){

        showLoader();

    }



    try{


        const newLoan = {


            product: product,


            qty: qty,


            price: price,


            total: total,


            date:
            new Date()
            .toLocaleString(
                "en-IN",
                {
                    day:"2-digit",
                    month:"short",
                    year:"numeric",
                    hour:"2-digit",
                    minute:"2-digit"
                }
            )

        };



        customer.loans.push(
            newLoan
        );
        
        customer.notifications =
    customer.notifications || [];

customer.notifications.push({

    icon: "🛒",

    title: "New Loan Added",

    message: `${product} - ₹${total}`,

    date: new Date().toLocaleString("en-IN")

});



        const totalLoan =
        customer.loans.reduce(
            (sum,item)=>{

                return sum +
                Number(
                    item.total || 0
                );

            },
            0
        );



        const totalPaid =
        customer.payments.reduce(
            (sum,item)=>{

                return sum +
                Number(
                    item.amount || 0
                );

            },
            0
        );



        const balance =
        Math.max(
            totalLoan - totalPaid,
            0
        );



        await updateDoc(

    doc(
        db,
        "customers",
        customerId
    ),

    {

        loans:
        customer.loans,

        loan:
        totalLoan,

        paid:
        totalPaid,

        balance:
        balance,

        notifications:
        customer.notifications

    }

);



        showToast(
            "Loan added successfully.",
            "success"
        );



        document.getElementById("product")
        .value = "";


        document.getElementById("qty")
        .value = "";


        document.getElementById("price")
        .value = "";


        document.getElementById("total")
        .value = "";



        setTimeout(()=>{


            window.location.href =
            "customer-details.html?id="
            + customerId;


        },700);



    }


    catch(error){


        console.error(
            "Save Loan Error:",
            error
        );


        showToast(
            "Failed to save loan.",
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
// START
// ======================================


document.addEventListener(
"DOMContentLoaded",
()=>{

    loadCustomer();

});




// ======================================
// HTML ACCESS
// ======================================

window.saveLoan =
saveLoan;