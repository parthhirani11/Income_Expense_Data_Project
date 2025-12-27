const exportBtn = document.getElementById('exportBtn');
const exportType = document.getElementById('exportType');


exportBtn.addEventListener('click', () => {
if (!exportType.value) {
alert('Please select export type');
return;
}


const data = filteredData.length ? filteredData : fullData;
let url = '';


if (exportType.value === 'csv') url = '/account/export/csv';
if (exportType.value === 'xlsx') url = '/account/export/xlsx';
if (exportType.value === 'pdf') url = '/account/export/pdf';


downloadFile(url, data);
});


async function downloadFile(url, data) {
const res = await fetch(url, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ data })
});


const blob = await res.blob();
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = '';
link.click();
URL.revokeObjectURL(link.href);
}