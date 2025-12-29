
const exportBtn = document.getElementById("exportBtn");
const exportType = document.getElementById("exportType");

exportBtn.addEventListener("click", () => {
  if (!exportType.value) {
    alert("Please select export type");
    return;
  }

  const data =
    (typeof filteredData !== "undefined" && filteredData.length)
      ? filteredData
      : (typeof fullData !== "undefined" ? fullData : []);

  if (!data.length) {
    alert("No data to export");
    return;
  }

  let url = "";
  if (exportType.value === "csv") url = "/account/export/csv";
  if (exportType.value === "xlsx") url = "/account/export/xlsx";
  if (exportType.value === "pdf") url = "/account/export/pdf";

  downloadFile(url, data);
});

async function downloadFile(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data })
  });

  if (!res.ok) {
    alert("Export failed");
    return;
  }

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  if (url.includes("csv")) link.download = "transactions.csv";
  if (url.includes("xlsx")) link.download = "transactions.xlsx";
  if (url.includes("pdf")) link.download = "transactions.pdf";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
