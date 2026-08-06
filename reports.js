// ======================================
// FIREBASE IMPORTS
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Protect Admin Page
if (typeof checkAdminLogin === "function") {
    checkAdminLogin();
}

// ======================================
// LOAD REPORTS
// ======================================

async function loadReports() {

    if (typeof showLoader === "function") {
        showLoader();
    }

    try {

        const snapshot = await getDocs(collection(db, "customers"));

        let totalCustomers = 0;
        let totalLoan = 0;
        let totalPaid = 0;
        let totalBalance = 0;

        let todayLoan = 0;
        let todayPaid = 0;
        let todayCustomers = 0;

        let monthLoan = 0;
        let monthPaid = 0;
        let monthCustomers = 0;

        let totalProducts = 0;
        let totalPayments = 0;

        let highestBalance = 0;
        let highestCustomer = "No Data";

        const now = new Date();
        const today = now.toDateString();
        const month = now.getMonth();
        const year = now.getFullYear();

        snapshot.forEach((docSnap) => {

            totalCustomers++;

            const customer = docSnap.data();

            customer.loans = customer.loans || [];
            customer.payments = customer.payments || [];

            let loan = 0;
            let paid = 0;

            // Loans
            customer.loans.forEach(item => {

                const amount = Number(item.total || 0);

                loan += amount;
                totalProducts++;

                if (item.date) {

                    const d = new Date(item.date);

                    if (!isNaN(d)) {

                        if (d.toDateString() === today) {
                            todayLoan += amount;
                        }

                        if (
                            d.getMonth() === month &&
                            d.getFullYear() === year
                        ) {
                            monthLoan += amount;
                        }

                    }

                }

            });

            // Payments
            customer.payments.forEach(item => {

                const amount = Number(item.amount || 0);

                paid += amount;
                totalPayments++;

                if (item.date) {

                    const d = new Date(item.date);

                    if (!isNaN(d)) {

                        if (d.toDateString() === today) {
                            todayPaid += amount;
                        }

                        if (
                            d.getMonth() === month &&
                            d.getFullYear() === year
                        ) {
                            monthPaid += amount;
                        }

                    }

                }

            });

            // Customer Created Date
            if (customer.createdAt) {

                const d = customer.createdAt.toDate
                    ? customer.createdAt.toDate()
                    : new Date(customer.createdAt);

                if (!isNaN(d)) {

                    if (d.toDateString() === today) {
                        todayCustomers++;
                    }

                    if (
                        d.getMonth() === month &&
                        d.getFullYear() === year
                    ) {
                        monthCustomers++;
                    }

                }

            }

            const balance = Math.max(loan - paid, 0);

            totalLoan += loan;
            totalPaid += paid;
            totalBalance += balance;

            if (balance > highestBalance) {

                highestBalance = balance;

                highestCustomer =
                    `${customer.name} (₹${balance})`;

            }

        });

        // Overall

        document.getElementById("customers").textContent = totalCustomers;
        document.getElementById("loan").textContent = "₹" + totalLoan;
        document.getElementById("paid").textContent = "₹" + totalPaid;
        document.getElementById("balance").textContent = "₹" + totalBalance;

        // Today

        document.getElementById("todayLoan").textContent = "₹" + todayLoan;
        document.getElementById("todayPaid").textContent = "₹" + todayPaid;
        document.getElementById("todayCustomers").textContent = todayCustomers;

        // Month

        document.getElementById("monthLoan").textContent = "₹" + monthLoan;
        document.getElementById("monthPaid").textContent = "₹" + monthPaid;
        document.getElementById("monthCustomers").textContent = monthCustomers;

        // Statistics

        document.getElementById("products").textContent = totalProducts;
        document.getElementById("payments").textContent = totalPayments;

        document.getElementById("averageLoan").textContent =
            totalCustomers
                ? "₹" + Math.round(totalLoan / totalCustomers)
                : "₹0";

        document.getElementById("topCustomer").textContent =
            highestCustomer;

        document.getElementById("today").textContent =
            now.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

    }

    catch (error) {

        console.error(error);

        showToast("Failed to load reports.", "error");

    }

    finally {

        if (typeof hideLoader === "function") {
            hideLoader();
        }

    }

}


// ======================================
// PRINT REPORT
// ======================================

