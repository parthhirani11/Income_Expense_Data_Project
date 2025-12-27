// public/js/payment.js
const paymentMode = document.getElementById("paymentMode");
const bankSection = document.getElementById("bankSection");
const upiSection = document.getElementById("upiSection");

paymentMode.addEventListener("change", () => {
  bankSection.style.display = "none";
  upiSection.style.display = "none";

  if (paymentMode.value === "Bank") {
    bankSection.style.display = "block";
  }

  if (paymentMode.value === "UPI") {
    upiSection.style.display = "block";
  }
});

/* Add New Bank */
const addBankBtn = document.getElementById("addBankBtn");
if (addBankBtn) {
  addBankBtn.addEventListener("click", () => {
    const name = prompt("Enter Bank Name");
    if (!name) return;

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    document.getElementById("bankName").appendChild(opt);
    document.getElementById("bankName").value = name;
  });
}
