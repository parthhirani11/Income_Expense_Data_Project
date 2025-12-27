/* ================= ELEMENTS ================= */

const extraFilters = document.getElementById("extraFilters");
const addFilterBtn = document.getElementById("addFilterBtn");
const resultsBox = document.getElementById("results");

const incomeBox = document.getElementById("totalIncome");
const expenseBox = document.getElementById("totalExpense");

let fullData = [];

/* ================= FETCH DATA ================= */

fetch("/account/data")
  .then(r => r.json())
  .then(d => {
    fullData = d;
    applyFilters();
  });

/* ================= DEFAULT FILTER ================= */

createFilter();

/* ================= ADD FILTER ================= */

addFilterBtn.addEventListener("click", () => {
  createFilter();
});

/* ================= CREATE FILTER ================= */

function createFilter() {
  extraFilters.insertAdjacentHTML("beforeend", `
    <div class="extra-filter-item d-flex align-items-center gap-2 mb-2 position-relative">

      <select class="extraFilter form-select border-3" style="width:195px;">
        <option value="all">--Select Filter--</option>
        <option value="type">Type</option>
        <option value="payment">Payment Method</option>
        <option value="recipient">Recipient</option>
        <option value="category">Category</option>
        <option value="tags">Tags</option>
        <option value="date">Start & End Date</option>
      </select>

      <div class="extraInputHolder">
        <input class="extraInput form-control border-3"
               placeholder="Transections Search..."
               autocomplete="off"
               style="width:1070px;">
               
      </div>

      <span class="remove-filter-btn close-btn">&times;</span>

      <div id="suggestionBox"class=" suggestionBox list-group position-absolute"style="top:45px; z-index:1000; margin-left: 200px;" ></div>

    </div>

        <style>
</style>
  `);

  updateRemoveButtons();
}

/* ================= REMOVE FILTER ================= */

extraFilters.addEventListener("click", e => {
  if (!e.target.classList.contains("remove-filter-btn")) return;

  e.target.closest(".extra-filter-item").remove();
  updateRemoveButtons();
  applyFilters();
});

/* ================= REMOVE BUTTON LOGIC ================= */

function updateRemoveButtons() {
  const filters = document.querySelectorAll(".extra-filter-item");

  filters.forEach(f => {
    const btn = f.querySelector(".remove-filter-btn");
    btn.style.display = filters.length > 1 ? "inline-block" : "none";
  });
}

/* ================= FILTER TYPE CHANGE ================= */

extraFilters.addEventListener("change", e => {
  if (!e.target.classList.contains("extraFilter")) return;

  const div = e.target.closest(".extra-filter-item");
  const holder = div.querySelector(".extraInputHolder");

  if (e.target.value === "type") {
    holder.innerHTML = `
      <select class="extraInput form-select border-3" style="width:1070px;">
        <option value="">Select</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    `;
  }
  else if (e.target.value === "payment") {
  holder.innerHTML = `
    <input class="extraInput form-control border-3"
           placeholder="Cash, Bank, UPI, SBI, PhonePe..."
           autocomplete="off"
           style="width:1070px;">
  `;
}
  else if (e.target.value === "date") {
    holder.innerHTML = `
      <div class="row g-2" style="width:1070px;">
        <div class="col-md-6">
          <input type="date" class="extraStart form-control border-3">
        </div>
        <div class="col-md-6">
          <input type="date" class="extraEnd form-control border-3">
        </div>
      </div>
    `;
  }
  else {
    holder.innerHTML = `
      <input class="extraInput form-control border-3"
             placeholder="Search Multiple Data for Ex. Food, Sales..."
             autocomplete="off"
             style="width:1070px;">
    `;
  }

  div.querySelector(".suggestionBox").innerHTML = "";
  applyFilters();
});

/* ================= APPLY FILTERS ================= */

document.addEventListener("input", applyFilters);