const printBtn = document.getElementById("printBtn");

if(printBtn){

    printBtn.onclick = () => {

        window.print();

    };

}

// ======================================
// EXPORT EXCEL
// ======================================

const excelBtn = document.getElementById("excelBtn");

if(excelBtn){

    excelBtn.onclick = () => {

        const data = [

            ["Report","Value"],

            ["Total Loan", document.getElementById("loan").textContent],

            ["Total Paid", document.getElementById("paid").textContent],

            ["Remaining", document.getElementById("balance").textContent],

            ["Customers", document.getElementById("customers").textContent],

            ["Today's Loan", document.getElementById("todayLoan").textContent],

            ["Today's Paid", document.getElementById("todayPaid").textContent],

            ["Today's Customers", document.getElementById("todayCustomers").textContent],

            ["Monthly Loan", document.getElementById("monthLoan").textContent],

            ["Monthly Paid", document.getElementById("monthPaid").textContent],

            ["Monthly Customers", document.getElementById("monthCustomers").textContent],

            ["Products", document.getElementById("products").textContent],

            ["Payments", document.getElementById("payments").textContent],

            ["Average Loan", document.getElementById("averageLoan").textContent],

            ["Highest Pending Customer", document.getElementById("topCustomer").textContent],

            ["Generated On", new Date().toLocaleString()]

        ];

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Reports"
        );

        XLSX.writeFile(
            workbook,
            "Khata_Report.xlsx"
        );

    };

}

// ======================================
// PROFESSIONAL PDF
// ======================================

const pdfBtn = document.getElementById("pdfBtn");

if(pdfBtn){

pdfBtn.onclick = () => {

const { jsPDF } = window.jspdf;

const pdf = new jsPDF();

const green = [22,163,74];

pdf.setFillColor(...green);
pdf.rect(0,0,210,32,"F");

pdf.setTextColor(255,255,255);
pdf.setFontSize(22);
pdf.text("KHATA MANAGEMENT",105,15,{align:"center"});

pdf.setFontSize(12);
pdf.text("Business Report",105,24,{align:"center"});

pdf.setTextColor(0,0,0);

let y = 42;

pdf.setFontSize(11);
pdf.text(
"Generated : " + new Date().toLocaleString(),
15,
y
);

y += 10;

function section(title){

pdf.setFillColor(22,163,74);
pdf.roundedRect(12,y-5,186,9,2,2,"F");

pdf.setTextColor(255,255,255);
pdf.setFontSize(13);
pdf.text(title,16,y+1);

pdf.setTextColor(0,0,0);

y += 12;

}

function row(name,value){

pdf.setFontSize(11);

pdf.text(name,18,y);

pdf.text(String(value),185,y,{align:"right"});

y += 7;

}

section("Financial Report");

row("Total Loan", document.getElementById("loan").textContent);
row("Total Paid", document.getElementById("paid").textContent);
row("Remaining", document.getElementById("balance").textContent);
row("Customers", document.getElementById("customers").textContent);

y += 5;

section("Today's Report");

row("Today's Loan", document.getElementById("todayLoan").textContent);
row("Today's Paid", document.getElementById("todayPaid").textContent);
row("New Customers", document.getElementById("todayCustomers").textContent);

y += 5;

section("Monthly Report");

row("Monthly Loan", document.getElementById("monthLoan").textContent);
row("Monthly Paid", document.getElementById("monthPaid").textContent);
row("New Customers", document.getElementById("monthCustomers").textContent);

y += 5;

section("Statistics");

row("Products", document.getElementById("products").textContent);
row("Payments", document.getElementById("payments").textContent);
row("Average Loan", document.getElementById("averageLoan").textContent);

y += 5;

section("Highest Pending Customer");

pdf.setFontSize(11);

pdf.text(
    document.getElementById("topCustomer").textContent,
    18,
    y
);

y += 10;

pdf.setDrawColor(22,163,74);
pdf.line(12,285,198,285);

pdf.setFontSize(9);
pdf.setTextColor(120);

pdf.text(
"Generated by Khata Management • Business Report",
105,
291,
{align:"center"}
);

pdf.save("Khata_Business_Report.pdf");

};

}

// ======================================
// START
// ======================================

loadReports();
