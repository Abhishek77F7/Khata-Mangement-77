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
// GENERATE PDF REPORT
// ======================================

const pdfBtn = document.getElementById("pdfBtn");

if (pdfBtn) {

    pdfBtn.addEventListener("click", generatePDF);

}

function generatePDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Khata Management Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Date : " + new Date().toLocaleDateString(), 20, 35);

    doc.text(
        "Total Customers : " +
        document.getElementById("customers").textContent,
        20,
        50
    );

    doc.text(
        "Total Loan : " +
        document.getElementById("loan").textContent,
        20,
        60
    );

    doc.text(
        "Total Paid : " +
        document.getElementById("paid").textContent,
        20,
        70
    );

    doc.text(
        "Remaining Balance : " +
        document.getElementById("balance").textContent,
        20,
        80
    );

    doc.text(
        "Today's Loan : " +
        document.getElementById("todayLoan").textContent,
        20,
        95
    );

    doc.text(
        "Today's Payment : " +
        document.getElementById("todayPaid").textContent,
        20,
        105
    );

    doc.text(
        "Monthly Loan : " +
        document.getElementById("monthLoan").textContent,
        20,
        120
    );

    doc.text(
        "Monthly Payment : " +
        document.getElementById("monthPaid").textContent,
        20,
        130
    );

    doc.text(
        "Top Customer : " +
        document.getElementById("topCustomer").textContent,
        20,
        145
    );

    doc.save("Khata_Report.pdf");

    showToast("PDF Generated Successfully", "success");

}

// ======================================
// START
// ======================================

loadReports();