function applyFilters() {
  const filters = [];
   let data = [...fullData];

  document.querySelectorAll(".extra-filter-item").forEach(div => {
    const type = div.querySelector(".extraFilter").value;
    if (type === "all") return;

    if (type === "date") {
      const start = div.querySelector(".extraStart")?.value;
      const end = div.querySelector(".extraEnd")?.value;
      if (start || end) filters.push({ type, start, end });
      return;
    }

    const input = div.querySelector(".extraInput");
    if (!input || !input.value.trim()) return;

    const values = input.value
      .split(",")
      .map(v => v.trim().toLowerCase())
      .filter(Boolean);

    if (values.length) filters.push({ type, values });
  });

  filters.forEach(f => {
    data = data.filter(item => {

       if (f.type === "payment") {
        return f.values.some(v => {

          if (v === "cash")
            return item.paymentMode === "Cash";

          if (item.paymentMode === "Bank")
            return v === "bank" ||
              item.bankDetails?.bankName?.toLowerCase().includes(v);

          if (item.paymentMode === "UPI")
            return v === "upi" ||
              item.upiDetails?.appName?.toLowerCase().includes(v);

          return false;
        });
      }

      if (f.type === "recipient")
        return f.values.some(v => item.person?.toLowerCase().includes(v));

      if (f.type === "category")
        return f.values.some(v => item.description?.toLowerCase().includes(v));

      if (f.type === "tags")
        return f.values.some(v => item.tags?.join(",").toLowerCase().includes(v));

      if (f.type === "type")
        return f.values.includes(item.type);

      if (f.type === "date") {
        const d = new Date(item.date);
        if (f.start && d < new Date(f.start)) return false;
        if (f.end && d > new Date(f.end)) return false;
        return true;
      }

      return true;
    });
  });

  render(data);
}


/* ================= SUGGESTION ENGINE ================= */

function getFilteredDataExcept(activeDiv) {
  let data = [...fullData];

  document.querySelectorAll(".extra-filter-item").forEach(div => {
    if (div === activeDiv) return;

    const type = div.querySelector(".extraFilter").value;
    if (type === "all") return;

    const input = div.querySelector(".extraInput");
    if (!input || !input.value.trim()) return;

    const values = input.value.split(",").map(v => v.trim().toLowerCase());

    data = data.filter(item => {
       if (type === "payment") {
        return values.some(v => {
          if (v === "cash") return item.paymentMode === "Cash";
          if (item.paymentMode === "Bank")
            return v === "bank" || item.bankDetails?.bankName?.toLowerCase().includes(v);
          if (item.paymentMode === "UPI")
            return v === "upi" || item.upiDetails?.appName?.toLowerCase().includes(v);
          return false;
        });
      }

      if (type === "recipient")
        return values.some(v => item.person?.toLowerCase().includes(v));  
      if (type === "category")
        return values.some(v => item.description?.toLowerCase().includes(v));
      if (type === "tags")
        return values.some(v => item.tags?.join(",").toLowerCase().includes(v));
      if (type === "type")
        return values.includes(item.type);
      return true;
    });
  });

  return data;
}

function getSuggestions(type, data) {
  if (type === "recipient")
    return [...new Set(data.map(i => i.person).filter(Boolean))];

  if (type === "category")
    return [...new Set(data.map(i => i.description).filter(Boolean))];

  if (type === "tags")
    return [...new Set(data.flatMap(i => i.tags || []))];

  if (type === "payment") {
    const banks = data
      .filter(i => i.paymentMode === "Bank")
      .map(i => i.bankDetails?.bankName)
      .filter(Boolean);

    const upis = data
      .filter(i => i.paymentMode === "UPI")
      .map(i => i.upiDetails?.appName)
      .filter(Boolean);

    return [...new Set(["Cash", "Bank", "UPI", ...banks, ...upis])];
  }

  return [];
}

/* ================= SUGGESTION HANDLER ================= */

