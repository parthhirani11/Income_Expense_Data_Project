
  document.addEventListener("DOMContentLoaded", () => {

  const openBtn = document.getElementById("openPopupBtn");
  const popup = document.getElementById("transactionPopup");
  const closeBtn = document.getElementById("closePopup");

  openBtn.onclick = () => {
    popup.style.display = "block";
  };

  closeBtn.onclick = () => {
    popup.style.display = "none";
  };

  // Tag buttons → click to fill input
  document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // document.getElementById("tagInputPopup").value = btn.dataset.tag;
        const tag = btn.dataset.tag;
        const input = document.getElementById('tagInput');
        let cur = input.value.trim();
        if(!cur) input.value = tag;
        else {
      // avoid duplicates
          const arr = cur.split(',').map(s=>s.trim()).filter(Boolean);
          if(!arr.includes(tag)) arr.push(tag);
          input.value = arr.join(', ');
        }
    });
  });

}); 

