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
// AVATAR COLORS
// ======================================

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

function getAvatarColor(name){

    if(!name) return colors[0];

    let hash = 0;

    for(let i=0;i<name.length;i++){

        hash =
        name.charCodeAt(i) +
        ((hash<<5)-hash);

    }

    return colors[
        Math.abs(hash)%colors.length
    ];

}


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



        const customerAvatar =
document.getElementById(
"customerAvatar"
);

const customerName =
document.getElementById(
"customerName"
);

const customerMobile =
document.getElementById(
"customerMobile"
);

if(customerAvatar){

customerAvatar.textContent =
customer.name
? customer.name.charAt(0).toUpperCase()
: "?";

customerAvatar.style.background =
getAvatarColor(customer.name);

}

if(customerName){

customerName.textContent =
customer.name || "Customer";

}

if(customerMobile){

customerMobile.textContent =
"📞 " +
(customer.mobile || "No Mobile");

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
parseInt(
    document.getElementById("qty")?.value.trim(),
    10
) || 0;



    const price =
    Number(
        document.getElementById("price")?.value
    ) || 0;



    const total =
    document.getElementById("total");



    if(total){

        total.value = (qty * price).toFixed(2);

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
parseInt(
    document.getElementById("qty").value.trim(),
    10
) || 0;


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


        const now = new Date();

const newLoan = {

    product: product,

    qty: qty,

    price: price,

    total: total,

    date: now.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ),

    createdAt: now.getTime(),

    reminders: []

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
"Borrowed product added successfully.",
"success"
);

document.getElementById("product").value="";
document.getElementById("qty").value="";
document.getElementById("price").value="";
document.getElementById("total").value="";



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

setTimeout(()=>{

const product =
document.getElementById("product");

if(product){

product.focus();

}

},300);

});




// ======================================
// HTML ACCESS
// ======================================

window.saveLoan =
saveLoan;