extraFilters.addEventListener("input", e => {
  if (!e.target.classList.contains("extraInput")) return;

  const div = e.target.closest(".extra-filter-item");
  const type = div.querySelector(".extraFilter").value;
  if (type === "all" || type === "date" || type === "type") return;

  const box = div.querySelector(".suggestionBox");
  box.innerHTML = "";

  const raw = e.target.value;
  const parts = raw.split(",").map(v => v.trim());
  const current = parts.pop().toLowerCase();
  if (!current) return;

  const filteredData = getFilteredDataExcept(div);
  const suggestions = getSuggestions(type, filteredData)
    .filter(s => s.toLowerCase().includes(current))
    .filter(s => !parts.map(p => p.toLowerCase()).includes(s.toLowerCase()));

  suggestions.forEach(s => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-group-item list-group-item-action";
    btn.textContent = s;

    btn.onclick = () => {
      parts.push(s);
      e.target.value = parts.join(", ") + ", ";
      box.innerHTML = "";
      applyFilters();
    };

    box.appendChild(btn);
  });
});

/* ================= HIDE SUGGESTIONS ================= */

document.addEventListener("click", e => {
  if (!e.target.closest(".extra-filter-item")) {
    document.querySelectorAll(".suggestionBox").forEach(b => b.innerHTML = "");
  }
});

/* ================= RENDER ================= */

// UPI cash bank Payment
function renderPayment(item) {
  if (item.paymentMode === "Cash") {
    return `<span class="badge bg-secondary">Cash</span>`;
  }

  if (item.paymentMode === "Bank") {
    return `
      <span class="badge bg-primary">
        Bank: ${item.bankDetails?.bankName || "No Bank"}
      </span>
      <small class="text-muted">
        A/C: ${item.bankDetails?.accountNumber || "No A/C"}
      </small>
    `;
  }

  if (item.paymentMode === "UPI") {
    return `
      <span class="badge bg-success">
        UPI: ${item.upiDetails?.appName || "No UPI"}
      </span>
      <small class="text-muted">
         UPI ID: ${item.upiDetails?.upiId || "No Id"}
      </small>
    `;
  }

  return `<span class="text-muted">-</span>`;
}
function render(data) {
 
  const currencySymbol =document.body.dataset.currency || "₹";

  if (!data.length) {
    resultsBox.innerHTML = `<p class="text-danger">No records found</p>`;
    incomeBox.textContent = `${currencySymbol}0`;
    expenseBox.textContent = `${currencySymbol}0`;
    return;
  }

  const income = data.filter(i => i.type === "income")
    .reduce((s, i) => s + i.amount, 0);

  const expense = data.filter(i => i.type === "expense")
    .reduce((s, i) => s + i.amount, 0);

  incomeBox.textContent = `${currencySymbol}${income.toFixed(2)}`;
  expenseBox.textContent = `${currencySymbol}${expense.toFixed(2)}`;
  
  resultsBox.innerHTML = data.map(item => `
      <li class="list-group">
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${item.type.toUpperCase()}</strong>
                    <span style="font-weight:bold; color:${item.type === "income" ? "green" : " rgb(227, 57, 57)"}">${currencySymbol}${item.amount}</span>
                    <div><strong>Payment:</strong>${renderPayment(item)}</div>
                    <div><strong>Recipient:</strong> ${item.person || '-'}</div>
                    <div><strong>Category:</strong> ${item.description || '-'}</div>
                    <div><strong>Tags:</strong> ${item.tags?.join(", ") || '-'}</div>
                    
                    <div>
                  ${(!item.attachment || item.attachment === "No File")
                    ? `<span class="text-muted">No file</span>`
                    : `<strong>Attachment file:</strong>
                      <a href="/uploads/${item.attachment}" target="_blank">
                        ${item.originalName}
                      </a>`
                    }
                </div>
                    <div><small class="text-muted">${new Date(item.date).toLocaleString()}</small></div>
                </div>

                <div class="d-flex">
                    <a class="edit-btn" href="/account/edit/${item._id}">Edit</a>
                    <form action="/account/delete/${item._id}" method="POST"  onsubmit="return confirm('Delete this record?');">
                        <button class="custom-btn">Delete</button>
                    </form>
                </div>
            </div>
        </li>
  `).join("");
}
